

export const fallbackLng = 'fr'; // Langue par défaut
export const languages = [fallbackLng, 'en', 'ar'];
export const defaultNS = 'common'; // Le nom de votre fichier de traduction (common.json)

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}