'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define an interface for the shape of your context data
interface PageContextData {
  pageName: string;
  ordersCount?: number;
  totalSales?: number;
  confirmedOrdersCount?: number;
  latestProducts?: any[]; // Use more specific types if available
  processedData?: any[];
  currentPeriodSales?: number;
  salesChange?: number;
  topProducts?: any[];
  ShowingTimePeriod?: string;
  description?: string;
}

// 2. Define the type for the context itself
interface PageContextType {
  pageContextData: PageContextData | null;
  // 3. Update the setter function to accept the data object
  setPageContextData: (data: PageContextData) => void;
}

// Create the context with a default value
const PageContext = createContext<PageContextType | undefined>(undefined);

// The provider component
export function PageContextProvider({ children }: { children: ReactNode }) {
  const [pageContextData, setPageContextData] = useState<PageContextData | null>(null);

  return (
    <PageContext.Provider value={{ pageContextData, setPageContextData }}>
      {children}
    </PageContext.Provider>
  );
}

// The custom hook to use the context
export function usePageContext() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageContextProvider');
  }
  return context;
}