
import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold px-3 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm"
        >
          <Languages className="w-4 h-4 mr-2" />
          {t('language.switch')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black/95 backdrop-blur-xl border-red-500/30 shadow-2xl">
        <DropdownMenuItem
          onClick={() => setLanguage('ar')}
          className={`text-white hover:bg-red-500/20 cursor-pointer ${
            language === 'ar' ? 'bg-red-500/30' : ''
          }`}
        >
          <Globe className="w-4 h-4 mr-2" />
          {t('language.arabic')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`text-white hover:bg-red-500/20 cursor-pointer ${
            language === 'en' ? 'bg-red-500/30' : ''
          }`}
        >
          <Globe className="w-4 h-4 mr-2" />
          {t('language.english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
