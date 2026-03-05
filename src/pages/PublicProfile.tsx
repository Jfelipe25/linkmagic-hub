import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileData } from '@/types/profile';
import { profileFromRow } from '@/lib/profile-utils';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { Loader2, Lock } from 'lucide-react';

const PublicProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
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
      else { setProfile(profileFromRow(data)); }
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold text-foreground">Perfil no encontrado</h1>
        <p className="text-muted-foreground">El link que buscas no existe.</p>
      </div>
    );
  }

  if (profile && !profile.paid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-6">
        <Lock size={48} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground text-center">Perfil pendiente de activación</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Este perfil aún no ha sido activado. El pago está siendo procesado o aún no se ha completado.
        </p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <TemplateRenderer profile={profile} />
    </div>
  );
};

export default PublicProfile;
