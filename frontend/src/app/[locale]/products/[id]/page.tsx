'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import AIRecommendations from '@/components/AIRecommendations';
import { Button } from '@/components/UI/button';
import ProductCommentSection from '@/components/ProductCommentSection';
import { formatCurrency } from '@/contexts/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Define Product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: { id: string; name: string };
  seller: { id: string; name: string };
  quantity: number;
}

// Helper function to fetch product data
async function getProduct(id: string): Promise<Product | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// Order History Component (unchanged)
function OrderHistory() {
  const { getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/my-history`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch order history.');
        }
        const result = await response.json();
        setOrders(result.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [getAuthHeaders]);

  if (loading) return <div className="text-center p-8">Loading order history...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="mt-12 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Reservation History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">You have no past reservations for any product.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <p className="font-semibold">{order.product.name}</p>
                <p className="text-sm text-gray-500">Reserved on: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Main Page Component
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { user, getAuthHeaders } = useAuth();
  const router = useRouter();

  // Load product data
  useEffect(() => {
    const fetchProductData = async () => {
      const productData = await getProduct(params.id);
      if (!productData) {
        notFound();
      } else {
        setProduct(productData);
      }
    };
    fetchProductData();
  }, [params.id]);

  // Handle reservation creation
const handleReserveProduct = async () => {
  if (!user) {
    toast.error("You must be logged in to reserve a product.");
    router.push('/signin');
    return;
  }

  if (!product) {
    toast.error("Product not found.");
    return;
  }

  const loadingToast = toast.loading("Reserving product...");

  try {
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/json';

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId: params.id,
        buyerId: user.id, // ✅ Required field
        quantity: 1,
        status: 'PENDING',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create reservation');
    }

    const result = await response.json();
    toast.success('✅ Reservation created!', { id: loadingToast });
    router.push('/dashboard/reservations');
  } catch (err: any) {
    toast.error(`❌ ${err.message}`, { id: loadingToast });
  }
};


  if (!product) {
    return <div className="flex items-center justify-center h-screen">Loading product...</div>;
  }

  return (
    <main className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-lg">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="relative w-full h-96">
              <Image 
                src={product.imageUrl || '/placeholder.png'} 
                alt={product.name} 
                fill
                className="object-contain rounded-md"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <span className="text-sm font-medium text-primary">{product.category.name}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mt-2">{product.name}</h1>
            <div className="mt-4">
              <p className="text-3xl text-gray-900">{formatCurrency(product.price)}</p>
            </div>
            <div className="mt-6 prose">
              <p>{product.description}</p>
            </div>
            <p className="mt-6 text-base text-gray-500">
              Sold by: <span className="font-semibold text-gray-800">{product.seller.name}</span>
            </p>

            {/* Reserve Button */}
            <div className="mt-8 flex space-x-4">
              <Button 
                onClick={handleReserveProduct} 
                size="lg" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Reserve Now
              </Button>

              {user && (
                <Button 
                  onClick={() => setShowHistory(!showHistory)} 
                  size="lg" 
                  variant="outline" 
                  className="flex-1"
                >
                  {showHistory ? 'Hide' : 'View'} Order History
                </Button>
              )}
            </div>

            {/* Show product availability */}
            <div className="mt-6">
              <p className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.quantity > 0 ? `In stock: ${product.quantity} units available` : 'Currently out of stock'}
              </p>
            </div>
          </div>
        </div>

        {showHistory && <OrderHistory />}
        
        <AIRecommendations productId={product.id} />
        <ProductCommentSection productId={product.id} />
      </div>
    </main>
  );
}