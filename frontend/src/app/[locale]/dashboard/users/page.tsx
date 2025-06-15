/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Users, PlusCircle, Search, Trash2,  Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'VET' | 'SELLER' | 'BUYER';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, getAuthHeaders } = useAuth();
  const currentUserId = user?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch all users
  useEffect(() => {
    if (!currentUserId) {
      setError('You must be logged in');
      setLoading(false);
      return;
    }

    const fetchAllUsers = async () => {
      try {
        const headers = getAuthHeaders();

        const res = await fetch(`${API_URL}/api/users`, {
          method: 'GET',
          headers,
        });

        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

        const result = await res.json();

        let userList: User[] = [];

        if (Array.isArray(result)) {
          userList = result;
        } else if (result && Array.isArray(result.data)) {
          userList = result.data;
        } else {
          throw new Error('Unexpected user data format');
        }

        // Filter out current user
        const filtered = userList.filter((u) => u.id !== currentUserId);

        setUsers(filtered);
      } catch (err: any) {
        console.error('Error fetching users:', err.message);
        setError(err.message || 'Could not load users.');
        toast.error(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [currentUserId, API_URL, getAuthHeaders]);

  // Role Badge Component
  const RoleBadge = ({ role }: { role: User['role'] }) => {
    const badgeStyles = {
      ADMIN: 'bg-red-100 text-red-800',
      VET: 'bg-blue-100 text-blue-800',
      SELLER: 'bg-green-100 text-green-800',
      BUYER: 'bg-yellow-100 text-yellow-800',
    };
    const style = badgeStyles[role] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${style}`}>
        {role}
      </span>
    );
  };

  // Handle Delete
  
  const handleDelete = async (userIdToDelete: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
   const loadingToast = toast.loading('Deleting user...');
   try{
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userIdToDelete}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

      
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete user.');
        }
      setUsers((prev) => prev.filter((u) => u.id !== userIdToDelete));
      toast.success('User deleted successfully', { id: loadingToast });
    
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
  };

  

  // Handle Role Change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      const updatedUser = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? updatedUser : u))
      );

      toast.success('✅ Role updated');
    } catch (err: any) {
      toast.error(`❌ Failed to update role`);
    }
  };

  // Search filter
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Protect this page for admins only
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      setError('You are not authorized to view this page.');
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div>
          <h2 className="text-xl font-semibold text-red-700">Error</h2>
          <p className="mt-2">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 underline text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users size={32} className="text-blue-600" /> User Management
        </h1>
        <a
          href="/dashboard/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle size={20} /> Create User
        </a>
      </header>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {/* User List */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 border-t border-gray-200">
            <p className="text-gray-500">No other users found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((u) => (
              <li key={u.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                        alt={u.name}
                        fill
                        unoptimized
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{u.name}</h3>
                      <p className="text-sm text-gray-500">{u.email}</p>
                      <RoleBadge role={u.role} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BUYER">Buyer</option>
                      <option value="SELLER">Seller</option>
                      <option value="VET">Veterinarian</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}