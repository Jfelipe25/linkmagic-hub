import { ProfileData } from '@/types/profile';
import MinimalTemplate from './MinimalTemplate';
import DarkTemplate from './DarkTemplate';
import GradientTemplate from './GradientTemplate';

interface TemplateRendererProps {
  profile: ProfileData;
}

const TemplateRenderer = ({ profile }: TemplateRendererProps) => {
  const accentColor = profile.accent_color || '#d4a432';

  switch (profile.template) {
    case 'dark':
      return <DarkTemplate profile={profile} accentColor={accentColor} />;
    case 'gradient':
      return <GradientTemplate profile={profile} accentColor={accentColor} />;
    case 'minimal':
    default:
      return <MinimalTemplate profile={profile} accentColor={accentColor} />;
  }
};

export default TemplateRenderer;
