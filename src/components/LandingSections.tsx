import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Link2, Palette, BarChart2, Shield, Smartphone, CreditCard,
  ChevronDown, ChevronUp, Star
} from 'lucide-react';

// ─── DATOS — edita aquí los perfiles de clientes ────────────────────────────
const EJEMPLOS = [
  { nombre: 'Valentina Ríos', categoria: 'Coach de vida & Bienestar', color: 'from-rose-400/20 to-pink-300/10', emoji: '🌸' },
  { nombre: 'Carlos Mendoza', categoria: 'Fotógrafo · Portfolio', color: 'from-slate-400/20 to-blue-300/10', emoji: '📸' },
  { nombre: 'Studio Nómada', categoria: 'Agencia de Diseño', color: 'from-violet-400/20 to-purple-300/10', emoji: '🎨' },
  { nombre: 'DJ Kronos', categoria: 'Música · Eventos', color: 'from-amber-400/20 to-yellow-300/10', emoji: '🎧' },
  { nombre: 'Tienda Luma', categoria: 'Tienda Online · Moda', color: 'from-emerald-400/20 to-teal-300/10', emoji: '🛍️' },
  { nombre: 'Andrés Varela', categoria: 'Emprendedor · Finanzas', color: 'from-cyan-400/20 to-sky-300/10', emoji: '🚀' },
];

const TESTIMONIOS = [
  {
    nombre: 'Camila Torres',
    rol: 'Coach de vida & Bienestar',
    texto: 'En menos de 5 minutos tenía mi link listo para compartir en Instagram. Mis clientes ahora encuentran todo en un solo lugar.',
    estrellas: 5,
  },
  {
    nombre: 'Diego Herrera',
    rol: 'DJ · México',
    texto: 'El diseño es elegante y se ve profesional. Puse mi Spotify, mis redes y mi WhatsApp y ya no pierdo contactos.',
    estrellas: 5,
  },
  {
    nombre: 'Valentina López',
    rol: 'Tienda de ropa · Argentina',
    texto: 'Antes mandaba a mis seguidores a varios links distintos. Ahora todo está en uno y mis ventas mejoraron.',
    estrellas: 5,
  },
];

// FAQS — la primera se construye dinámicamente con precios reales
const FAQS_STATIC = [
  {
    q: '¿Puedo editar mi página después de publicarla?',
    a: 'Sí, ¡y es gratis! Puedes editar tu nombre, bio, links, redes sociales, colores y plantilla cuando quieras desde tu dashboard, sin ningún costo adicional.',
  },
  {
    q: '¿Qué incluye mi página?',
    a: 'Links ilimitados, redes sociales, plantillas personalizables, colores y fuentes, código QR descargable, analíticas de visitas y clics, formulario de contacto y tarjeta virtual NFC.',
  },
  {
    q: '¿Puedo usar mi propio dominio?',
    a: 'Tu página queda en linkone.bio/u/tu-nombre. Si necesitas dominio propio, escríbenos y lo evaluamos.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas de crédito y débito, transferencia bancaria y más métodos locales — todo a través de MercadoPago en la moneda de tu país.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Usamos encriptación para el almacenamiento de todos tus datos.',
  },
];

// ─── Utilidad ────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

// ─── Beneficios ──────────────────────────────────────────────────────────────
const BENEFICIOS = [
  {
    icon: <Zap size={22} className="text-primary" />,
    titulo: 'Lista en minutos',
    desc: 'Crea y personaliza tu página en menos de 5 minutos. Sin código, sin diseñador.',
  },
  {
    icon: <Link2 size={22} className="text-primary" />,
    titulo: 'Links ilimitados',
    desc: 'Agrega todos los enlaces que necesites: tienda, portfolio, WhatsApp, YouTube y más.',
  },
  {
    icon: <Palette size={22} className="text-primary" />,
    titulo: 'Tu marca, tu estilo',
    desc: 'Elige entre plantillas profesionales y personaliza colores, fuentes e imagen de fondo.',
  },
  {
    icon: <BarChart2 size={22} className="text-primary" />,
    titulo: 'Analíticas reales',
    desc: 'Ve cuántas personas visitan tu página y en qué links hacen clic, en tiempo real.',
  },
  {
    icon: <Smartphone size={22} className="text-primary" />,
    titulo: 'Optimizado para móvil',
    desc: 'Tu página se ve perfecta en celular, tablet y computador, siempre.',
  },
  {
    icon: <CreditCard size={22} className="text-primary" />,
    titulo: 'Tarjeta virtual incluida',
    desc: 'Cada perfil incluye una tarjeta digital profesional con código QR que puedes compartir o descargar para hacer networking al instante.',
  },
  {
    icon: <Shield size={22} className="text-primary" />,
    titulo: 'Pago único, para siempre',
    desc: 'Sin suscripciones. Pagas una vez y tu página vive para siempre.',
  },
];

function SeccionBeneficios() {
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            ¿Por qué LinkOne?
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            Todo lo que necesitas,<br />
            <span className="gold-text">sin complicaciones</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Una sola herramienta para centralizar tu presencia digital y convertir visitas en clientes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFICIOS.map((b, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              className="flex gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                {b.icon}
              </div>
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

// ─── Ejemplos ─────────────────────────────────────────────────────────────────

const PHONE_THEMES = [
  {
    nombre: 'Juan Rodríguez',
    bio: 'Ingeniero · MBA',
    initials: 'JR',
    label: 'Corporativo',
    screen: 'bg-[#f8f8f8]',
    nameColor: 'text-[#111]',
    bioColor: 'text-[#555]',
    avatarBg: 'bg-[#dde4f0]',
    avatarText: 'text-[#3b4a72]',
    avatarBorder: 'border-[#ddd]',
    socBg: 'bg-[#333]',
    btnStyle: 'border border-[#222] text-[#111] bg-transparent',
    links: ['Portfolio', 'LinkedIn', 'Contáctame'],
  },
  {
    nombre: 'Camilo Torres',
    bio: 'Coach de Vida & Bienestar',
    initials: 'CT',
    label: 'Lifestyle',
    screen: 'bg-gradient-to-b from-[#2a5425] via-[#3d7535] to-[#1b3b18]',
    nameColor: 'text-white',
    bioColor: 'text-white/75',
    avatarBg: 'bg-[#7aad6a]',
    avatarText: 'text-white',
    avatarBorder: 'border-white/60',
    socBg: 'bg-white/70',
    btnStyle: 'border border-white/30 text-white bg-white/15',
    links: ['Servicio Personal', 'Servicio Grupal', 'Empresas'],
  },
  {
    nombre: 'Valentina López',
    bio: 'Clothes Cute',
    initials: 'VL',
    label: 'Tienda / Moda',
    screen: 'bg-gradient-to-br from-[#c09090] via-[#7d4555] to-[#4a2535]',
    nameColor: 'text-white',
    bioColor: 'text-white/75',
    avatarBg: 'bg-[#c49a9a]',
    avatarText: 'text-white',
    avatarBorder: 'border-pink-200/60',
    socBg: 'bg-white/60',
    btnStyle: 'border border-white/28 text-white bg-[#a05060]/40',
    links: ['Catálogo Mujer', 'Catálogo Niñas', 'Pedidos en Línea'],
  },
  {
    nombre: 'Andrés Varela',
    bio: 'Emprendedor · Finanzas',
    initials: 'AV',
    label: 'Dark / Premium',
    screen: 'bg-[#0a0a0a]',
    nameColor: 'text-[#e8d9b0]',
    bioColor: 'text-[#888]',
    avatarBg: 'bg-[#2a2200]',
    avatarText: 'text-[#c9a84c]',
    avatarBorder: 'border-[#c9a84c]',
    socBg: 'bg-[#c9a84c]',
    btnStyle: 'border border-[#c9a84c]/45 text-[#c9a84c] bg-[#c9a84c]/10',
    links: ['Consultoría', 'Podcast', 'Newsletter'],
  },
];

function PhoneCard({ p }: { p: typeof PHONE_THEMES[0] }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Phone frame */}
      <div className="relative rounded-[26px] bg-[#111] overflow-hidden flex-shrink-0 shadow-2xl w-[155px] h-[300px] border-[5px] border-[#1e1e1e] ring-1 ring-[#3a3a3a]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#111] rounded-b-lg z-10" />
        {/* Screen */}
        <div className={`w-full h-full rounded-[21px] overflow-hidden flex flex-col items-center pt-6 ${p.screen}`}>
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full border-2 ${p.avatarBorder} ${p.avatarBg} ${p.avatarText} flex items-center justify-center text-sm font-semibold mt-1 mb-1.5 flex-shrink-0`}>
            {p.initials}
          </div>
          <p className={`text-[11px] font-semibold text-center leading-tight ${p.nameColor}`}>{p.nombre}</p>
          <p className={`text-[9px] text-center mt-0.5 ${p.bioColor}`}>{p.bio}</p>
          {/* Socials */}
          <div className="flex gap-1.5 my-1.5">
            {[0,1,2].map(i => <div key={i} className={`w-3 h-3 rounded-full ${p.socBg}`} />)}
          </div>
          {/* Links */}
          <div className="w-full px-2.5 flex flex-col gap-1 mt-0.5">
            {p.links.map((l, i) => (
              <div key={i} className={`w-full py-1.5 rounded-full text-[8.5px] font-medium text-center ${p.btnStyle}`}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{p.label}</span>
    </div>
  );
}

function SeccionEjemplos() {
  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            Ejemplos
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            Así podría verse<br />
            <span className="gold-text">tu página en LinkOne</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Estos son diseños de muestra — el tuyo puede tener tus colores, tu foto y tus links.
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-5 justify-center items-end">
          {PHONE_THEMES.map((p, i) => (
            <PhoneCard key={i} p={p} />
          ))}

          {/* CTA card */}
          <div className="flex flex-col items-center gap-2">
            <a href="#editor"
              className="w-[155px] h-[300px] rounded-[26px] border-2 border-dashed border-primary/40
                bg-card hover:border-primary/70 hover:bg-primary/5 transition-all
                flex flex-col items-center justify-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-light group-hover:bg-primary/20 transition-colors">
                +
              </div>
              <p className="text-xs font-semibold text-primary text-center px-4 leading-snug">El tuyo puede ser el siguiente</p>
              <p className="text-[10px] text-muted-foreground">Crea tu página →</p>
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
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            Lo que dicen nuestros usuarios
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            Profesionales, marcas, emprendedores<br />
            <span className="gold-text">y creadores confían en LinkOne</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIOS.map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)}
              className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex gap-0.5">
                {Array.from({ length: t.estrellas }).map((_, s) => (
                  <Star key={s} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed">"{t.texto}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.nombre}</p>
                <p className="text-xs text-muted-foreground">{t.rol}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function SeccionFAQ() {
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

  const precioFaq = {
    q: '¿Cuánto cuesta LinkOne?',
    a: precios
      ? `Pagas una sola vez para publicar tu página — sin suscripciones ni cobros mensuales. Los precios en moneda local a través de MercadoPago son: ${precios}.`
      : 'Pagas una sola vez para publicar tu página — sin suscripciones ni cobros mensuales. El precio varía según tu país y se cobra en moneda local a través de MercadoPago.',
  };

  const FAQS = [precioFaq, ...FAQS_STATIC];

  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            Preguntas frecuentes
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            ¿Tienes dudas?<br />
            <span className="gold-text">Las resolvemos aquí</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} {...fadeUp(i * 0.05)}
              className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setAbierto(abierto === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              >
                <span className="font-semibold text-foreground text-sm">{faq.q}</span>
                {abierto === i
                  ? <ChevronUp size={16} className="text-primary shrink-0" />
                  : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
              </button>
              {abierto === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function SeccionCTAFinal() {
  return (
    <section className="py-20 px-6 border-t border-border">
      <motion.div {...fadeUp()} className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
          Tu link en bio,<br />
          <span className="gold-text">profesional y listo hoy</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Únete a los creadores, emprendedores y marcas que ya centralizaron su presencia digital con LinkOne.
        </p>
        <a
          href="#editor"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          Crea tu LinkOne ahora ✨
        </a>
        <p className="text-xs text-muted-foreground">Sin suscripciones · Pago único · Edita cuando quieras</p>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold gold-text">LinkOne</span>
            <span className="text-xs text-muted-foreground">Tu identidad digital en un solo link</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <button onClick={() => navigate('/terminos')} className="hover:text-foreground transition-colors">
              Términos y condiciones
            </button>
            <button onClick={() => navigate('/privacidad')} className="hover:text-foreground transition-colors">
              Política de privacidad
            </button>
          </nav>

          <p className="text-xs text-muted-foreground">
            © {year} LinkOne · Hecho en Latinoamérica 🌎
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Exportación principal ────────────────────────────────────────────────────
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
