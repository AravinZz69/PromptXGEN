import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, planId, isAnnual, paymentId, orderId, signature } = await req.json();

    // Fetch Razorpay config from payment_gateways table
    const { data: gateway, error: gwError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('name', 'razorpay')
      .eq('is_enabled', true)
      .single();

    if (gwError || !gateway) {
      return new Response(JSON.stringify({ error: 'Razorpay is not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keyId = gateway.config?.key_id;
    const keySecret = gateway.config?.key_secret;

    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay keys not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Plan pricing (in INR)
    const plans: Record<string, { name: string; monthly: number; yearly: number; credits: number }> = {
      pro: { name: 'Pro', monthly: 499, yearly: 4999, credits: 200 },
      enterprise: { name: 'Enterprise', monthly: 1999, yearly: 19999, credits: 9999 },
    };

    if (action === 'create_order') {
      const plan = plans[planId];
      if (!plan) {
        return new Response(JSON.stringify({ error: 'Invalid plan' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const amount = isAnnual ? plan.yearly : plan.monthly;

      // Create Razorpay order via API
      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${keyId}:${keySecret}`),
        },
        body: JSON.stringify({
          amount: amount * 100, // paise
          currency: 'INR',
          receipt: `order_${user.id}_${Date.now()}`,
          notes: {
            user_id: user.id,
            plan_id: planId,
            is_annual: String(isAnnual),
          },
        }),
      });

      const order = await razorpayResponse.json();

      if (!razorpayResponse.ok) {
        console.error('Razorpay order error:', order);
        return new Response(JSON.stringify({ error: order.error?.description || 'Failed to create order' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId,
        isTestMode: gateway.is_test_mode,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_payment') {
      // Verify payment signature using HMAC SHA256
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(keySecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );

      const message = `${orderId}|${paymentId}`;
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
      const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const isValid = expectedSignature === signature;

      if (!isValid && !gateway.is_test_mode) {
        // In test mode, skip verification
        return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Payment verified - process it
      const plan = plans[planId];
      if (!plan) {
        return new Response(JSON.stringify({ error: 'Invalid plan' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const amount = isAnnual ? plan.yearly : plan.monthly;
      const creditsToAdd = plan.credits;

      // 1. Record transaction
      await supabase.from('payment_transactions').insert({
        user_id: user.id,
        user_email: user.email,
        gateway: 'razorpay',
        amount: amount,
        currency: 'INR',
        status: 'success',
        transaction_id: paymentId,
        plan_name: plan.name,
        credits_purchased: creditsToAdd,
        metadata: {
          order_id: orderId,
          plan_id: planId,
          is_annual: isAnnual,
          is_test_mode: gateway.is_test_mode,
          verified: isValid,
          timestamp: new Date().toISOString(),
        },
      });

      // 2. Update user credits
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingCredits) {
        const newBalance = planId === 'enterprise' ? -1 : existingCredits.credits_balance + creditsToAdd;
        const newTotal = planId === 'enterprise' ? -1 : existingCredits.total_credits + creditsToAdd;

        await supabase.from('user_credits').update({
          credits_balance: newBalance,
          total_credits: newTotal,
          plan_type: planId,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
      } else {
        await supabase.from('user_credits').insert({
          user_id: user.id,
          credits_balance: creditsToAdd,
          total_credits: creditsToAdd,
          used_credits: 0,
          plan_type: planId,
        });
      }

      // 3. Log credit transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: creditsToAdd,
        transaction_type: 'topup',
        description: `${plan.name} plan (${isAnnual ? 'Annual' : 'Monthly'}) via Razorpay`,
      });

      // 4. Update user profile plan
      await supabase.from('user_profiles').update({
        plan_type: planId,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);

      return new Response(JSON.stringify({
        success: true,
        transactionId: paymentId,
        credits: creditsToAdd,
        planType: planId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Razorpay function error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
