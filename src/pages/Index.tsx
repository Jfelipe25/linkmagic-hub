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

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
              Tu identidad digital en un solo link
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
              Todas tus redes, contenido y links<br className="hidden md:block" />
              <span className="gold-text">en una sola página personalizada</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Un <strong className="text-foreground">Link in Bio</strong> es la página que pones en tu perfil de Instagram, TikTok o cualquier red social. 
              En lugar de elegir un solo enlace, compartes <strong className="text-foreground">todos tus links</strong> — redes sociales, tienda, portafolio, WhatsApp y más — en un diseño profesional con tu marca personal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href="#editor" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                Crea tu LinkBio gratis ↓
              </a>
              <span className="text-xs text-muted-foreground">Solo pagas al publicar • Desde $2.990 CLP</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { icon: '🎨', title: 'Personalizable', desc: 'Elige plantillas, colores y fuentes' },
              { icon: '🔗', title: 'Links ilimitados', desc: 'Agrega todos los enlaces que quieras' },
              { icon: '📱', title: 'Optimizado para móvil', desc: 'Se ve perfecto en cualquier dispositivo' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-semibold text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground text-center">{item.desc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div id="editor" className="max-w-7xl mx-auto px-6 py-8">
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
