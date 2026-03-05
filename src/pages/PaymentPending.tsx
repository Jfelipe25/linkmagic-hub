import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentPending = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 max-w-md">
      <Clock size={56} className="mx-auto text-primary" />
      <h1 className="text-2xl font-bold text-foreground">Pago en proceso</h1>
      <p className="text-muted-foreground">
        Tu pago está siendo procesado. Te notificaremos cuando se confirme y tu perfil sea activado.
      </p>
      <Link to="/" className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-border text-sm text-foreground hover:bg-card transition-colors">
        Volver al inicio
      </Link>
    </motion.div>
  </div>
);

export default PaymentPending;
