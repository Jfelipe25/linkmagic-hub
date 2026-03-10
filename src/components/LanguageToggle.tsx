import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors"
      title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      {lang === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
    </button>
  );
};

export default LanguageToggle;
