import { useState } from 'react';
import { Check } from 'lucide-react';
import { ACCENT_COLORS } from '@/types/profile';

interface ColorPickerProps {
  selected: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ selected, onChange }: ColorPickerProps) => {
  const [hexInput, setHexInput] = useState(selected);

  const handleHexChange = (value: string) => {
    const clean = value.startsWith('#') ? value : `#${value}`;
    setHexInput(clean);
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      onChange(clean);
    }
  };

  const handlePresetClick = (color: string) => {
    setHexInput(color);
    onChange(color);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handlePresetClick(color)}
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
      <div className="flex items-center gap-2">
        <label className="relative w-8 h-8 rounded-md border border-input shrink-0 cursor-pointer overflow-hidden">
          <div className="w-full h-full" style={{ backgroundColor: selected }} />
          <input
            type="color"
            value={selected}
            onChange={(e) => handlePresetClick(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#d4a432"
          maxLength={7}
          className="w-28 h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
