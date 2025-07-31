import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelectorTest: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  console.log('LanguageSelectorTest - Current language:', language);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const handleLanguageChange = (langCode: string) => {
    console.log('Changing language to:', langCode);
    setLanguage(langCode as any);
  };

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            language === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {lang.flag} {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelectorTest;