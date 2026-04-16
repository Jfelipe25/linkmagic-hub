// src/components/store/StoreSettings.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, MessageCircle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  profileId: string;
  initialStoreName: string;
  initialWhatsapp: string;
  initialMessage: string;
  initialCurrency: string;
  onSaved?: () => void;
}

const CURRENCIES = [
  { value: 'COP', label: 'Peso colombiano (COP)' },
  { value: 'MXN', label: 'Peso mexicano (MXN)' },
  { value: 'ARS', label: 'Peso argentino (ARS)' },
  { value: 'CLP', label: 'Peso chileno (CLP)' },
  { value: 'USD', label: 'Dólar (USD)' },
];

const StoreSettings = ({
  profileId,
  initialStoreName,
  initialWhatsapp,
  initialMessage,
  initialCurrency,
  onSaved,
}: Props) => {
  const [storeName, setStoreName] = useState(initialStoreName || '');
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp || '');
  const [message, setMessage] = useState(initialMessage || '');
  const [currency, setCurrency] = useState(initialCurrency || 'COP');
  const [saving, setSaving] = useState(false);

  const hasAllData = !!(initialWhatsapp && initialStoreName);
  const [editing, setEditing] = useState(!hasAllData);

  useEffect(() => {
    setStoreName(initialStoreName || '');
    setWhatsapp(initialWhatsapp || '');
    setMessage(initialMessage || '');
    setCurrency(initialCurrency || 'COP');
    const hasSaved = !!(initialWhatsapp && initialStoreName);
    setEditing(!hasSaved);
  }, [initialStoreName, initialWhatsapp, initialMessage, initialCurrency]);

  const handleSave = async () => {
    if (!storeName.trim()) {
      toast.error('El nombre de la tienda es obligatorio');
      return;
    }
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('El número de WhatsApp debe tener al menos 10 dígitos con código de país');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        store_name: storeName.trim(),
        store_whatsapp: cleanPhone || null,
        store_welcome_message: message.trim() || null,
        store_currency: currency,
      })
      .eq('id', profileId);
    if (error) {
      toast.error('Error al guardar');
    } else {
      toast.success('Configuración guardada');
      setEditing(false);
      onSaved?.();
    }
    setSaving(false);
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length >= 12) {
      return `+${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
    }
    if (clean.length >= 10) {
      return `+${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
    }
    return clean;
  };

  const getCurrencyLabel = (val: string) =>
    CURRENCIES.find(c => c.value === val)?.label || val;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-green-600" />
          <h3 className="font-medium text-sm">Configuración de la tienda</h3>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition"
          >
            <Edit2 size={11} /> Editar
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Nombre de la tienda *
            </label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="Ej: Vida Verde, Moda Express..."
              maxLength={60}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Aparece en el mensaje de WhatsApp que reciben tus clientes.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              WhatsApp para recibir pedidos *
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="573001234567"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Incluye el código de país sin +. Ej: 573001234567 para Colombia.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Moneda</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Mensaje de bienvenida (opcional)
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ej: ¡Envíos gratis en Bucaramanga! · Precios al por mayor disponibles."
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {message.length}/200 · Se muestra arriba de los productos en tu tienda.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            {hasAllData && (
              <button
                onClick={() => {
                  setStoreName(initialStoreName || '');
                  setWhatsapp(initialWhatsapp || '');
                  setMessage(initialMessage || '');
                  setCurrency(initialCurrency || 'COP');
                  setEditing(false);
                }}
                className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Guardar
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">Nombre de la tienda</span>
            <span className="text-sm font-medium">{storeName}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-t border-border">
            <span className="text-xs text-muted-foreground">WhatsApp</span>
            <span className="text-sm font-mono">{formatPhoneDisplay(whatsapp)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-t border-border">
            <span className="text-xs text-muted-foreground">Moneda</span>
            <span className="text-sm">{getCurrencyLabel(currency)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-t border-border">
            <span className="text-xs text-muted-foreground">Mensaje de bienvenida</span>
            <span className="text-sm text-right max-w-[60%]">{message || '—'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSettings;