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

const BackgroundTemplate = ({ profile, accentColor, profileId }: TemplateProps) => {
  const socialEntries = Object.entries(profile.social_links || {}).filter(([, v]) => v);
  const bgImage = profile.background_image;
  const fontColor = profile.font_color || '#ffffff';
  const visibleLinks = getVisibleLinks(profile.links || []);

  return (
    <div
      className="min-h-full flex flex-col items-center px-6 py-12 relative max-w-md mx-auto w-full"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: bgImage ? undefined : '#ffffff',
        color: fontColor,
      }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />

      <div className="relative z-10 flex flex-col items-center w-full">
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
        <h1 className="text-xl font-bold drop-shadow-md" style={{ color: fontColor }}>{profile.name || 'Tu Nombre'}</h1>
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
              className="block w-full text-center py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 backdrop-blur-sm"
              style={{ backgroundColor: `${fontColor}26`, color: fontColor, border: `1px solid ${fontColor}4d` }}
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
  );
};

export default BackgroundTemplate;
