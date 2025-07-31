import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const currentLang = languages.find(lang => lang.code === language);

  return (
    <Select value={language} onValueChange={(value) => {
      console.log('Language changing from', language, 'to', value);
      setLanguage(value as any);
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
      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 min-w-[160px] shadow-lg">
        {languages.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
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