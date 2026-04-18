// src/components/store/StoreSettings.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, MessageCircle, Edit2, Truck, Plus, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import type { PromoCode } from '@/types/store';

interface Props {
  profileId: string;
  initialStoreName: string;
  initialWhatsapp: string;
  initialMessage: string;
  initialCurrency: string;
  initialShippingFree: boolean;
  initialShippingLocalEnabled: boolean;
  initialShippingLocalPrice: number;
  initialShippingLocalCities: string[];
  initialShippingNationalEnabled: boolean;
  initialShippingNationalPrice: number;
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
  initialShippingFree,
  initialShippingLocalEnabled,
  initialShippingLocalPrice,
  initialShippingLocalCities,
  initialShippingNationalEnabled,
  initialShippingNationalPrice,
  onSaved,
}: Props) => {
  const [storeName, setStoreName] = useState(initialStoreName || '');
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp || '');
  const [message, setMessage] = useState(initialMessage || '');
  const [currency, setCurrency] = useState(initialCurrency || 'COP');
  const [saving, setSaving] = useState(false);

  // Shipping state
  const [shippingFree, setShippingFree] = useState(initialShippingFree);
  const [localEnabled, setLocalEnabled] = useState(initialShippingLocalEnabled);
  const [localPrice, setLocalPrice] = useState(initialShippingLocalPrice);
  const [localCities, setLocalCities] = useState<string[]>(initialShippingLocalCities);
  const [newCity, setNewCity] = useState('');
  const [nationalEnabled, setNationalEnabled] = useState(initialShippingNationalEnabled);
  const [nationalPrice, setNationalPrice] = useState(initialShippingNationalPrice);

  // Promo codes state
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percent' | 'fixed'>('percent');
  const [newPromoValue, setNewPromoValue] = useState('');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState('');
  const [addingPromo, setAddingPromo] = useState(false);

  const hasAllData = !!(initialWhatsapp && initialStoreName);
  const [editing, setEditing] = useState(!hasAllData);

  useEffect(() => {
    setStoreName(initialStoreName || '');
    setWhatsapp(initialWhatsapp || '');
    setMessage(initialMessage || '');
    setCurrency(initialCurrency || 'COP');
    setShippingFree(initialShippingFree);
    setLocalEnabled(initialShippingLocalEnabled);
    setLocalPrice(initialShippingLocalPrice);
    setLocalCities(initialShippingLocalCities);
    setNationalEnabled(initialShippingNationalEnabled);
    setNationalPrice(initialShippingNationalPrice);
    const hasSaved = !!(initialWhatsapp && initialStoreName);
    setEditing(!hasSaved);
  }, [initialStoreName, initialWhatsapp, initialMessage, initialCurrency,
      initialShippingFree, initialShippingLocalEnabled, initialShippingLocalPrice,
      initialShippingLocalCities, initialShippingNationalEnabled, initialShippingNationalPrice]);

  // Load promo codes
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      setPromos(data || []);
      setLoadingPromos(false);
    };
    load();
  }, [profileId]);

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
        shipping_free: shippingFree,
        shipping_local_enabled: localEnabled,
        shipping_local_price: localPrice,
        shipping_local_cities: localCities,
        shipping_national_enabled: nationalEnabled,
        shipping_national_price: nationalPrice,
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

  const addCity = () => {
    const city = newCity.trim();
    if (!city) return;
    if (localCities.map(c => c.toLowerCase()).includes(city.toLowerCase())) {
      toast.error('Esta ciudad ya está agregada');
      return;
    }
    setLocalCities([...localCities, city]);
    setNewCity('');
  };

  const removeCity = (idx: number) => {
    setLocalCities(localCities.filter((_, i) => i !== idx));
  };

  // ─── Promo CRUD ─────────────────────────────────────────────────────
  const handleAddPromo = async () => {
    const code = newPromoCode.trim().toUpperCase();
    if (!code) { toast.error('Ingresa un código'); return; }
    const value = parseInt(newPromoValue);
    if (!value || value <= 0) { toast.error('Ingresa un valor válido'); return; }
    if (newPromoType === 'percent' && value > 100) { toast.error('El porcentaje no puede ser mayor a 100'); return; }

    setAddingPromo(true);
    const maxUses = newPromoMaxUses ? parseInt(newPromoMaxUses) : null;
    const { data, error } = await supabase.from('promo_codes').insert({
      profile_id: profileId,
      code,
      discount_type: newPromoType,
      discount_value: value,
      max_uses: maxUses,
    }).select().single();

    if (error) {
      if (error.code === '23505') toast.error('Ya existe un código con ese nombre');
      else toast.error('Error al crear código');
    } else if (data) {
      setPromos([data, ...promos]);
      setNewPromoCode('');
      setNewPromoValue('');
      setNewPromoMaxUses('');
      toast.success(`Código ${code} creado`);
    }
    setAddingPromo(false);
  };

  const togglePromo = async (id: string, active: boolean) => {
    const { error } = await supabase.from('promo_codes').update({ active: !active }).eq('id', id);
    if (!error) {
      setPromos(promos.map(p => p.id === id ? { ...p, active: !active } : p));
    }
  };

  const deletePromo = async (id: string) => {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) {
      setPromos(promos.filter(p => p.id !== id));
      toast.success('Código eliminado');
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length >= 12) return `+${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
    if (clean.length >= 10) return `+${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
    return clean;
  };

  const getCurrencyLabel = (val: string) => CURRENCIES.find(c => c.value === val)?.label || val;

  return (
    <div className="space-y-4">
      {/* ─── Main config ──────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-green-600" />
            <h3 className="font-medium text-sm">Configuración de la tienda</h3>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
              <Edit2 size={11} /> Editar
            </button>
          )}
        </div>

        {editing ? (
          <>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Nombre de la tienda *</label>
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                placeholder="Ej: Vida Verde, Moda Express..." maxLength={60}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm" />
              <p className="text-[11px] text-muted-foreground mt-1">Aparece en el mensaje de WhatsApp que reciben tus clientes.</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">WhatsApp para recibir pedidos *</label>
              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="573001234567"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm" />
              <p className="text-[11px] text-muted-foreground mt-1">Incluye el código de país sin +. Ej: 573001234567 para Colombia.</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Moneda</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Mensaje de bienvenida (opcional)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Ej: ¡Envíos gratis en Bucaramanga! · Precios al por mayor disponibles."
                maxLength={200} rows={2}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none" />
              <p className="text-[11px] text-muted-foreground mt-1">{message.length}/200 · Se muestra arriba de los productos en tu tienda.</p>
            </div>

            {/* ─── Shipping config ──────────────────────────────── */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-primary" />
                <span className="text-sm font-medium">Envíos</span>
              </div>

              {/* Free shipping */}
              <label className="flex items-center justify-between gap-3 py-2 px-3 rounded-md border border-border bg-background cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Envío gratis</p>
                  <p className="text-[11px] text-muted-foreground">No se cobra envío al cliente</p>
                </div>
                <input type="checkbox" checked={shippingFree} onChange={e => setShippingFree(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary" />
              </label>

              {/* Local shipping */}
              <div className="rounded-md border border-border bg-background overflow-hidden">
                <label className="flex items-center justify-between gap-3 py-2 px-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">Envío local</p>
                    <p className="text-[11px] text-muted-foreground">Ciudades específicas con precio fijo</p>
                  </div>
                  <input type="checkbox" checked={localEnabled} onChange={e => setLocalEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary" />
                </label>
                {localEnabled && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Precio envío local</label>
                      <input type="number" value={localPrice || ''} onChange={e => setLocalPrice(parseInt(e.target.value) || 0)}
                        placeholder="8000" min={0}
                        className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm mt-0.5" />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Ciudades locales</label>
                      <div className="flex gap-1.5 mt-0.5">
                        <input type="text" value={newCity} onChange={e => setNewCity(e.target.value)}
                          placeholder="Ej: Bucaramanga" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCity())}
                          className="flex-1 px-2 py-1.5 rounded-md border border-border bg-background text-sm" />
                        <button onClick={addCity} type="button"
                          className="px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                          <Plus size={12} />
                        </button>
                      </div>
                      {localCities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {localCities.map((city, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                              {city}
                              <button onClick={() => removeCity(i)} className="hover:text-red-500"><Trash2 size={10} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* National shipping */}
              <div className="rounded-md border border-border bg-background overflow-hidden">
                <label className="flex items-center justify-between gap-3 py-2 px-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">Envío nacional</p>
                    <p className="text-[11px] text-muted-foreground">Resto del país con precio fijo</p>
                  </div>
                  <input type="checkbox" checked={nationalEnabled} onChange={e => setNationalEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary" />
                </label>
                {nationalEnabled && (
                  <div className="px-3 pb-3 border-t border-border pt-2">
                    <label className="text-[11px] text-muted-foreground">Precio envío nacional</label>
                    <input type="number" value={nationalPrice || ''} onChange={e => setNationalPrice(parseInt(e.target.value) || 0)}
                      placeholder="15000" min={0}
                      className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm mt-0.5" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              {hasAllData && (
                <button onClick={() => {
                  setStoreName(initialStoreName || ''); setWhatsapp(initialWhatsapp || '');
                  setMessage(initialMessage || ''); setCurrency(initialCurrency || 'COP');
                  setShippingFree(initialShippingFree); setLocalEnabled(initialShippingLocalEnabled);
                  setLocalPrice(initialShippingLocalPrice); setLocalCities(initialShippingLocalCities);
                  setNationalEnabled(initialShippingNationalEnabled); setNationalPrice(initialShippingNationalPrice);
                  setEditing(false);
                }} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-muted-foreground hover:text-foreground">
                  Cancelar
                </button>
              )}
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Guardar
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
            <div className="flex items-center justify-between py-1.5 border-t border-border">
              <span className="text-xs text-muted-foreground">Envíos</span>
              <span className="text-sm text-right">
                {shippingFree && 'Gratis'}
                {localEnabled && `${shippingFree ? ' · ' : ''}Local: $${localPrice.toLocaleString()}`}
                {nationalEnabled && `${(shippingFree || localEnabled) ? ' · ' : ''}Nacional: $${nationalPrice.toLocaleString()}`}
                {!shippingFree && !localEnabled && !nationalEnabled && '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Promo codes ──────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-primary" />
          <h3 className="font-medium text-sm">Códigos promocionales</h3>
        </div>

        {/* Add new */}
        <div className="space-y-2 p-3 rounded-md border border-dashed border-border bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground">Código</label>
              <input type="text" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                placeholder="DESCUENTO10" maxLength={20}
                className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm font-mono mt-0.5" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Tipo</label>
              <select value={newPromoType} onChange={e => setNewPromoType(e.target.value as 'percent' | 'fixed')}
                className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm mt-0.5">
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Valor fijo ($)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground">
                {newPromoType === 'percent' ? 'Descuento (%)' : 'Descuento ($)'}
              </label>
              <input type="number" value={newPromoValue} onChange={e => setNewPromoValue(e.target.value)}
                placeholder={newPromoType === 'percent' ? '10' : '5000'} min={1}
                max={newPromoType === 'percent' ? 100 : undefined}
                className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm mt-0.5" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Usos máximos (opcional)</label>
              <input type="number" value={newPromoMaxUses} onChange={e => setNewPromoMaxUses(e.target.value)}
                placeholder="∞" min={1}
                className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-sm mt-0.5" />
            </div>
          </div>
          <button onClick={handleAddPromo} disabled={addingPromo}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            {addingPromo ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Crear código
          </button>
        </div>

        {/* List */}
        {loadingPromos ? (
          <div className="text-center py-4"><Loader2 size={16} className="animate-spin mx-auto text-muted-foreground" /></div>
        ) : promos.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No hay códigos creados</p>
        ) : (
          <div className="space-y-2">
            {promos.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-background">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">{p.code}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${p.active ? 'bg-green-500/15 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {p.discount_type === 'percent' ? `${p.discount_value}% de descuento` : `$${p.discount_value.toLocaleString()} de descuento`}
                    {p.max_uses ? ` · ${p.uses}/${p.max_uses} usos` : ` · ${p.uses} usos`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => togglePromo(p.id, p.active)}
                    className="px-2 py-1 rounded text-[11px] border border-border hover:bg-accent transition">
                    {p.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => deletePromo(p.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSettings;
