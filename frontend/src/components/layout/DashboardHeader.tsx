// src/components/layout/DashboardHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// import { useSocket } from '@/contexts/SocketContext'; // As requested, we will not use a new context

export default function DashboardHeader() {
  const { user,  } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
    const searchParams = useSearchParams();
  
    
    // This correctly gets ONLY the token value from the URL
    const token = searchParams.get('token');
  
  // Effect to fetch the initial count of unread notifications
  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    fetchUnreadCount();
  }, [token]);

  // Effect to listen for real-time notifications from your socket
  useEffect(() => {
    // --- IMPORTANT ---
    // You need to get your connected socket.io instance here.
    // Replace `YourSocketInstance` with your actual socket instance.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socket: any = null; // <<<<<<< TODO: REPLACE `null` WITH YOUR SOCKET INSTANCE

    if (!socket) {
      console.warn("Socket not available, real-time notifications are disabled.");
      return;
    }

    const handleNewNotification = () => {
      setNotificationCount(prevCount => prevCount + 1);
    };

    socket.on('new_notification', handleNewNotification);

    // Clean up the event listener
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, []); // Add your socket instance to the dependency array if it changes

  // When the user clicks the link, reset the count for a better UX
  const handleNotificationClick = () => {
    setNotificationCount(0);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-white dark:bg-gray-800 px-6">
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Notification Icon and Badge */}
        <Link
          href="/dashboard/notifications"
          onClick={handleNotificationClick}
          className="relative rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bell size={22} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {notificationCount}
            </span>
          )}
        </Link>
        
        {/* Optional: User Avatar */}
        <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || <User size={18} />}
            </div>
            <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-200">
                {user?.name}
            </span>
        </div>

      </div>
    </header>
  );
}