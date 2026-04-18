import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Zap, Link2, Palette, BarChart2, Shield, Smartphone, CreditCard,
  ChevronDown, ChevronUp, Star, ShoppingBag, MessageCircle, Check, X as XIcon,
  Store, ArrowRight,
} from 'lucide-react';

// ─── Testimonios ────────────────────────────────────────────────────────────
const TESTIMONIOS = [
  { nombre: 'Camila Torres', rol: 'Life Coach · Colombia', rolEn: 'Life Coach · Colombia', texto: 'En menos de 5 minutos tenía mi link listo para compartir en Instagram. Mis clientes ahora encuentran todo en un solo lugar.', textoEn: 'In less than 5 minutes I had my link ready to share on Instagram. My clients now find everything in one place.', estrellas: 5 },
  { nombre: 'Diego Herrera', rol: 'DJ · México', rolEn: 'DJ · Mexico', texto: 'El diseño es elegante y se ve profesional. Puse mi Spotify, mis redes y mi WhatsApp y ya no pierdo contactos.', textoEn: 'The design is elegant and looks professional. I added my Spotify, social media and WhatsApp and I no longer lose contacts.', estrellas: 5 },
  { nombre: 'Valentina López', rol: 'Tienda de ropa · Argentina', rolEn: 'Clothing store · Argentina', texto: 'Activé la tienda y ese mismo día recibí 3 pedidos por WhatsApp. Mis clientas arman el carrito solas y yo solo confirmo.', textoEn: 'I activated the store and that same day I received 3 orders via WhatsApp. My customers build their cart on their own and I just confirm.', estrellas: 5 },
  { nombre: 'Andrés Vargas', rol: 'Consultor de negocios · Perú', rolEn: 'Business Consultant · Peru', texto: 'Cambié de Linktree a LinkOne y la diferencia es abismal. El diseño, la tarjeta virtual y el pago único me convencieron al instante.', textoEn: 'I switched from Linktree to LinkOne and the difference is huge. The design, virtual card and one-time payment convinced me instantly.', estrellas: 5 },
];

// ─── Phone themes (ejemplos link-in-bio) ────────────────────────────────────
const PHONE_THEMES = [
  { nombre: 'Juan Rodríguez', bio: 'Ingeniero · MBA', bioEn: 'Engineer · MBA', initials: 'JR', label: 'Corporativo', labelEn: 'Corporate', screen: 'bg-[#f8f8f8]', nameColor: 'text-[#111]', bioColor: 'text-[#555]', avatarBg: 'bg-[#dde4f0]', avatarText: 'text-[#3b4a72]', avatarBorder: 'border-[#ddd]', socBg: 'bg-[#333]', btnStyle: 'border border-[#222] text-[#111] bg-transparent', links: ['Portfolio', 'LinkedIn', 'Contáctame'], linksEn: ['Portfolio', 'LinkedIn', 'Contact me'] },
  { nombre: 'Camilo Torres', bio: 'Coach de Vida & Bienestar', bioEn: 'Life Coach & Wellness', initials: 'CT', label: 'Lifestyle', labelEn: 'Lifestyle', screen: 'bg-gradient-to-b from-[#2a5425] via-[#3d7535] to-[#1b3b18]', nameColor: 'text-white', bioColor: 'text-white/75', avatarBg: 'bg-[#7aad6a]', avatarText: 'text-white', avatarBorder: 'border-white/60', socBg: 'bg-white/70', btnStyle: 'border border-white/30 text-white bg-white/15', links: ['Servicio Personal', 'Servicio Grupal', 'Empresas'], linksEn: ['Personal Service', 'Group Service', 'Corporate'] },
  { nombre: 'Valentina López', bio: 'Clothes Cute', bioEn: 'Clothes Cute', initials: 'VL', label: 'Tienda / Moda', labelEn: 'Store / Fashion', screen: 'bg-gradient-to-br from-[#c09090] via-[#7d4555] to-[#4a2535]', nameColor: 'text-white', bioColor: 'text-white/75', avatarBg: 'bg-[#c49a9a]', avatarText: 'text-white', avatarBorder: 'border-pink-200/60', socBg: 'bg-white/60', btnStyle: 'border border-white/28 text-white bg-[#a05060]/40', links: ['Catálogo Mujer', 'Catálogo Niñas', 'Pedidos en Línea'], linksEn: ['Women Catalog', 'Girls Catalog', 'Online Orders'] },
  { nombre: 'Andrés Varela', bio: 'Emprendedor · Finanzas', bioEn: 'Entrepreneur · Finance', initials: 'AV', label: 'Dark / Premium', labelEn: 'Dark / Premium', screen: 'bg-[#0a0a0a]', nameColor: 'text-[#e8d9b0]', bioColor: 'text-[#888]', avatarBg: 'bg-[#2a2200]', avatarText: 'text-[#c9a84c]', avatarBorder: 'border-[#c9a84c]', socBg: 'bg-[#c9a84c]', btnStyle: 'border border-[#c9a84c]/45 text-[#c9a84c] bg-[#c9a84c]/10', links: ['Consultoría', 'Podcast', 'Newsletter'], linksEn: ['Consulting', 'Podcast', 'Newsletter'] },
];

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay } });

// ─── Phone Card ─────────────────────────────────────────────────────────────
function PhoneCard({ p, lang, large = false }: { p: typeof PHONE_THEMES[0]; lang: string; large?: boolean }) {
  const links = lang === 'en' ? p.linksEn : p.links;
  const bio = lang === 'en' ? p.bioEn : p.bio;
  const label = lang === 'en' ? p.labelEn : p.label;

  const w = large ? 'w-[200px]' : 'w-[155px]';
  const h = large ? 'h-[400px]' : 'h-[300px]';
  const r = large ? 'rounded-[30px]' : 'rounded-[26px]';
  const ri = large ? 'rounded-[25px]' : 'rounded-[21px]';
  const notch = large ? 'w-14 h-4' : 'w-12 h-3.5';
  const avatar = large ? 'w-14 h-14 text-base' : 'w-12 h-12 text-sm';
  const nameSize = large ? 'text-[13px]' : 'text-[11px]';
  const bioSize = large ? 'text-[10px]' : 'text-[9px]';
  const socSize = large ? 'w-4 h-4' : 'w-3 h-3';
  const btnPy = large ? 'py-2' : 'py-1.5';
  const btnText = large ? 'text-[10px]' : 'text-[8.5px]';
  const px = large ? 'px-3' : 'px-2.5';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${r} bg-[#111] overflow-hidden flex-shrink-0 shadow-2xl ${w} ${h} border-[5px] border-[#1e1e1e] ring-1 ring-[#3a3a3a]`}>
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${notch} bg-[#111] rounded-b-lg z-10`} />
        <div className={`w-full h-full ${ri} overflow-hidden flex flex-col items-center pt-6 ${p.screen}`}>
          <div className={`${avatar} rounded-full border-2 ${p.avatarBorder} ${p.avatarBg} ${p.avatarText} flex items-center justify-center font-semibold mt-1 mb-1.5 flex-shrink-0`}>{p.initials}</div>
          <p className={`${nameSize} font-semibold text-center leading-tight ${p.nameColor}`}>{p.nombre}</p>
          <p className={`${bioSize} text-center mt-0.5 ${p.bioColor}`}>{bio}</p>
          <div className="flex gap-1.5 my-1.5">{[0,1,2].map(i => <div key={i} className={`${socSize} rounded-full ${p.socBg}`} />)}</div>
          <div className={`w-full ${px} flex flex-col gap-1 mt-0.5`}>
            {links.map((l, i) => <div key={i} className={`w-full ${btnPy} rounded-full ${btnText} font-medium text-center ${p.btnStyle}`}>{l}</div>)}
          </div>
        </div>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Store Phone Mockup ─────────────────────────────────────────────────────
function StorePhoneMockup({ lang }: { lang: string }) {
  const products = lang === 'en'
    ? [
        { name: 'Pink Set', price: '$45.000' },
        { name: 'Crop Top', price: '$28.000' },
        { name: 'Mom Jeans', price: '$65.000' },
      ]
    : [
        { name: 'Set Rosado', price: '$45.000' },
        { name: 'Crop Top', price: '$28.000' },
        { name: 'Mom Jeans', price: '$65.000' },
      ];
  return (
    <div className="relative rounded-[30px] bg-[#111] overflow-hidden flex-shrink-0 shadow-2xl w-[200px] h-[400px] border-[5px] border-[#1e1e1e] ring-1 ring-[#3a3a3a]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-[#111] rounded-b-lg z-10" />
      <div className="w-full h-full rounded-[25px] overflow-hidden bg-gradient-to-br from-[#c09090] via-[#7d4555] to-[#4a2535] flex flex-col">
        {/* Header */}
        <div className="pt-7 pb-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#c49a9a] border border-pink-200/60 flex items-center justify-center text-[8px] font-bold text-white">VL</div>
            <span className="text-[10px] font-semibold text-white">Clothes Cute</span>
          </div>
          <div className="flex gap-1">
            <div className="text-[8px] px-2 py-0.5 rounded-full border border-white/20 text-white/80">Links</div>
            <div className="text-[8px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{lang === 'en' ? 'Store' : 'Tienda'}</div>
          </div>
        </div>
        {/* Categories */}
        <div className="flex gap-1 px-3 mb-2">
          <span className="text-[7px] px-2 py-0.5 rounded-full bg-white/25 text-white font-medium">{lang === 'en' ? 'All' : 'Todos'}</span>
          <span className="text-[7px] px-2 py-0.5 rounded-full border border-white/15 text-white/60">Sets</span>
          <span className="text-[7px] px-2 py-0.5 rounded-full border border-white/15 text-white/60">Tops</span>
        </div>
        {/* Products */}
        <div className="flex-1 px-3 space-y-2 overflow-hidden">
          {products.map((p, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
              <div className="w-10 h-10 rounded-md bg-white/15 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={12} className="text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-medium text-white truncate">{p.name}</p>
                <p className="text-[8px] text-white/60">{p.price}</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">+</div>
            </div>
          ))}
        </div>
        {/* Cart bar */}
        <div className="mx-3 mb-4 mt-2">
          <div className="bg-green-500 rounded-lg py-2 px-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageCircle size={10} className="text-white" />
              <span className="text-[8px] font-semibold text-white">{lang === 'en' ? 'Order via WhatsApp' : 'Pedir por WhatsApp'}</span>
            </div>
            <span className="text-[8px] font-bold text-white">$138.000</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sección "Tu link que también vende" ────────────────────────────────────
function SeccionTienda() {
  const { t, language } = useLanguage();
  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold tracking-wide uppercase">
            {t('landing.store.badge')}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            {t('landing.store.title1')}<br />
            <span className="gold-text">{t('landing.store.title2')}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            {t('landing.store.desc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Mockups */}
          <motion.div {...fadeUp(0.1)} className="flex justify-center items-end gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <PhoneCard p={PHONE_THEMES[2]} lang={language} large />
              <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                {t('landing.store.labelLinks')}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center pb-16">
              <ArrowRight size={20} className="text-primary animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <StorePhoneMockup lang={language} />
              <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                {t('landing.store.labelStore')}
              </span>
            </div>
          </motion.div>

          {/* Features list */}
          <motion.div {...fadeUp(0.2)} className="space-y-5">
            {[
              { icon: <ShoppingBag size={18} />, title: t('landing.store.f1.title'), desc: t('landing.store.f1.desc') },
              { icon: <MessageCircle size={18} />, title: t('landing.store.f2.title'), desc: t('landing.store.f2.desc') },
              { icon: <Palette size={18} />, title: t('landing.store.f3.title'), desc: t('landing.store.f3.desc') },
              { icon: <BarChart2 size={18} />, title: t('landing.store.f4.title'), desc: t('landing.store.f4.desc') },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{f.icon}</div>
                <div>
                  <p className="font-semibold text-foreground text-sm mb-0.5">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Beneficios ─────────────────────────────────────────────────────────────
function SeccionBeneficios() {
  const { t } = useLanguage();
  const BENEFICIOS = [
    { icon: <Zap size={22} className="text-primary" />, titulo: t('landing.benefits.b1.title'), desc: t('landing.benefits.b1.desc') },
    { icon: <Link2 size={22} className="text-primary" />, titulo: t('landing.benefits.b2.title'), desc: t('landing.benefits.b2.desc') },
    { icon: <Palette size={22} className="text-primary" />, titulo: t('landing.benefits.b3.title'), desc: t('landing.benefits.b3.desc') },
    { icon: <BarChart2 size={22} className="text-primary" />, titulo: t('landing.benefits.b4.title'), desc: t('landing.benefits.b4.desc') },
    { icon: <CreditCard size={22} className="text-primary" />, titulo: t('landing.benefits.b5.title'), desc: t('landing.benefits.b5.desc') },
    { icon: <Smartphone size={22} className="text-primary" />, titulo: t('landing.benefits.b6.title'), desc: t('landing.benefits.b6.desc') },
    { icon: <Store size={22} className="text-primary" />, titulo: t('landing.benefits.b8.title'), desc: t('landing.benefits.b8.desc') },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFICIOS.map((b, i) => (
            <motion.div key={i} {...fadeUp(i * 0.06)}
              className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">{b.icon}</div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">{b.titulo}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Ejemplos ───────────────────────────────────────────────────────────────
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

// ─── Pricing ────────────────────────────────────────────────────────────────
function SeccionPricing() {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('landing.pricing.pro.name'),
      price: t('landing.pricing.pro.price'),
      priceNote: t('landing.pricing.pro.priceNote'),
      desc: t('landing.pricing.pro.desc'),
      highlight: false,
      features: [
        { text: t('landing.pricing.pro.f1'), included: true },
        { text: t('landing.pricing.pro.f2'), included: true },
        { text: t('landing.pricing.pro.f3'), included: true },
        { text: t('landing.pricing.pro.f4'), included: true },
        { text: t('landing.pricing.pro.f5'), included: true },
        { text: t('landing.pricing.pro.f6'), included: true },
        { text: t('landing.pricing.pro.f7'), included: false },
        { text: t('landing.pricing.pro.f8'), included: false },
      ],
      cta: t('landing.pricing.pro.cta'),
      href: '#editor',
    },
    {
      name: t('landing.pricing.store.name'),
      price: t('landing.pricing.store.price'),
      priceNote: t('landing.pricing.store.priceNote'),
      desc: t('landing.pricing.store.desc'),
      highlight: true,
      features: [
        { text: t('landing.pricing.store.f1'), included: true },
        { text: t('landing.pricing.store.f2'), included: true },
        { text: t('landing.pricing.store.f3'), included: true },
        { text: t('landing.pricing.store.f4'), included: true },
        { text: t('landing.pricing.store.f5'), included: true },
        { text: t('landing.pricing.store.f6'), included: true },
        { text: t('landing.pricing.store.f7'), included: true },
        { text: t('landing.pricing.store.f8'), included: true },
      ],
      cta: t('landing.pricing.store.cta'),
      href: '#editor',
    },
  ];

  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            {t('landing.pricing.badge')}
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            {t('landing.pricing.title1')}<br />
            <span className="gold-text">{t('landing.pricing.title2')}</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            {t('landing.pricing.desc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.12)}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col border-2 transition-all ${
                plan.highlight
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gold-gradient text-primary-foreground text-[11px] font-semibold tracking-wide uppercase">
                  {t('landing.pricing.popular')}
                </span>
              )}

              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{plan.desc}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.priceNote}</span>
              </div>

              <div className="space-y-2.5 flex-1">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XIcon size={14} className="text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${f.included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={plan.href}
                className={`mt-6 w-full py-3 rounded-xl text-center text-sm font-semibold transition-all inline-block ${
                  plan.highlight
                    ? 'gold-gradient text-primary-foreground hover:opacity-90 shadow-md'
                    : 'bg-card border-2 border-primary text-primary hover:bg-primary/10'
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeUp(0.3)} className="text-center text-xs text-muted-foreground mt-8">
          {t('landing.pricing.note')}
        </motion.p>
      </div>
    </section>
  );
}

// ─── Testimonios ────────────────────────────────────────────────────────────
function SeccionTestimonios() {
  const { t, language } = useLanguage();
  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">{t('landing.testimonials.badge')}</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">{t('landing.testimonials.title1')}<br /><span className="gold-text">{t('landing.testimonials.title2')}</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

// ─── FAQ ─────────────────────────────────────────────────────────────────────
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
    { q: t('landing.faq.q7'), a: t('landing.faq.a7') },
    { q: t('landing.faq.q8'), a: t('landing.faq.a8') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') },
    { q: t('landing.faq.q5'), a: t('landing.faq.a5') },
    { q: t('landing.faq.q6'), a: t('landing.faq.a6') },
  ];

  return (
    <section className="py-20 px-6 border-t border-border">
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

// ─── CTA Final ──────────────────────────────────────────────────────────────
function SeccionCTAFinal() {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <motion.div {...fadeUp()} className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">{t('landing.cta.title1')}<br /><span className="gold-text">{t('landing.cta.title2')}</span></h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">{t('landing.cta.desc')}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#editor" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg">{t('landing.cta.btn')}</a>
        </div>
        <p className="text-xs text-muted-foreground">{t('landing.cta.note')}</p>
      </motion.div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────
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

// ─── Export ──────────────────────────────────────────────────────────────────
export default function LandingSections() {
  return (
    <>
      <SeccionTienda />
      <SeccionBeneficios />
      <SeccionEjemplos />
      <SeccionPricing />
      <SeccionTestimonios />
      <SeccionFAQ />
      <SeccionCTAFinal />
      <Footer />
    </>
  );
}
