import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, Users, DollarSign, Clock, Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileRow {
  id: string;
  name: string | null;
  slug: string;
  template: string | null;
  paid: boolean | null;
  created_at: string | null;
  avatar: string | null;
}

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!data) {
        navigate('/dashboard');
        return;
      }
      setIsAdmin(true);
      setChecking(false);
    };
    checkAdmin();
  }, [user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, slug, template, paid, created_at, avatar')
        .order('created_at', { ascending: false });
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, [isAdmin]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const filtered = profiles.filter(p => {
    const matchSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || 
      (filter === 'paid' && p.paid) || 
      (filter === 'unpaid' && !p.paid);
    return matchSearch && matchFilter;
  });

  const totalProfiles = profiles.length;
  const paidProfiles = profiles.filter(p => p.paid).length;
  const recentProfiles = profiles.filter(p => {
    if (!p.created_at) return false;
    const diff = Date.now() - new Date(p.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold gold-text">LinkOne · Admin</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalProfiles}</p>
                <p className="text-xs text-muted-foreground">Perfiles totales</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{paidProfiles}</p>
                <p className="text-xs text-muted-foreground">Perfiles pagados</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{recentProfiles}</p>
                <p className="text-xs text-muted-foreground">Últimos 7 días</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o slug..."
              className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'paid', 'unpaid'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagados' : 'Sin pagar'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Perfil</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Template</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.avatar ? (
                          <img src={p.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {p.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="text-foreground font-medium">{p.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.template || 'minimal'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.paid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {p.paid ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.paid && (
                        <a href={`/u/${p.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:opacity-80 transition-opacity">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No se encontraron perfiles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
