
import { arTranslations } from './ar';
import { enTranslations } from './en';

export const translations = {
  ar: arTranslations,
  en: enTranslations,
};

export type TranslationKey = keyof typeof arTranslations;
