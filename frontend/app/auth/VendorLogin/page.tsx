"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { Phone, ArrowRight, Loader2, KeyRound } from 'lucide-react';

export default function VendorLogin() {
  const router = useRouter();
  
  // State 1: Entering phone number
  const [phoneNumber, setPhoneNumber] = useState('');
  // State 2: Entering OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post<any>('/api/auth/vendor-otp/request/', { phone: phoneNumber });
      setOtpSent(true);
      if (response.dev_otp) {
        console.log(`\n\n%c[SECURITY DEV] Vendor OTP Code: ${response.dev_otp}\n\n`, "color: #10b981; font-weight: bold; font-size: 16px; background: #064e3b; padding: 10px; border-radius: 8px;");
      }
      setSuccess(response.message || 'OTP sent to your WhatsApp!');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post<any>('/api/auth/vendor-otp/verify/', { 
        phone: phoneNumber, 
        otp: otpCode 
      });
      
      if (response.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, response.token);
        window.dispatchEvent(new Event('storage'));
        setSuccess('Login successful! Welcome back.');
        setTimeout(() => {
          router.push('/vendor-dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP.');
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
              Welcome Back Partner
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Login to view new verified leads, update your calendar, and manage successful bookings.
            </p>
          </div>

          <div className="relative z-10">
            <div className="inline-flex overflow-hidden rounded-full backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium">
              Vendor Dashboard 🚀
            </div>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="md:w-7/12 p-8 md:p-10 lg:p-14 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Login</h2>
              <p className="text-gray-500">Access your EventDhara vendor dashboard.</p>
            </div>

            {!otpSent ? (
              // STEP 1: PHONE NUMBER FOR OTP
              <form onSubmit={handleRequestOtp} className="space-y-5">
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

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">WhatsApp Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-sm"
                      placeholder="+91 99999 99999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-400 ml-1 mt-1">We will send a 4-digit code to verify.</p>
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
                      Send Secure OTP
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // STEP 2: VERIFY OTP
              <form onSubmit={handleVerifyOtp} className="space-y-5">
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

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Enter the 4-digit OTP sent to {phoneNumber}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-center tracking-[1em] font-bold text-lg"
                      placeholder="••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                        setOtpSent(false); 
                        setOtpCode(''); 
                        setSuccess(''); 
                        setError('');
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700 ml-1 mt-1 font-semibold"
                  >
                    Change phone number
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 4}
                  className="w-full mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-green-200 transition-all duration-200 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify and Secure Login
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-gray-500 mt-4 text-sm">
                Make your brand big with Eventdhara.{' '}
                <Link href="/auth/VendorRegister" className="font-semibold text-slate-900 hover:text-amber-600 transition-colors">
                  Register as a vendor
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
