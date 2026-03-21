import { ProfileData, SOCIAL_PLATFORMS, getVisibleLinks } from '@/types/profile';
import { normalizeUrl } from '@/lib/profile-utils';
import { trackLinkClick } from '@/hooks/useLinkClicks';
import ContactForm from '@/components/ContactForm';
import {
  Facebook, Twitter, Instagram, Github, Send, Linkedin,
  Mail, MessageCircle, Youtube, Music, ExternalLink
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Facebook, Twitter, Instagram, Github, Send, Linkedin,
  Mail, MessageCircle, Youtube, Music,
};

interface TemplateProps {
  profile: ProfileData;
  accentColor: string;
  profileId?: string;
}

function darkenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

const GradientTemplate = ({ profile, accentColor, profileId }: TemplateProps) => {
  const socialEntries = Object.entries(profile.social_links || {}).filter(([, v]) => v);
  const darkColor = darkenHex(accentColor, 80);
  const fontColor = profile.font_color || '#000000';
  const visibleLinks = getVisibleLinks(profile.links || []);

  return (
    <div className="min-h-screen w-full" style={{
        background: `linear-gradient(160deg, ${accentColor}, ${darkColor})`,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 6s ease infinite',
      }}>
      <div className="min-h-screen flex flex-col items-center px-6 py-12 mx-auto max-w-md" style={{ color: fontColor }}>
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name}
          className="w-28 h-28 rounded-full object-cover mb-4"
          style={{ border: `3px solid ${fontColor}cc` }} />
      ) : (
        <div className="w-28 h-28 rounded-full mb-4 flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: `${fontColor}33`, border: `3px solid ${fontColor}cc` }}>
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      <h1 className="text-xl font-bold text-center drop-shadow-md" style={{ color: fontColor }}>{profile.name || 'Tu Nombre'}</h1>
      <p className="text-sm mt-1 text-center max-w-[220px] drop-shadow-sm" style={{ color: fontColor, opacity: 0.85 }}>
        {profile.bio || 'Tu biografía aquí'}
      </p>

      {socialEntries.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-4" style={{ maxWidth: '220px' }}>
          {socialEntries.map(([key, url]) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
            const Icon = platform ? iconMap[platform.icon] : ExternalLink;
            return (
              <a key={key} href={normalizeUrl(url as string)} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-80"
                style={{ color: fontColor, opacity: 0.9 }}>
                <Icon size={18} />
              </a>
            );
          })}
        </div>
      )}

      <div className="w-full mt-6 space-y-3">
        {visibleLinks.map((link) => (
          <a key={link.id} href={normalizeUrl(link.url)} target="_blank" rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: `${fontColor}f2`, color: accentColor }}
            onClick={() => profile.slug && trackLinkClick(profile.slug, link.id)}>
            {link.label || 'Link'}
          </a>
        ))}
      </div>

      {profile.enable_contact_form && profileId && (
        <ContactForm profileId={profileId} accentColor={accentColor} fontColor={fontColor} />
      )}
    </div>
      </div>
    </div>
  );
};

export default GradientTemplate;
