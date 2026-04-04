'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, CheckCircle, Filter, ChevronDown, Award, Phone, MessageCircle, X } from 'lucide-react';
import { edImg } from '@/lib/edImages';

// ─── Mock Vendor Data ────────────────────────────────────
const VENDORS = [
  { id: 1, name: 'Ramesh Photography Studio', category: 'Photography', city: 'Indore', rating: 4.9, reviews: 312, services: 8, img: edImg('ring_ceremony', 0), verified: true, badge: 'Top Rated', priceFrom: 3499, description: 'Award-winning photography studio specializing in weddings, engagements, and corporate events.' },
  { id: 2, name: 'Shobha Decor Studio', category: 'Floral Decoration', city: 'Bhopal', rating: 4.8, reviews: 198, services: 12, img: edImg('anniversary', 0), verified: true, badge: null, priceFrom: 1999, description: 'Exquisite floral arrangements and decor setups for all occasions — from intimate gatherings to grand weddings.' },
  { id: 3, name: 'Beat Box DJ Services', category: 'DJ & Music', city: 'Ujjain', rating: 4.7, reviews: 143, services: 5, img: edImg('stage', 0), verified: true, badge: 'New', priceFrom: 2999, description: 'Professional DJ setups with high-quality sound systems and lighting for any event type.' },
  { id: 4, name: 'Balloon Art by Meera', category: 'Balloon Decoration', city: 'Indore', rating: 5.0, reviews: 87, services: 6, img: edImg('birthday', 0), verified: true, badge: 'Best Seller', priceFrom: 1499, description: 'Creative balloon decorations for birthdays, baby showers, and all celebrations. Whimsical & colorful setups.' },
  { id: 5, name: 'Glamour Bridal Makeup', category: 'Makeup & Styling', city: 'Gwalior', rating: 4.9, reviews: 221, services: 10, img: edImg('general', 0), verified: true, badge: 'Top Rated', priceFrom: 3999, description: 'Celebrity makeup artist with 8+ years of experience in bridal, party, and editorial makeup.' },
  { id: 6, name: 'Mehndi by Priya', category: 'Mehndi', city: 'Indore', rating: 4.8, reviews: 178, services: 4, img: edImg('mehndi', 0), verified: true, badge: null, priceFrom: 999, description: 'Traditional and contemporary mehndi designs for brides, bridesmaids, and guests.' },
  { id: 7, name: 'Cake Fantasies', category: 'Cake & Desserts', city: 'Jabalpur', rating: 4.7, reviews: 156, services: 15, img: edImg('birthday', 1), verified: true, badge: null, priceFrom: 799, description: 'Custom multi-tier cakes, dessert tables, and personalized sweet treats for every occasion.' },
  { id: 8, name: 'LightShow Events', category: 'Lighting', city: 'Bhopal', rating: 4.6, reviews: 89, services: 7, img: edImg('stage', 1), verified: false, badge: null, priceFrom: 2499, description: 'Professional stage and venue lighting with LED panels, spotlights, and atmospheric effects.' },
];

const CATEGORIES = ['All', 'Photography', 'Floral Decoration', 'DJ & Music', 'Balloon Decoration', 'Makeup & Styling', 'Mehndi', 'Cake & Desserts', 'Lighting', 'Videography'];
const CITIES = ['All Cities', 'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Rewa'];

export default function VendorsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('rating');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = VENDORS
    .filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
      const matchCity = selectedCity === 'All Cities' || v.city === selectedCity;
      const matchVerified = !verifiedOnly || v.verified;
      return matchSearch && matchCat && matchCity && matchVerified;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      if (sortBy === 'price_asc') return a.priceFrom - b.priceFrom;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-100 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Our Vendors</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Find Your Perfect Event Professional</h1>
          <p className="text-gray-500 mb-8">Browse 500+ verified vendors across 6 cities in Madhya Pradesh</p>

          {/* Search */}
          <div className="flex items-center max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-orange-400 focus-within:shadow-md transition-all">
            <Search className="ml-4 w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vendors by name or category..."
              className="flex-1 bg-transparent px-3 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="mr-4 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[80px] z-40">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center gap-3 flex-wrap">
          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* City */}
          <div className="relative shrink-0">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-orange-400 cursor-pointer"
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-orange-400 pointer-events-none" />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-orange-400 cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="price_asc">Lowest Price</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Verified Toggle */}
          <button
            onClick={() => setVerifiedOnly(v => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all shrink-0 ${verifiedOnly ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
          >
            <CheckCircle className="w-3.5 h-3.5" /> Verified Only
          </button>

          <span className="text-xs text-gray-500 shrink-0">{filtered.length} vendors</span>
        </div>
      </div>

      {/* ── Vendor Grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No vendors found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(vendor => (
              <div key={vendor.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  <Image src={vendor.img} alt={vendor.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {vendor.verified && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </div>
                  )}
                  {vendor.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        <Award className="w-3 h-3" /> {vendor.badge}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold text-white opacity-90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">{vendor.category}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-orange-600 transition-colors">{vendor.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-[11px] font-bold text-green-700">
                      {vendor.rating} <Star className="w-3 h-3 fill-green-600 text-green-600 ml-0.5" />
                    </div>
                    <span className="text-[11px] text-gray-400">({vendor.reviews} reviews)</span>
                    <span className="ml-auto text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-400" /> {vendor.city}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">{vendor.description}</p>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400">Starting from</p>
                      <p className="text-base font-black text-gray-900">₹{vendor.priceFrom.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-9 h-9 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all">
                        <Phone className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/shop?category=${encodeURIComponent(vendor.category)}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        View Services
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Register CTA ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center">
          <Award className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Are You a Vendor?</h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">Join 500+ professionals on EventDhara and start getting quality leads on WhatsApp.</p>
          <Link
            href="/become-a-vendor"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/30"
          >
            Become a Vendor → 
          </Link>
        </div>
      </div>
    </div>
  );
}
