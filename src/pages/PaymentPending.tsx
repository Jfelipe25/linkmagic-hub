import { Link, useSearchParams } from 'react-router-dom';
import { Clock, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const isStore = searchParams.get('type') === 'store';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 max-w-md">
        <Clock size={56} className="mx-auto text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Pago en proceso</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isStore
            ? 'Tu pago está siendo procesado. Cuando se confirme, tu tienda se activará automáticamente y podrás empezar a agregar productos.'
            : 'Tu pago está siendo procesado. Te notificaremos cuando se confirme y tu perfil sea activado.'
          }
        </p>
        {isStore ? (
          <Link to="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full border border-border text-sm text-foreground hover:bg-card transition-colors">
            <LayoutDashboard size={14} />
            Ir al Dashboard
          </Link>
        ) : (
          <Link to="/"
            className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-border text-sm text-foreground hover:bg-card transition-colors">
            Volver al inicio
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentPending;
