// Supabase Edge Function: check-credits
// Deploy: supabase functions deploy check-credits
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user credits using the SQL function
    const { data, error } = await supabase.rpc('check_user_credits', {
      p_user_id: user.id,
    });

    if (error) {
      // If no credits record exists, create one
      if (error.message.includes('no rows')) {
        await supabase.from('user_credits').insert({
          user_id: user.id,
          total_credits: 100,
          used_credits: 0,
          plan_type: 'free',
        });
        
        return new Response(
          JSON.stringify({
            hasCredits: true,
            remaining: 100,
            plan: 'free',
            total: 100,
            used: 0,
            resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw error;
    }

    const result = data?.[0];
    
    return new Response(
      JSON.stringify({
        hasCredits: result?.has_credits ?? false,
        remaining: result?.remaining ?? 0,
        plan: result?.plan ?? 'free',
        total: result?.total ?? 100,
        used: result?.used ?? 0,
        resetDate: result?.reset_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check credits error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
