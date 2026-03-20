import { ProfileData, SocialLinks, SOCIAL_PLATFORMS, getVisibleLinks } from '@/types/profile';
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

const MinimalTemplate = ({ profile, accentColor, profileId }: TemplateProps) => {
  const socialEntries = Object.entries(profile.social_links || {}).filter(([, v]) => v);
  const fontColor = profile.font_color || '#000000';
  const visibleLinks = getVisibleLinks(profile.links || []);

  return (
    <div className="min-h-full flex flex-col items-center px-6 py-12" style={{ backgroundColor: '#ffffff', color: fontColor }}>
      {profile.avatar && (
        <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover mb-4" />
      )}
      {!profile.avatar && (
        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: fontColor + '22', color: fontColor }}>
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      <h1 className="text-xl font-bold" style={{ color: fontColor }}>{profile.name || 'Tu Nombre'}</h1>
      <p className="text-sm mt-1 text-center max-w-[220px]" style={{ color: fontColor, opacity: 0.6 }}>{profile.bio || 'Tu biografía aquí'}</p>

      {socialEntries.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-4" style={{ maxWidth: '220px' }}>
          {socialEntries.map(([key, url]) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
            const Icon = platform ? iconMap[platform.icon] : ExternalLink;
            return (
              <a key={key} href={normalizeUrl(url as string)} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-80"
                style={{ color: fontColor }}>
                <Icon size={18} />
              </a>
            );
          })}
        </div>
      )}

      <div className="w-full mt-6 space-y-3">
        {visibleLinks.map((link) => (
          <a key={link.id} href={normalizeUrl(link.url)} target="_blank" rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-full text-sm font-medium transition-all"
            style={{
              border: `2px solid ${fontColor}`,
              color: fontColor,
            }}
            onClick={() => profile.slug && trackLinkClick(profile.slug, link.id)}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = fontColor; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = fontColor; }}
          >
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

export default MinimalTemplate;
