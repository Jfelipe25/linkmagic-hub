import { useState } from 'react';

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

  const handleColorPick = (color: string) => {
    setHexInput(color);
    onChange(color);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="relative w-10 h-10 rounded-lg border border-input shrink-0 cursor-pointer overflow-hidden shadow-sm">
        <div className="w-full h-full" style={{ backgroundColor: selected }} />
        <input
          type="color"
          value={selected}
          onChange={(e) => handleColorPick(e.target.value)}
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
  );
};

export default ColorPicker;
