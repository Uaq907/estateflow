'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

export function LanguageDirectionProvider() {
  const { language } = useLanguage();

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    // Update dir attribute for RTL/LTR
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return null;
}

