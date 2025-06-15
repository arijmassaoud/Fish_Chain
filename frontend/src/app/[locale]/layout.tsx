
import * as React from 'react';

import './styles/globals.css'; // Assuming you have this file for global styles
import { AuthProvider } from '@/contexts/AuthContext';
import AiChatToggler from '@/components/AiChatToggler';
import ConditionalLayout from '@/components/layout/ConditionalLayout'; // <-- Import the conditional layout
import I18nProvider  from '@/providers/I18nProvider'
import { dir } from 'i18next';
import { languages } from '../i18n/settings'; // Assurez-vous d'avoir ce fichier

import { Inter } from 'next/font/google'; // NOUVEAU : Importer la police
const inter = Inter({ subsets: ['latin'] });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}
export const metadata = {
  title: 'FishChain - Dashboard',
  description: 'Manage your FishChain marketplace.',
};
export async function generateStaticParams() {
  return languages.map((locale) => ({ locale }));
}
interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}
export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  return (
    <html lang={locale} dir={dir(locale)}>
      <body
        className={`${inter.className} bg-white text-gray-900`}
        suppressHydrationWarning
      >
             <I18nProvider locale={locale}>
        <AuthProvider>
          {/*
            This is the crucial part. ConditionalLayout will look at the URL.
            If it's a dashboard URL, it will render the SideNav and your page content.
            If it's not, it will render the regular Header/Footer.
          */}
         
          <ConditionalLayout >
        
          {children}
          
          
          </ConditionalLayout>
         
          <AiChatToggler />
         
        </AuthProvider>
     </I18nProvider>
      </body>
    </html>
  );
}
