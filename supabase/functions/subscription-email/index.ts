import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  action: 'purchase' | 'cancel' | 'upgrade' | 'downgrade';
  userId: string;
  userEmail: string;
  planName: string;
  amount?: number;
  credits?: number;
  transactionId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: EmailPayload = await req.json();
    const { action, userId, userEmail, planName, amount, credits, transactionId } = payload;

    // Create in-app notification based on action
    let title = '';
    let message = '';
    let type: 'success' | 'info' | 'warning' = 'info';

    switch (action) {
      case 'purchase':
        title = '🎉 Payment Successful!';
        message = `Your payment of ₹${amount} for the ${planName} plan was successful. ${credits && credits !== 9999 ? `${credits} credits` : 'Unlimited credits'} have been added to your account. Transaction ID: ${transactionId}`;
        type = 'success';
        break;
      case 'cancel':
        title = '⚠️ Subscription Cancelled';
        message = `Your ${planName} plan has been cancelled. You've been downgraded to the Free plan. Your remaining credits are still available.`;
        type = 'warning';
        break;
      case 'upgrade':
        title = '🚀 Plan Upgraded!';
        message = `Congratulations! You've been upgraded to the ${planName} plan. ${credits && credits !== 9999 ? `${credits} credits` : 'Unlimited credits'} are now available.`;
        type = 'success';
        break;
      case 'downgrade':
        title = '📋 Plan Changed';
        message = `Your plan has been changed to ${planName}. Your credit balance has been updated accordingly.`;
        type = 'info';
        break;
    }

    // Insert in-app notification
    const { error: notifError } = await supabase.from('user_notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      priority: action === 'cancel' ? 'high' : 'normal',
      read: false,
      action_url: action === 'cancel' ? '/upgrade' : '/profile',
    });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Log to audit if admin action
    console.log(`[Subscription Email] ${action} for ${userEmail}: ${title}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Subscription email error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
