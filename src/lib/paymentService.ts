/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Payment Service
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Handles payment gateway integration:
 * - Fetches enabled gateways from Supabase
 * - Processes payments via Razorpay/Stripe/PayPal
 * - On success: credits are added, plan is upgraded, transaction is recorded
 * - Updates user_credits and credit_transactions tables
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentGateway {
  id: string;
  name: string;
  display_name: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  config: GatewayConfig;
}

export interface GatewayConfig {
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  client_id?: string;
  client_secret?: string;
  key_id?: string;
  key_secret?: string;
  [key: string]: string | undefined;
}

export interface PlanDetails {
  id: string;
  name: string;
  credits: number;
  monthlyPrice: number;
  yearlyPrice: number;
  planType: 'free' | 'pro' | 'enterprise';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  credits?: number;
  planType?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const PLANS: Record<string, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free',
    credits: 20,
    monthlyPrice: 0,
    yearlyPrice: 0,
    planType: 'free',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    credits: 200,
    monthlyPrice: 499,
    yearlyPrice: 4999,
    planType: 'pro',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    credits: -1, // Unlimited
    monthlyPrice: 1999,
    yearlyPrice: 19999,
    planType: 'enterprise',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GATEWAY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all enabled payment gateways from Supabase
 */
export async function getEnabledGateways(): Promise<PaymentGateway[]> {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_enabled', true);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching payment gateways:', err);
    return [];
  }
}

/**
 * Fetch configuration for a specific gateway
 */
export async function getGatewayConfig(gatewayName: string): Promise<PaymentGateway | null> {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('name', gatewayName)
      .eq('is_enabled', true)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`Error fetching ${gatewayName} config:`, err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RAZORPAY INTEGRATION (via Edge Function)
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Initialize Razorpay payment using backend order creation
 */
export async function initiateRazorpayPayment(
  userId: string,
  userEmail: string,
  planId: string,
  isAnnual: boolean
): Promise<PaymentResult> {
  const plan = PLANS[planId];
  if (!plan) {
    return { success: false, error: 'Invalid plan selected.' };
  }

  const amount = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
  if (amount === 0) {
    return { success: false, error: 'Cannot purchase free plan.' };
  }

  // Load Razorpay script
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    return { success: false, error: 'Failed to load payment gateway.' };
  }

  try {
    // 1. Create order via edge function
    const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-order', {
      body: {
        action: 'create_order',
        planId,
        isAnnual,
      },
    });

    if (orderError || !orderData?.orderId) {
      return { success: false, error: orderData?.error || 'Failed to create payment order.' };
    }

    // 2. Open Razorpay checkout
    return new Promise((resolve) => {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AskJai',
        description: `${plan.name} Plan - ${isAnnual ? 'Annual' : 'Monthly'}`,
        order_id: orderData.orderId,
        prefill: {
          email: userEmail,
        },
        theme: {
          color: '#4F46E5',
        },
        handler: async function (response: any) {
          // 3. Verify payment via edge function
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-order', {
              body: {
                action: 'verify_payment',
                planId,
                isAnnual,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              },
            });

            if (verifyError || !verifyData?.success) {
              resolve({ success: false, error: verifyData?.error || 'Payment verification failed.' });
              return;
            }

            resolve({
              success: true,
              transactionId: verifyData.transactionId,
              credits: verifyData.credits,
              planType: verifyData.planType,
            });
          } catch (err) {
            resolve({ success: false, error: 'Payment verification failed.' });
          }
        },
        modal: {
          ondismiss: function () {
            resolve({ success: false, error: 'Payment cancelled by user.' });
          },
        },
        notes: {
          is_test: orderData.isTestMode ? 'true' : 'false',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        resolve({
          success: false,
          error: response.error?.description || 'Payment failed. Please try again.',
        });
      });
      razorpay.open();
    });
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to initiate payment.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Stripe: any;
  }
}

/**
 * Load Stripe script dynamically
 */
export function loadStripeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Stripe) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Initialize Stripe payment (redirect to Stripe checkout)
 * Note: For full Stripe integration, you'd need a backend to create checkout sessions
 */
export async function initiateStripePayment(
  userId: string,
  userEmail: string,
  planId: string,
  isAnnual: boolean
): Promise<PaymentResult> {
  const gateway = await getGatewayConfig('stripe');
  if (!gateway || !gateway.config?.api_key) {
    return { success: false, error: 'Stripe is not configured. Please contact admin.' };
  }

  // For demo purposes, we'll simulate a successful payment
  // In production, you'd create a checkout session via a backend API
  const plan = PLANS[planId];
  const amount = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;

  // Simulate payment success for demo
  const simulatedTransactionId = `stripe_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  return processSuccessfulPayment(
    userId,
    userEmail,
    planId,
    isAnnual,
    'stripe',
    simulatedTransactionId,
    amount
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYPAL INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize PayPal payment
 * Note: For full PayPal integration, you'd need to render PayPal buttons
 */
export async function initiatePayPalPayment(
  userId: string,
  userEmail: string,
  planId: string,
  isAnnual: boolean
): Promise<PaymentResult> {
  const gateway = await getGatewayConfig('paypal');
  if (!gateway || !gateway.config?.client_id) {
    return { success: false, error: 'PayPal is not configured. Please contact admin.' };
  }

  // For demo purposes, simulate a successful payment
  const plan = PLANS[planId];
  const amount = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
  const simulatedTransactionId = `paypal_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return processSuccessfulPayment(
    userId,
    userEmail,
    planId,
    isAnnual,
    'paypal',
    simulatedTransactionId,
    amount
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Process a successful payment:
 * 1. Record the transaction
 * 2. Add credits to user
 * 3. Upgrade user's plan
 */
export async function processSuccessfulPayment(
  userId: string,
  userEmail: string,
  planId: string,
  isAnnual: boolean,
  gateway: string,
  transactionId: string,
  amount: number
): Promise<PaymentResult> {
  const plan = PLANS[planId];
  if (!plan) {
    return { success: false, error: 'Invalid plan.' };
  }

  try {
    // 1. Record the payment transaction
    const { error: txError } = await supabase.from('payment_transactions').insert({
      user_id: userId,
      user_email: userEmail,
      gateway: gateway,
      amount: amount,
      currency: 'INR',
      status: 'success',
      transaction_id: transactionId,
      plan_name: plan.name,
      credits_purchased: plan.credits === -1 ? 9999 : plan.credits, // Unlimited = 9999
      metadata: {
        plan_id: planId,
        is_annual: isAnnual,
        timestamp: new Date().toISOString(),
      },
    });

    if (txError) {
      console.error('Error recording transaction:', txError);
      // Don't fail the whole process, continue with credit update
    }

    // 2. Update user credits and plan
    const creditsToAdd = plan.credits === -1 ? 9999 : plan.credits;
    
    // First check if user has credits record
    const { data: existingCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching credits:', fetchError);
    }

    if (existingCredits) {
      // Update existing record
      const newBalance = plan.credits === -1 
        ? -1 // Unlimited
        : existingCredits.credits_balance + creditsToAdd;
      
      const newTotal = plan.credits === -1 
        ? -1 
        : existingCredits.total_credits + creditsToAdd;

      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits_balance: newBalance,
          total_credits: newTotal,
          plan_type: plan.planType,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return { success: false, error: 'Failed to update credits. Please contact support.' };
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase.from('user_credits').insert({
        user_id: userId,
        credits_balance: creditsToAdd,
        total_credits: creditsToAdd,
        used_credits: 0,
        plan_type: plan.planType,
      });

      if (insertError) {
        console.error('Error creating credits:', insertError);
        return { success: false, error: 'Failed to create credits. Please contact support.' };
      }
    }

    // 3. Log credit transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: creditsToAdd === -1 ? 9999 : creditsToAdd,
      transaction_type: 'topup',
      description: `${plan.name} plan purchase (${isAnnual ? 'Annual' : 'Monthly'})`,
    });

    // 4. Send subscription notification
    try {
      await supabase.functions.invoke('subscription-email', {
        body: {
          action: 'purchase',
          userId,
          userEmail,
          planName: plan.name,
          amount,
          credits: creditsToAdd,
          transactionId,
        },
      });
    } catch (notifErr) {
      console.error('Failed to send subscription notification:', notifErr);
    }

    // 5. Update user profile plan type
    await supabase
      .from('user_profiles')
      .update({ 
        plan_type: plan.planType,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return {
      success: true,
      transactionId: transactionId,
      credits: creditsToAdd,
      planType: plan.planType,
    };
  } catch (err) {
    console.error('Error processing payment:', err);
    return { success: false, error: 'Payment processing failed. Please contact support.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAYMENT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initiate payment with the preferred gateway
 * Falls back to available gateways if preferred is not configured
 */
export async function initiatePayment(
  userId: string,
  userEmail: string,
  planId: string,
  isAnnual: boolean,
  preferredGateway?: string
): Promise<PaymentResult> {
  // Get enabled gateways
  const gateways = await getEnabledGateways();
  
  if (gateways.length === 0) {
    return { success: false, error: 'No payment gateways are configured. Please contact admin.' };
  }

  // Find preferred gateway or use first available
  let gateway = preferredGateway 
    ? gateways.find(g => g.name === preferredGateway) 
    : gateways[0];

  if (!gateway) {
    gateway = gateways[0]; // Fall back to first available
  }

  // Initiate payment based on gateway
  switch (gateway.name) {
    case 'razorpay':
      return initiateRazorpayPayment(userId, userEmail, planId, isAnnual);
    case 'stripe':
      return initiateStripePayment(userId, userEmail, planId, isAnnual);
    case 'paypal':
      return initiatePayPalPayment(userId, userEmail, planId, isAnnual);
    default:
      return { success: false, error: `Unsupported payment gateway: ${gateway.name}` };
  }
}

/**
 * Get user's current subscription info
 */
export async function getUserSubscription(userId: string): Promise<{
  planType: string;
  credits: number;
  totalCredits: number;
  usedCredits: number;
  isActive: boolean;
  lastPayment: any | null;
} | null> {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('plan_type, credits_balance, total_credits, used_credits, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) return null;

    // Get last successful payment
    const { data: lastTx } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      planType: data.plan_type || 'free',
      credits: data.credits_balance || 0,
      totalCredits: data.total_credits || 0,
      usedCredits: data.used_credits || 0,
      isActive: (data.plan_type || 'free') !== 'free',
      lastPayment: lastTx || null,
    };
  } catch (err) {
    console.error('Error fetching subscription:', err);
    return null;
  }
}

/**
 * Cancel subscription (downgrade to free)
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Update user credits to free plan
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        plan_type: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        plan_type: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Log the cancellation
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: 0,
      transaction_type: 'reset',
      description: 'Subscription cancelled - downgraded to Free plan',
    });

    // Send cancellation notification
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.functions.invoke('subscription-email', {
        body: {
          action: 'cancel',
          userId,
          userEmail: user?.email || '',
          planName: 'Free',
        },
      });
    } catch (notifErr) {
      console.error('Failed to send cancellation notification:', notifErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error cancelling subscription:', err);
    return { success: false, error: err.message || 'Failed to cancel subscription' };
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(userId: string, limit = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching payment history:', err);
    return [];
  }
}
