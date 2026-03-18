import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validateSignature(req: Request, rawBody: string): Promise<boolean> {
  const secret = Deno.env.get('MP_WEBHOOK_SECRET');
  if (!secret) return true;

  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  if (!xSignature) return false;

  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')));
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  let dataId = '';
  try {
    const body = JSON.parse(rawBody);
    dataId = body?.data?.id?.toString() || '';
  } catch { return false; }

  const manifest = `id:${dataId};request-id:${xRequestId || ''};ts:${ts};`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest));
  const hexSignature = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return hexSignature === v1;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    const isValid = await validateSignature(req, rawBody);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const body = JSON.parse(rawBody);
    console.log('Webhook received:', JSON.stringify(body));

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

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ paid: true })
          .eq('session_id', sessionId);

        if (updateError) console.error('Error updating profile:', updateError);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (profile) {
          console.log(`Profile ${profile.slug} activated. user_id: ${profile.user_id || 'none'}`);

          if (!profile.user_id && payment.payer?.email) {
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers?.users?.find(u => u.email === payment.payer.email);

            if (existingUser) {
              await supabase.from('profiles').update({ user_id: existingUser.id }).eq('session_id', sessionId);
              console.log(`Linked existing user ${payment.payer.email} to profile ${profile.slug}`);
            } else {
              const tempPassword = crypto.randomUUID().slice(0, 12);
              const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: payment.payer.email,
                password: tempPassword,
                email_confirm: true,
              });

              if (authData?.user && !authError) {
                await supabase.from('profiles').update({ user_id: authData.user.id }).eq('session_id', sessionId);
                const appUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://www.linkone.bio';
                const publicSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
                await publicSupabase.auth.resetPasswordForEmail(payment.payer.email, {
                  redirectTo: `${appUrl}/reset-password`,
                });
                console.log(`User created for ${payment.payer.email}, recovery email sent`);
              }
            }
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
