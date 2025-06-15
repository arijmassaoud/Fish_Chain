'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setSocket] = useState<Socket | null>(null);

  // Vérifie si l'utilisateur est connecté
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">You are not authorized to access this page</p>
      </div>
    );
  }

  // 🔄 Charger les notifications existantes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch notifications');
        const result = await response.json();
        setNotifications(result || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 🧠 Connexion WebSocket avec socket.io-client
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!user) return;

    const socketIo: Socket = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketIo.on('connect', () => {
      socketIo.emit('register-user', { userId: user.id });
    });

    socketIo.on('new-notification', (data) => {
      if (data?.type === 'new-notification') {
        setNotifications((prev) => [data.payload, ...prev]);
      }
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [user]);

  // ✅ Marquer une notification comme lue
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || 'Failed to update notification');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Liste des notifications */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul role="list" className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <li className="py-6 px-6 text-center text-gray-500">No notifications yet.</li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id} className={`py-6 px-6 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm ${notification.read ? 'text-gray-900' : 'font-medium text-gray-900'}`}>
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
