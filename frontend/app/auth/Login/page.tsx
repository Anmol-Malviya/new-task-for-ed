"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, User, Store } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading: authLoading, login, vendorLogin } = useAuth();

  const [role, setRole] = useState<'user'>('user');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get('from') || '/profile';

  // If already logged in, redirect away
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [authLoading, isLoggedIn, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (role === 'user') {
        // Uses AuthContext login() → updates Navbar instantly
        await login(formData.email, formData.password);
      }
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Visual / Branding */}
        <div className={`md:w-5/12 relative overflow-hidden p-10 flex flex-col justify-between text-white hidden md:flex transition-all duration-500 bg-gradient-to-br from-indigo-600 via-rose-500 to-orange-400`}>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl opacity-20" />
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center p-2.5 px-4 border border-white/30">
               <span className="text-white font-bold text-xl tracking-tight">EventDhara</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Curate Your Perfect Event
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Login to access the finest vendors, exclusive packages, and start piecing together your dream occasion.
            </p>
          </div>

          <div className="relative z-10">
            <div className="inline-flex overflow-hidden rounded-full backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium">
              EventDhara 2.0 ✨
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 md:p-14 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-gray-500">Sign in to continue to EventDhara.</p>
            </div>

            {/* ── Role Toggle ── */}
            <div className="flex rounded-xl border border-gray-200 p-1 bg-gray-50 gap-1">
              <button
                type="button"
                onClick={() => { setRole('user'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  role === 'user'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => { router.push('/auth/VendorLogin'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-gray-500 hover:text-amber-600`}
              >
                <Store className="w-4 h-4" />
                Vendor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Username / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all duration-200"
                    placeholder="Username or Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all duration-200"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-medium py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 shadow-slate-200"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign in to your account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100 space-y-2">
                <p className="text-gray-500 mt-4">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/Register" className="font-semibold text-slate-900 hover:text-rose-600 transition-colors">
                    Create an account
                  </Link>
                </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
