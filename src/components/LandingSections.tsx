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
function SeccionEjemplos() {
  if (EJEMPLOS.length === 0) return null;

  return (
    <section className="py-20 px-6 border-t border-border bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-14 space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            Ejemplos reales
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            Así se ven las páginas<br />
            <span className="gold-text">de nuestros clientes</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EJEMPLOS.map((e, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className="group block rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Preview decorativo */}
              <div className={`h-40 bg-gradient-to-br ${e.color} flex items-center justify-center relative`}>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">{e.emoji}</span>
                  <div className="w-16 h-1.5 rounded-full bg-foreground/10" />
                  <div className="w-10 h-1 rounded-full bg-foreground/10" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-foreground text-sm">{e.nombre}</p>
                <p className="text-xs text-muted-foreground">{e.categoria}</p>
              </div>
            </motion.div>
          ))}

          {/* Card CTA — crear el tuyo */}
          <motion.a
            {...fadeUp(EJEMPLOS.length * 0.1)}
            href="#editor"
            className="group block rounded-2xl border-2 border-dashed border-primary/30 bg-card hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden"
          >
            <div className="h-40 flex items-center justify-center">
              <span className="text-4xl">✨</span>
            </div>
            <div className="p-4 text-center">
              <p className="font-semibold text-primary text-sm">El tuyo puede ser el siguiente</p>
              <p className="text-xs text-muted-foreground mt-1">Crea tu página gratis →</p>
            </div>
          </motion.a>
        </div>
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
