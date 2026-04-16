import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStore = searchParams.get('type') === 'store';
  const hasPending = !!sessionStorage.getItem('pending_profile');

  useEffect(() => {
    if (!hasPending && !isStore) {
      const t = setTimeout(() => navigate('/'), 10000);
      return () => clearTimeout(t);
    }
  }, [hasPending, isStore, navigate]);

  const handleRetry = () => {
    if (isStore) {
      navigate('/dashboard');
    } else {
      navigate('/#editor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-5 max-w-md w-full"
      >
        <XCircle size={56} className="mx-auto text-destructive" />

        <div>
          <h1 className="text-2xl font-bold text-foreground">No se procesó el pago</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {isStore
              ? 'Hubo un problema al procesar el pago de tu tienda. No se realizó ningún cobro. Puedes intentarlo de nuevo desde el dashboard.'
              : hasPending
                ? 'Hubo un problema al procesar tu pago. No se realizó ningún cobro. Tu información está guardada — puedes intentarlo de nuevo sin volver a llenar el formulario.'
                : 'Hubo un problema al procesar tu pago. No se realizó ningún cobro. Por favor intenta de nuevo.'
            }
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {isStore ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <LayoutDashboard size={15} />
              Volver al Dashboard
            </button>
          ) : hasPending ? (
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={15} />
              Intentar de nuevo
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Home size={15} />
              Volver al inicio
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ir al inicio
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Si el problema persiste, verifica que tu tarjeta tenga fondos suficientes o intenta con otro método de pago.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
