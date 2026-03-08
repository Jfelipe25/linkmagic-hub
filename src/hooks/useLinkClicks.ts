import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LinkClickStat {
  link_id: string;
  clicks: number;
}

export const useLinkClicks = (profileId: string | null) => {
  const [stats, setStats] = useState<LinkClickStat[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('link_clicks')
        .select('link_id')
        .eq('profile_id', profileId);

      if (data) {
        const map: Record<string, number> = {};
        data.forEach(row => {
          map[row.link_id] = (map[row.link_id] || 0) + 1;
        });
        const statArr = Object.entries(map).map(([link_id, clicks]) => ({ link_id, clicks }));
        setStats(statArr);
        setTotalClicks(data.length);
      }
      setLoading(false);
    };
    fetch();
  }, [profileId]);

  return { stats, totalClicks, loading };
};

export const trackLinkClick = async (profileSlug: string, linkId: string) => {
  await supabase.rpc('track_link_click', { p_profile_slug: profileSlug, p_link_id: linkId });
};
