'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

// Import your layout components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SideNav from '@/components/layout/SideNav';
import DashboardHeader from './DashboardHeader';

// This component displays the user's profile in the sidebar.
// It is self-contained and uses the AuthContext for data.
const SideNavUserProfile = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="p-4 border-t border-gray-700 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-600" />
          <div className="flex-1">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-1.5" />
            <div className="h-3 bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
          {user.name?.charAt(0).toUpperCase() || <User size={20} />}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-semibold text-white truncate text-sm">{user.name}</p>
          <p className="text-xs text-gray-300 truncate">{user.email}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Sign Out"
          className="p-2 text-gray-300 rounded-full hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};


export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define paths that should NOT have the common Header/Footer
  const noHeaderFooterPaths = [
    '/auth/signin',
    '/auth/register',
    '/auth/forgot-password',
    '/profile', // Include profile page in this minimalist layout
  ];

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthOrProfileRoute = noHeaderFooterPaths.some(path => pathname.startsWith(path));

  // --- DASHBOARD LAYOUT (with SideNav and DashboardHeader) ---
  if (isDashboardRoute) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900/50">
        {/* Column 1: The Sidebar */}
        <SideNav>
          <SideNavUserProfile />
        </SideNav>

        {/* Column 2: The Main Panel (Header + Content) */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // --- AUTH/PROFILE LAYOUT (minimalist: no Header, no Footer) ---
  // This new condition will take precedence for auth/profile pages
  if (isAuthOrProfileRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // --- PUBLIC-FACING LAYOUT (for all other pages, with Header and Footer) ---
  // This is the fallback layout for routes that are neither dashboard nor auth/profile
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}