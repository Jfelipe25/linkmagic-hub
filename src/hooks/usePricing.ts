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

export const usePricing = () => {
  const [options, setOptions] = useState<PricingOption[]>([]);
  const [selected, setSelected] = useState<PricingOption | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('pricing').select('*').order('is_default', { ascending: false });
      if (data && data.length > 0) {
        const typed = data as unknown as PricingOption[];
        setOptions(typed);
        const def = typed.find(p => p.is_default) || typed[0];
        setSelected(def);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { options, selected, setSelected, loading };
};
