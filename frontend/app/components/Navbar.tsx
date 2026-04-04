'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, ShoppingCart, User, ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CITIES = ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Rewa'];

const NAV_OCCASIONS = [
  { label: 'Birthday', href: '/shop?occasion=birthday' },
  { label: 'Anniversary', href: '/shop?occasion=anniversary' },
  { label: 'Wedding', href: '/shop?occasion=wedding' },
  { label: 'Baby Shower', href: '/shop?occasion=baby_shower' },
  { label: 'Engagement', href: '/shop?occasion=engagement' },
  { label: 'Bachelorette', href: '/shop?occasion=bachelorette' },
];

export default function Navbar() {
  const [city, setCity] = useState('Indore');
  const [cityOpen, setCityOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-sm transition-all duration-300">
      {/* ── Top bar ── */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 h-16 md:h-20 flex items-center gap-3 md:gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center transition-transform hover:scale-[1.02]">
          <Image 
            src="/Eventdhara_logo.png" 
            alt="EventDhara Logo" 
            width={1668} 
            height={394} 
            className="object-contain w-[160px] md:w-[210px] lg:w-[230px] h-auto"
            priority
          />
        </Link>

        {/* City Picker */}
        <div className="relative shrink-0 hidden sm:block">
          <button
            onClick={() => setCityOpen(o => !o)}
            className="flex items-center gap-1 text-sm font-medium text-slate-200 hover:text-orange-400 transition-colors"
          >
            <MapPin className="w-4 h-4 text-orange-400" />
            {city}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
          </button>

          {cityOpen && (
            <div className="absolute top-full left-0 mt-3 w-48 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 py-2 z-50 overflow-hidden transform origin-top-left transition-all">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setCityOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 text-sm hover:bg-slate-700 transition-colors flex items-center justify-between ${c === city ? 'text-orange-400 font-bold bg-slate-700/50' : 'text-slate-300 font-medium'}`}
                >
                  {c}
                  {c === city && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-1 md:mx-4 hidden sm:block">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full overflow-hidden focus-within:bg-slate-900 focus-within:border-orange-500 focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] transition-all duration-300">
            <Search className="ml-4 w-4.5 h-4.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search for services, vendors, occasions..."
              className="flex-1 bg-transparent px-3 py-2.5 md:py-3 text-[14px] text-slate-100 placeholder-slate-400 outline-none"
            />
            <button className="px-6 py-2.5 md:py-3 bg-orange-500 text-white text-[14px] font-bold hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-sm">
              Search
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 md:gap-3 ml-auto shrink-0">
          {isLoggedIn ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-orange-400 transition-colors px-3 py-2 rounded-full hover:bg-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                Hi, {user?.name?.split(' ')[0]} 👋
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-rose-400 transition-colors px-3 py-2 rounded-full hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/Login"
              className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-slate-200 hover:text-orange-400 transition-colors px-4 py-2 rounded-full hover:bg-slate-800"
            >
              <User className="w-4 h-4" /> Login
            </Link>
          )}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm font-bold text-slate-200 hover:text-orange-400 transition-colors px-3 md:px-5 py-2.5 rounded-full hover:bg-slate-800"
          >
            <ShoppingCart className="w-5 h-5 md:w-4.5 md:h-4.5" />
            <span className="hidden md:inline">Cart</span>
            <span className="absolute max-md:top-1 max-md:right-1 md:top-1.5 md:right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">0</span>
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="sm:hidden p-2 text-slate-300 hover:text-orange-400 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Occasions Nav Bar ── */}
      <div className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
          <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {NAV_OCCASIONS.map(o => (
              <Link
                key={o.label}
                href={o.href}
                className="shrink-0 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-orange-400 hover:bg-slate-800 rounded-md transition-all whitespace-nowrap"
              >
                {o.label}
              </Link>
            ))}
            <Link href="/shop" className="shrink-0 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-md transition-all whitespace-nowrap ml-auto">
              Browse All →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="text-sm font-medium text-slate-200 bg-transparent outline-none"
            >
              {CITIES.map(c => <option className="text-gray-900" key={c}>{c}</option>)}
            </select>
          </div>
          <Link href="/auth/Login" className="flex items-center gap-2 text-sm font-semibold text-slate-200 py-2" onClick={() => setMobileOpen(false)}>
            <User className="w-4 h-4" /> Login / Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}