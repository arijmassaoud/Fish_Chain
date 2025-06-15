'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

// Define props for your page components to resolve the userId error
interface MessagesPageProps {
  userId: string;
}

interface DashboardClientUIProps {
  dataCards: ReactNode;
  lineChart: ReactNode;
  piChart: ReactNode;
  latestProducts: ReactNode;
  productsPage: ReactNode;
  categoriesPage: ReactNode;
  reservationsPage: ReactNode;
  certificationsPage: ReactNode;
  notificationsPage: ReactNode;
  VeterinarianDashboardPage:ReactNode;
  messagesPage: (props: MessagesPageProps) => ReactNode; // Update to reflect it's a component that needs props
}

export default function DashboardClientUI({
  dataCards,
  lineChart,
  piChart,
  latestProducts,
  productsPage,
  categoriesPage,
  reservationsPage,
  certificationsPage,
  VeterinarianDashboardPage,
  notificationsPage,
  messagesPage,
}: DashboardClientUIProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect on the client side after loading is complete and no user is found
    router.push('/signin');
    return null;
  }
  
  // Render the dashboard UI with components passed from the server
  return (
    <>
      {/* Quick Stats Cards */}
      <div className="flex flex-wrap gap-4 w-full mb-8 max-sm:flex-col">
          {dataCards}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
            {lineChart}
        </div>
        <div>
            {piChart}
        </div>
      </div>
      
      {/* Latest Products Table */}
      <div className="mb-12">
        {latestProducts}
      </div>

      {/* Role-Based Tools & Page Components */}
      {user.role === 'ADMIN' && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Admin Controls</h2>
          {/* ... admin buttons ... */}
        </div>
      )}

      {(user.role === 'SELLER' || user.role === 'ADMIN') && (
        <div className="mt-12 space-y-12">
          {productsPage}
          {categoriesPage}
          {reservationsPage}
          {certificationsPage}
          {notificationsPage}
          {VeterinarianDashboardPage}
          {messagesPage({ userId: user.id })}
        </div>
      )}

       {/* Add other role-based sections (BUYER, VET) as needed */}
    </>
  );
}