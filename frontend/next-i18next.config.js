// next-i18next.config.js

module.exports = {
  i18n: {
    // These are the locales you want to support
    locales: ['en', 'fr','ar'],
    // This is the default locale
    defaultLocale: 'en',
  },
   ns: ['common'], // <--- IMPORTANT: Ensure this matches your files
  defaultNS: 'common', 
};