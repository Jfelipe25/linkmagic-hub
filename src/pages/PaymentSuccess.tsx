import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const sid = searchParams.get('session_id');
    if (sid) {
      supabase.from('profiles').select('slug').eq('session_id', sid).maybeSingle()
        .then(({ data }) => { if (data) setSlug(data.slug); });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 max-w-md">
        <CheckCircle size={56} className="mx-auto text-primary" />
        <h1 className="text-2xl font-bold text-foreground">¡Pago exitoso!</h1>
        <p className="text-muted-foreground">Tu perfil ha sido activado correctamente.</p>
        {slug && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Tu link público:</p>
            <a href={`/u/${slug}`} className="text-primary font-semibold hover:underline">
              {window.location.origin}/u/{slug}
            </a>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Link to="/dashboard"
            className="inline-flex items-center justify-center h-10 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90">
            Ir al Dashboard
          </Link>
          <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
            Iniciar sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
