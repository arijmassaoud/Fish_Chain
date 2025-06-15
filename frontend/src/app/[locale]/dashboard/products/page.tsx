/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { Edit, Trash2,ChevronRight, PlusCircle } from 'lucide-react'; // 1. Import PlusCircle icon
import { toast } from 'sonner';
import { formatCurrency } from '@/contexts/utils'

// Interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  status: string; // Add status to track pending, available, etc.
  category: { id: string; name: string; };
  sellerId: string;
}
interface Category { id: string; name: string; }


export default function DashboardProductsPage() {
  const { user, getAuthHeaders } = useAuth();

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', quantity: '', categoryId: '' });
  
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);


  // --- DATA FETCHING ---
  useEffect(() => {
    // Only fetch data if the user is available
    if (user) {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch only products created by the current seller, unless they are an admin
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) throw new Error('Failed to fetch products');
                const productsResult = await response.json();
                setProducts(productsResult.data || []);

                const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
                if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
                const categoriesResult = await categoriesResponse.json();
                setCategories(categoriesResult.data || []);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || 'Failed to load page data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }
  }, [getAuthHeaders, user]); // Re-fetch when user object is available


  // --- HANDLER FUNCTIONS ---

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      categoryId: product.category.id,
    });
    setEditImagePreview(product.imageUrl || null);
    setEditImageFile(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateDescription = async () => {
    if (!editForm.name) {
        toast.error("Please ensure the product name is filled in.");
        return;
    }
    setIsGenerating(true);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-description`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productName: editForm.name }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "AI generation failed.");
        setEditForm(prev => ({ ...prev, description: result.description }));
        toast.success("Description generated successfully!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const loadingToast = toast.loading('Updating product...');
    try {
        const productData = new FormData();
        productData.append('name', editForm.name);
        productData.append('description', editForm.description);
        productData.append('price', editForm.price);
        productData.append('quantity', editForm.quantity);
        productData.append('categoryId', editForm.categoryId);
        if (editImageFile) {
            productData.append('image', editImageFile);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: { 'Authorization': getAuthHeaders()['Authorization'] },
            body: productData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update product');

        setProducts(products.map(p => (p.id === editingProduct.id ? result.data : p)));
        setEditingProduct(null);
        toast.success('Product updated successfully!', { id: loadingToast });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        toast.error(err.message, { id: loadingToast });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    const loadingToast = toast.loading('Deleting product...');
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete product.');
        }

        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        toast.success('Product deleted successfully!', { id: loadingToast });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        toast.error(err.message, { id: loadingToast });
    }
  };

  if (loading) return <div className="text-center py-20">Loading products...</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800 ">
        {/* --- 3. Added Add Product button --- */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            {user && ['SELLER', 'ADMIN'].includes(user.role) && (
                <Link href="/products/new">
                    <button className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary transition-colors shadow-sm">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Add New Product
                    </button>
                </Link>
            )}
        </div>

        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800 p-6 sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center flex-grow min-w-0">
                        <Image src={product.imageUrl || '/placeholder.png'} alt={product.name} width={64} height={64} className="h-16 w-16 object-cover rounded-md flex-shrink-0"/>
                        <div className="ml-4 truncate">
                            <p className="text-sm font-semibold text-primary truncate">{product.name}</p>
                            {/* --- 4. Added Status Badge --- */}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                product.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                product.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {product.status}
                            </span>
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mx-4 flex-shrink-0">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        <Link href={`/products/${product.id}`} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors" title="View Product Page">
                            <ChevronRight className="h-5 w-5"/>
                        </Link>
                        <button onClick={() => handleEditClick(product)} className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-gray-100 rounded-full transition-colors" title="Edit Product">
                            <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors" title="Delete Product">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            {/* ... Modal content remains the same ... */}
        </div>
      )}
    </>
  );
}
