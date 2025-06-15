/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { toast } from 'sonner';

// Define interfaces for your data
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: {
    id: string;
    name: string;
  };
  sellerId: string;
}

interface Reservation {
  id: string;
  productId: string;
  buyerId: string;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export default function ReservationsPage() {
  const { user, getAuthHeaders } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState({ status: '' });

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch reservations');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setReservations(result.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load reservations');
        toast.error(err.message || 'Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [user, getAuthHeaders]);

  const handleEditClick = (reservation: Reservation) => {
    setEditingReservation(editingReservation?.id === reservation.id ? null : reservation);
    setEditForm({ status: reservation.status });
  };

  const handleDelete = async (reservationId: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    const loadingToast = toast.loading('Deleting reservation...');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete reservation');
      }
      setReservations(reservations.filter((r) => r.id !== reservationId));
      toast.success('Reservation deleted!', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLSelectElement & { name: string };
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent, reservationId: string) => {
    e.preventDefault();

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(editForm.status)) {
      toast.error('Please select a valid status.');
      return;
    }
    
    const loadingToast = toast.loading('Updating reservation...');
    try {
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json'; // Ensure Content-Type is set

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: editForm.status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server Error:', errorData);
        throw new Error(errorData.message || 'Failed to update reservation');
      }

      const data = await response.json();
      setReservations(reservations.map(r => r.id === reservationId ? data.data : r));
      setEditingReservation(null);
      toast.success('✅ Reservation updated!', { id: loadingToast });
    } catch (err: any) {
      toast.error(`❌ ${err.message}`, { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!user || !['BUYER', 'SELLER', 'ADMIN'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Management</h1>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {reservations.length === 0 ? (
            <li className="py-6 px-6 text-center text-gray-500">No reservations found.</li>
          ) : (
            reservations.map((reservation) => (
              <React.Fragment key={reservation.id}>
                {/* Reservation Card */}
                <li className="py-6 px-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className="flex items-center">
                      <Image
                        src={reservation.product.imageUrl || '/placeholder.png'}
                        alt={reservation.product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{reservation.product.name}</h3>
                        <p
                          className={`mt-1 text-xs font-bold ${
                            reservation.status === 'PENDING'
                              ? 'text-yellow-600'
                              : reservation.status === 'CONFIRMED'
                              ? 'text-green-600'
                              : reservation.status === 'CANCELLED'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        >
                          Status: {reservation.status}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {reservation.quantity}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <button
                        onClick={() => handleEditClick(reservation)}
                        className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                      >
                        {editingReservation?.id === reservation.id ? 'Cancel' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setEditingReservation(editingReservation?.id === reservation.id ? null : reservation)}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </li>

                {/* Edit Form */}
                {editingReservation?.id === reservation.id && (
                  <li className="py-6 px-6 bg-gray-50">
                    <form onSubmit={(e) => handleEditSubmit(e, reservation.id)}>
                      <h4 className="text-md font-semibold mb-2">Update Status</h4>
                      <div className="flex items-center gap-4">
                        <select
                          name="status"
                          required
                          value={editForm.status}
                          onChange={handleEditChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Select Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Update
                        </button>
                      </div>
                    </form>
                  </li>
                )}
              </React.Fragment>
            ))
          )}
        </ul>
       
      </div>
    </div>
  );
}