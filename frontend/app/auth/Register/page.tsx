"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { Mail, Lock, Phone, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', number: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post<any>('/api/auth/register/', formData);
      if (response.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, response.token);
        window.dispatchEvent(new Event('storage'));
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse">
        
        {/* Right Side: Visual / Branding */}
        <div className="md:w-5/12 relative overflow-hidden bg-gradient-to-bl from-rose-500 via-orange-400 to-indigo-600 p-10 flex flex-col justify-between text-white hidden md:flex">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl opacity-20 hidden md:block" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-2.5 px-3">
               <img src="/Eventdhara_logo.png" alt="Logo" className="h-full w-auto object-contain" />
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Begin Your Journey
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Create an account and unlock the premium directory of top-tier decorators, photographers, and caterers.
            </p>
          </div>

          <div className="relative z-10">
            <div className="inline-flex overflow-hidden rounded-full backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium">
              Join the future ✨
            </div>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="md:w-7/12 p-8 md:p-14 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
              <p className="text-gray-500">Sign up to EventDhara to book premium vendors effortlessly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all duration-200"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all duration-200"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="tel"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all duration-200"
                      placeholder="+91 99999 99999"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all duration-200"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-slate-200 transition-all duration-200 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create your account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href="/auth/Login" className="font-semibold text-slate-900 hover:text-rose-600 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
