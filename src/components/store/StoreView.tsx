// src/components/store/StoreView.tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem, formatPrice } from '@/types/store';
import { ShoppingBag, Plus, Minus, X, MessageCircle, Image as ImageIcon, ChevronLeft } from 'lucide-react';

interface BuyerInfo {
  name: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  comments: string;
}

const EMPTY_BUYER: BuyerInfo = {
  name: '',
  phone: '',
  city: '',
  address: '',
  email: '',
  comments: '',
};

interface Props {
  profileId: string;
  storeName: string;
  whatsapp: string;
  welcomeMessage?: string;
  currency?: string;
  fontColor?: string;
  accentColor?: string;
}

function buildWhatsAppUrl(
  phone: string,
  items: CartItem[],
  storeName: string,
  currency: string,
  buyer: BuyerInfo
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [];
  lines.push(`¡Hola! Quiero hacer un pedido desde tu tienda *${storeName}*:`);
  lines.push('');
  let total = 0;
  items.forEach(({ product, quantity }) => {
    const subtotal = product.price * quantity;
    total += subtotal;
    lines.push(`• ${quantity}x ${product.name} — ${formatPrice(subtotal, currency)}`);
  });
  lines.push('');
  lines.push(`*Total: ${formatPrice(total, currency)}*`);
  lines.push('');
  lines.push('--- Datos de envío ---');
  lines.push(`Nombre: ${buyer.name}`);
  if (buyer.phone) lines.push(`Teléfono: ${buyer.phone}`);
  if (buyer.email) lines.push(`Email: ${buyer.email}`);
  lines.push(`Ciudad: ${buyer.city}`);
  lines.push(`Dirección: ${buyer.address}`);
  if (buyer.comments) {
    lines.push('');
    lines.push(`Comentarios: ${buyer.comments}`);
  }
  const msg = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${msg}`;
}

const StoreView = ({
  profileId,
  storeName,
  whatsapp,
  welcomeMessage,
  currency = 'COP',
  fontColor = '#000000',
  accentColor = '#d4a432',
}: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyer, setBuyer] = useState<BuyerInfo>({ ...EMPTY_BUYER });
  const [showBuyerForm, setShowBuyerForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('profile_id', profileId)
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, [profileId]);

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
  const totalPrice = cartItems.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );

  const addToCart = (id: string) => {
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const changeQty = (id: string, delta: number) => {
    setCart(c => {
      const next = (c[id] || 0) + delta;
      const copy = { ...c };
      if (next <= 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };

  const handleCheckout = async () => {
    if (!whatsapp || cartItems.length === 0) return;
    if (!buyer.name.trim() || !buyer.city.trim() || !buyer.address.trim()) {
      return;
    }
    try {
      await supabase.from('store_orders').insert({
        profile_id: profileId,
        items: cartItems.map(({ product, quantity }) => ({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        total: totalPrice,
      });
    } catch { /* no-op */ }
    const url = buildWhatsAppUrl(whatsapp, cartItems, storeName, currency, buyer);
    window.open(url, '_blank');
  };

  const canCheckout = buyer.name.trim() && buyer.city.trim() && buyer.address.trim();

  if (loading) {
    return (
      <div className="w-full py-8 text-center" style={{ color: fontColor, opacity: 0.6 }}>
        Cargando productos...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12 text-center" style={{ color: fontColor, opacity: 0.6 }}>
        <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Aún no hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      {welcomeMessage && (
        <p
          className="text-xs text-center px-4 mb-4"
          style={{ color: fontColor, opacity: 0.7 }}
        >
          {welcomeMessage}
        </p>
      )}

      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-1 mb-4 pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition"
              style={{
                backgroundColor: activeCategory === cat ? accentColor : 'transparent',
                color: activeCategory === cat ? '#fff' : fontColor,
                border: `1px solid ${activeCategory === cat ? accentColor : fontColor + '40'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="rounded-lg overflow-hidden cursor-pointer"
            style={{ backgroundColor: fontColor + '0A' }}
            onClick={() => setSelectedProduct(product)}
          >
            <div className="relative aspect-square">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ color: fontColor, opacity: 0.3 }}
                >
                  <ImageIcon size={32} />
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90"
                style={{ backgroundColor: accentColor }}
                aria-label={`Agregar ${product.name}`}
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="p-2">
              <p
                className="text-[11px] font-medium line-clamp-2 leading-tight"
                style={{ color: fontColor }}
              >
                {product.name}
              </p>
              <p
                className="text-xs font-semibold mt-1"
                style={{ color: accentColor }}
              >
                {formatPrice(product.price, currency)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative flex-shrink-0">
              {selectedProduct.image_url ? (
                <div className="w-full bg-gray-50 flex items-center justify-center">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full object-contain"
                    style={{ maxHeight: '45vh' }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-300" />
                </div>
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              {selectedProduct.category && (
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mb-2">
                  {selectedProduct.category}
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedProduct.name}
              </h3>
              <p className="text-xl font-bold mt-1" style={{ color: accentColor }}>
                {formatPrice(selectedProduct.price, currency)}
              </p>
              {selectedProduct.description && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { addToCart(selectedProduct.id); setSelectedProduct(null); }}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
                style={{ backgroundColor: accentColor }}
              >
                <Plus size={16} /> Agregar al pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating cart bar */}
      {totalItems > 0 && !cartOpen && !selectedProduct && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-16 left-4 right-4 z-40 flex items-center justify-between px-5 py-3 rounded-2xl shadow-lg font-medium text-sm text-white transition active:scale-[0.98]"
          style={{ backgroundColor: accentColor, maxWidth: '420px', margin: '0 auto' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} />
            <span>Ver pedido ({totalItems})</span>
          </div>
          <span className="font-semibold">{formatPrice(totalPrice, currency)}</span>
        </button>
      )}

      {/* Cart + checkout modal */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => { setCartOpen(false); setShowBuyerForm(false); }}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              {showBuyerForm ? (
                <>
                  <button
                    onClick={() => setShowBuyerForm(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <ChevronLeft size={16} className="text-gray-600" />
                  </button>
                  <h3 className="font-semibold text-gray-900">Datos de envío</h3>
                  <div className="w-8" />
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900">Tu pedido</h3>
                  <button
                    onClick={() => { setCartOpen(false); setShowBuyerForm(false); }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                </>
              )}
            </div>

            {!showBuyerForm ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{formatPrice(product.price * quantity, currency)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeQty(product.id, -1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-5 text-center text-gray-900">{quantity}</span>
                        <button
                          onClick={() => changeQty(product.id, 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice, currency)}</span>
                  </div>
                  <button
                    onClick={() => setShowBuyerForm(true)}
                    disabled={!whatsapp}
                    className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition"
                  >
                    Continuar
                  </button>
                  {!whatsapp && (
                    <p className="text-[11px] text-center text-red-500">
                      La tienda no tiene WhatsApp configurado
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Completa tus datos para que el vendedor pueda enviarte el pedido.
                  </p>
                  <div>
                    <label className="text-xs text-gray-500">Nombre completo *</label>
                    <input
                      type="text"
                      value={buyer.name}
                      onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))}
                      placeholder="Tu nombre"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Teléfono</label>
                    <input
                      type="tel"
                      value={buyer.phone}
                      onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))}
                      placeholder="3001234567"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Correo electrónico</label>
                    <input
                      type="email"
                      value={buyer.email}
                      onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Ciudad *</label>
                    <input
                      type="text"
                      value={buyer.city}
                      onChange={e => setBuyer(b => ({ ...b, city: e.target.value }))}
                      placeholder="Bucaramanga"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Dirección de envío *</label>
                    <input
                      type="text"
                      value={buyer.address}
                      onChange={e => setBuyer(b => ({ ...b, address: e.target.value }))}
                      placeholder="Cra 15 #32-45, Barrio Centro"
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Comentarios (opcional)</label>
                    <textarea
                      value={buyer.comments}
                      onChange={e => setBuyer(b => ({ ...b, comments: e.target.value }))}
                      placeholder="Ej: Entregar después de las 5pm, llamar antes..."
                      maxLength={200}
                      rows={2}
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 resize-none"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice, currency)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={!canCheckout}
                    className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition"
                  >
                    <MessageCircle size={16} />
                    Enviar pedido por WhatsApp
                  </button>
                  {!canCheckout && (
                    <p className="text-[11px] text-center text-gray-400">
                      Completa nombre, ciudad y dirección para continuar
                    </p>
                  )}
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