export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  telegram?: string;
  linkedin?: string;
  email?: string;
  whatsapp?: string;
  youtube?: string;
  tiktok?: string;
}

export interface CustomLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export type TemplateType = 'minimal' | 'dark' | 'gradient';

export interface ProfileData {
  name: string;
  bio: string;
  avatar: string;
  slug: string;
  template: TemplateType;
  accent_color: string;
  social_links: SocialLinks;
  links: CustomLink[];
  paid?: boolean;
  session_id?: string;
  user_id?: string;
  created_at?: string;
}

export const ACCENT_COLORS = [
  '#d4a432',
  '#a78bfa',
  '#60a5fa',
  '#f87171',
  '#4ade80',
  '#fb923c',
];

export const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { key: 'twitter', label: 'Twitter / X', icon: 'Twitter' },
  { key: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { key: 'github', label: 'GitHub', icon: 'Github' },
  { key: 'telegram', label: 'Telegram', icon: 'Send' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { key: 'email', label: 'Email', icon: 'Mail' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { key: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { key: 'tiktok', label: 'TikTok', icon: 'Music' },
] as const;

export const DEFAULT_PROFILE: ProfileData = {
  name: '',
  bio: '',
  avatar: '',
  slug: '',
  template: 'minimal',
  accent_color: '#d4a432',
  social_links: {},
  links: [],
};
