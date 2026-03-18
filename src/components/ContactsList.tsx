import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, Phone, Download, Loader2, Copy, Check } from 'lucide-react';
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

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (data) setContacts(data);
      setLoading(false);
    };
    fetchContacts();
  }, [profileId]);

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

  if (loading) return <Loader2 size={16} className="animate-spin text-muted-foreground" />;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users size={16} className="text-primary" /> {t('dash.contacts')} ({contacts.length})
        </p>
        {contacts.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <Download size={12} /> Descargar CSV
          </button>
        )}
      </div>
      {contacts.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('dash.noContacts')}</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contacts.map(c => (
            <div key={c.id} className="rounded-md border border-border bg-background p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{c.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {c.email && <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  {c.message && <p className="text-xs text-muted-foreground mt-1 italic">"{c.message}"</p>}
                </div>
                <button
                  onClick={() => copyContact(c)}
                  className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 mt-0.5"
                  title="Copiar datos"
                >
                  {copiedId === c.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsList;

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

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (data) setContacts(data);
      setLoading(false);
    };
    fetchContacts();
  }, [profileId]);

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

  if (loading) return <Loader2 size={16} className="animate-spin text-muted-foreground" />;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users size={16} className="text-primary" /> {t('dash.contacts')} ({contacts.length})
        </p>
        {contacts.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <Download size={12} /> CSV
          </button>
        )}
      </div>
      {contacts.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('dash.noContacts')}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {contacts.map(c => (
            <div key={c.id} className="rounded-md border border-border bg-background p-3 text-sm">
              <p className="font-medium text-foreground">{c.name}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                {c.email && <span className="flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
                {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              {c.message && <p className="text-xs text-muted-foreground mt-1 italic">"{c.message}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsList;
