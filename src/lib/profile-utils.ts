import { ProfileData, FontFamily } from '@/types/profile';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function profileFromRow(row: any): ProfileData {
  return {
    name: row.name || '',
    bio: row.bio || '',
    avatar: row.avatar || '',
    slug: row.slug || '',
    template: row.template || 'minimal',
    accent_color: row.accent_color || '#d4a432',
    font_color: row.font_color || '#000000',
    font_family: (row.font_family as FontFamily) || 'Inter',
    background_image: row.background_image || '',
    social_links: (typeof row.social_links === 'object' && row.social_links) ? row.social_links : {},
    links: Array.isArray(row.links) ? row.links : [],
    paid: row.paid ?? false,
    session_id: row.session_id || '',
    user_id: row.user_id || '',
    created_at: row.created_at || '',
    views: row.views ?? 0,
    enable_contact_form: row.enable_contact_form ?? false,
store_enabled: row.store_enabled ?? false,
    store_whatsapp: row.store_whatsapp ?? '',
    store_welcome_message: row.store_welcome_message ?? '',
    store_currency: row.store_currency ?? 'COP',
store_name: row.store_name ?? '',
  };
}

/** Normaliza una URL asegurando que tenga protocolo https:// */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  return `https://${url}`;
}
