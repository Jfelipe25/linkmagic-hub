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
    const { profile_id, country_code } = await req.json();

    if (!profile_id) {
      return new Response(JSON.stringify({ error: 'profile_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
    const appUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://www.linkone.bio';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', profile_id).maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile.paid) {
      return new Response(JSON.stringify({ error: 'Profile already paid' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get pricing
    let pricingQuery = supabase.from('pricing').select('*');
    if (country_code) {
      pricingQuery = pricingQuery.eq('country_code', country_code);
    } else {
      pricingQuery = pricingQuery.eq('is_default', true);
    }
    const { data: pricingData } = await pricingQuery.maybeSingle();
    let pricing = pricingData;
    if (!pricing) {
      const { data: defaultPricing } = await supabase.from('pricing').select('*').eq('is_default', true).maybeSingle();
      pricing = defaultPricing || { currency_id: 'COP', price: 20000, display_price: '$20.000 COP' };
    }

    // Regenerate session_id for fresh payment
    const session_id = crypto.randomUUID();
    await supabase.from('profiles').update({ session_id }).eq('id', profile_id);

    if (!mpAccessToken) {
      return new Response(JSON.stringify({
        init_point: `${appUrl}/pago/exitoso?session_id=${session_id}`,
        session_id,
        slug: profile.slug,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items: [{
          title: 'LinkOne Bio - Acceso permanente',
          quantity: 1,
          unit_price: Number(pricing.price),
          currency_id: pricing.currency_id,
        }],
        back_urls: {
          success: `${appUrl}/pago/exitoso?session_id=${session_id}`,
          failure: `${appUrl}/pago/fallido?session_id=${session_id}`,
          pending: `${appUrl}/pago/pendiente?session_id=${session_id}`,
        },
        auto_return: 'approved',
        external_reference: session_id,
        notification_url: `${supabaseUrl}/functions/v1/webhook`,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(JSON.stringify({ error: 'Error creating payment', details: mpData }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      init_point: mpData.init_point || mpData.sandbox_init_point,
      session_id,
      slug: profile.slug,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
