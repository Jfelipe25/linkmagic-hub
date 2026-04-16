// src/types/store.ts
export interface Product {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  store_enabled: boolean;
  store_whatsapp: string;
  store_welcome_message: string;
  store_currency: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_enabled: false,
  store_whatsapp: '',
  store_welcome_message: '',
  store_currency: 'COP',
};

export function formatPrice(amount: number, currency: string = 'COP'): string {
  const locale = currency === 'COP' ? 'es-CO'
    : currency === 'MXN' ? 'es-MX'
    : currency === 'ARS' ? 'es-AR'
    : currency === 'CLP' ? 'es-CL'
    : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString(locale)}`;
  }
}

export function buildWhatsAppUrl(
  phone: string,
  items: CartItem[],
  storeName: string,
  currency: string = 'COP'
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [];
  lines.push(`¡Hola! Quiero hacer un pedido desde tu tienda ${storeName}:`);
  lines.push('');
  let total = 0;
  items.forEach(({ product, quantity }) => {
    const subtotal = product.price * quantity;
    total += subtotal;
    lines.push(`• ${quantity}x ${product.name} — ${formatPrice(subtotal, currency)}`);
  });
  lines.push('');
  lines.push(`*Total: ${formatPrice(total, currency)}*`);
  const msg = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${msg}`;
}
