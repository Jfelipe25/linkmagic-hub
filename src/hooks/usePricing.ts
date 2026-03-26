import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricingOption {
  id: string;
  country_code: string;
  country_name: string;
  currency_id: string;
  price: number;
  display_price: string;
  is_default: boolean;
}

// Detectar país por IP usando ipapi.co (gratis, sin API key, 1000 req/día)
async function detectCountryCode(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/country/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const code = (await res.text()).trim();
    return code.length === 2 ? code : null;
  } catch {
    return null;
  }
}

export const usePricing = () => {
  const [options, setOptions] = useState<PricingOption[]>([]);
  const [selected, setSelected] = useState<PricingOption | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // 1. Cargar precios de Supabase
      const { data } = await supabase
        .from('pricing')
        .select('*')
        .order('is_default', { ascending: false });

      if (!data || data.length === 0) { setLoading(false); return; }

      const typed = data as unknown as PricingOption[];
      setOptions(typed);

      // 2. Detectar país por IP en paralelo con timeout de 3s
      const countryCode = await detectCountryCode();

      // 3. Buscar precio del país detectado
      const byCountry = countryCode
        ? typed.find(p => p.country_code === countryCode)
        : null;

      // 4. Fallback: is_default → primero de la lista
      const fallback = typed.find(p => p.is_default) || typed[0];

      setSelected(byCountry || fallback);
      setLoading(false);
    };

    init();
  }, []);

  return { options, selected, setSelected, loading };
};
