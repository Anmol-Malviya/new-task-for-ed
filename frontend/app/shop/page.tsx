'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { edImg } from '@/lib/edImages';
import {
  Search, SlidersHorizontal, Star, ArrowRight, ChevronDown,
  X, Filter, LayoutGrid, LayoutList, Heart, ShoppingCart, Tag
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface ServiceItem {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge?: string;
  img: string;
  occasion?: string;
}

// ─── Fallback Data ───────────────────────────────────────
const ALL_SERVICES: ServiceItem[] = [
  { id: 1,  title: 'Premium Balloon Decoration',  category: 'Balloon Decoration', price: 2499,  originalPrice: 3499,  rating: 4.9, reviews: 312, badge: 'Best Seller', img: edImg('birthday', 0),      occasion: 'birthday' },
  { id: 2,  title: 'Birthday Cake + Decoration',  category: 'Cake & Desserts',    price: 1899,  originalPrice: 2499,  rating: 4.8, reviews: 198, badge: 'PRICE DROP',  img: edImg('birthday', 1),      occasion: 'birthday' },
  { id: 3,  title: 'Photography + Reels Package', category: 'Photography',        price: 4999,  originalPrice: 6500,  rating: 5.0, reviews: 87,                       img: edImg('ring_ceremony', 0), occasion: 'birthday' },
  { id: 4,  title: 'DJ Setup — 4 Hours',          category: 'DJ & Music',         price: 3499,  originalPrice: 4500,  rating: 4.7, reviews: 143,                      img: edImg('stage', 0),         occasion: 'birthday' },
  { id: 5,  title: 'Rose & Candle Decoration',    category: 'Floral Decoration',  price: 2999,  originalPrice: 3999,  rating: 4.9, reviews: 221, badge: 'Best Seller', img: edImg('anniversary', 0),   occasion: 'anniversary' },
  { id: 6,  title: 'Couple Photography Session',  category: 'Photography',        price: 5499,  originalPrice: 7000,  rating: 5.0, reviews: 104,                      img: edImg('ring_ceremony', 1), occasion: 'anniversary' },
  { id: 7,  title: 'Anniversary Cake — 2 kg',     category: 'Cake & Desserts',    price: 1299,  originalPrice: 1799,  rating: 4.8, reviews: 167,                      img: edImg('anniversary', 1),   occasion: 'anniversary' },
  { id: 8,  title: 'Full Makeup & Styling',        category: 'Makeup & Styling',   price: 3999,  originalPrice: 5500,  rating: 4.9, reviews: 89,                       img: edImg('general', 0),       occasion: 'anniversary' },
  { id: 9,  title: 'Complete Wedding Decoration', category: 'Floral Decoration',  price: 24999, originalPrice: 32000, rating: 4.9, reviews: 56,  badge: 'Best Seller', img: edImg('mandap', 0),        occasion: 'wedding' },
  { id: 10, title: 'Wedding Photography + Video', category: 'Videography',        price: 34999, originalPrice: 45000, rating: 5.0, reviews: 43,  badge: 'PRICE DROP',  img: edImg('wedding', 0),       occasion: 'wedding' },
  { id: 11, title: 'Mehndi Artist — Full Hands',  category: 'Mehndi',             price: 2499,  originalPrice: 3200,  rating: 4.8, reviews: 178,                      img: edImg('mehndi', 0),        occasion: 'wedding' },
  { id: 12, title: 'Bridal Makeup Premium',       category: 'Makeup & Styling',   price: 8999,  originalPrice: 12000, rating: 4.9, reviews: 62,                       img: edImg('general', 1),       occasion: 'wedding' },
  { id: 13, title: 'Baby Shower Balloon Decor',   category: 'Balloon Decoration', price: 2199,  originalPrice: 2999,  rating: 4.8, reviews: 134,                      img: edImg('baby_shower', 0),   occasion: 'baby_shower' },
  { id: 14, title: 'Cute Baby Theme Cake',        category: 'Cake & Desserts',    price: 1499,  originalPrice: 1999,  rating: 4.7, reviews: 98,                       img: edImg('baby_shower', 1),   occasion: 'baby_shower' },
  { id: 15, title: 'Baby Shower Photography',     category: 'Photography',        price: 3499,  originalPrice: 4500,  rating: 4.9, reviews: 67,                       img: edImg('baby_shower', 2),   occasion: 'baby_shower' },
  { id: 16, title: 'Floral Ring Ceremony Decor',  category: 'Floral Decoration',  price: 8999,  originalPrice: 12000, rating: 4.9, reviews: 87,  badge: 'Best Seller', img: edImg('ring_ceremony', 0), occasion: 'engagement' },
  { id: 17, title: 'Engagement Photography',      category: 'Photography',        price: 7999,  originalPrice: 10000, rating: 5.0, reviews: 63,                       img: edImg('ring_ceremony', 3), occasion: 'engagement' },
  { id: 18, title: 'Party Balloon & Prop Setup',  category: 'Balloon Decoration', price: 3499,  originalPrice: 4500,  rating: 4.9, reviews: 145,                      img: edImg('birthday', 3),      occasion: 'bachelorette' },
  { id: 19, title: 'DJ + Dance Floor Setup',      category: 'DJ & Music',         price: 6999,  originalPrice: 9000,  rating: 4.8, reviews: 54,                       img: edImg('stage', 1),         occasion: 'bachelorette' },
  { id: 20, title: 'Haldi Decoration Special',    category: 'Floral Decoration',  price: 4999,  originalPrice: 6500,  rating: 4.7, reviews: 89,                       img: edImg('haldi', 0),         occasion: 'bachelorette' },
];

const OCCASIONS = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'baby_shower', label: 'Baby Shower' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'bachelorette', label: 'Bachelorette' },
];

const CATEGORIES = [
  'Balloon Decoration', 'Floral Decoration', 'Photography', 'Videography',
  'Cake & Desserts', 'Makeup & Styling', 'DJ & Music', 'Mehndi', 'Lighting', 'Invitation Cards'
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

// ─── Service Card ────────────────────────────────────────
function ServiceCard({ s, wishlist, onWishlist }: { s: ServiceItem; wishlist: Set<number>; onWishlist: (id: number) => void }) {
  const discount = Math.round((1 - s.price / s.originalPrice) * 100);
  return (
    <div className="group relative flex flex-col rounded-[20px] overflow-hidden border border-gray-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
      <Link href={`/shop/${s.id}`} className="block">
        <div className="relative bg-gray-50 aspect-[4/3] overflow-hidden">
          <Image src={s.img} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-black tracking-wide px-2.5 py-1 rounded-full z-10 shadow-md">
              {discount}% OFF
            </span>
          )}
          {s.badge && (
            <span className={`absolute top-3 right-12 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full z-10 ${s.badge === 'PRICE DROP' ? 'bg-red-500 text-white' : 'bg-violet-600 text-white'}`}>
              {s.badge}
            </span>
          )}
        </div>
      </Link>
      {/* Wishlist Button */}
      <button
        onClick={() => onWishlist(s.id)}
        className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${wishlist.has(s.id) ? 'bg-rose-500 text-white' : 'bg-white text-gray-400 hover:text-rose-500'}`}
      >
        <Heart className="w-4 h-4" fill={wishlist.has(s.id) ? 'currentColor' : 'none'} />
      </button>

      <Link href={`/shop/${s.id}`} className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest mb-1">{s.category}</p>
        <h3 className="text-[14px] font-bold text-gray-800 leading-snug mb-3 line-clamp-2 group-hover:text-rose-600 transition-colors flex-1">{s.title}</h3>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center px-1.5 py-0.5 bg-green-50 rounded text-[11px] font-bold text-green-700">
            <span>{s.rating}</span>
            <Star className="w-3 h-3 ml-0.5 fill-green-600 text-green-600" />
          </div>
          <span className="text-[11px] text-gray-400 font-medium">({s.reviews})</span>
        </div>
        <div className="flex items-end gap-2 pt-2 border-t border-gray-50">
          <span className="text-lg font-black text-gray-900 tracking-tight">₹{s.price.toLocaleString('en-IN')}</span>
          <span className="text-[13px] text-gray-400 font-semibold line-through pb-0.5">₹{s.originalPrice.toLocaleString('en-IN')}</span>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white text-sm font-bold transition-all duration-200 group/btn">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Inner component using useSearchParams ───────────────
function ShopInner() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<ServiceItem[]>(ALL_SERVICES);
  const [filteredServices, setFilteredServices] = useState<ServiceItem[]>(ALL_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>(searchParams.get('occasion') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  // Try to load from backend
  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.get<any[]>('/api/services/');
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((s: any, i: number) => ({
            id: s.services_id || i + 1,
            title: s.name,
            category: s.category_name || '',
            price: s.price ?? 0,
            originalPrice: s.original_price ?? s.price ?? 0,
            rating: s.ratings ?? 4.5,
            reviews: s.review_count ?? 0,
            badge: s.badge || undefined,
            img: s.image_url || ALL_SERVICES[i % ALL_SERVICES.length].img,
            occasion: s.occasion || '',
          }));
          setServices(mapped);
        }
      } catch { /* use fallback */ }
    }
    loadServices();
  }, []);

  // Filter & sort
  useEffect(() => {
    let result = [...services];
    if (searchQuery) result = result.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedOccasion) result = result.filter(s => s.occasion === selectedOccasion);
    if (selectedCategory) result = result.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    result = result.filter(s => s.price >= priceRange[0] && s.price <= priceRange[1]);
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => b.reviews - a.reviews);
    setFilteredServices(result);
  }, [services, searchQuery, selectedOccasion, selectedCategory, sortBy, priceRange]);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedOccasion('');
    setSelectedCategory('');
    setSortBy('popular');
    setPriceRange([0, 50000]);
  };

  const hasFilters = searchQuery || selectedOccasion || selectedCategory || sortBy !== 'popular';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[80px] z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-3 flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all">
            <Search className="ml-3 w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services, categories..."
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mr-3 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl outline-none focus:border-orange-400 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${sidebarOpen ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-rose-500 rounded-full" />}
          </button>

          {/* View Mode */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-orange-500'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-orange-500'}`}>
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm text-gray-500 shrink-0">{filteredServices.length} results</span>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 shrink-0">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {/* Active Filters Chips */}
        {(selectedOccasion || selectedCategory) && (
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 pb-3 flex gap-2 flex-wrap">
            {selectedOccasion && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                {OCCASIONS.find(o => o.id === selectedOccasion)?.label}
                <button onClick={() => setSelectedOccasion('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedCategory && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-6 flex gap-6">
        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside className="w-64 shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-[160px] space-y-6">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Filters</h3>

              {/* Occasions */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Occasion</p>
                <div className="space-y-1">
                  {OCCASIONS.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOccasion(selectedOccasion === o.id ? '' : o.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedOccasion === o.id ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Category</p>
                <div className="space-y-1">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(selectedCategory === c ? '' : c)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === c ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Max Price</p>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={500}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500 font-medium mt-1">
                  <span>₹0</span>
                  <span className="text-orange-600 font-bold">₹{priceRange[1].toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={clearFilters} className="w-full py-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                Clear All Filters
              </button>
            </div>
          </aside>
        )}

        {/* ── Grid ── */}
        <div className="flex-1 min-w-0">
          {filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No services found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
              <button onClick={clearFilters} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredServices.map(s => (
                <ServiceCard key={s.id} s={s} wishlist={wishlist} onWishlist={toggleWishlist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────
export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <ShopInner />
    </Suspense>
  );
}
