import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProfileData, DEFAULT_PROFILE } from '@/types/profile';
import ProfileEditorForm from '@/components/editor/ProfileEditorForm';
import PhoneMockup from '@/components/editor/PhoneMockup';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { usePricing } from '@/hooks/usePricing';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import LandingSections from '@/components/LandingSections';

const Index = () => {
  const [profile, setProfile] = useState<ProfileData>({ ...DEFAULT_PROFILE });
  const [publishing, setPublishing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { options: pricingOptions, selected: selectedPricing, setSelected: setSelectedPricing, loading: pricingLoading } = usePricing();

  // Redirigir perfiles que vienen de la función OG (/u/slug → /?_u=slug → /u/slug)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profileSlug = params.get('_u');
    if (profileSlug) {
      navigate(`/u/${profileSlug}`, { replace: true });
      return;
    }
    // Recuperar perfil guardado si viene de un pago fallido
    const pending = sessionStorage.getItem('pending_profile');
    if (pending) {
      try {
        const saved = JSON.parse(pending);
        setProfile(prev => ({ ...prev, ...saved }));
        // Scroll al editor automáticamente
        setTimeout(() => {
          document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      } catch (_) {}
    }
  }, [navigate]);

  const handlePublish = async () => {
    if (!profile.name.trim()) { toast.error('Por favor ingresa tu nombre'); return; }
    if (!profile.slug || profile.slug.length < 3) { toast.error('Por favor elige una URL personalizada válida'); return; }

    if (!user) {
      sessionStorage.setItem('pending_profile', JSON.stringify({ ...profile, country_code: selectedPricing?.country_code }));
      toast.info('Primero debes crear una cuenta para publicar');
      navigate('/login?redirect=publish');
      return;
    }

    // Meta Pixel — InitiateCheckout
    try {
      const price = selectedPricing?.price ?? 20000;
      const currency = { CO: 'COP', MX: 'MXN', AR: 'ARS', CL: 'CLP', PE: 'PEN', UY: 'UYU', BR: 'BRL', EC: 'USD', BO: 'BOB', PY: 'PYG', US: 'USD' }[selectedPricing?.country_code ?? ''] ?? 'COP';
      (window as any).fbq?.('track', 'InitiateCheckout', {
        value: price,
        currency,
        num_items: 1,
        content_name: 'LinkOne Profile',
      });
    } catch (_) {}

    setPublishing(true);
    // Guardar perfil para recuperar si el pago falla
    sessionStorage.setItem('pending_profile', JSON.stringify({ ...profile, country_code: selectedPricing?.country_code }));
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { ...profile, user_id: user.id, country_code: selectedPricing?.country_code },
      });
      if (error) throw error;
      if (data?.init_point) window.location.href = data.init_point;
      else toast.error('Error al crear el pago');
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar');
    }
    setPublishing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1
            className="text-2xl font-bold gold-text cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            LinkOne
          </h1>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/10 transition-colors"
              >
                {t('nav.dashboard')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/10 transition-colors"
              >
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
              {t('hero.badge')}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
              {t('hero.title1')}<br className="hidden md:block" />
              <span className="gold-text">{t('hero.title2')}</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t('hero.desc1')} <strong className="text-foreground">{t('hero.linkInBio')}</strong> {t('hero.desc2')} <strong className="text-foreground">{t('hero.allLinks')}</strong> {t('hero.desc3')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href="#editor" className="px-8 py-3.5 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md inline-flex items-center gap-2">
                {t('hero.cta')}
              </a>
              <span className="text-xs text-muted-foreground">{t('hero.onlyPay')}{!pricingLoading && selectedPricing ? ` • ${t('hero.from')} ${selectedPricing.display_price}` : ''}</span>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-12 grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '🎨', title: t('feat.custom'), desc: t('feat.customDesc') },
              { icon: '🔗', title: t('feat.links'), desc: t('feat.linksDesc') },
              { icon: '🛍️', title: t('feat.store'), desc: t('feat.storeDesc') },
              { icon: '📱', title: t('feat.mobile'), desc: t('feat.mobileDesc') },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-center lg:order-2 lg:sticky lg:top-8 self-start">
            <PhoneMockup>
              <TemplateRenderer profile={profile} />
            </PhoneMockup>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 lg:order-1">
            <ProfileEditorForm
              profile={profile}
              onChange={setProfile}
              onPublish={handlePublish}
              isPublishing={publishing}
              pricingOptions={pricingOptions}
              selectedPricing={selectedPricing}
              onPricingChange={setSelectedPricing}
            />
          </motion.div>
        </div>
      </div>
      <LandingSections />
    </div>
  );
};

export default Index;
