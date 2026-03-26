import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const hasPending = !!sessionStorage.getItem('pending_profile');

  useEffect(() => {
    // Si no hay perfil guardado redirigir al inicio después de 10s
    if (!hasPending) {
      const t = setTimeout(() => navigate('/'), 10000);
      return () => clearTimeout(t);
    }
  }, [hasPending, navigate]);

  const handleRetry = () => {
    // El perfil ya está en sessionStorage — Index.tsx lo levanta automáticamente
    // via el flujo normal de Login → pending_profile
    navigate('/#editor');
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
            Hubo un problema al procesar tu pago. No se realizó ningún cobro.
            {hasPending
              ? ' Tu información está guardada — puedes intentarlo de nuevo sin volver a llenar el formulario.'
              : ' Por favor intenta de nuevo.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {hasPending ? (
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
            Ir al inicio sin intentar de nuevo
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
