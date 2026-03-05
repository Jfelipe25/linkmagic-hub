import { ProfileData, SOCIAL_PLATFORMS } from '@/types/profile';
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
}

const DarkTemplate = ({ profile, accentColor }: TemplateProps) => {
  const socialEntries = Object.entries(profile.social_links || {}).filter(([, v]) => v);

  return (
    <div className="min-h-full flex flex-col items-center px-6 py-12" style={{ backgroundColor: '#0f0f0f', color: '#fff' }}>
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name}
          className="w-20 h-20 rounded-full object-cover mb-4"
          style={{ boxShadow: `0 0 0 3px ${accentColor}` }} />
      ) : (
        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: accentColor, color: '#0f0f0f', boxShadow: `0 0 0 3px ${accentColor}44` }}>
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      <h1 className="text-xl font-bold" style={{ color: '#fff' }}>{profile.name || 'Tu Nombre'}</h1>
      <p className="text-sm mt-1 text-center max-w-[220px]" style={{ color: '#aaa' }}>{profile.bio || 'Tu biografía aquí'}</p>

      {socialEntries.length > 0 && (
        <div className="flex gap-3 mt-4">
          {socialEntries.map(([key, url]) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
            const Icon = platform ? iconMap[platform.icon] : ExternalLink;
            return (
              <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{ color: accentColor, filter: `drop-shadow(0 0 6px ${accentColor}66)` }}>
                <Icon size={18} />
              </a>
            );
          })}
        </div>
      )}

      <div className="w-full mt-6 space-y-3">
        {profile.links?.map((link) => (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: accentColor, color: '#0f0f0f' }}>
            {link.label || 'Link'}
          </a>
        ))}
      </div>
    </div>
  );
};

export default DarkTemplate;
