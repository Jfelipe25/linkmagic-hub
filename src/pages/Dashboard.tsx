import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData, DEFAULT_PROFILE } from '@/types/profile';
import { profileFromRow } from '@/lib/profile-utils';
import ProfileEditorForm from '@/components/editor/ProfileEditorForm';
import PhoneMockup from '@/components/editor/PhoneMockup';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { Copy, Check, Loader2, ExternalLink, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>({ ...DEFAULT_PROFILE });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileId, setProfileId] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setProfile(profileFromRow(data));
        setProfileId(data.id);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!profileId) return;
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
        background_image: profile.background_image,
        social_links: profile.social_links as any,
        links: profile.links as any,
      })
      .eq('id', profileId);
    if (error) toast.error('Error al guardar');
    else toast.success('Cambios guardados');
    setSaving(false);
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
            <p className="text-xs text-muted-foreground">Creado</p>
            <p className="text-sm text-foreground">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            <ProfileEditorForm
              profile={profile}
              onChange={setProfile}
              onPublish={handleSave}
              publishLabel="Guardar cambios"
              isPublishing={saving}
            />
          </div>
          <div className="hidden lg:flex items-start justify-center sticky top-8">
            <PhoneMockup>
              <TemplateRenderer profile={profile} />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
