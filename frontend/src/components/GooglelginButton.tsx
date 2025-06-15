// components/GoogleLoginButton.tsx
'use client';
import { useEffect } from 'react';

interface GoogleWindow extends Window {
  google?: any;
}

declare const window: GoogleWindow;

export default function GoogleLoginButton() {
  const handleCredentialResponse = async (response: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save JWT token
      localStorage.setItem('token', data.token);

      // Redirect or update auth context
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Google login error:', err.message);
      alert('Google login failed: ' + err.message);
    }
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      if (typeof window.google === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client'; 
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderGoogleButton();
        };
        script.onerror = () => {
          console.error('Failed to load Google script.');
          alert('Failed to load Google login. Please try again later.');
        };
        document.body.appendChild(script);
      } else {
        renderGoogleButton();
      }
    };

    const renderGoogleButton = () => {
      if (typeof window.google !== 'undefined') {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const buttonContainer = document.getElementById('google-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      }
    };

    loadGoogleScript();
  }, []);

  return <div id="google-button"></div>;
}