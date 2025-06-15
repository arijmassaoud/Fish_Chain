// file: frontend/src/app/products/new/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, UploadCloud, X } from 'lucide-react';

// --- THE FIX IS HERE: Make sure your Image import is exactly like this ---
// It must be a default import (no curly braces).
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { user, getAuthHeaders } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
  });

  // Fetching categories logic
  useEffect(() => {
    if (user && !['SELLER', 'ADMIN'].includes(user.role)) {
      router.push('/products');
    }
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const result = await response.json();
        setCategories(result.data || result || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a product name first.");
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeaders()['Authorization'],
        },
        body: JSON.stringify({ productName: formData.name }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI generation failed.");
      setFormData(prev => ({ ...prev, description: result.description }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const productData = new FormData();
      productData.append('name', formData.name.trim());
      productData.append('description', formData.description.trim());
      productData.append('price', formData.price);
      productData.append('quantity', formData.quantity);
      productData.append('categoryId', formData.categoryId);
      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) {
        productData.append('image', imageFile);
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        method: 'POST',
        headers: { Authorization: getAuthHeaders()['Authorization'] },
        body: productData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create product');
      router.push('/products');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !['SELLER', 'ADMIN'].includes(user.role)) {
    return null;
  }

  // The professional JSX design remains the same
  return (
    <div className="relative overflow-hidden min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800  py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-8 md:px-10 md:py-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create a New Product</h1>
            <p className="mt-2 text-md text-gray-500">Fill in the details below to add a new item to the market.</p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-md">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* ... other form fields ... */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-lg p-3" placeholder="e.g., Fresh Atlantic Salmon"/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Description</label>
                  <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !formData.name} className="flex items-center text-xs px-2 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      {isGenerating ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>) : (<Sparkles className="w-4 h-4 mr-1" />)}
                      Generate with AI
                  </button>
              </div>
              <textarea id="description" name="description" required value={formData.description} onChange={handleChange} rows={5} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-base p-3" placeholder="A detailed description will be generated here..."/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1">Price (USD)</label>
                <input type="number" id="price" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-lg p-3" placeholder="0.00"/>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                <input type="number" id="quantity" name="quantity" required min="0" value={formData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-lg p-3" placeholder="0"/>
              </div>
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select id="categoryId" name="categoryId" required value={formData.categoryId} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-lg p-3">
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
              </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
                {imagePreview ? (
                    <div className="mt-2 group relative">
                        <Image src={imagePreview} alt="Product preview" width={500} height={300} className="rounded-lg w-full h-auto object-contain"/>
                        <button type="button" onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                           <X className="w-5 h-5"/>
                        </button>
                    </div>
                ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary bg-gray-50 hover:bg-slate-100">
                        <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                )}
                 <input type="file" id="image" name="image" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
               <button type="button" onClick={() => router.push('/products')} className="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Cancel</button>
               <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary disabled:opacity-50 transition-colors flex items-center">
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {loading ? 'Creating...' : 'Create Product'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}