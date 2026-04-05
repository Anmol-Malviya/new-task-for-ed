"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { Mail, Lock, Phone, User, ArrowRight, Loader2, Building, Briefcase } from 'lucide-react';

export default function VendorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', 
    company_name: '',
    email: '', 
    number: '', 
    type: 'Photographer', // Default
    password: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const vendorTypes = [
    "Photographer", "Decorator", "Caterer", "Venue Provider", 
    "Makeup Artist", "DJ / Musician", "Event Planner"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post<any>('/api/auth/vendor-register/', formData);
      if (response.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, response.token);
        window.dispatchEvent(new Event('storage'));
        setSuccess(response.message || 'Registration successful!');
        setTimeout(() => {
          router.push('/vendor/dashboard'); // Or homepage
        }, 2000);
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
        <div className="md:w-5/12 relative overflow-hidden bg-gradient-to-tr from-amber-500 via-orange-400 to-rose-600 p-10 flex flex-col justify-between text-white hidden md:flex">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl opacity-20 hidden md:block" />
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center p-2.5 px-4 border border-white/30">
               <span className="text-white font-bold text-xl tracking-tight">EventDhara</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Grow Your Business
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Join India's fastest-growing events marketplace. Partner with EventDhara as a premium vendor and get discovered by thousands of clients.
            </p>
          </div>

          <div className="relative z-10">
            <div className="inline-flex overflow-hidden rounded-full backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium">
              Vendor Portal 🚀
            </div>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="md:w-7/12 p-8 md:p-10 lg:p-14 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Partner with Us</h2>
              <p className="text-gray-500">Apply to become an EventDhara verified vendor.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Building className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-sm"
                      placeholder="e.g. Pixel Perfect"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Your Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-sm"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Service Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-sm appearance-none"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {vendorTypes.map(vt => (
                        <option key={vt} value={vt}>{vt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-sm"
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-sm"
                    placeholder="+91 99999 99999"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-amber-200 transition-all duration-200 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-gray-500 mt-4 text-sm">
                Already a vendor?{' '}
                <Link href="/auth/VendorLogin" className="font-semibold text-slate-900 hover:text-amber-600 transition-colors">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}