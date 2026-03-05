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

function darkenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

const GradientTemplate = ({ profile, accentColor }: TemplateProps) => {
  const socialEntries = Object.entries(profile.social_links || {}).filter(([, v]) => v);
  const darkColor = darkenHex(accentColor, 80);

  return (
    <div className="min-h-full flex flex-col items-center px-6 py-12"
      style={{
        background: `linear-gradient(160deg, ${accentColor}, ${darkColor})`,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 6s ease infinite',
        color: '#fff',
      }}>
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name}
          className="w-20 h-20 rounded-full object-cover mb-4"
          style={{ border: '3px solid rgba(255,255,255,0.8)' }} />
      ) : (
        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.8)' }}>
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      <h1 className="text-xl font-bold drop-shadow-md">{profile.name || 'Tu Nombre'}</h1>
      <p className="text-sm mt-1 text-center max-w-[220px] drop-shadow-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {profile.bio || 'Tu biografía aquí'}
      </p>

      {socialEntries.length > 0 && (
        <div className="flex gap-3 mt-4">
          {socialEntries.map(([key, url]) => {
            const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
            const Icon = platform ? iconMap[platform.icon] : ExternalLink;
            return (
              <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.9)' }}>
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
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: accentColor }}>
            {link.label || 'Link'}
          </a>
        ))}
      </div>
    </div>
  );
};

export default GradientTemplate;
