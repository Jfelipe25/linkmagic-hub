// src/components/store/StoreSettings.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, MessageCircle, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  profileId: string;
  initialWhatsapp: string;
  initialMessage: string;
  initialCurrency: string;
  onSaved?: () => void;
}

const StoreSettings = ({
  profileId,
  initialWhatsapp,
  initialMessage,
  initialCurrency,
  onSaved,
}: Props) => {
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp || '');
  const [message, setMessage] = useState(initialMessage || '');
  const [currency, setCurrency] = useState(initialCurrency || 'COP');
  const [saving, setSaving] = useState(false);
  const [editingPhone, setEditingPhone] = useState(!initialWhatsapp);

  useEffect(() => {
    setWhatsapp(initialWhatsapp || '');
    setMessage(initialMessage || '');
    setCurrency(initialCurrency || 'COP');
    setEditingPhone(!initialWhatsapp);
  }, [initialWhatsapp, initialMessage, initialCurrency]);

  const handleSave = async () => {
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('El número de WhatsApp debe tener al menos 10 dígitos con código de país');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        store_whatsapp: cleanPhone || null,
        store_welcome_message: message.trim() || null,
        store_currency: currency,
      })
      .eq('id', profileId);
    if (error) {
      toast.error('Error al guardar');
    } else {
      toast.success('Configuración guardada');
      setEditingPhone(false);
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

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle size={16} className="text-green-600" />
        <h3 className="font-medium text-sm">Configuración de la tienda</h3>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          WhatsApp para recibir pedidos *
        </label>
        {editingPhone ? (
          <div className="space-y-1">
            <div className="flex gap-2">
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="573001234567"
                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
              {initialWhatsapp && (
                <button
                  onClick={() => { setWhatsapp(initialWhatsapp); setEditingPhone(false); }}
                  className="px-2 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Incluye el código de país sin +. Ej: 573001234567 para Colombia.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/30">
            <span className="flex-1 text-sm font-mono">
              {formatPhoneDisplay(whatsapp)}
            </span>
            <button
              onClick={() => setEditingPhone(true)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              <Edit2 size={11} /> Editar
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Moneda</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
        >
          <option value="COP">Peso colombiano (COP)</option>
          <option value="MXN">Peso mexicano (MXN)</option>
          <option value="ARS">Peso argentino (ARS)</option>
          <option value="CLP">Peso chileno (CLP)</option>
          <option value="USD">Dólar (USD)</option>
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

      <div className="flex justify-end pt-2 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Guardar
        </button>
      </div>
    </div>
  );
};

export default StoreSettings;
