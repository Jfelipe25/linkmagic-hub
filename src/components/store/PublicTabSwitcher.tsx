// src/components/store/PublicTabSwitcher.tsx
interface Props {
  activeTab: 'links' | 'store';
  onChange: (tab: 'links' | 'store') => void;
  fontColor: string;
  accentColor: string;
}

const PublicTabSwitcher = ({ activeTab, onChange, fontColor, accentColor }: Props) => {
  const baseStyle = {
    color: fontColor,
    borderColor: fontColor + '30',
  };

  const activeStyle = {
    color: '#fff',
    backgroundColor: accentColor,
    borderColor: accentColor,
  };

  return (
    <div
      className="w-full flex rounded-full p-1 mb-5"
      style={{ border: `1px solid ${fontColor}20` }}
    >
      <button
        onClick={() => onChange('links')}
        className="flex-1 py-1.5 text-xs font-medium rounded-full transition"
        style={activeTab === 'links' ? activeStyle : baseStyle}
      >
        Links
      </button>
      <button
        onClick={() => onChange('store')}
        className="flex-1 py-1.5 text-xs font-medium rounded-full transition"
        style={activeTab === 'store' ? activeStyle : baseStyle}
      >
        Tienda
      </button>
    </div>
  );
};

export default PublicTabSwitcher;
