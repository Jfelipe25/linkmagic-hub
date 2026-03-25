import { useNavigate } from 'react-router-dom';

export default function Terminos() {
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
          <h1 className="text-2xl font-bold mb-1">Términos y Condiciones</h1>
          <p className="text-xs text-muted-foreground">Última actualización: enero {year}</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">1. Aceptación de los términos</h2>
          <p className="text-muted-foreground">Al acceder y usar LinkOne (linkone.bio), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar el servicio.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">2. Descripción del servicio</h2>
          <p className="text-muted-foreground">LinkOne es una plataforma que permite a los usuarios crear páginas de "link in bio" personalizadas para centralizar sus enlaces en un solo URL público. El servicio incluye editor visual, plantillas, analíticas básicas, código QR y tarjeta digital.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">3. Registro y cuenta</h2>
          <p className="text-muted-foreground">Para publicar tu página debes crear una cuenta con un email válido. Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad que ocurra bajo tu cuenta.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">4. Pagos y reembolsos</h2>
          <p className="text-muted-foreground">LinkOne cobra un pago único por la publicación de cada página. Los pagos se procesan a través de MercadoPago. No se realizan reembolsos una vez que la página ha sido publicada y activada, salvo error técnico imputable a LinkOne.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">5. Uso aceptable</h2>
          <p className="text-muted-foreground">No puedes usar LinkOne para publicar contenido ilegal, fraudulento, difamatorio, que infrinja derechos de autor, o que promueva violencia, odio o discriminación. Nos reservamos el derecho de suspender cuentas que violen estas condiciones sin reembolso.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">6. Propiedad intelectual</h2>
          <p className="text-muted-foreground">El contenido que publicas en tu página (textos, imágenes, links) es de tu propiedad. Al publicarlo, nos otorgas una licencia limitada para mostrarlo en nuestra plataforma. El código, diseño y marca LinkOne son propiedad exclusiva de LinkOne.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">7. Limitación de responsabilidad</h2>
          <p className="text-muted-foreground">LinkOne no garantiza disponibilidad ininterrumpida del servicio. No somos responsables por pérdidas derivadas del uso o imposibilidad de uso de la plataforma, incluyendo pérdida de datos o ganancias.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">8. Modificaciones</h2>
          <p className="text-muted-foreground">Podemos actualizar estos términos en cualquier momento. Los cambios sustanciales serán notificados por email. El uso continuado del servicio implica la aceptación de los nuevos términos.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-base">9. Contacto</h2>
          <p className="text-muted-foreground">Para cualquier consulta sobre estos términos escríbenos a <a href="mailto:hola@linkone.bio" className="text-primary hover:underline">hola@linkone.bio</a>.</p>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        © {year} LinkOne · <button onClick={() => navigate('/privacidad')} className="hover:text-foreground transition-colors">Política de privacidad</button>
      </footer>
    </div>
  );
}
