import { useNavigate } from 'react-router-dom';

export default function Privacidad() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold gold-text cursor-pointer" onClick={() => navigate('/')}>LinkOne</h1>
          <button onClick={() => navigate(-1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Volver</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-sm text-foreground leading-relaxed">
        <div>
          <h1 className="text-2xl font-bold mb-1">Política de Privacidad</h1>
          <p className="text-xs text-muted-foreground">Última actualización: enero {year}</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">1. Información que recopilamos</h2>
          <p className="text-muted-foreground">Recopilamos la información que nos proporcionas al registrarte (email), al crear tu página (nombre, bio, foto, links) y la que se genera automáticamente al usar el servicio (dirección IP, tipo de navegador, páginas visitadas, fecha y hora de acceso).</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">2. Cómo usamos tu información</h2>
          <p className="text-muted-foreground">Usamos tu información para proveer y mejorar el servicio, procesar pagos, enviarte comunicaciones relacionadas con tu cuenta, y generar analíticas agregadas (no personales) sobre el uso de la plataforma.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">3. Compartir información con terceros</h2>
          <p className="text-muted-foreground">No vendemos tu información personal. La compartimos únicamente con proveedores de servicios necesarios para operar la plataforma: Supabase (base de datos y autenticación), MercadoPago (procesamiento de pagos) y Meta (analíticas de marketing, con tu consentimiento implícito al usar el sitio).</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">4. Cookies y tecnologías de rastreo</h2>
          <p className="text-muted-foreground">Usamos cookies propias para mantener tu sesión activa y cookies de terceros (Meta Pixel) para medir el rendimiento de nuestras campañas publicitarias. Puedes desactivar las cookies en tu navegador aunque esto puede afectar la funcionalidad del sitio.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">5. Retención de datos</h2>
          <p className="text-muted-foreground">Conservamos tu información mientras tu cuenta esté activa. Si eliminas tu cuenta, borraremos tus datos personales en un plazo de 30 días, excepto donde la ley nos obligue a conservarlos por más tiempo.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">6. Tus derechos</h2>
          <p className="text-muted-foreground">Tienes derecho a acceder, corregir o eliminar tu información personal. Para ejercer estos derechos puedes contactarnos a través de nuestra plataforma. Responderemos en un plazo máximo de 15 días hábiles.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">7. Seguridad</h2>
          <p className="text-muted-foreground">Implementamos medidas técnicas y organizativas para proteger tu información: conexiones cifradas (HTTPS), autenticación segura a través de Supabase y no almacenamos datos de tarjetas de crédito (procesados directamente por MercadoPago).</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">8. Cambios a esta política</h2>
          <p className="text-muted-foreground">Podemos actualizar esta política periódicamente. Te notificaremos por email sobre cambios significativos. La fecha de última actualización siempre estará visible al inicio de este documento.</p>
        </section>


      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        © {year} LinkOne · <button onClick={() => navigate('/terminos')} className="hover:text-foreground transition-colors">Términos y condiciones</button>
      </footer>
    </div>
  );
}
