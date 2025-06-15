'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Certificate {
  id: string;
  productId: string;
  type: string;
  description: string;
  validUntil: string;
  status: string;
  product: {
    id: string;
    name: string;
    quantity: number;
  };
  veterinarian: {
    id: string;
    name: string;
  };
}

export default function EditCertificatePage() {
  const router = useRouter();
  const params = useParams();
  useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    validUntil: '',
    status: 'ACTIVE',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // جلب بيانات الشهادة
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${params.id}`);
        if (!response.ok) throw new Error('فشل جلب الشهادة');

        const result = await response.json();
        setCertificate(result);
        setFormData({
          type: result.type,
          description: result.description,
          validUntil: new Date(result.validUntil).toISOString().split('T')[0],
          status: result.status,
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'فشل تحميل الشهادة');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">الشهادة غير موجودة</p>
      </div>
    );
  }

  // تحديث النموذج ← دعم التعديل
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // إرسال النموذج ← تحديث الشهادة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${certificate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل تحديث الشهادة');
      }

      const updated = await response.json();
      router.push(`/dashboard/certifications/${updated.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء التحديث');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">تعديل الشهادة</h1>

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* نوع الشهادة */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                نوع الشهادة
              </label>
              <input
                type="text"
                id="type"
                name="type"
                required
                minLength={2}
                maxLength={100}
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* الوصف */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                الوصف
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={10}
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* تاريخ الانتهاء */}
            <div>
              <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
                صالح حتى
              </label>
              <input
                type="date"
                id="validUntil"
                name="validUntil"
                required
                value={formData.validUntil}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* الحالة */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                الحالة
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Update Certificate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}