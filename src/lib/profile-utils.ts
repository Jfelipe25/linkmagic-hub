import { ProfileData } from '@/types/profile';

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
    background_image: row.background_image || '',
    social_links: (typeof row.social_links === 'object' && row.social_links) ? row.social_links : {},
    links: Array.isArray(row.links) ? row.links : [],
    paid: row.paid ?? false,
    session_id: row.session_id || '',
    user_id: row.user_id || '',
    created_at: row.created_at || '',
  };
}
