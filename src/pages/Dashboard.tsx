import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData, DEFAULT_PROFILE } from '@/types/profile';
import { profileFromRow } from '@/lib/profile-utils';
import { downloadVCard } from '@/lib/vcard';
import ProfileEditorForm from '@/components/editor/ProfileEditorForm';
import PhoneMockup from '@/components/editor/PhoneMockup';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import QRCodeCard from '@/components/QRCodeCard';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ContactsList from '@/components/ContactsList';
import { useLinkClicks } from '@/hooks/useLinkClicks';
import { usePricing } from '@/hooks/usePricing';
import { Copy, Check, Loader2, ExternalLink, LogOut, Plus, Download, X, CreditCard, Contact } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileRow {
  id: string;
  slug: string;
  name: string | null;
  paid: boolean | null;
  views: number;
  created_at: string | null;
  [key: string]: any;
}

const DEMO_PROFILES: ProfileRow[] = [
  {
    id: 'demo-1', slug: 'felipe-rodriguez', name: 'Felipe Rodriguez',
    bio: 'Ingeniero Mecánico | MBA', avatar: '', paid: true, views: 342,
    created_at: '2025-01-15T10:00:00Z', template: 'minimal', accent_color: '#d4a432',
    font_color: '#ffffff', font_family: 'Inter', background_image: '',
    social_links: { instagram: 'https://instagram.com/felipe', linkedin: 'https://linkedin.com/in/felipe' },
    links: [
      { id: '1', label: 'Mi portafolio', url: 'https://example.com' },
      { id: '2', label: 'Agendar reunión', url: 'https://calendly.com' },
      { id: '3', label: 'Mi empresa', url: 'https://miempresa.com' },
    ],
    user_id: 'demo', session_id: null, enable_contact_form: false,
  },
];

const DEMO_CLICK_STATS = [
  { link_id: '1', clicks: 87 },
  { link_id: '2', clicks: 54 },
  { link_id: '3', clicks: 31 },
];

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [profile, setProfile] = useState<ProfileData>({ ...DEFAULT_PROFILE });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProfile, setNewProfile] = useState<ProfileData>({ ...DEFAULT_PROFILE });
  const [isDemo, setIsDemo] = useState(false);
  const [showFirstVisit, setShowFirstVisit] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'contacts'>('editor');

  const { stats: clickStats, totalClicks } = useLinkClicks(isDemo ? null : (activeProfileId || null));
  const { options: pricingOptions, selected: selectedPricing, setSelected: setSelectedPricing } = usePricing();

  const effectiveClickStats = isDemo ? DEMO_CLICK_STATS : clickStats;
  const effectiveTotalClicks = isDemo ? DEMO_CLICK_STATS.reduce((sum, s) => sum + s.clicks, 0) : totalClicks;

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setProfiles(data);
        setIsDemo(false);
        if (!activeProfileId || !data.find(p => p.id === activeProfileId)) {
          setActiveProfileId(data[0].id);
          setProfile(profileFromRow(data[0]));
        }
        const dismissed = localStorage.getItem('linkbio_welcome_dismissed');
        if (!dismissed) setShowFirstVisit(true);
      } else {
        setProfiles(DEMO_PROFILES);
        setActiveProfileId(DEMO_PROFILES[0].id);
        setProfile(profileFromRow(DEMO_PROFILES[0]));
        setIsDemo(true);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, [user]);

  const switchProfile = (id: string) => {
    const row = profiles.find(p => p.id === id);
    if (row) { setActiveProfileId(id); setProfile(profileFromRow(row)); setShowNewForm(false); }
  };

  const handleSave = async () => {
    if (!activeProfileId) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name: profile.name, bio: profile.bio, avatar: profile.avatar, template: profile.template,
      accent_color: profile.accent_color, font_color: profile.font_color, font_family: profile.font_family,
      background_image: profile.background_image, social_links: profile.social_links as any,
      links: profile.links as any, enable_contact_form: profile.enable_contact_form,
    }).eq('id', activeProfileId);
    if (error) toast.error('Error al guardar');
    else {
      toast.success(t('dash.saved'));
      setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, name: profile.name, slug: profile.slug } : p));
    }
    setSaving(false);
  };

  const handleCreateNew = async () => {
    if (!newProfile.name.trim()) { toast.error('Ingresa un nombre'); return; }
    if (!newProfile.slug || newProfile.slug.length < 3) { toast.error('URL mínimo 3 caracteres'); return; }
    setCreatingNew(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { ...newProfile, user_id: user!.id, country_code: selectedPricing?.country_code },
      });
      if (error) throw error;
      if (data?.init_point) window.location.href = data.init_point;
      else toast.error('Error al crear el pago');
    } catch (err: any) { toast.error(err.message || 'Error'); }
    setCreatingNew(false);
  };

  const dismissFirstVisit = () => { localStorage.setItem('linkbio_welcome_dismissed', 'true'); setShowFirstVisit(false); };

  const profileUrl = profile.slug ? `${window.location.origin}/u/${profile.slug}` : '';
  const qrUrl = profile.slug ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}` : '';

  const handleDownloadQR = async () => {
    if (!qrUrl) return;
    try {
      const res = await fetch(qrUrl); const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `qr-${profile.slug}.png`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('Download failed', err); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold gold-text">LinkOne</h1>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors"><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Demo banner */}
        {isDemo && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-accent/30 bg-accent/10 p-4 mb-4 flex items-center gap-3">
            <span className="text-lg">👀</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t('dash.demo')}</p>
              <p className="text-xs text-muted-foreground">{t('dash.demoDesc')}</p>
            </div>
          </motion.div>
        )}

        {/* First-visit banner */}
        <AnimatePresence>
          {showFirstVisit && !isDemo && profile.slug && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 mb-6 relative">
              <button onClick={dismissFirstVisit} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X size={16} /></button>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-lg border border-border bg-white p-3"><img src={qrUrl} alt="QR" className="w-32 h-32" /></div>
                  <button onClick={handleDownloadQR} className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                    <Download size={12} /> {t('dash.downloadQr')}
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2 justify-center md:justify-start">🎉 {t('dash.pageReady')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t('dash.shareQr')}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-3 inline-flex items-center gap-2">
                    <code className="text-sm text-primary font-medium">{profileUrl}</code>
                    <button onClick={copyLink} className="text-muted-foreground hover:text-primary">{copied ? <Check size={14} /> : <Copy size={14} />}</button>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink size={14} /></a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : '👋'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('dash.hello', { name: profile.name || user?.email?.split('@')[0] || 'crack' })}</h2>
              <p className="text-sm text-muted-foreground">{t('dash.activeDesc')}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile switcher */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">{t('dash.myPages')}</p>
            <button onClick={() => { setShowNewForm(!showNewForm); setNewProfile({ ...DEFAULT_PROFILE }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
              <Plus size={14} /> {t('dash.newUrl')}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {profiles.map(p => (
              <button key={p.id} onClick={() => switchProfile(p.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                  p.id === activeProfileId && !showNewForm ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/20'
                }`}>
                <span className="block truncate max-w-[140px]">{p.name || p.slug}</span>
                <span className="text-[10px] opacity-60 font-mono">/u/{p.slug}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* New profile form */}
        {showNewForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-6 mb-6">
            <h3 className="text-sm font-bold text-foreground mb-4">{t('dash.newUrl')}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <ProfileEditorForm profile={newProfile} onChange={setNewProfile} onPublish={handleCreateNew}
                  publishLabel={t('editor.payPublish')} isPublishing={creatingNew}
                  pricingOptions={pricingOptions} selectedPricing={selectedPricing} onPricingChange={setSelectedPricing} />
              </div>
              <div className="flex items-start justify-center lg:sticky lg:top-8">
                <PhoneMockup><TemplateRenderer profile={newProfile} /></PhoneMockup>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active profile */}
        {!showNewForm && activeProfileId && (
          <>
            {/* Status bar */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-4 mb-6 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs text-muted-foreground mb-1">{t('dash.publicLink')}</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-primary">/u/{profile.slug}</code>
                  <button onClick={copyLink} className="text-muted-foreground hover:text-primary">{copied ? <Check size={14} /> : <Copy size={14} />}</button>
                  <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink size={14} /></a>
                </div>
              </div>
              <div><p className="text-xs text-muted-foreground">{t('dash.views')}</p><p className="text-sm text-foreground font-semibold">{profile.views ?? 0}</p></div>
              <div><p className="text-xs text-muted-foreground">{t('dash.clicks')}</p><p className="text-sm text-foreground font-semibold">{effectiveTotalClicks}</p></div>
              <div><p className="text-xs text-muted-foreground">{t('dash.created')}</p><p className="text-sm text-foreground">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</p></div>
              <div className="flex gap-2">
                <button onClick={() => downloadVCard(profile)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  <Contact size={12} /> vCard
                </button>
                <a href={`/card/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  <CreditCard size={12} /> {t('dash.virtualCard')}
                </a>
              </div>
            </motion.div>

            {/* Dashboard tabs */}
            <div className="flex gap-2 mb-6">
              {(['editor', 'analytics', 'contacts'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}>
                  {tab === 'editor' ? '✏️ Editor' : tab === 'analytics' ? `📊 ${t('dash.analytics')}` : `👥 ${t('dash.contacts')}`}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AnalyticsCharts
                  profileViews={profile.views ?? 0}
                  totalClicks={effectiveTotalClicks}
                  clickStats={effectiveClickStats}
                  links={profile.links}
                />
              </motion.div>
            )}

            {activeTab === 'contacts' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!isDemo && activeProfileId ? (
                  <ContactsList profileId={activeProfileId} />
                ) : (
                  <div className="rounded-lg border border-border bg-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">{t('dash.noContacts')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'editor' && (
              <>
                {/* QR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <QRCodeCard slug={profile.slug} />
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm font-semibold text-foreground mb-3">{t('dash.clicksByLink')}</p>
                    {profile.links.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t('dash.noLinks')}</p>
                    ) : (
                      <div className="space-y-2">
                        {profile.links.map(link => {
                          const clicks = effectiveClickStats.find(s => s.link_id === link.id)?.clicks || 0;
                          return (
                            <div key={link.id} className="flex items-center justify-between text-sm">
                              <span className="text-foreground truncate max-w-[200px]">{link.label || 'Sin nombre'}</span>
                              <span className="text-primary font-semibold">{clicks}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor + Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 lg:order-1">
                    <ProfileEditorForm profile={profile} onChange={setProfile} onPublish={handleSave}
                      publishLabel={t('dash.save')} isPublishing={saving} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-center lg:order-2 lg:sticky lg:top-8">
                    <PhoneMockup><TemplateRenderer profile={profile} profileId={activeProfileId} /></PhoneMockup>
                  </motion.div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
