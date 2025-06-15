'use client';

import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';

// --- API Abstraction (replace with your actual API calls) ---
// This should be in a shared file, e.g., /lib/api.js
const api = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: async (userData: any) => {
    console.log("Creating user with data:", userData);
    // This is where you'd make the actual API call
    // const response = await fetch('/api/auth/register', { // Your backend has a register endpoint
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData),
    // });
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || 'Failed to create user');
    // }
    // return response.json();
    
    // For now, we simulate a successful API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...userData, id: Math.random().toString(36).substring(2, 9) };
  }
};
// --- End API Abstraction ---

const CreateUserPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SELLER', // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await api.createUser(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', password: '', role: 'SELLER' }); // Reset form
      // Optionally, redirect after a delay
      // setTimeout(() => window.location.href = '/dashboard/users', 2000);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
            <a href="/dashboard/users" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4">
                <ArrowLeft size={20} />
                Back to User List
            </a>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserPlus className="text-blue-600" size={32} />
                Create New User
            </h1>
            <p className="mt-2 text-gray-600">Fill in the details below to add a new user to the system.</p>
        </header>

        <main className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="e.g., Dr. Jane Doe"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="jane.doe@example.com"
                    />
                </div>
                 <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Enter a secure password"
                    />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                    >
                        <option value="SELLER">Seller</option>
                        <option value="VET">Vet</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                {error && <div className="p-3 text-sm text-red-800 bg-red-100 border-l-4 border-red-500 rounded-r-lg">{error}</div>}
                {success && <div className="p-3 text-sm text-green-800 bg-green-100 border-l-4 border-green-500 rounded-r-lg">User created successfully! You can create another or go back to the list.</div>}


                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? 'Creating User...' : 'Create User'}
                    </button>
                </div>
            </form>
        </main>
      </div>
    </div>
  );
};

export default CreateUserPage;
