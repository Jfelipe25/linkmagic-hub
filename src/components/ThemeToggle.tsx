import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors ${className}`}
      title={darkMode ? 'Modo claro' : 'Modo oscuro'}
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default ThemeToggle;
