import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    // MercadoPago sends notifications with type and data
    if (body.type === 'payment' || body.action === 'payment.updated') {
      const paymentId = body.data?.id;
      if (!paymentId) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
      if (!mpAccessToken) {
        console.error('MP_ACCESS_TOKEN not configured');
        return new Response('Config error', { status: 500, headers: corsHeaders });
      }

      // Verify payment with MercadoPago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${mpAccessToken}` },
      });
      const payment = await paymentRes.json();

      if (payment.status === 'approved') {
        const sessionId = payment.external_reference;
        if (!sessionId) {
          console.error('No external_reference in payment');
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Update profile as paid
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ paid: true })
          .eq('session_id', sessionId);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }

        // Get profile to create user
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (profile && !profile.user_id && payment.payer?.email) {
          // Create user with temp password
          const tempPassword = crypto.randomUUID().slice(0, 12);
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: payment.payer.email,
            password: tempPassword,
            email_confirm: true,
          });

          if (authData?.user && !authError) {
            await supabase
              .from('profiles')
              .update({ user_id: authData.user.id })
              .eq('session_id', sessionId);

            // Send password reset email so user can set their own password
            const appUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://linkbio.pro';
            await supabase.auth.admin.generateLink({
              type: 'recovery',
              email: payment.payer.email,
              options: {
                redirectTo: `${appUrl}/reset-password`,
              },
            });

            // Also try the public method which actually sends the email
            const publicSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
            await publicSupabase.auth.resetPasswordForEmail(payment.payer.email, {
              redirectTo: `${appUrl}/reset-password`,
            });

            console.log(`User created for ${payment.payer.email}, recovery email sent`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
