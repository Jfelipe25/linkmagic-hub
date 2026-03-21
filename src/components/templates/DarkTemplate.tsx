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

const DarkTemplate = ({ profile, accentColor, profileId }: TemplateProps) => {
  const socialEntries = Object.entries(profile.social_links || {}).filter(([, v]) => v);
  const fontColor = profile.font_color || '#ffffff';
  const visibleLinks = getVisibleLinks(profile.links || []);

  return (
    <div className="min-h-full flex flex-col items-center px-6 py-12" style={{ backgroundColor: '#0f0f0f', color: fontColor }}>
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name}
          className="w-24 h-24 rounded-full object-cover mb-4"
          style={{ boxShadow: `0 0 0 3px ${fontColor}` }} />
      ) : (
        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: fontColor, color: '#0f0f0f', boxShadow: `0 0 0 3px ${fontColor}44` }}>
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      <h1 className="text-xl font-bold" style={{ color: fontColor }}>{profile.name || 'Tu Nombre'}</h1>
      <p className="text-sm mt-1 text-center max-w-[220px]" style={{ color: fontColor, opacity: 0.7 }}>{profile.bio || 'Tu biografía aquí'}</p>

      {socialEntries.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-4" style={{ maxWidth: '220px' }}>
          {socialEntries.map(([key, url]) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
            const Icon = platform ? iconMap[platform.icon] : ExternalLink;
            return (
              <a key={key} href={normalizeUrl(url as string)} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{ color: fontColor, filter: `drop-shadow(0 0 6px ${fontColor}66)` }}>
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
            style={{ backgroundColor: fontColor, color: '#0f0f0f' }}
            onClick={() => profile.slug && trackLinkClick(profile.slug, link.id)}>
            {link.label || 'Link'}
          </a>
        ))}
      </div>

      {profile.enable_contact_form && profileId && (
        <ContactForm profileId={profileId} accentColor={accentColor} fontColor={fontColor} />
      )}
    </div>
  );
};

export default DarkTemplate;
