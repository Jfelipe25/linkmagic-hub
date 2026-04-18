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

export interface ShippingConfig {
  shipping_free: boolean;
  shipping_local_enabled: boolean;
  shipping_local_price: number;
  shipping_local_cities: string[];
  shipping_national_enabled: boolean;
  shipping_national_price: number;
}

export const DEFAULT_SHIPPING: ShippingConfig = {
  shipping_free: false,
  shipping_local_enabled: false,
  shipping_local_price: 0,
  shipping_local_cities: [],
  shipping_national_enabled: false,
  shipping_national_price: 0,
};

export interface PromoCode {
  id: string;
  profile_id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  active: boolean;
  uses: number;
  max_uses: number | null;
  created_at?: string;
}

export interface AppliedPromo {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  discount_amount: number; // calculated
}

export type ShippingOption = 'free' | 'local' | 'national' | null;

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
