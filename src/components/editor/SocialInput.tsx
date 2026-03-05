import {
  Facebook, Twitter, Instagram, Github, Send, Linkedin,
  Mail, MessageCircle, Youtube, Music
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Facebook, Twitter, Instagram, Github, Send, Linkedin,
  Mail, MessageCircle, Youtube, Music,
};

interface SocialInputProps {
  iconName: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SocialInput = ({ iconName, label, value, onChange, placeholder }: SocialInputProps) => {
  const Icon = iconMap[iconName] || Mail;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-secondary text-primary shrink-0">
        <Icon size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
};

export default SocialInput;
