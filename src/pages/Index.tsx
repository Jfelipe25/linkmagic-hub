import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProfileData, DEFAULT_PROFILE } from '@/types/profile';
import ProfileEditorForm from '@/components/editor/ProfileEditorForm';
import PhoneMockup from '@/components/editor/PhoneMockup';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Index = () => {
  const [profile, setProfile] = useState<ProfileData>({ ...DEFAULT_PROFILE });
  const [publishing, setPublishing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePublish = async () => {
    if (!profile.name.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (!profile.slug || profile.slug.length < 3) {
      toast.error('Por favor elige una URL personalizada válida');
      return;
    }

    // If not logged in, save profile to sessionStorage and redirect to login
    if (!user) {
      sessionStorage.setItem('pending_profile', JSON.stringify(profile));
      toast.info('Primero debes crear una cuenta para publicar');
      navigate('/login?redirect=publish');
      return;
    }

    // User is logged in, proceed to payment
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { ...profile, user_id: user.id },
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
    setPublishing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold gold-text">LinkBio Pro</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="text-xs text-primary hover:underline">
                Mi Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="text-xs text-primary hover:underline">
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-center lg:order-2 lg:sticky lg:top-8"
          >
            <PhoneMockup>
              <TemplateRenderer profile={profile} />
            </PhoneMockup>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5 lg:order-1"
          >
            <ProfileEditorForm
              profile={profile}
              onChange={setProfile}
              onPublish={handlePublish}
              isPublishing={publishing}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
