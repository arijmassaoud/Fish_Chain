// file: src/app/dashboard/categories/new/page.tsx (or your correct path)

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

export default function NewCategoryPage() {
  const router = useRouter();
  const { user, getAuthHeaders } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Redirect if user doesn't have the correct role
  if (user && !['ADMIN', 'SELLER'].includes(user.role)) {
    router.push('/'); // Redirect to home or another appropriate page
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Function to handle the AI description generation
  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
        alert("Please enter a category name first.");
        return;
    }
    
    setIsGenerating(true);
    setError('');

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-category-description`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthHeaders()['Authorization'],
            },
            body: JSON.stringify({ categoryName: formData.name }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "AI generation failed.");
        }
        
        setFormData(prev => ({ ...prev, description: result.description }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const categoryData = new FormData();
      categoryData.append('name', formData.name.trim());
      categoryData.append('description', formData.description.trim());

      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) {
        categoryData.append('image', imageFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          Authorization: getAuthHeaders()['Authorization'],
        },
        body: categoryData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create category.');
      }
      
      router.push('/dashboard/categories');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-8 md:px-10 md:py-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create a New Category</h1>
            <p className="mt-2 text-md text-gray-500">Fill in the details for the new product category.</p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-md">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
              <input type="text" id="name" name="name" required minLength={2} maxLength={100} value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3" placeholder="e.g., White Fish, Shellfish"/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Description</label>
                  <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !formData.name} className="flex items-center text-xs px-2 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      {isGenerating ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>) : (<Sparkles className="w-4 h-4 mr-1" />)}
                      Generate with AI
                  </button>
              </div>
              <textarea id="description" name="description" required minLength={10} value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3" placeholder="A brief, engaging description will be generated here..."/>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Image (Optional)</label>
                {imagePreview ? (
                    <div className="mt-2 group relative">
                        <Image src={imagePreview} alt="Category preview" width={500} height={300} className="rounded-lg w-full h-auto object-cover"/>
                        <button type="button" onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                           <X className="w-5 h-5"/>
                        </button>
                    </div>
                ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-slate-100">
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
               <button type="button" onClick={() => router.push('/dashboard/categories')} className="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Cancel</button>
               <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center">
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {loading ? 'Creating...' : 'Create Category'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}