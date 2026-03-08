import { ProfileData } from '@/types/profile';
import MinimalTemplate from './MinimalTemplate';
import DarkTemplate from './DarkTemplate';
import GradientTemplate from './GradientTemplate';
import BackgroundTemplate from './BackgroundTemplate';

interface TemplateRendererProps {
  profile: ProfileData;
}

const TemplateRenderer = ({ profile }: TemplateRendererProps) => {
  const accentColor = profile.accent_color || '#d4a432';
  const fontFamily = profile.font_family || 'Inter';

  const wrappedProfile = { ...profile };

  const wrapperStyle = { fontFamily: `'${fontFamily}', sans-serif` };

  switch (profile.template) {
    case 'dark':
      return <div style={wrapperStyle}><DarkTemplate profile={wrappedProfile} accentColor={accentColor} /></div>;
    case 'gradient':
      return <div style={wrapperStyle}><GradientTemplate profile={wrappedProfile} accentColor={accentColor} /></div>;
    case 'background':
      return <div style={wrapperStyle}><BackgroundTemplate profile={wrappedProfile} accentColor={accentColor} /></div>;
    case 'minimal':
    default:
      return <div style={wrapperStyle}><MinimalTemplate profile={wrappedProfile} accentColor={accentColor} /></div>;
  }
};

export default TemplateRenderer;
