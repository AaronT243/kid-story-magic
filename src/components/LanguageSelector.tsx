import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
type SupportedLanguage = 'fr' | 'en' | 'es' | 'pt';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  console.log('Current language:', language);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const currentLang = languages.find(lang => lang.code === language);

  return (
    <Select value={language} onValueChange={(value) => {
      console.log('LanguageSelector: Language changing from', language, 'to', value);
      setLanguage(value as SupportedLanguage);
    }}>
      <SelectTrigger className="w-auto min-w-[120px] bg-background/80 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            <span className="flex items-center gap-1">
              {currentLang?.flag} {currentLang?.name}
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50 z-50">
        {languages.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
          >
            <span className="flex items-center gap-2">
              {lang.flag} {lang.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;