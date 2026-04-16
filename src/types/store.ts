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
