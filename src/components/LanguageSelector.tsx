import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';
type SupportedLanguage = 'fr' | 'en' | 'es' | 'pt';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const currentLang = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: string) => {
    console.log('Changing language to:', langCode);
    setLanguage(langCode as SupportedLanguage);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors min-w-[120px]"
      >
        <Globe className="h-4 w-4" />
        <span className="flex items-center gap-1">
          {currentLang?.flag} {currentLang?.name}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;