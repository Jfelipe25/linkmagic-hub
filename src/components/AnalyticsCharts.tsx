import { useMemo, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsChartsProps {
  profileId: string;
  profileViews: number;
  totalClicks: number;
  clickStats: { link_id: string; clicks: number }[];
  links: { id: string; label: string }[];
}

const AnalyticsCharts = ({ profileId, profileViews, totalClicks, clickStats, links }: AnalyticsChartsProps) => {
  const { t } = useLanguage();
  const [dailyViews, setDailyViews] = useState<{ date: string; views: number; clicks: number }[]>([]);
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    if (!profileId) return;

    // Fetch real daily views from profile_views_log
    const fetchDailyData = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 13);

      const { data: viewsData } = await supabase
        .from('profile_views_log')
        .select('viewed_at')
        .eq('profile_id', profileId)
        .gte('viewed_at', since.toISOString());

      const { data: clicksData } = await supabase
        .from('link_clicks')
        .select('clicked_at')
        .eq('profile_id', profileId)
        .gte('clicked_at', since.toISOString());

      const { count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);
      setContactsCount(count || 0);

      // Build 14-day array
      const days: { date: string; views: number; clicks: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({
          date: d.toLocaleDateString('es', { month: 'short', day: 'numeric' }),
          views: viewsData?.filter(v => v.viewed_at.slice(0, 10) === key).length || 0,
          clicks: clicksData?.filter(c => (c as any).clicked_at.slice(0, 10) === key).length || 0,
        });
      }
      setDailyViews(days);
    };

    fetchDailyData();
  }, [profileId]);

  const linkBarData = useMemo(() => {
    return clickStats
      .map(s => ({
        name: links.find(l => l.id === s.link_id)?.label || s.link_id.slice(0, 8),
        clicks: s.clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);
  }, [clickStats, links]);

  const ctr = profileViews > 0 ? ((totalClicks / profileViews) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('dash.views'), value: profileViews, color: 'text-blue-500' },
          { label: t('dash.clicks'), value: totalClicks, color: 'text-green-500' },
          { label: 'CTR', value: `${ctr}%`, color: 'text-amber-500' },
          { label: t('dash.contacts'), value: contactsCount, color: 'text-purple-500' },
        ].map((kpi, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Views Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground mb-3">{t('dash.dailyViews')} <span className="text-xs text-muted-foreground font-normal">(últimos 14 días)</span></p>
        {dailyViews.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dailyViews}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area type="monotone" dataKey="views" name="Visitas" stroke="hsl(var(--primary))" fill="url(#viewsGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicks" name="Clics" stroke="hsl(142 76% 36%)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
            Aún no hay datos de visitas
          </div>
        )}
      </div>

      {/* Clicks by Link */}
      {linkBarData.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">{t('dash.clicksByLink')}</p>
          <ResponsiveContainer width="100%" height={Math.max(120, linkBarData.length * 32)}>
            <BarChart data={linkBarData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
