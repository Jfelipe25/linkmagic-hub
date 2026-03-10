import { ProfileData } from '@/types/profile';
import MinimalTemplate from './MinimalTemplate';
import DarkTemplate from './DarkTemplate';
import GradientTemplate from './GradientTemplate';
import BackgroundTemplate from './BackgroundTemplate';

interface TemplateRendererProps {
  profile: ProfileData;
  profileId?: string;
}

const TemplateRenderer = ({ profile, profileId }: TemplateRendererProps) => {
  const accentColor = profile.accent_color || '#d4a432';

  switch (profile.template) {
    case 'dark':
      return <DarkTemplate profile={profile} accentColor={accentColor} profileId={profileId} />;
    case 'gradient':
      return <GradientTemplate profile={profile} accentColor={accentColor} profileId={profileId} />;
    case 'background':
      return <BackgroundTemplate profile={profile} accentColor={accentColor} profileId={profileId} />;
    case 'minimal':
    default:
      return <MinimalTemplate profile={profile} accentColor={accentColor} profileId={profileId} />;
  }
};

export default TemplateRenderer;
