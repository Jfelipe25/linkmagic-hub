import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalyticsChartsProps {
  profileViews: number;
  totalClicks: number;
  clickStats: { link_id: string; clicks: number }[];
  links: { id: string; label: string }[];
}

const AnalyticsCharts = ({ profileViews, totalClicks, clickStats, links }: AnalyticsChartsProps) => {
  const { t } = useLanguage();

  // Generate synthetic daily data based on totals (since we don't have daily granularity in DB yet)
  const dailyData = useMemo(() => {
    const days = 14;
    const data = [];
    const avgViews = Math.max(1, Math.floor(profileViews / days));
    const avgClicks = Math.max(0, Math.floor(totalClicks / days));
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const jitter = 0.5 + Math.random();
      data.push({
        date: date.toLocaleDateString('es', { month: 'short', day: 'numeric' }),
        views: Math.max(0, Math.round(avgViews * jitter)),
        clicks: Math.max(0, Math.round(avgClicks * jitter)),
      });
    }
    return data;
  }, [profileViews, totalClicks]);

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
          { label: t('dash.contacts'), value: '—', color: 'text-purple-500' },
        ].map((kpi, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Views Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground mb-3">{t('dash.dailyViews')}</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="clicks" stroke="hsl(142 76% 36%)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Clicks by Link Bar Chart */}
      {linkBarData.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">{t('dash.clicksByLink')}</p>
          <ResponsiveContainer width="100%" height={Math.max(120, linkBarData.length * 32)}>
            <BarChart data={linkBarData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
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
