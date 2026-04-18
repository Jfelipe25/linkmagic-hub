// src/components/store/StoreView.tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem, formatPrice, ShippingOption, AppliedPromo } from '@/types/store';
import { ShoppingBag, Plus, Minus, X, MessageCircle, Image as ImageIcon, ChevronLeft, Tag, Truck, CheckCircle, ArrowLeft } from 'lucide-react';

interface BuyerInfo {
  name: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  comments: string;
}

interface OrderConfirmation {
  items: CartItem[];
  subtotal: number;
  shippingLabel: string | null;
  shippingCost: number;
  promoCode: string | null;
  discountAmount: number;
  total: number;
  buyerName: string;
  orderDate: string;
}

const EMPTY_BUYER: BuyerInfo = {
  name: '', phone: '', city: '', address: '', email: '', comments: '',
};

interface ShippingConfig {
  shipping_free: boolean;
  shipping_local_enabled: boolean;
  shipping_local_price: number;
  shipping_local_cities: string[];
  shipping_national_enabled: boolean;
  shipping_national_price: number;
}

interface Props {
  profileId: string;
  storeName: string;
  whatsapp: string;
  welcomeMessage?: string;
  currency?: string;
  fontColor?: string;
  accentColor?: string;
  shipping?: ShippingConfig;
}

function buildWhatsAppUrl(
  phone: string,
  items: CartItem[],
  storeName: string,
  currency: string,
  buyer: BuyerInfo,
  shippingLabel: string | null,
  shippingCost: number,
  promo: AppliedPromo | null,
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [];
  lines.push(`¡Hola! Quiero hacer un pedido desde tu tienda *${storeName}*:`);
  lines.push('');
  let subtotal = 0;
  items.forEach(({ product, quantity }) => {
    const sub = product.price * quantity;
    subtotal += sub;
    lines.push(`• ${quantity}x ${product.name} — ${formatPrice(sub, currency)}`);
  });
  lines.push('');
  lines.push(`Subtotal: ${formatPrice(subtotal, currency)}`);

  if (promo) {
    lines.push(`Código *${promo.code}*: -${formatPrice(promo.discount_amount, currency)}`);
  }

  if (shippingLabel) {
    lines.push(`Envío (${shippingLabel}): ${shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost, currency)}`);
  }

  const total = Math.max(0, subtotal - (promo?.discount_amount || 0) + shippingCost);
  lines.push(`*Total: ${formatPrice(total, currency)}*`);
  lines.push('');
  lines.push('--- Datos de envío ---');
  lines.push(`Nombre: ${buyer.name}`);
  if (buyer.phone) lines.push(`Teléfono: ${buyer.phone}`);
  if (buyer.email) lines.push(`Email: ${buyer.email}`);
  lines.push(`Ciudad: ${buyer.city}`);
  lines.push(`Dirección: ${buyer.address}`);
  if (buyer.comments) { lines.push(''); lines.push(`Comentarios: ${buyer.comments}`); }
  const msg = encodeURIComponent(lines.join('\n'));
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return isMobile ? `whatsapp://send?phone=${cleanPhone}&text=${msg}` : `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`;
}

const StoreView = ({
  profileId, storeName, whatsapp, welcomeMessage,
  currency = 'COP', fontColor = '#000000', accentColor = '#d4a432',
  shipping,
}: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyer, setBuyer] = useState<BuyerInfo>({ ...EMPTY_BUYER });
  const [showBuyerForm, setShowBuyerForm] = useState(false);

  // Order confirmation
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(() => {
    // Recover confirmation from sessionStorage if user is returning from WhatsApp
    try {
      const saved = sessionStorage.getItem(`linkone_order_${profileId}`);
      if (saved) {
        sessionStorage.removeItem(`linkone_order_${profileId}`);
        return JSON.parse(saved);
      }
    } catch { /* no-op */ }
    return null;
  });

  // Shipping
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(null);

  // Promo
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products').select('*').eq('profile_id', profileId)
        .order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, [profileId]);

  // Auto-select shipping if only one option
  useEffect(() => {
    if (!shipping) return;
    const options: ShippingOption[] = [];
    if (shipping.shipping_free) options.push('free');
    if (shipping.shipping_local_enabled) options.push('local');
    if (shipping.shipping_national_enabled) options.push('national');
    if (options.length === 1) setSelectedShipping(options[0]);
  }, [shipping]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todos') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const product = products.find(p => p.id === id);
        return product ? { product, quantity } : null;
      })
      .filter((x): x is CartItem => x !== null);
  }, [cart, products]);

  const totalItems = cartItems.reduce((sum, { quantity }) => sum + quantity, 0);
  const subtotalPrice = cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  const shippingCost = useMemo(() => {
    if (!selectedShipping || !shipping) return 0;
    if (selectedShipping === 'free') return 0;
    if (selectedShipping === 'local') return shipping.shipping_local_price;
    if (selectedShipping === 'national') return shipping.shipping_national_price;
    return 0;
  }, [selectedShipping, shipping]);

  const shippingLabel = useMemo(() => {
    if (!selectedShipping) return null;
    if (selectedShipping === 'free') return 'Envío gratis';
    if (selectedShipping === 'local') return 'Envío local';
    if (selectedShipping === 'national') return 'Envío nacional';
    return null;
  }, [selectedShipping]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discount_type === 'percent') return Math.round(subtotalPrice * appliedPromo.discount_value / 100);
    return Math.min(appliedPromo.discount_value, subtotalPrice);
  }, [appliedPromo, subtotalPrice]);

  const totalPrice = Math.max(0, subtotalPrice - discountAmount + shippingCost);

  const hasShippingOptions = shipping && (shipping.shipping_free || shipping.shipping_local_enabled || shipping.shipping_national_enabled);

  const addToCart = (id: string) => { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })); };
  const changeQty = (id: string, delta: number) => {
    setCart(c => { const next = (c[id] || 0) + delta; const copy = { ...c }; if (next <= 0) delete copy[id]; else copy[id] = next; return copy; });
  };

  const validatePromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setValidatingPromo(true);
    setPromoError('');
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('profile_id', profileId)
      .ilike('code', code)
      .eq('active', true)
      .maybeSingle();
    if (error || !data) {
      setPromoError('Código no válido');
      setAppliedPromo(null);
    } else if (data.max_uses && data.uses >= data.max_uses) {
      setPromoError('Este código ya alcanzó su límite de usos');
      setAppliedPromo(null);
    } else {
      const amt = data.discount_type === 'percent'
        ? Math.round(subtotalPrice * data.discount_value / 100)
        : Math.min(data.discount_value, subtotalPrice);
      setAppliedPromo({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount: amt,
      });
      setPromoError('');
    }
    setValidatingPromo(false);
  };

  const removePromo = () => { setAppliedPromo(null); setPromoInput(''); setPromoError(''); };

  const handleCheckout = async () => {
    if (!whatsapp || cartItems.length === 0) return;
    if (!buyer.name.trim() || !buyer.city.trim() || !buyer.address.trim()) return;

    // Save confirmation data before clearing cart
    const confirmation: OrderConfirmation = {
      items: [...cartItems],
      subtotal: subtotalPrice,
      shippingLabel,
      shippingCost,
      promoCode: appliedPromo?.code || null,
      discountAmount,
      total: totalPrice,
      buyerName: buyer.name,
      orderDate: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    // Increment promo uses
    if (appliedPromo) {
      await supabase.from('promo_codes')
        .update({ uses: (await supabase.from('promo_codes').select('uses').eq('profile_id', profileId).ilike('code', appliedPromo.code).single()).data?.uses + 1 || 1 })
        .eq('profile_id', profileId).ilike('code', appliedPromo.code);
    }

    try {
      await supabase.from('store_orders').insert({
        profile_id: profileId,
        items: cartItems.map(({ product, quantity }) => ({ product_id: product.id, name: product.name, price: product.price, quantity })),
        total: totalPrice,
      });
    } catch { /* no-op */ }

    const promoForMsg = appliedPromo ? { ...appliedPromo, discount_amount: discountAmount } : null;
    const url = buildWhatsAppUrl(whatsapp, cartItems, storeName, currency, buyer, shippingLabel, shippingCost, promoForMsg);

    // Save confirmation to sessionStorage so it shows when user returns
    try {
      sessionStorage.setItem(`linkone_order_${profileId}`, JSON.stringify(confirmation));
    } catch { /* no-op */ }

    // Redirect to WhatsApp (location.href works reliably on mobile + desktop)
    window.location.href = url;
  };

  const canCheckout = buyer.name.trim() && buyer.city.trim() && buyer.address.trim() && (!hasShippingOptions || selectedShipping);

  if (loading) return <div className="w-full py-8 text-center" style={{ color: fontColor, opacity: 0.6 }}>Cargando productos...</div>;
  if (products.length === 0) return (
    <div className="w-full py-12 text-center" style={{ color: fontColor, opacity: 0.6 }}>
      <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">Aún no hay productos disponibles</p>
    </div>
  );

  // ─── Order confirmation screen ──────────────────────────────────────
  if (orderConfirmation) {
    return (
      <div className="w-full py-6 px-2">
        <div className="rounded-2xl border-2 border-green-200 bg-green-50/80 p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">¡Pedido enviado!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Tu pedido fue enviado por WhatsApp a <strong>{storeName}</strong>.
              El vendedor te confirmará la disponibilidad y el pago.
            </p>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-xl p-4 text-left space-y-3 shadow-sm">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Resumen del pedido</p>
            <div className="space-y-2">
              {orderConfirmation.items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{quantity}x {product.name}</span>
                  <span className="text-gray-900 font-medium">{formatPrice(product.price * quantity, currency)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(orderConfirmation.subtotal, currency)}</span>
              </div>
              {orderConfirmation.promoCode && (
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span>Código {orderConfirmation.promoCode}</span>
                  <span>-{formatPrice(orderConfirmation.discountAmount, currency)}</span>
                </div>
              )}
              {orderConfirmation.shippingLabel && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{orderConfirmation.shippingLabel}</span>
                  <span>{orderConfirmation.shippingCost === 0 ? 'Gratis' : formatPrice(orderConfirmation.shippingCost, currency)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(orderConfirmation.total, currency)}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              {orderConfirmation.buyerName} · {orderConfirmation.orderDate}
            </p>
          </div>

          <button
            onClick={() => setOrderConfirmation(null)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition"
            style={{ backgroundColor: accentColor, color: '#fff' }}
          >
            <ArrowLeft size={14} />
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      {welcomeMessage && <p className="text-xs text-center px-4 mb-4" style={{ color: fontColor, opacity: 0.7 }}>{welcomeMessage}</p>}

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-1 mb-4 pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition"
              style={{
                backgroundColor: activeCategory === cat ? accentColor : 'transparent',
                color: activeCategory === cat ? '#fff' : fontColor,
                border: `1px solid ${activeCategory === cat ? accentColor : fontColor + '40'}`,
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product grid (2 columns with large images) */}
      <div className="grid grid-cols-2 gap-2">
        {filteredProducts.map(product => (
          <div key={product.id} className="rounded-lg overflow-hidden cursor-pointer"
            style={{ backgroundColor: fontColor + '0A' }} onClick={() => setSelectedProduct(product)}>
            <div className="relative aspect-square">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: fontColor, opacity: 0.3 }}><ImageIcon size={32} /></div>
              )}
              {product.active ? (
                <button onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                  className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90"
                  style={{ backgroundColor: accentColor }}
                  aria-label={`Agregar ${product.name}`}>
                  <Plus size={14} />
                </button>
              ) : null}
            </div>
            <div className="p-2">
              <p className="text-[11px] font-medium line-clamp-2 leading-tight" style={{ color: fontColor }}>{product.name}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs font-semibold" style={{ color: accentColor }}>{formatPrice(product.price, currency)}</p>
                {product.active ? (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600">En stock</span>
                ) : (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-500">Sin stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setSelectedProduct(null)}>
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
            <div className="relative flex-shrink-0">
              {selectedProduct.image_url ? (
                <div className="w-full bg-gray-50 flex items-center justify-center">
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full object-contain" style={{ maxHeight: '45vh' }} />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center"><ImageIcon size={48} className="text-gray-300" /></div>
              )}
              <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-5">
              {selectedProduct.category && <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mb-2">{selectedProduct.category}</span>}
              <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h3>
              <p className="text-xl font-bold mt-1" style={{ color: accentColor }}>{formatPrice(selectedProduct.price, currency)}</p>
              {selectedProduct.active ? (
                <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-600">En stock</span>
              ) : (
                <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">Sin stock</span>
              )}
              {selectedProduct.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{selectedProduct.description}</p>}
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              {selectedProduct.active ? (
                <button onClick={() => { addToCart(selectedProduct.id); setSelectedProduct(null); }}
                  className="w-full py-3 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
                  style={{ backgroundColor: accentColor }}>
                  <Plus size={16} /> Agregar al pedido
                </button>
              ) : (
                <button disabled className="w-full py-3 rounded-lg bg-gray-200 text-gray-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">No disponible</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating cart bar */}
      {totalItems > 0 && !cartOpen && !selectedProduct && (
        <button onClick={() => setCartOpen(true)}
          className="fixed bottom-16 left-4 right-4 z-40 flex items-center justify-between px-5 py-3 rounded-2xl shadow-lg font-medium text-sm text-white transition active:scale-[0.98]"
          style={{ backgroundColor: accentColor, maxWidth: '420px', margin: '0 auto' }}>
          <div className="flex items-center gap-2"><ShoppingBag size={16} /><span>Ver pedido ({totalItems})</span></div>
          <span className="font-semibold">{formatPrice(subtotalPrice, currency)}</span>
        </button>
      )}

      {/* Cart + checkout modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => { setCartOpen(false); setShowBuyerForm(false); }}>
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[95vh] sm:max-h-[85vh]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              {showBuyerForm ? (
                <>
                  <button onClick={() => setShowBuyerForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><ChevronLeft size={16} className="text-gray-600" /></button>
                  <h3 className="font-semibold text-gray-900">Datos de envío</h3>
                  <div className="w-8" />
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900">Tu pedido</h3>
                  <button onClick={() => { setCartOpen(false); setShowBuyerForm(false); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} className="text-gray-600" /></button>
                </>
              )}
            </div>

            {!showBuyerForm ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon size={18} className="text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{formatPrice(product.price * quantity, currency)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQty(product.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600"><Minus size={12} /></button>
                        <span className="text-sm font-medium w-5 text-center text-gray-900">{quantity}</span>
                        <button onClick={() => changeQty(product.id, 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600"><Plus size={12} /></button>
                      </div>
                    </div>
                  ))}

                  {/* Promo code input */}
                  <div className="pt-3 border-t border-gray-100">
                    {!appliedPromo ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                            placeholder="Código promocional" onKeyDown={e => e.key === 'Enter' && validatePromo()}
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 font-mono" />
                        </div>
                        <button onClick={validatePromo} disabled={validatingPromo || !promoInput.trim()}
                          className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium disabled:opacity-40">
                          Aplicar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2">
                          <Tag size={12} className="text-green-600" />
                          <span className="text-sm font-mono font-medium text-green-700">{appliedPromo.code}</span>
                          <span className="text-xs text-green-600">
                            -{appliedPromo.discount_type === 'percent' ? `${appliedPromo.discount_value}%` : formatPrice(appliedPromo.discount_value, currency)}
                          </span>
                        </div>
                        <button onClick={removePromo} className="text-green-600 hover:text-red-500"><X size={14} /></button>
                      </div>
                    )}
                    {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                  </div>

                  {/* Shipping selector */}
                  {hasShippingOptions && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center gap-1.5"><Truck size={12} className="text-gray-500" /><span className="text-xs font-medium text-gray-700">Envío</span></div>
                      {shipping!.shipping_free && (
                        <label className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition ${selectedShipping === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="shipping" checked={selectedShipping === 'free'} onChange={() => setSelectedShipping('free')} className="accent-green-500" />
                            <span className="text-sm text-gray-900">Envío gratis</span>
                          </div>
                          <span className="text-sm font-medium text-green-600">Gratis</span>
                        </label>
                      )}
                      {shipping!.shipping_local_enabled && (
                        <label className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition ${selectedShipping === 'local' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="shipping" checked={selectedShipping === 'local'} onChange={() => setSelectedShipping('local')} className="accent-green-500" />
                            <div>
                              <span className="text-sm text-gray-900">Envío local</span>
                              {shipping!.shipping_local_cities.length > 0 && (
                                <p className="text-[10px] text-gray-500">{shipping!.shipping_local_cities.join(', ')}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{formatPrice(shipping!.shipping_local_price, currency)}</span>
                        </label>
                      )}
                      {shipping!.shipping_national_enabled && (
                        <label className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition ${selectedShipping === 'national' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="shipping" checked={selectedShipping === 'national'} onChange={() => setSelectedShipping('national')} className="accent-green-500" />
                            <span className="text-sm text-gray-900">Envío nacional</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{formatPrice(shipping!.shipping_national_price, currency)}</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Total desglosado */}
                <div className="p-4 pb-8 border-t border-gray-100 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Subtotal</span>
                      <span className="text-sm text-gray-700">{formatPrice(subtotalPrice, currency)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600">Descuento ({appliedPromo.code})</span>
                        <span className="text-sm text-green-600">-{formatPrice(discountAmount, currency)}</span>
                      </div>
                    )}
                    {selectedShipping && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{shippingLabel}</span>
                        <span className="text-sm text-gray-700">{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost, currency)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice, currency)}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowBuyerForm(true)} disabled={!whatsapp}
                    className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition">
                    Continuar
                  </button>
                  {!whatsapp && <p className="text-[11px] text-center text-red-500">La tienda no tiene WhatsApp configurado</p>}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3"
                  onFocus={(e) => { const t = e.target as HTMLElement; if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350); }}>
                  <p className="text-xs text-gray-500 mb-1">Completa tus datos para que el vendedor pueda enviarte el pedido.</p>
                  <div>
                    <label className="text-xs text-gray-500">Nombre completo *</label>
                    <input type="text" value={buyer.name} onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))} placeholder="Tu nombre"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Teléfono</label>
                    <input type="tel" value={buyer.phone} onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))} placeholder="3001234567"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Correo electrónico</label>
                    <input type="email" value={buyer.email} onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))} placeholder="tu@email.com"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Ciudad *</label>
                    <input type="text" value={buyer.city} onChange={e => setBuyer(b => ({ ...b, city: e.target.value }))} placeholder="Bucaramanga"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Dirección de envío *</label>
                    <input type="text" value={buyer.address} onChange={e => setBuyer(b => ({ ...b, address: e.target.value }))} placeholder="Cra 15 #32-45, Barrio Centro"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Comentarios (opcional)</label>
                    <textarea value={buyer.comments} onChange={e => setBuyer(b => ({ ...b, comments: e.target.value }))}
                      placeholder="Ej: Entregar después de las 5pm, llamar antes..." maxLength={200} rows={2}
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 resize-none" />
                  </div>
                </div>
                <div className="p-4 pb-8 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice, currency)}</span>
                  </div>
                  <button onClick={handleCheckout} disabled={!canCheckout}
                    className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition">
                    <MessageCircle size={16} /> Enviar pedido por WhatsApp
                  </button>
                  {!canCheckout && <p className="text-[11px] text-center text-gray-400">
                    {hasShippingOptions && !selectedShipping ? 'Selecciona un método de envío' : 'Completa nombre, ciudad y dirección para continuar'}
                  </p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreView;
