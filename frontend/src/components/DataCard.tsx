'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define types
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalReservations: number;
  reservationsByStatus: Array<{
    status: string;
    _count: { id: number };
  }>;
}

export default function DataCard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard/stats', {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError('Error fetching stats');
        toast.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Auth Headers Helper
  function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get confirmed orders from grouped status
  const confirmedOrders = stats?.reservationsByStatus.find(
    (item) => item.status === 'CONFIRMED'
  )?.["_count"]?.id || 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <UserIcon />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <ShoppingCartIcon />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalReservations || 0}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Confirmed Orders</h3>
          <CheckCircleIcon />
        </div>
        <p className="mt-2 text-3xl font-bold text-green-600">{confirmedOrders}</p>
        <p className="mt-1 text-sm text-gray-500">
          {stats?.totalReservations ? Math.round((confirmedOrders / stats.totalReservations) * 100) : 0}% of total
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <PackageIcon />
        </div>
        <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.totalProducts || 0}</p>
      </div>
    </div>
  );
}

// Icon Components
function UserIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function ShoppingCartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M16 11V7a4 4 0 00-8 0v4M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M20 7l-8-4-8 4m16 0l-2 10a2 2 0 01-2 2H4a2 2 0 01-2-2L2 7l8-4 8 4z"
      />
    </svg>
  );
}