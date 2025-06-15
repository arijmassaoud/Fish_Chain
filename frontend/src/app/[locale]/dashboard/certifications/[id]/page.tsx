// file: frontend/src/app/dashboard/certifications/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Edit, Trash2, FileText,  } from 'lucide-react';

// Define the detailed shape of a single certificate
interface Certificate {
  id: string;
  type: string;
  description: string;
  validUntil: string;
  status: string;
  createdAt: string;
  product: { id: string; name: string };
  veterinarian: { id: string; name: string };
}

export default function CertificateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Get the certificate ID from the URL

  const { getAuthHeaders } = useAuth();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({ type: '', description: '', validUntil: '' });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Fetch the specific certificate data when the page loads
  const fetchCertificate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch certificate details.');
      const data = await response.json();
      setCertificate(data);
      // Pre-fill the form data for editing
      setFormData({
        type: data.type,
        description: data.description,
        validUntil: new Date(data.validUntil).toISOString().split('T')[0], // Format date for input
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeaders]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // AI Description Generation for the Edit Form
  const handleGenerateDescription = async () => {
    if (!certificate || !formData.type) {
        alert("Please ensure the certificate type is filled in.");
        return;
    }
    setIsGenerating(true);
    setError('');
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-certificate-text`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                productName: certificate.product.name,
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

  // Handle saving the updated certificate
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update certificate.');
      }
      // Refresh data and exit edit mode
      await fetchCertificate();
      setIsEditing(false);
      alert('Certificate updated successfully!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting the certificate
  const handleDelete = async () => {
      if (!confirm('Are you sure you want to permanently delete this certificate?')) return;
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${id}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete certificate.');
          alert('Certificate deleted successfully.');
          router.push('/dashboard/certifications');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
          setError(err.message);
      }
  }

  if (loading) return <div className="text-center py-20">Loading certificate...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!certificate) return <div className="text-center py-20">Certificate not found.</div>;


  // THE RENDER LOGIC
  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* --- EDIT MODE FORM --- */}
        {isEditing ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Editing Certificate</h1>
            <p className="mt-2 text-md text-gray-500">For Product: <span className="font-semibold">{certificate.product.name}</span></p>

            <form onSubmit={handleUpdate} className="mt-8 space-y-8">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">Certificate Type</label>
                <input type="text" id="type" name="type" required value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Official Description</label>
                    <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !formData.type} className="flex items-center text-xs px-2 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <Sparkles className="w-4 h-4 mr-1" />}
                        Regenerate with AI
                    </button>
                </div>
                <textarea id="description" name="description" required value={formData.description} onChange={handleChange} rows={6} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3" />
              </div>

              <div>
                <label htmlFor="validUntil" className="block text-sm font-semibold text-gray-700 mb-1">Valid Until</label>
                <input type="date" id="validUntil" name="validUntil" required value={formData.validUntil} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-3"/>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                 <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Cancel</button>
                 <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center">
                      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                      {loading ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
            </form>
          </div>
        ) : (
          // --- VIEW MODE DISPLAY ---
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
              <div className="flex justify-between items-start">
                  <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          certificate.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          certificate.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{certificate.status}</span>
                      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-4">{certificate.type}</h1>
                      <p className="mt-1 text-lg text-gray-600">For Product: <span className="font-semibold text-gray-800">{certificate.product.name}</span></p>
                  </div>
                  <div className="flex space-x-2">
                      <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"><Edit className="w-5 h-5"/></button>
                      <button onClick={handleDelete} className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                      <div>
                          <dt className="text-sm font-medium text-gray-500">Certificate ID</dt>
                          <dd className="mt-1 text-sm text-gray-900 font-mono">{certificate.id}</dd>
                      </div>
                      <div>
                          <dt className="text-sm font-medium text-gray-500">Issued By</dt>
                          <dd className="mt-1 text-sm text-gray-900">{certificate.veterinarian.name}</dd>
                      </div>
                       <div>
                          <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{new Date(certificate.createdAt).toLocaleDateString()}</dd>
                      </div>
                      <div>
                          <dt className="text-sm font-medium text-gray-500">Valid Until</dt>
                          <dd className="mt-1 text-sm text-gray-900">{new Date(certificate.validUntil).toLocaleDateString()}</dd>
                      </div>
                      <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500 flex items-center"><FileText className="w-4 h-4 mr-2"/>Official Description</dt>
                          <dd className="mt-2 text-base text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{certificate.description}</dd>
                      </div>
                  </dl>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}