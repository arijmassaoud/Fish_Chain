/*
================================================================================
| Fichier à créer : src/middleware.ts                                          |
|                                                                              |
| Placez ce fichier à la racine de votre dossier `src`. S'il n'y a pas de      |
| dossier `src`, placez-le à la racine de votre projet, à côté de `next.config.js`.|
================================================================================
*/

import { NextRequest, NextResponse } from 'next/server';

// 1. Spécifiez vos langues et la langue par défaut
const locales = ['fr', 'en', 'ar'];
const defaultLocale = 'fr';

export function middleware(request: NextRequest) {
  // 2. Récupérez le chemin de la requête (ex: /dashboard)
  const pathname = request.nextUrl.pathname;

  // 3. Vérifiez si le chemin contient déjà un préfixe de langue (ex: /fr, /en)
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // 4. Si aucune langue n'est présente, redirigez vers la langue par défaut
  if (pathnameIsMissingLocale) {
    // Créez une nouvelle URL en ajoutant la langue par défaut
    const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
    
    // Redirigez l'utilisateur vers cette nouvelle URL
    return NextResponse.redirect(newUrl);
  }
}

// 5. Définissez les chemins sur lesquels ce middleware doit s'exécuter
export const config = {
  matcher: [
    // Ne pas exécuter sur les routes API, les fichiers statiques, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
