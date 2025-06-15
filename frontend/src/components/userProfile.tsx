'use client'; // Mark this as a Client Component

import Image from 'next/image';
import { useState, useEffect } from 'react';
import UserProfileSkeleton from './userProfileSkeleton'; // Import the skeleton

// Define the shape of the User object
interface User {
  name: string;
  email: string;
  image?: string;
}

function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function will run once when the component mounts
    const fetchUser = async () => {
      try {
        // Fetch user data from the browser. The browser automatically sends cookies.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`
        );

       
        const result = await response.json();
        if (result.success && result.data) {
          setUser(result.data); // Set the user data in state
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null); // Ensure user is null on error
      } finally {
        setLoading(false); // Stop loading, whether successful or not
      }
    };

    fetchUser();
  }, []); // The empty dependency array [] means this effect runs only once

  // While loading, show the skeleton
  if (loading) {
    return <UserProfileSkeleton />;
  }

  // If loading is finished and there's no user, render nothing
  if (!user) {
    return null;
  }

  // If loading is finished and we have a user, show the profile
  return (
    <span className="flex w-full flex-row items-center">
      <Image
        className="mr-3 rounded-full"
        src={user.image || '/profile.svg'}
        alt="user profile picture"
        width={54}
        height={54}
      />
      <span className="flex flex-col">
        <h2 className="text-lg font-medium">{user.name}</h2>
        <p className="text-sm text-gray-400">{user.email}</p>
      </span>
    </span>
  );
}

export default UserProfile;