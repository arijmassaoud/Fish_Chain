// file: (your path)/CreateCertificatePage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles,} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantity: number;
}

export default function CreateCertificatePage() {
  const router = useRouter();
  const { user, getAuthHeaders } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    productId: '',
    type: '',
    description: '',
    validUntil: '',
  });

  useEffect(() => {
    if (user && !['VETERINARIAN', 'ADMIN'].includes(user.role)) {
      router.push('/');
    }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch products');
        const result = await response.json();
        setProducts(result.data || result || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Could not load products.');
      } finally {
        setLoading(false);
      }
    };
    if(user) {
        fetchProducts();
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.productId || !formData.type) {
        alert("Please select a product and enter a certificate type first.");
        return;
    }
    const selectedProduct = products.find(p => p.id === formData.productId);
    if (!selectedProduct) {
        alert("Selected product not found.");
        return;
    }
    setIsGenerating(true);
    setError('');
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-certificate-text`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                productName: selectedProduct.name,
                certificateType: formData.type 
            }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "AI generation failed.");
        setFormData(prev => ({ ...prev, description: result.description }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create certificate.');
      }
      const data = await response.json();
      alert('Certificate created successfully!');

      // --- THIS IS THE FIX ---
      // Redirect to the new certificate's detail page using its ID from the API response.
      // Make sure your folder structure is /dashboard/certifications/[id]/page.tsx
      router.push(`/dashboard/certifications/${data.id}`);
      // --- END OF FIX ---

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred during creation.');
    } finally {
        setLoading(false);
    }
  };
  
  if (!user || !['VETERINARIAN', 'ADMIN'].includes(user.role)) {
     return <div className="text-center py-20">Access Denied.</div>
  }

  // The professional JSX design remains the same
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-8 md:px-10 md:py-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Issue New Certificate</h1>
            <p className="mt-2 text-md text-gray-500">Fill in the details to issue a new veterinary certificate.</p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-md">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="productId" className="block text-sm font-semibold text-gray-700 mb-1">Product</label>
                <select id="productId" name="productId" required value={formData.productId} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3">
                  <option value="" disabled>Select a product</option>
                  {products.map((product) => (<option key={product.id} value={product.id}>{product.name}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">Certificate Type</label>
                <input type="text" id="type" name="type" required value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3" placeholder="e.g., Certificate of Health"/>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Official Description / Attestation</label>
                  <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !formData.productId || !formData.type} className="flex items-center text-xs px-2 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      {isGenerating ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>) : (<Sparkles className="w-4 h-4 mr-1" />)}
                      Generate with AI
                  </button>
              </div>
              <textarea id="description" name="description" required value={formData.description} onChange={handleChange} rows={5} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3" placeholder="A formal description will be generated here..."/>
            </div>

             <div>
                <label htmlFor="validUntil" className="block text-sm font-semibold text-gray-700 mb-1">Valid Until</label>
                <input type="date" id="validUntil" name="validUntil" required value={formData.validUntil} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3"/>
             </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
               <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Cancel</button>
               <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center">
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {loading ? 'Issuing...' : 'Issue Certificate'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}