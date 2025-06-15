// file: (your path)/CertificationsPage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, FileText, ChevronRight } from 'lucide-react';

// Using the more detailed Certificate interface
interface Certificate {
  id: string;
  type: string;
  description: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | string;
  createdAt: string;
  product: { name: string; };
  veterinarian: { name: string; };
}

export default function CertificationsPage() {
  const { user, getAuthHeaders } = useAuth(); // Assuming getAuthHeaders is in your context
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetching logic remains the same, but with getAuthHeaders
  useEffect(() => {
    if (!user) return;
    const fetchCertificates = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch certificates');
        const result = await response.json();
        setCertificates(result || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [user, getAuthHeaders]);


  // Redirect if user doesn't have the correct role
  if (user && !['VETERINARIAN', 'ADMIN'].includes(user.role)) {
    return <div className="text-center py-20 text-red-600">Access Denied.</div>;
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Certifications Management</h1>
                    <p className="mt-1 text-md text-gray-500">View, create, and manage all veterinary certificates.</p>
                </div>
                <Link
                href="/dashboard/certifications/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Issue New Certificate
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-md">{error}</div>
            )}

            {/* Redesigned Certificate List */}
            <div className="bg-white shadow-md overflow-hidden sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200">
                {certificates.length === 0 ? (
                    <li className="py-8 px-6 text-center text-gray-500">No certificates have been issued yet.</li>
                ) : (
                    certificates.map((certificate) => (
                    <li key={certificate.id}>
                        {/* --- THE FIX IS HERE --- */}
                        {/* The entire list item is now a link to the detail/edit page */}
                        <Link href={`/dashboard/certifications/${certificate.id}`} className="block hover:bg-gray-50 transition-colors">
                            <div className="px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <FileText className="h-6 w-6 text-blue-600"/>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-blue-700 truncate">
                                            {certificate.type}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600">
                                            For Product: <span className="font-medium">{certificate.product.name}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        certificate.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        certificate.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                                        certificate.status === 'REVOKED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {certificate.status}
                                    </p>
                                    <ChevronRight className="h-5 w-5 text-gray-400 ml-4"/>
                                </div>
                            </div>
                        </Link>
                    </li>
                    ))
                )}
                </ul>
            </div>
        </div>
    </div>
  );
}