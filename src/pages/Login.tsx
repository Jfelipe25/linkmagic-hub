import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Login = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) toast.error(error.message);
    else toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Ingresa tu email'); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) toast.error(error.message);
    else toast.success('Revisa tu email para restablecer tu contraseña');
    setLoading(false);
  };

  const onSubmit = mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset;
  const title = mode === 'login' ? 'Inicia sesión' : mode === 'register' ? 'Crea tu cuenta' : 'Restablecer contraseña';
  const btnText = mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Registrarme' : 'Enviar enlace';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold gold-text mb-1">LinkBio Pro</h1>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="tu@email.com" />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••" />
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full h-10 rounded-full gold-gradient text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {btnText}
          </button>
        </form>

        <div className="text-center space-y-2">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('reset')} className="text-xs text-primary hover:underline block mx-auto">
                ¿Olvidaste tu contraseña?
              </button>
              <p className="text-xs text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <button onClick={() => setMode('register')} className="text-primary hover:underline">Regístrate</button>
              </p>
            </>
          )}
          {mode === 'register' && (
            <p className="text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setMode('login')} className="text-primary hover:underline">Inicia sesión</button>
            </p>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('login')} className="text-xs text-primary hover:underline">
              Volver al login
            </button>
          )}
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
