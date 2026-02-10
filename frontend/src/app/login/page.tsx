// @ts-nocheck - React types are in Docker container
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginWithGoogle } = useAuth();
  
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Load Google Sign-In script
  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
    return () => { 
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  // Initialize Google button after script loads
  useEffect(() => {
    if (!googleLoaded || !googleClientId) return;

    const initGoogle = () => {
      // @ts-ignore
      if (window.google?.accounts?.id) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          auto_select: true,
        });
        // @ts-ignore
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { 
            theme: 'filled_blue',
            size: 'large',
            width: 360,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
        // Show One Tap prompt
        // @ts-ignore
        window.google.accounts.id.prompt();
      }
    };
    setTimeout(initGoogle, 100);
  }, [googleLoaded]);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const result = await loginWithGoogle(response.credential);
    
    if (result.success) {
      setMessage({ type: 'success', text: `Welcome, ${result.user?.name || 'there'}! Redirecting...` });
      setTimeout(() => router.push('/'), 800);
    } else {
      setMessage({ type: 'error', text: result.message || 'Google login failed' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Family Tree
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to manage your family tree
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 text-purple-600">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm font-medium">Signing you in...</span>
              </div>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="space-y-6">
            {googleClientId ? (
              <div className="flex flex-col items-center gap-4">
                <div id="google-signin-btn" className="w-full flex justify-center"></div>
                <p className="text-xs text-gray-400">
                  Sign in securely with your Google account
                </p>
              </div>
            ) : (
              <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="text-4xl mb-3">⚙️</div>
                <p className="text-yellow-700 text-sm font-medium">
                  Google Sign-In not configured yet
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in docker-compose.yml
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg">🌳</span>
                </div>
                <span className="text-xs text-gray-500">Family Tree</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg">📸</span>
                </div>
                <span className="text-xs text-gray-500">Photo Gallery</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg">📝</span>
                </div>
                <span className="text-xs text-gray-500">Bio Cards</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
