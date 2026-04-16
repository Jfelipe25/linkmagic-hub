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

    // Fetch profile — store activation requires the profile to already be paid (Pro)
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', profile_id).maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profile.paid) {
      return new Response(JSON.stringify({
        error: 'Profile must be paid (Pro) before activating the store',
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile.store_enabled) {
      return new Response(JSON.stringify({ error: 'Store already enabled' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get store pricing by country
    let pricingQuery = supabase.from('pricing').select('*');
    if (country_code) {
      pricingQuery = pricingQuery.eq('country_code', country_code);
    } else {
      pricingQuery = pricingQuery.eq('is_default', true);
    }
    const { data: pricingData } = await pricingQuery.maybeSingle();
    let pricing = pricingData;
    if (!pricing || !pricing.store_price) {
      const { data: defaultPricing } = await supabase
        .from('pricing').select('*').eq('is_default', true).maybeSingle();
      pricing = defaultPricing || {
        currency_id: 'COP', store_price: 100000, store_display_price: '$100.000 COP',
      };
    }

    const storePrice = Number(pricing.store_price || 100000);
    const currencyId = pricing.currency_id || 'COP';

    // Generate store_session_id — distinct from the Pro session_id
    // Prefix with "store_" so the webhook can distinguish payment types
    const store_session_id = `store_${crypto.randomUUID()}`;
    await supabase.from('profiles').update({ store_session_id }).eq('id', profile_id);

    // Dev mode: no MP token → simulate success
    if (!mpAccessToken) {
      return new Response(JSON.stringify({
        init_point: `${appUrl}/pago/exitoso?session_id=${store_session_id}&type=store`,
        session_id: store_session_id,
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
          title: 'LinkOne Store - Módulo de tienda',
          description: 'Activación única del módulo de tienda con checkout por WhatsApp',
          quantity: 1,
          unit_price: storePrice,
          currency_id: currencyId,
        }],
        back_urls: {
          success: `${appUrl}/pago/exitoso?session_id=${store_session_id}&type=store`,
          failure: `${appUrl}/pago/fallido?session_id=${store_session_id}&type=store`,
          pending: `${appUrl}/pago/pendiente?session_id=${store_session_id}&type=store`,
        },
        auto_return: 'approved',
        external_reference: store_session_id,
        notification_url: `${supabaseUrl}/functions/v1/webhook`,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return new Response(JSON.stringify({
        error: 'Error creating payment', details: mpData,
      }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      init_point: mpData.init_point || mpData.sandbox_init_point,
      session_id: store_session_id,
      slug: profile.slug,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
