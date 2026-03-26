import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Zap, Link2, Palette, BarChart2, Shield, Smartphone, CreditCard,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react';

// ─── Testimonios (hardcoded — no se traducen los nombres) ────────────────────
const TESTIMONIOS = [
  { nombre: 'Camila Torres', rol: 'Life Coach · Colombia', rolEn: 'Life Coach · Colombia', texto: 'En menos de 5 minutos tenía mi link listo para compartir en Instagram. Mis clientes ahora encuentran todo en un solo lugar.', textoEn: 'In less than 5 minutes I had my link ready to share on Instagram. My clients now find everything in one place.', estrellas: 5 },
  { nombre: 'Diego Herrera', rol: 'DJ · México', rolEn: 'DJ · Mexico', texto: 'El diseño es elegante y se ve profesional. Puse mi Spotify, mis redes y mi WhatsApp y ya no pierdo contactos.', textoEn: 'The design is elegant and looks professional. I added my Spotify, social media and WhatsApp and I no longer lose contacts.', estrellas: 5 },
  { nombre: 'Valentina López', rol: 'Tienda de ropa · Argentina', rolEn: 'Clothing store · Argentina', texto: 'Antes mandaba a mis seguidores a varios links distintos. Ahora todo está en uno y mis ventas mejoraron.', textoEn: 'I used to send my followers to different links. Now everything is in one place and my sales improved.', estrellas: 5 },
];

// ─── Phone themes (ejemplos) ─────────────────────────────────────────────────
const PHONE_THEMES = [
  { nombre: 'Juan Rodríguez', bio: 'Ingeniero · MBA', bioEn: 'Engineer · MBA', initials: 'JR', label: 'Corporativo', labelEn: 'Corporate', screen: 'bg-[#f8f8f8]', nameColor: 'text-[#111]', bioColor: 'text-[#555]', avatarBg: 'bg-[#dde4f0]', avatarText: 'text-[#3b4a72]', avatarBorder: 'border-[#ddd]', socBg: 'bg-[#333]', btnStyle: 'border border-[#222] text-[#111] bg-transparent', links: ['Portfolio', 'LinkedIn', 'Contáctame'], linksEn: ['Portfolio', 'LinkedIn', 'Contact me'] },
  { nombre: 'Camilo Torres', bio: 'Coach de Vida & Bienestar', bioEn: 'Life Coach & Wellness', initials: 'CT', label: 'Lifestyle', labelEn: 'Lifestyle', screen: 'bg-gradient-to-b from-[#2a5425] via-[#3d7535] to-[#1b3b18]', nameColor: 'text-white', bioColor: 'text-white/75', avatarBg: 'bg-[#7aad6a]', avatarText: 'text-white', avatarBorder: 'border-white/60', socBg: 'bg-white/70', btnStyle: 'border border-white/30 text-white bg-white/15', links: ['Servicio Personal', 'Servicio Grupal', 'Empresas'], linksEn: ['Personal Service', 'Group Service', 'Corporate'] },
  { nombre: 'Valentina López', bio: 'Clothes Cute', bioEn: 'Clothes Cute', initials: 'VL', label: 'Tienda / Moda', labelEn: 'Store / Fashion', screen: 'bg-gradient-to-br from-[#c09090] via-[#7d4555] to-[#4a2535]', nameColor: 'text-white', bioColor: 'text-white/75', avatarBg: 'bg-[#c49a9a]', avatarText: 'text-white', avatarBorder: 'border-pink-200/60', socBg: 'bg-white/60', btnStyle: 'border border-white/28 text-white bg-[#a05060]/40', links: ['Catálogo Mujer', 'Catálogo Niñas', 'Pedidos en Línea'], linksEn: ['Women Catalog', 'Girls Catalog', 'Online Orders'] },
  { nombre: 'Andrés Varela', bio: 'Emprendedor · Finanzas', bioEn: 'Entrepreneur · Finance', initials: 'AV', label: 'Dark / Premium', labelEn: 'Dark / Premium', screen: 'bg-[#0a0a0a]', nameColor: 'text-[#e8d9b0]', bioColor: 'text-[#888]', avatarBg: 'bg-[#2a2200]', avatarText: 'text-[#c9a84c]', avatarBorder: 'border-[#c9a84c]', socBg: 'bg-[#c9a84c]', btnStyle: 'border border-[#c9a84c]/45 text-[#c9a84c] bg-[#c9a84c]/10', links: ['Consultoría', 'Podcast', 'Newsletter'], linksEn: ['Consulting', 'Podcast', 'Newsletter'] },
];

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay } });

// ─── Phone Card ───────────────────────────────────────────────────────────────
function PhoneCard({ p, lang }: { p: typeof PHONE_THEMES[0]; lang: string }) {
  const links = lang === 'en' ? p.linksEn : p.links;
  const bio = lang === 'en' ? p.bioEn : p.bio;
  const label = lang === 'en' ? p.labelEn : p.label;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-[26px] bg-[#111] overflow-hidden flex-shrink-0 shadow-2xl w-[155px] h-[300px] border-[5px] border-[#1e1e1e] ring-1 ring-[#3a3a3a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#111] rounded-b-lg z-10" />
        <div className={`w-full h-full rounded-[21px] overflow-hidden flex flex-col items-center pt-6 ${p.screen}`}>
          <div className={`w-12 h-12 rounded-full border-2 ${p.avatarBorder} ${p.avatarBg} ${p.avatarText} flex items-center justify-center text-sm font-semibold mt-1 mb-1.5 flex-shrink-0`}>{p.initials}</div>
          <p className={`text-[11px] font-semibold text-center leading-tight ${p.nameColor}`}>{p.nombre}</p>
          <p className={`text-[9px] text-center mt-0.5 ${p.bioColor}`}>{bio}</p>
          <div className="flex gap-1.5 my-1.5">{[0,1,2].map(i => <div key={i} className={`w-3 h-3 rounded-full ${p.socBg}`} />)}</div>
          <div className="w-full px-2.5 flex flex-col gap-1 mt-0.5">
            {links.map((l, i) => <div key={i} className={`w-full py-1.5 rounded-full text-[8.5px] font-medium text-center ${p.btnStyle}`}>{l}</div>)}
          </div>
        </div>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Beneficios ───────────────────────────────────────────────────────────────
function SeccionBeneficios() {
  const { t, language } = useLanguage();
  const BENEFICIOS = [
    { icon: <Zap size={22} className="text-primary" />, titulo: t('landing.benefits.b1.title'), desc: t('landing.benefits.b1.desc') },
    { icon: <Link2 size={22} className="text-primary" />, titulo: t('landing.benefits.b2.title'), desc: t('landing.benefits.b2.desc') },
    { icon: <Palette size={22} className="text-primary" />, titulo: t('landing.benefits.b3.title'), desc: t('landing.benefits.b3.desc') },
    { icon: <BarChart2 size={22} className="text-primary" />, titulo: t('landing.benefits.b4.title'), desc: t('landing.benefits.b4.desc') },
    { icon: <CreditCard size={22} className="text-primary" />, titulo: t('landing.benefits.b5.title'), desc: t('landing.benefits.b5.desc') },
    { icon: <Smartphone size={22} className="text-primary" />, titulo: t('landing.benefits.b6.title'), desc: t('landing.benefits.b6.desc') },
    { icon: <Shield size={22} className="text-primary" />, titulo: t('landing.benefits.b7.title'), desc: t('landing.benefits.b7.desc') },
  ];
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">{t('landing.benefits.badge')}</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">{t('landing.benefits.title1')}<br /><span className="gold-text">{t('landing.benefits.title2')}</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">{t('landing.benefits.desc')}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFICIOS.map((b, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              className={`flex gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors
                ${i === BENEFICIOS.length - 1 && BENEFICIOS.length % 3 === 1 ? 'lg:col-start-2' : ''}
                ${i === BENEFICIOS.length - 1 && BENEFICIOS.length % 2 === 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
              <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">{b.icon}</div>
              <div><p className="font-semibold text-foreground text-sm mb-1">{b.titulo}</p><p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Ejemplos ─────────────────────────────────────────────────────────────────
function SeccionEjemplos() {
  const { t, language } = useLanguage();
  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">{t('landing.examples.badge')}</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">{t('landing.examples.title1')}<br /><span className="gold-text">{t('landing.examples.title2')}</span></h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{t('landing.examples.desc')}</p>
        </motion.div>
        <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-5 justify-center items-end">
          {PHONE_THEMES.map((p, i) => <PhoneCard key={i} p={p} lang={language} />)}
          <div className="flex flex-col items-center gap-2">
            <a href="#editor" className="w-[155px] h-[300px] rounded-[26px] border-2 border-dashed border-primary/40 bg-card hover:border-primary/70 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-light group-hover:bg-primary/20 transition-colors">+</div>
              <p className="text-xs font-semibold text-primary text-center px-4 leading-snug">{t('landing.examples.cta')}</p>
              <p className="text-[10px] text-muted-foreground">{t('landing.examples.ctaSub')}</p>
            </a>
            <span className="text-[10px] opacity-0">·</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonios ──────────────────────────────────────────────────────────────
function SeccionTestimonios() {
  const { t, language } = useLanguage();
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">{t('landing.testimonials.badge')}</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">{t('landing.testimonials.title1')}<br /><span className="gold-text">{t('landing.testimonials.title2')}</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIOS.map((t2, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex gap-0.5">{Array.from({ length: t2.estrellas }).map((_, s) => <Star key={s} size={14} className="fill-primary text-primary" />)}</div>
              <p className="text-sm text-foreground leading-relaxed">"{language === 'en' ? t2.textoEn : t2.texto}"</p>
              <div><p className="text-sm font-semibold text-foreground">{t2.nombre}</p><p className="text-xs text-muted-foreground">{language === 'en' ? t2.rolEn : t2.rol}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function SeccionFAQ() {
  const { t } = useLanguage();
  const [abierto, setAbierto] = useState<number | null>(null);
  const [precios, setPrecios] = useState<string>('');

  useEffect(() => {
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.from('pricing').select('country_name, display_price').order('is_default', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            const lista = data.map((p: any) => `${p.country_name}: ${p.display_price}`).join(' · ');
            setPrecios(lista);
          }
        });
    });
  }, []);

  const FAQS = [
    { q: t('landing.faq.q1'), a: precios ? `${t('landing.faq.q1.prefix')}${precios}.` : t('landing.faq.q1.loading') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') },
    { q: t('landing.faq.q5'), a: t('landing.faq.a5') },
    { q: t('landing.faq.q6'), a: t('landing.faq.a6') },
  ];

  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">{t('landing.faq.badge')}</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">{t('landing.faq.title1')}<br /><span className="gold-text">{t('landing.faq.title2')}</span></h2>
        </motion.div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} {...fadeUp(i * 0.05)} className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setAbierto(abierto === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                <span className="font-semibold text-foreground text-sm">{faq.q}</span>
                {abierto === i ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
              </button>
              {abierto === i && <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function SeccionCTAFinal() {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6 border-t border-border">
      <motion.div {...fadeUp()} className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">{t('landing.cta.title1')}<br /><span className="gold-text">{t('landing.cta.title2')}</span></h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">{t('landing.cta.desc')}</p>
        <a href="#editor" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg">{t('landing.cta.btn')}</a>
        <p className="text-xs text-muted-foreground">{t('landing.cta.note')}</p>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold gold-text">LinkOne</span>
            <span className="text-xs text-muted-foreground">{t('landing.footer.tagline')}</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <button onClick={() => navigate('/terminos')} className="hover:text-foreground transition-colors">{t('landing.footer.terms')}</button>
            <button onClick={() => navigate('/privacidad')} className="hover:text-foreground transition-colors">{t('landing.footer.privacy')}</button>
          </nav>
          <p className="text-xs text-muted-foreground">© {year} LinkOne · {t('landing.footer.copy')}</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function LandingSections() {
  return (
    <>
      <SeccionBeneficios />
      <SeccionEjemplos />
      <SeccionTestimonios />
      <SeccionFAQ />
      <SeccionCTAFinal />
      <Footer />
    </>
  );
}
