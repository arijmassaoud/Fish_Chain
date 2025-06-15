'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatCurrency } from '@/contexts/utils';

// Icons
import { FaRegTrashAlt } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import { IoEyeOutline } from 'react-icons/io5';
import { AiOutlineShoppingCart } from 'react-icons/ai';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: { id: string; name: string };
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

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, getAuthHeaders } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  // Fetch buyer's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || user.role !== 'BUYER') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/my`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch your orders');
        }

        const result = await response.json();
        setReservations(result.data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Failed to load your orders');
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, getAuthHeaders]);

  // Cancel order
  const handleCancelOrder = async (reservationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    const loadingToast = toast.loading('Cancelling order...');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'CANCELLED' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      const updated = await response.json();
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? updated.data : r))
      );
      toast.success('✅ Order cancelled successfully!', { id: loadingToast });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(`❌ ${err.message}`, { id: loadingToast });
    }
  };

  // Edit status (if needed)
  const handleEditSubmit = async (e: React.FormEvent, reservationId: string) => {
    e.preventDefault();
    const validStatuses = ['PENDING',  'CANCELLED'];
    if (!validStatuses.includes(editStatus)) {
      toast.error('Please select a valid status.');
      return;
    }

    const loadingToast = toast.loading('Updating order...');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: editStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      const updated = await response.json();
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? updated.data : r))
      );
      setEditingId(null);
      toast.success('✅ Order updated!', { id: loadingToast });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (!user || user.role !== 'BUYER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">You must be a buyer to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          <AiOutlineShoppingCart />
          <span>See All Products</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {reservations.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">You have no orders yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <li key={reservation.id} className="py-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <Image
                      src={reservation.product.imageUrl || '/placeholder.png'}
                      alt={reservation.product.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {reservation.product.name}
                      </h3>
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
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {reservation.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    {/* Cancel Button - Only for PENDING orders */}
                    {reservation.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelOrder(reservation.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                        disabled={reservation.status === 'CANCELLED'}
                      >
                        <FaRegTrashAlt />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {/* Edit Button - Optional */}
                    <button
                      onClick={() => {
                        setEditingId(editingId === reservation.id ? null : reservation.id);
                        setEditStatus(reservation.status);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition"
                    >
                      <MdEdit />
                      <span>{editingId === reservation.id ? 'Cancel' : 'Edit'}</span>
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={() => setExpandedId(expandedId === reservation.id ? null : reservation.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                    >
                      <IoEyeOutline />
                      <span>{expandedId === reservation.id ? 'Hide' : 'Details'}</span>
                    </button>
                  </div>
                </div>

                {/* Edit Form */}
                {editingId === reservation.id && (
                  <div className="py-4 px-4 bg-gray-50 mt-4 rounded-md">
                    <form onSubmit={(e) => handleEditSubmit(e, reservation.id)}>
                      <h4 className="text-sm font-semibold mb-2">Update Status</h4>
                      <div className="flex items-center gap-4">
                        <select
                          required
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Expanded View */}
                {expandedId === reservation.id && (
                  <div className="py-4 px-4 bg-gray-50 text-sm mt-4 rounded-md">
                    <div className="space-y-2">
                      <p>
                        <strong>Product ID:</strong> {reservation.productId}
                      </p>
                      <p>
                        <strong>Product Price:</strong>{' '}
                        {formatCurrency(reservation.product.price)}
                      </p>
                      <p>
                        <strong>Description:</strong>{' '}
                        {reservation.product.description}
                      </p>
                      <p>
                        <strong>Seller:</strong>{' '}
                        {reservation.product.sellerId}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}