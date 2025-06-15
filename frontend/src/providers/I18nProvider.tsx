'use client'; // Ce composant est un client car il utilise un Provider et un hook

import { I18nextProvider } from 'react-i18next';
import i18n from '../contexts/i18n'; // Importez votre configuration i18n client
import { useEffect } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
}

export default function I18nProvider({ children, locale }: I18nProviderProps) {
  // Met à jour la langue de i18next lorsque la locale de l'URL change
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);
  
  return (
    <I18nextProvider i18n={i18n}>
        {children}
    </I18nextProvider>
  );
}