import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, Phone, Download, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
}

interface ContactsListProps {
  profileId: string;
}

const ContactsList = ({ profileId }: ContactsListProps) => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [profileId]);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('contacts').select('*').eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    if (data) setContacts(data);
    setLoading(false);
  };

  const exportCSV = () => {
    const header = 'Nombre,Email,Teléfono,Mensaje,Fecha\n';
    const rows = contacts.map(c =>
      `"${c.name}","${c.email || ''}","${c.phone || ''}","${(c.message || '').replace(/"/g, '""')}","${new Date(c.created_at).toLocaleDateString()}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'contacts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyContact = (c: Contact) => {
    const text = [
      `Nombre: ${c.name}`,
      c.email ? `Email: ${c.email}` : '',
      c.phone ? `Teléfono: ${c.phone}` : '',
      c.message ? `Mensaje: ${c.message}` : '',
      `Fecha: ${new Date(c.created_at).toLocaleDateString()}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev => prev.size === contacts.length ? new Set() : new Set(contacts.map(c => c.id)));
  };

  const deleteSelected = async () => {
    if (!selected.size) return;
    setDeleting(true);
    await supabase.from('contacts').delete().in('id', Array.from(selected));
    setContacts(prev => prev.filter(c => !selected.has(c.id)));
    setSelected(new Set());
    setDeleting(false);
  };

  const deleteOne = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  if (loading) return <Loader2 size={16} className="animate-spin text-muted-foreground" />;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users size={16} className="text-primary" /> {t('dash.contacts')} ({contacts.length})
        </p>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={deleteSelected} disabled={deleting}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium">
              {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Eliminar ({selected.size})
            </button>
          )}
          {contacts.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Download size={12} /> CSV
            </button>
          )}
        </div>
      </div>

      {contacts.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('dash.noContacts')}</p>
      ) : (
        <>
          {/* Select all */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
            <input type="checkbox"
              checked={selected.size === contacts.length && contacts.length > 0}
              onChange={toggleAll}
              className="rounded cursor-pointer accent-primary"
            />
            <span className="text-xs text-muted-foreground">Seleccionar todos</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contacts.map(c => (
              <div key={c.id} className={`rounded-md border bg-background p-3 text-sm transition-colors ${selected.has(c.id) ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                      className="rounded cursor-pointer accent-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{c.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        {c.email && <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
                        {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      {c.message && <p className="text-xs text-muted-foreground mt-1 italic">"{c.message}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => copyContact(c)} className="text-muted-foreground hover:text-primary transition-colors" title="Copiar">
                      {copiedId === c.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => deleteOne(c.id)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ContactsList;
