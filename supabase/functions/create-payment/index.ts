import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, bio, avatar, template, accent_color, social_links, links, slug: customSlug, background_image, font_family, country_code } = body;

    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
    const appUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://linkbio.pro';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pricing for selected country (or default)
    let pricingQuery = supabase.from('pricing').select('*');
    if (country_code) {
      pricingQuery = pricingQuery.eq('country_code', country_code);
    } else {
      pricingQuery = pricingQuery.eq('is_default', true);
    }
    const { data: pricingData } = await pricingQuery.maybeSingle();
    
    // Fallback to default if country not found
    let pricing = pricingData;
    if (!pricing) {
      const { data: defaultPricing } = await supabase.from('pricing').select('*').eq('is_default', true).maybeSingle();
      pricing = defaultPricing || { currency_id: 'COP', price: 20000, display_price: '$20.000 COP' };
    }

    // Use custom slug if provided, otherwise generate from name
    let slug = customSlug && customSlug.trim() ? customSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) : generateSlug(name);
    
    // Check if slug is taken
    const { data: existingSlug } = await supabase.from('profiles').select('id').eq('slug', slug).maybeSingle();
    if (existingSlug) {
      if (customSlug && customSlug.trim()) {
        return new Response(JSON.stringify({ error: 'Este nombre de URL ya está en uso' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      let suffix = 2;
      while (true) {
        const candidate = `${slug}-${suffix}`;
        const { data } = await supabase.from('profiles').select('id').eq('slug', candidate).maybeSingle();
        if (!data) { slug = candidate; break; }
        suffix++;
      }
    }

    const session_id = crypto.randomUUID();

    const { error: insertError } = await supabase.from('profiles').insert({
      slug,
      name: name.trim(),
      bio: (bio || '').slice(0, 100),
      avatar: avatar || '',
      template: template || 'minimal',
      accent_color: accent_color || '#d4a432',
      font_color: body.font_color || '#000000',
      font_family: font_family || 'Inter',
      background_image: background_image || '',
      social_links: social_links || {},
      links: links || [],
      paid: false,
      session_id,
      user_id: body.user_id || null,
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!mpAccessToken) {
      return new Response(JSON.stringify({
        init_point: `${appUrl}/pago/exitoso?session_id=${session_id}`,
        session_id,
        slug,
        message: 'MercadoPago not configured. Using test mode.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items: [{
          title: 'LinkBio Pro - Acceso permanente',
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      init_point: mpData.init_point || mpData.sandbox_init_point,
      session_id,
      slug,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
