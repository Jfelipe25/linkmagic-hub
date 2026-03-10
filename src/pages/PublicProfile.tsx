import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';
import { profileFromRow } from '@/lib/profile-utils';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { Loader2, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PublicProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) { setNotFound(true); }
      else {
        setProfile(profileFromRow(data));
        setProfileId(data.id);
        supabase.rpc('increment_profile_views', { profile_slug: slug });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  useEffect(() => {
    if (!profile) return;
    document.title = `${profile.name || 'Perfil'} | LinkOne`;
    
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    const title = `${profile.name} | LinkOne`;
    const description = profile.bio || `Visita el perfil de ${profile.name}`;
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:type', 'profile');
    setMeta('og:url', window.location.href);
    if (profile.avatar) setMeta('og:image', profile.avatar);
    setMetaName('twitter:card', 'summary');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    if (profile.avatar) setMetaName('twitter:image', profile.avatar);
    setMetaName('description', description);

    return () => { document.title = 'LinkOne'; };
  }, [profile]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('profile.notFound')}</h1>
        <p className="text-muted-foreground">{t('profile.notFoundDesc')}</p>
      </div>
    );
  }

  if (profile && !profile.paid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-6">
        <Lock size={48} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground text-center">{t('profile.pending')}</h1>
        <p className="text-muted-foreground text-center max-w-md">{t('profile.pendingDesc')}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <TemplateRenderer profile={profile} profileId={profileId || undefined} />
    </div>
  );
};

export default PublicProfile;
