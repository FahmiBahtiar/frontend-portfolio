'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Lock, AlertCircle, X } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/admin' });
  };

  // Force dark theme for login page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0f172a';
    return () => {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
    };
  }, []);

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'Your Google account is not authorized to access this admin panel. Please contact the administrator to request access.',
        };
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'There was a problem with the authentication configuration. Please contact the administrator.',
        };
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during sign in. Please try again.',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4"
          >
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-200 font-medium mb-1">
                    {getErrorMessage().title}
                  </p>
                  <p className="text-xs text-red-200/70">
                    {getErrorMessage().message}
                  </p>
                </div>
                <button
                  onClick={() => setShowError(false)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 mb-4 border border-cyan-500/20">
              <Plane className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-white/60">
              Sign in with your authorized Google account
            </p>
          </div>

          {/* Sign In Button */}
          <motion.button
            onClick={handleGoogleSignIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-lg group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </motion.button>

          {/* Security Notice */}
          <div className="mt-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-200/90 font-medium mb-1">
                  Authorized Access Only
                </p>
                <p className="text-xs text-orange-200/60">
                  Only pre-authorized Google accounts can access this admin panel. 
                  Contact the administrator if you need access.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          Protected by Google OAuth 2.0
        </p>
      </motion.div>
    </div>
  );
}
