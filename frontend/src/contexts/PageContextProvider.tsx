'use client';

import React, { createContext, useContext, useState } from 'react';

interface PageContextType {
  pageContextData: string | null;
  setPageContextData: (data: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) throw new Error('usePageContext must be used within PageContextProvider');
  return context;
};

export function PageContextProvider({ children }: { children: React.ReactNode }) {
  const [pageContextData, setPageContextData] = useState<string | null>(null);

  return (
    <PageContext.Provider value={{ pageContextData, setPageContextData }}>
      {children}
    </PageContext.Provider>
  );
}
