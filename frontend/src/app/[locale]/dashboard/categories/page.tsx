// file: (your path)/CategoriesPage.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Trash2, X, Sparkles, UploadCloud, PlusCircle, Eye } from 'lucide-react';

// Interface for Category data
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function CategoriesPage() {
  const { user, getAuthHeaders } = useAuth();

  // --- ALL STATE MANAGEMENT ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for managing which modal is open
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  
  // State for the edit form
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  // --- DATA FETCHING ---
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      setCategories(result.data || result || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchCategories();
    }
  }, [user]);
  
  // --- COMPLETE HANDLER FUNCTIONS ---
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditForm({ name: category.name, description: category.description || '' });
    setEditImagePreview(category.imageUrl || null);
    setEditImageFile(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        alert("Please ensure the category name is filled in.");
        return;
    }
    setIsGenerating(true);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-category-description`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ categoryName: editForm.name }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "AI generation failed.");
        setEditForm(prev => ({ ...prev, description: result.description }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setLoading(true);
    try {
        const categoryData = new FormData();
        categoryData.append('name', editForm.name);
        categoryData.append('description', editForm.description);
        if (editImageFile) {
            categoryData.append('image', editImageFile);
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingCategory.id}`, {
            method: 'PUT',
            headers: { 'Authorization': getAuthHeaders()['Authorization'] },
            body: categoryData,
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to update category');

        // We call fetchCategories() to get the freshest list data
        await fetchCategories();
        setEditingCategory(null); // Close the modal
        alert('Category updated successfully!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        alert(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect existing products.')) return;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': getAuthHeaders()['Authorization'] },
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete category');
        
        // Update the state by refetching the list
        await fetchCategories();
        alert('Category deleted.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        alert(err.message);
    }
  };

  // --- RENDER LOGIC ---
  if (!user || !['ADMIN', 'SELLER'].includes(user.role)) {
    return <div className="text-center py-20">Access Denied.</div>;
  }
  if (loading && categories.length === 0) return <div className="text-center py-20">Loading...</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                <p className="mt-1 text-md text-gray-500">Add, view, and manage all product categories.</p>
            </div>
            <Link href="/dashboard/categories/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                <PlusCircle className="w-5 h-5 mr-2" />
                Add New Category
            </Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="bg-white shadow-md overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id}>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center min-w-0">
                        <Image src={category.imageUrl || '/placeholder.png'} alt={category.name} width={48} height={48} className="h-12 w-12 object-cover rounded-md flex-shrink-0"/>
                        <div className="ml-4 min-w-0">
                            <p className="text-md font-semibold text-gray-800 truncate">{category.name}</p>
                            <p className="mt-1 text-sm text-gray-500 truncate">{category.description}</p>
                        </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                        <button onClick={() => setViewingCategory(category)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors" title="View Details">
                            <Eye className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleEditClick(category)} className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-gray-100 rounded-full transition-colors" title="Edit Category">
                            <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors" title="Delete Category">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- View Details Modal --- */}
      {viewingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-start"><h2 className="text-2xl font-bold text-gray-900">{viewingCategory.name}</h2><button type="button" onClick={() => setViewingCategory(null)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X className="w-6 h-6"/></button></div>
                    <p className="mt-1 text-sm text-gray-500">Category Details</p>
                    <div className="mt-6 space-y-6">{viewingCategory.imageUrl && (<div className="relative w-full h-64 rounded-lg overflow-hidden"><Image src={viewingCategory.imageUrl} alt={viewingCategory.name} fill className="object-cover"/></div>)}<div><h3 className="font-semibold text-gray-800">Description</h3><p className="mt-1 text-gray-600 whitespace-pre-wrap">{viewingCategory.description || 'No description available.'}</p></div></div>
                </div>
                <div className="bg-gray-50 px-8 py-4 flex justify-end rounded-b-2xl"><button type="button" onClick={() => setViewingCategory(null)} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Close</button></div>
            </div>
        </div>
      )}

      {/* --- Edit Category Modal --- */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleUpdateCategory}>
                    <div className="p-8">
                        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-900">Edit Category</h2><button type="button" onClick={() => setEditingCategory(null)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><X/></button></div>
                        <div className="mt-8 space-y-8">
                            <div><label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label><input type="text" name="name" required value={editForm.name} onChange={handleEditFormChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3"/></div>
                            <div><div className="flex justify-between items-center mb-1"><label htmlFor="description" className="block text-sm font-semibold text-gray-700">Description</label><button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !editForm.name} className="flex items-center text-xs px-2 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all">{isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <Sparkles className="w-4 h-4 mr-1" />}Generate with AI</button></div><textarea name="description" value={editForm.description} onChange={handleEditFormChange} rows={4} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3"/></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Category Image</label>{editImagePreview && <div className="mt-2 group relative"><Image src={editImagePreview} alt="New preview" width={200} height={200} className="rounded-lg h-32 w-32 object-cover"/></div>}<div onClick={() => editFileInputRef.current?.click()} className="mt-2 flex items-center px-4 py-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 w-fit"><UploadCloud className="h-5 w-5 text-gray-500 mr-2"/><span className="text-sm text-gray-600">{editImageFile ? 'Change image' : 'Upload new image'}</span></div><input type="file" ref={editFileInputRef} accept="image/*" onChange={handleEditImageChange} className="hidden" /></div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3"><button type="button" onClick={() => setEditingCategory(null)} className="px-6 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Cancel</button><button type="submit" disabled={loading} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center">{loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}{loading ? 'Updating...' : 'Save Changes'}</button></div>
                </form>
            </div>
        </div>
      )}
    </>
  );
}