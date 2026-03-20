import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactFormProps {
  profileId: string;
  accentColor?: string;
  fontColor?: string;
}

const ContactForm = ({ profileId, accentColor = '#d4a432', fontColor = '#ffffff' }: ContactFormProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSending(true);
    const { error } = await supabase.from('contacts').insert({
      profile_id: profileId,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      message: message.trim() || null,
    });
    setSending(false);
    if (!error) {
      setSent(true);
      setName(''); setEmail(''); setPhone(''); setMessage('');
    }
  };

  return (
    <div className="w-full mt-6">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-semibold transition-all"
        style={{
          backgroundColor: open ? accentColor + '22' : accentColor + '15',
          color: fontColor,
          border: `1px solid ${accentColor}44`,
        }}
      >
        <span>{t('contact.title')}</span>
        <ChevronDown
          size={16}
          style={{
            color: accentColor,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Collapsible form */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '500px' : '0px',
        transition: 'max-height 0.35s ease',
      }}>
        {sent ? (
          <div className="pt-4 pb-2 text-center space-y-2">
            <CheckCircle size={28} className="mx-auto" style={{ color: accentColor }} />
            <p className="text-sm font-semibold" style={{ color: fontColor }}>{t('contact.sent')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2 pt-3">
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder={t('contact.name')}
              className="w-full h-9 rounded-lg px-3 text-sm bg-white/10 border border-white/20 placeholder:opacity-50 focus:outline-none focus:ring-1"
              style={{ color: fontColor, borderColor: fontColor + '33', ['--tw-ring-color' as any]: accentColor }}
            />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t('contact.email')}
              className="w-full h-9 rounded-lg px-3 text-sm bg-white/10 border border-white/20 placeholder:opacity-50 focus:outline-none focus:ring-1"
              style={{ color: fontColor, borderColor: fontColor + '33' }}
            />
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder={t('contact.phone')}
              className="w-full h-9 rounded-lg px-3 text-sm bg-white/10 border border-white/20 placeholder:opacity-50 focus:outline-none focus:ring-1"
              style={{ color: fontColor, borderColor: fontColor + '33' }}
            />
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder={t('contact.message')} rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 border border-white/20 placeholder:opacity-50 focus:outline-none focus:ring-1 resize-none"
              style={{ color: fontColor, borderColor: fontColor + '33' }}
            />
            <button
              type="submit" disabled={sending}
              className="w-full h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accentColor, color: '#fff' }}
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {t('contact.send')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
