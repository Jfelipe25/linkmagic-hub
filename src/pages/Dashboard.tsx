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
import { Copy, Check, Loader2, ExternalLink, LogOut, Plus, Download, X, Trash2, CreditCard } from 'lucide-react';
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

const DEMO_PROFILES: ProfileRow[] = [];
const DEMO_CLICK_STATS: { link_id: string; clicks: number }[] = [];

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
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'qr' | 'contacts'>('editor');

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
        setIsDemo(false);
        setProfiles([]);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, [user]);

  const switchProfile = (id: string) => {
    const row = profiles.find(p => p.id === id);
    if (row) { setActiveProfileId(id); setProfile(profileFromRow(row)); setShowNewForm(false); }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('¿Eliminar este perfil? Esta acción no se puede deshacer.')) return;
    await supabase.from('profiles').delete().eq('id', id);
    const remaining = profiles.filter(p => p.id !== id);
    setProfiles(remaining);
    if (activeProfileId === id) {
      if (remaining.length > 0) {
        setActiveProfileId(remaining[0].id);
        setProfile(profileFromRow(remaining[0]));
      } else {
        setActiveProfileId('');
      }
    }
  };

  const handlePayPending = async (profileId: string) => {
    const row = profiles.find(p => p.id === profileId);
    if (!row) return;
    try {
      const { data, error } = await supabase.functions.invoke('pay-existing', {
        body: { profile_id: profileId, country_code: selectedPricing?.country_code },
      });
      if (error) throw error;
      if (data?.init_point) window.location.href = data.init_point;
      else toast.error('Error al generar el pago');
    } catch (err: any) { toast.error(err.message || 'Error'); }
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
        {/* Empty state - sin perfiles */}
        {!isDemo && profiles.length === 0 && !showNewForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 mb-6 text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h2 className="text-lg font-bold text-foreground mb-1">Crea tu primera página</h2>
            <p className="text-sm text-muted-foreground mb-4">Diseña tu perfil y comparte todos tus links en un solo lugar</p>
            <button onClick={() => { setShowNewForm(true); setNewProfile({ ...DEFAULT_PROFILE }); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus size={16} /> Crear mi página
            </button>
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
                <span className={`text-[10px] font-mono ${p.id === activeProfileId && !showNewForm ? 'opacity-70' : 'opacity-50'}`}>/u/{p.slug}</span>
                {!p.paid && <span className="ml-1 text-[9px] text-yellow-500">● pendiente</span>}
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
              <div className="flex gap-2 flex-wrap">
                {!profile.paid ? (
                  <>
                    <button onClick={() => handlePayPending(activeProfileId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                      <CreditCard size={12} /> Activar — pagar ahora
                    </button>
                    <button onClick={() => handleDeleteProfile(activeProfileId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-300 text-red-500 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleDeleteProfile(activeProfileId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors">
                    <Trash2 size={12} /> Eliminar perfil
                  </button>
                )}
              </div>
            </motion.div>

            {/* Dashboard tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {([
                { key: 'editor', label: '✏️ Editor' },
                { key: 'analytics', label: `📊 ${t('dash.analytics')}` },
                { key: 'qr', label: '🪪 QR & Tarjeta' },
                { key: 'contacts', label: `👥 ${t('dash.contacts')}` },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab analytics */}
            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AnalyticsCharts
                  profileId={isDemo ? '' : activeProfileId}
                  profileViews={profile.views ?? 0}
                  totalClicks={effectiveTotalClicks}
                  clickStats={effectiveClickStats}
                  links={profile.links}
                />
                {/* Clics por link */}
                <div className="rounded-lg border border-border bg-card p-4 mt-4">
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
              </motion.div>
            )}

            {/* Tab QR & Tarjeta Virtual */}
            {activeTab === 'qr' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* QR Code */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm font-semibold text-foreground mb-4">Código QR</p>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="rounded-xl border border-border bg-white p-4">
                      <img src={qrUrl} alt="QR" className="w-48 h-48" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Comparte este QR para que tus visitantes lleguen directo a tu perfil.</p>
                      <div className="flex flex-col gap-2">
                        <button onClick={handleDownloadQR}
                          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity w-fit">
                          <Download size={14} /> Descargar QR
                        </button>
                        <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors w-fit">
                          <ExternalLink size={14} /> Ver perfil público
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Tarjeta Virtual */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm font-semibold text-foreground mb-4">Tarjeta virtual</p>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-full max-w-sm">
                      <a href={`/card/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                        className="block rounded-2xl overflow-hidden shadow-xl relative" style={{ aspectRatio: '1.6/1' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
                        <div className="relative h-full flex p-5 gap-4 items-center justify-between">
                          <div className="flex flex-col gap-2">
                            {profile.avatar
                              ? <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: profile.accent_color }} />
                              : <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: profile.accent_color + '33', color: profile.accent_color }}>{profile.name?.charAt(0)?.toUpperCase()}</div>
                            }
                            <p className="text-white font-bold text-base leading-tight">{profile.name}</p>
                            {profile.bio && <p className="text-neutral-400 text-xs line-clamp-2">{profile.bio}</p>}
                            <span className="text-xs font-bold" style={{ color: profile.accent_color }}>LinkOne /{profile.slug}</span>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/u/${profile.slug}`)}`} alt="QR" className="w-20 h-20" />
                          </div>
                        </div>
                      </a>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Tu tarjeta digital. Compártela o descarga el contacto.</p>
                  
                      <a href={`/card/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors w-fit">
                        <ExternalLink size={14} /> Ver tarjeta completa
                      </a>
                    </div>
                  </div>
                </div>
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
