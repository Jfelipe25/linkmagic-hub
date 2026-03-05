import { TemplateType } from '@/types/profile';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  type: TemplateType;
  selected: boolean;
  onClick: () => void;
}

const templateInfo: Record<TemplateType, { label: string; bgClass: string; textClass: string }> = {
  minimal: { label: 'Minimal', bgClass: 'bg-white', textClass: 'text-gray-800' },
  dark: { label: 'Dark', bgClass: 'bg-[#0f0f0f]', textClass: 'text-white' },
  gradient: { label: 'Gradient', bgClass: 'gold-gradient', textClass: 'text-white' },
};

const TemplateCard = ({ type, selected, onClick }: TemplateCardProps) => {
  const info = templateInfo[type];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105",
        selected ? "border-primary shadow-lg shadow-primary/20" : "border-border"
      )}
    >
      <div className={cn("w-16 h-24 rounded-md flex flex-col items-center justify-center gap-1", info.bgClass)}>
        <div className="w-5 h-5 rounded-full bg-gray-400" />
        <div className="w-8 h-1 rounded bg-gray-400" />
        <div className="w-10 h-2 rounded bg-gray-300 mt-1" />
        <div className="w-10 h-2 rounded bg-gray-300" />
      </div>
      <span className={cn("text-xs font-medium", selected ? "text-primary" : "text-muted-foreground")}>
        {info.label}
      </span>
    </button>
  );
};

export default TemplateCard;
