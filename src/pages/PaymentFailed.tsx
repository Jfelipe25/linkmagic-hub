import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailed = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 max-w-md">
      <XCircle size={56} className="mx-auto text-destructive" />
      <h1 className="text-2xl font-bold text-foreground">Pago fallido</h1>
      <p className="text-muted-foreground">
        No se pudo procesar tu pago. Por favor intenta de nuevo.
      </p>
      <Link to="/"
        className="inline-flex items-center justify-center h-10 px-6 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90">
        Volver a intentar
      </Link>
    </motion.div>
  </div>
);

export default PaymentFailed;
