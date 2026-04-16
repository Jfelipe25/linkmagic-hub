import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, QrCode, ExternalLink, LayoutDashboard, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [slug, setSlug] = useState<string>('');
  const isStore = searchParams.get('type') === 'store';

  useEffect(() => {
    const sid = searchParams.get('session_id');
    if (!sid) return;

    if (isStore) {
      // Store payment — look up by store_session_id
      supabase.from('profiles').select('slug').eq('store_session_id', sid).maybeSingle()
        .then(({ data }) => {
          if (data) setSlug(data.slug);
        });
    } else {
      // Pro payment — existing flow
      supabase.from('profiles').select('slug, plan_price, country_code').eq('session_id', sid).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setSlug(data.slug);
            try {
              const price = (data as any).plan_price ?? 20000;
              const currency = { CO: 'COP', MX: 'MXN', AR: 'ARS', CL: 'CLP', PE: 'PEN', UY: 'UYU', BR: 'BRL', EC: 'USD', BO: 'BOB', PY: 'PYG', US: 'USD' }[(data as any).country_code ?? ''] ?? 'COP';
              (window as any).fbq?.('track', 'Purchase', {
                value: price,
                currency,
                content_name: 'LinkOne Profile',
                content_type: 'product',
              });
            } catch (_) {}
          }
        });
    }
  }, [searchParams, isStore]);

  const profileUrl = slug ? `${window.location.origin}/u/${slug}` : '';
  const qrUrl = slug ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}` : '';

  const handleDownloadQR = async () => {
    if (!qrUrl) return;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (isStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <Store size={32} className="text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">¡Tu tienda está activa!</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Ya puedes configurar tu tienda, agregar productos y empezar a recibir pedidos por WhatsApp.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-3 text-left">
            <p className="text-sm font-medium text-foreground">Próximos pasos:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <p className="text-sm text-muted-foreground">Configura el nombre de tu tienda y tu WhatsApp</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <p className="text-sm text-muted-foreground">Agrega tus productos con fotos y precios</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <p className="text-sm text-muted-foreground">Comparte tu link y empieza a vender</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link to="/dashboard"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Store size={16} />
              Configurar mi tienda
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md w-full">
        <CheckCircle size={56} className="mx-auto text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">¡Pago exitoso!</h1>
          <p className="text-muted-foreground mt-1">Tu perfil ha sido activado correctamente.</p>
        </div>

        {slug && (
          <>
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tu link público</p>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline flex items-center justify-center gap-1.5 text-sm">
                <ExternalLink size={14} />
                {profileUrl}
              </a>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <QrCode size={16} className="text-primary" />
                Tu código QR
              </div>
              <img src={qrUrl} alt="QR Code" className="w-40 h-40 rounded-md" />
              <button onClick={handleDownloadQR}
                className="flex items-center gap-2 text-xs text-primary hover:underline">
                <Download size={14} /> Descargar QR
              </button>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Link to="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-11 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90">
            <LayoutDashboard size={16} />
            Ir al Dashboard
          </Link>
          <p className="text-xs text-muted-foreground">
            Desde el dashboard puedes editar tu perfil, ver estadísticas y descargar tu QR en cualquier momento.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
