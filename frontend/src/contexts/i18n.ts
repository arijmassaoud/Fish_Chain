"use client"
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Détecte la langue de l'utilisateur
  .use(LanguageDetector)
  // Passe l'instance i18n à react-i18next
  .use(initReactI18next)
  // Charge les traductions depuis votre backend ou le dossier /public
  .use(Backend)
  .init({
    // Langues supportées
    supportedLngs: ['en', 'fr', 'ar'],
    // Langue par défaut
    fallbackLng: 'fr',
    // Le nom de votre fichier de traduction (common.json)
    defaultNS: 'common',
    backend: {
      // Chemin vers vos fichiers de traduction
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Désactivez le débogage en production
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;