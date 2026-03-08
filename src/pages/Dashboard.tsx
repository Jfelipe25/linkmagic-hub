import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData, DEFAULT_PROFILE } from '@/types/profile';
import { profileFromRow } from '@/lib/profile-utils';
import ProfileEditorForm from '@/components/editor/ProfileEditorForm';
import PhoneMockup from '@/components/editor/PhoneMockup';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import QRCodeCard from '@/components/QRCodeCard';
import { useLinkClicks } from '@/hooks/useLinkClicks';
import { usePricing } from '@/hooks/usePricing';
import { Copy, Check, Loader2, ExternalLink, LogOut, MousePointerClick, Plus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
    id: 'demo-1',
    slug: 'felipe-rodriguez',
    name: 'Felipe Rodriguez',
    bio: 'Ingeniero Mecánico | MBA',
    avatar: '',
    paid: true,
    views: 342,
    created_at: '2025-01-15T10:00:00Z',
    template: 'minimal',
    accent_color: '#d4a432',
    font_color: '#ffffff',
    font_family: 'Inter',
    background_image: '',
    social_links: { instagram: 'https://instagram.com/felipe', linkedin: 'https://linkedin.com/in/felipe', twitter: 'https://twitter.com/felipe' },
    links: [
      { id: '1', label: 'Mi portafolio', url: 'https://example.com' },
      { id: '2', label: 'Agendar reunión', url: 'https://calendly.com' },
      { id: '3', label: 'Mi empresa', url: 'https://miempresa.com' },
      { id: '4', label: 'Blog personal', url: 'https://blog.example.com' },
    ],
    user_id: 'demo',
    session_id: null,
  },
];

const DEMO_CLICK_STATS = [
  { link_id: '1', clicks: 87 },
  { link_id: '2', clicks: 54 },
  { link_id: '3', clicks: 31 },
  { link_id: '4', clicks: 12 },
];

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
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

  const { stats: clickStats, totalClicks } = useLinkClicks(isDemo ? null : (activeProfileId || null));
  const { options: pricingOptions, selected: selectedPricing, setSelected: setSelectedPricing } = usePricing();

  const effectiveClickStats = isDemo ? DEMO_CLICK_STATS : clickStats;
  const effectiveTotalClicks = isDemo ? DEMO_CLICK_STATS.reduce((sum, s) => sum + s.clicks, 0) : totalClicks;

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // Fetch all user profiles
  useEffect(() => {
    if (!user) return;
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setProfiles(data);
        setIsDemo(false);
        if (!activeProfileId || !data.find(p => p.id === activeProfileId)) {
          setActiveProfileId(data[0].id);
          setProfile(profileFromRow(data[0]));
        }
      } else {
        // No profiles yet — show demo
        setProfiles(DEMO_PROFILES);
        setActiveProfileId(DEMO_PROFILES[0].id);
        setProfile(profileFromRow(DEMO_PROFILES[0]));
        setIsDemo(true);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, [user]);

  // When switching active profile
  const switchProfile = (id: string) => {
    const row = profiles.find(p => p.id === id);
    if (row) {
      setActiveProfileId(id);
      setProfile(profileFromRow(row));
      setShowNewForm(false);
    }
  };

  const handleSave = async () => {
    if (!activeProfileId) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        template: profile.template,
        accent_color: profile.accent_color,
        font_color: profile.font_color,
        font_family: profile.font_family,
        background_image: profile.background_image,
        social_links: profile.social_links as any,
        links: profile.links as any,
      })
      .eq('id', activeProfileId);
    if (error) toast.error('Error al guardar');
    else {
      toast.success('Cambios guardados');
      // Update local profiles list
      setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, name: profile.name, slug: profile.slug } : p));
    }
    setSaving(false);
  };

  const handleCreateNew = async () => {
    if (!newProfile.name.trim()) {
      toast.error('Ingresa un nombre para el nuevo perfil');
      return;
    }
    if (!newProfile.slug || newProfile.slug.length < 3) {
      toast.error('Elige una URL válida (mínimo 3 caracteres)');
      return;
    }

    setCreatingNew(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { ...newProfile, user_id: user!.id, country_code: selectedPricing?.country_code },
      });
      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error('Error al crear el pago');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar');
    }
    setCreatingNew(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/u/${profile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold gold-text">LinkBio Pro</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Demo banner */}
        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-accent/30 bg-accent/10 p-4 mb-4 flex items-center gap-3"
          >
            <span className="text-lg">👀</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Esto es un demo</p>
              <p className="text-xs text-muted-foreground">
                Así se verá tu dashboard cuando tengas una página activa. ¡Crea tu primera URL para empezar!
              </p>
            </div>
          </motion.div>
        )}

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : '👋'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                ¡Hola, {profile.name || user?.email?.split('@')[0] || 'crack'}! 🎉
              </h2>
              <p className="text-sm text-muted-foreground">
                Tu página está activa y lista para compartir. Personalízala, comparte tu link y crece tu audiencia.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile switcher */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Mis páginas</p>
            <button
              onClick={() => { setShowNewForm(!showNewForm); setNewProfile({ ...DEFAULT_PROFILE }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={14} /> Nueva URL
            </button>
          </div>
          
          {/* Profile tabs */}
          <div className="flex gap-2 flex-wrap">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => switchProfile(p.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                  p.id === activeProfileId && !showNewForm
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/20'
                }`}
              >
                <span className="block truncate max-w-[140px]">{p.name || p.slug}</span>
                <span className="text-[10px] opacity-60 font-mono">/u/{p.slug}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* New profile form */}
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-6 mb-6"
          >
            <h3 className="text-sm font-bold text-foreground mb-4">Crear nueva página</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <ProfileEditorForm
                  profile={newProfile}
                  onChange={setNewProfile}
                  onPublish={handleCreateNew}
                  publishLabel="Pagar y crear nueva URL"
                  isPublishing={creatingNew}
                  pricingOptions={pricingOptions}
                  selectedPricing={selectedPricing}
                  onPricingChange={setSelectedPricing}
                />
              </div>
              <div className="flex items-start justify-center lg:sticky lg:top-8">
                <PhoneMockup>
                  <TemplateRenderer profile={newProfile} />
                </PhoneMockup>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active profile editor (only show when not creating new) */}
        {!showNewForm && activeProfileId && (
          <>
            {/* Status card */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-4 mb-6 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs text-muted-foreground mb-1">Tu link público</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-primary">/u/{profile.slug}</code>
                  <button onClick={copyLink} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Template</p>
                <p className="text-sm text-foreground capitalize">{profile.template}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Visitas</p>
                <p className="text-sm text-foreground font-semibold">{profile.views ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MousePointerClick size={12} /> Clics</p>
                <p className="text-sm text-foreground font-semibold">{effectiveTotalClicks}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Creado</p>
                <p className="text-sm text-foreground">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                </p>
              </div>
            </motion.div>

            {/* QR + Click stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <QRCodeCard slug={profile.slug} />
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MousePointerClick size={16} className="text-primary" /> Clics por link
                </p>
                {profile.links.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tienes links aún</p>
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5 lg:order-1"
              >
                <ProfileEditorForm
                  profile={profile}
                  onChange={setProfile}
                  onPublish={handleSave}
                  publishLabel="Guardar cambios"
                  isPublishing={saving}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-center lg:order-2 lg:sticky lg:top-8"
              >
                <PhoneMockup>
                  <TemplateRenderer profile={profile} />
                </PhoneMockup>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
