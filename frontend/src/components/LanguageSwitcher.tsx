'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const currentPathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);

  const locales = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
  ];

  // Trouve la langue actuelle ou utilise le français par défaut
  const currentLocale = locales.find(l => currentPathname.startsWith(`/${l.code}`)) || locales[1];

  const handleLocaleChange = (newLocale: string) => {
    // 1. Détermine le chemin de base sans le préfixe de langue
    // Exemple : /fr/dashboard -> /dashboard
    let basePath = currentPathname;
    const currentLocaleCode = currentLocale.code;
    
    if (basePath.startsWith(`/${currentLocaleCode}`)) {
      basePath = basePath.substring(currentLocaleCode.length + 1);
      // S'assurer que le chemin de base commence par un / s'il n'est pas vide
      if (basePath.length > 0 && !basePath.startsWith('/')) {
        basePath = `/${basePath}`;
      }
    }
    // Si le chemin de base est vide (cas de /fr), on le met à /
    if (basePath === '') {
        basePath = '/';
    }

    // 2. Naviguer vers la nouvelle URL complète
    const newUrl = `/${newLocale}${basePath}`;
    router.push(newUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center">
          <Globe size={20} className="mr-3" />
          <span className="text-sm font-medium">{currentLocale.name}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        // CORRECTION : `bottom-full` est remplacé par `top-full` et `mb-2` par `mt-2`
        // pour que le menu s'affiche en dessous du bouton.
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-700 rounded-lg shadow-lg z-10 animate-in fade-in-0 slide-in-from-top-2">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleLocaleChange(locale.code)}
              className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
              disabled={currentLocale.code === locale.code}
            >
              {locale.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
