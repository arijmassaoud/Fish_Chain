'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SideNav from '@/components/layout/SideNav';
import DashboardHeader from './DashboardHeader';

// You might need to import your 'languages' array or define them here
// For simplicity, let's assume you have access to the 'locales' defined in middleware
const knownLocales = ['fr', 'en', 'ar']; // Make sure this matches your middleware locales

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  let isDashboardRoute = false;

  // Option 1: Remove locale prefix before checking
  const pathWithoutLocale = knownLocales.reduce((acc, locale) => {
    if (acc === `/${locale}` || acc.startsWith(`/${locale}/`)) {
      return acc.substring(`/${locale}`.length); // Remove e.g., "/fr"
    }
    return acc;
  }, pathname);

  // Now check the path without the locale prefix
  isDashboardRoute = pathWithoutLocale.startsWith('/dashboard');

  // Or Option 2 (simpler if all dashboard routes have specific structure):
  // You could also check if it starts with any locale + /dashboard
  // isDashboardRoute = knownLocales.some(locale => pathname.startsWith(`/${locale}/dashboard`));


  // --- Debugging Logs (keep these for now!) ---
  console.log('ConditionalLayout Debug:');
  console.log('  Current Pathname (raw):', pathname);
  console.log('  Path Without Locale:', pathWithoutLocale); // Check this value
  console.log('  isDashboardRoute:', isDashboardRoute);
  console.log('  Auth Loading State:', loading);
  console.log('  Authenticated User:', user ? user.name : 'No user');
  // --- End Debugging Logs ---

  // Pendant le chargement de l'utilisateur
  if (loading) {
    console.log('ConditionalLayout: Rendering Loading State.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Chargement...
      </div>
    );
  }

  // --- Layout du dashboard ---
  if (isDashboardRoute) {
    console.log('ConditionalLayout: Rendering Dashboard Layout (SideNav should be visible).');
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900/50">
        {/* Sidebar */}
        <SideNav />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // --- Layout public pour toutes les autres pages ---
  console.log('ConditionalLayout: Rendering Public Layout.');
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}