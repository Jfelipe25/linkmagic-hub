import { Check } from 'lucide-react';
import { ACCENT_COLORS } from '@/types/profile';

interface ColorPickerProps {
  selected: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ selected, onChange }: ColorPickerProps) => {
  return (
    <div className="flex items-center gap-3">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
          style={{
            backgroundColor: color,
            borderColor: selected === color ? 'hsl(var(--foreground))' : 'transparent',
          }}
        >
          {selected === color && <Check size={14} className="text-background" />}
        </button>
      ))}
    </div>
  );
};

export default ColorPicker;
