// frontend/src/components/providers/AuthProviders.tsx
'use client'; // This directive makes it a Client Component

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext'; // Your custom AuthProvider

interface AuthProvidersProps {
  children: ReactNode;
}

export function AuthProviders({ children }: AuthProvidersProps) {
  return (

    
    // SessionProvider should typically wrap other auth-related providers
    // as it manages the core session for NextAuth.js
    <SessionProvider>
      {/* Your custom AuthProvider can then consume the session from NextAuth.js */}
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}