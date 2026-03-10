import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/i18n/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('linkone_lang');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('linkone_lang', l);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    const dict = translations[lang] as Record<string, string>;
    const fallback = translations.es as Record<string, string>;
    let text = dict[key] || fallback[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
