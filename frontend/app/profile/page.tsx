'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User, ShoppingBag, Heart, MessageSquare, Star, Settings,
  MapPin, Phone, Mail, Edit3, Camera, Bell, Shield, LogOut,
  ChevronRight, Package, Clock, CheckCircle, XCircle, AlertCircle,
  Wallet, Gift, TrendingUp, Calendar, FileText, Headphones,
  LayoutDashboard, Home, ChevronDown, BadgeCheck, Gavel
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  service_name: string;
  vendor_name: string;
  total_price: number;
  paid_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  service_date: string;
  timestamp: string;
  location: string;
  payment_type: string;
}

interface WishlistItem {
  id: string;
  service_name: string;
  vendor_name: string;
  base_price: number;
  category: string;
  rating: number;
  image_url: string;
}

interface Query {
  id: string;
  service_name: string;
  location: string;
  service_date: string;
  approx_budget: number;
  is_urgent: boolean;
  is_accepted: boolean;
  timestamp: string;
}

interface Review {
  id: string;
  service_name: string;
  vendor_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  has_image: boolean;
}

interface Address {
  id: string;
  address: string;
  city: string;
  country: string;
  location_id: string;
  is_default?: boolean;
}

// ─── Mock Data (replace with real API calls) ──────────────────────────────────

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', service_name: 'Balloon Decoration', vendor_name: 'Dream Decors', total_price: 8500, paid_price: 4250, status: 'confirmed', service_date: '2026-04-15', timestamp: '2026-03-28', location: 'Indore', payment_type: 'partial' },
  { id: 'ORD-002', service_name: 'Birthday Photography', vendor_name: 'PixelPerfect Studio', total_price: 12000, paid_price: 12000, status: 'completed', service_date: '2026-03-20', timestamp: '2026-03-10', location: 'Indore', payment_type: 'full' },
  { id: 'ORD-003', service_name: 'DJ & Music', vendor_name: 'Beats by Ravi', total_price: 6000, paid_price: 0, status: 'pending', service_date: '2026-05-02', timestamp: '2026-03-30', location: 'Bhopal', payment_type: 'pending' },
  { id: 'ORD-004', service_name: 'Floral Decoration', vendor_name: 'Nature\'s Touch', total_price: 15000, paid_price: 15000, status: 'cancelled', service_date: '2026-03-01', timestamp: '2026-02-20', location: 'Indore', payment_type: 'full' },
];

const MOCK_WISHLIST: WishlistItem[] = [
  { id: 'W1', service_name: 'Mehndi Artist - Bridal', vendor_name: 'Henna Queens', base_price: 5000, category: 'Mehndi', rating: 4.8, image_url: '' },
  { id: 'W2', service_name: 'Wedding Videography', vendor_name: 'CinematicMoments', base_price: 25000, category: 'Videography', rating: 4.9, image_url: '' },
  { id: 'W3', service_name: 'Makeup & Styling', vendor_name: 'Glam Studio', base_price: 8000, category: 'Makeup', rating: 4.7, image_url: '' },
];

const MOCK_QUERIES: Query[] = [
  { id: 'Q-001', service_name: 'Catering Service', location: 'Indore', service_date: '2026-04-20', approx_budget: 50000, is_urgent: false, is_accepted: true, timestamp: '2026-03-25' },
  { id: 'Q-002', service_name: 'Tent & Lighting', location: 'Bhopal', service_date: '2026-05-10', approx_budget: 30000, is_urgent: true, is_accepted: false, timestamp: '2026-03-29' },
];

const MOCK_REVIEWS: Review[] = [
  { id: 'R1', service_name: 'Birthday Photography', vendor_name: 'PixelPerfect Studio', rating: 5, review_text: 'Absolutely phenomenal work! The photos captured every precious moment perfectly.', created_at: '2026-03-21', has_image: true },
  { id: 'R2', service_name: 'Balloon Decoration (Previous)', vendor_name: 'Happy Balloons', rating: 4, review_text: 'Good quality work, very professional team and on-time delivery.', created_at: '2026-02-15', has_image: false },
];

const MOCK_ADDRESSES: Address[] = [
  { id: 'A1', address: '42, Vijay Nagar, Scheme 54', city: 'Indore', country: 'India', location_id: 'loc_1', is_default: true },
  { id: 'A2', address: '15, Tulsi Nagar', city: 'Bhopal', country: 'India', location_id: 'loc_2' },
];

// ─── Helper Components ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const config = {
    pending:   { label: 'Pending',   icon: Clock,         cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    confirmed: { label: 'Confirmed', icon: CheckCircle,   cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    completed: { label: 'Completed', icon: CheckCircle,   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    cancelled: { label: 'Cancelled', icon: XCircle,       cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.cls}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${sz} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) => (
  <div className="relative overflow-hidden bg-white shadow-sm border border-gray-200 rounded-2xl p-5 backdrop-blur-sm group hover:border-gray-200 transition-all duration-300">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${color} blur-2xl`} />
    <div className="relative">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-gray-900" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  </div>
);

// ─── Section Components ────────────────────────────────────────────────────────

function OverviewSection({ user, queryCount, wishlistCount }: { user: { name: string; email: string; number?: string; address?: string } | null, queryCount: number, wishlistCount: number }) {
  const stats = [
    { icon: ShoppingBag, label: 'Total Orders', value: MOCK_ORDERS.length, color: 'from-orange-500/20 to-orange-600/20' },
    { icon: Heart, label: 'Wishlist Items', value: wishlistCount, color: 'from-rose-500/20 to-rose-600/20' },
    { icon: Star, label: 'Reviews Given', value: MOCK_REVIEWS.length, color: 'from-amber-500/20 to-amber-600/20' },
    { icon: MessageSquare, label: 'Active Queries', value: queryCount, color: 'from-blue-500/20 to-blue-600/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-rose-500 p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl md:text-4xl font-bold text-white border border-white/30 shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-orange-100 text-sm font-medium mb-1">Welcome back 👋</p>
            <h2 className="text-2xl md:text-3xl md:text-4xl font-bold text-white truncate">{user?.name ?? 'Guest User'}</h2>
            <p className="text-orange-200 text-sm mt-0.5 truncate">{user?.email}</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/30">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified User
            </span>
            <span className="text-orange-100 text-xs">Member since 2025</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-400" /> Recent Orders
          </h3>
          <button className="text-xs text-orange-400 font-semibold hover:text-orange-300 transition-colors">View All →</button>
        </div>
        <div className="divide-y divide-gray-100">
          {MOCK_ORDERS.slice(0, 3).map(order => (
            <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-100 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{order.service_name}</p>
                <p className="text-gray-500 text-xs">{order.vendor_name} · {order.service_date}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StatusBadge status={order.status} />
                <span className="text-gray-900 font-bold text-sm">₹{order.total_price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: Gavel, label: 'My Queries', desc: 'View active queries', color: 'text-blue-400', href: '#queries' },
          { icon: Heart, label: 'Wishlist', desc: 'Saved services', color: 'text-rose-400', href: '#wishlist' },
          { icon: Star, label: 'My Reviews', desc: 'Manage your reviews', color: 'text-amber-400', href: '#reviews' },
        ].map(action => (
          <button
            key={action.label}
            className="flex items-center gap-3 p-4 bg-white shadow-sm border border-gray-200 rounded-2xl hover:border-gray-200 hover:bg-gray-100 transition-all duration-200 group text-left"
          >
            <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
              <p className="text-gray-500 text-xs">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function OrdersSection() {
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const filtered = filter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-400" /> My Orders
        </h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
              filter === f
                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                : 'bg-white shadow-sm text-gray-500 border-gray-200 hover:text-gray-900 hover:border-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No orders found</p>
          </div>
        )}
        {filtered.map(order => (
          <div key={order.id} className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-gray-200 transition-all duration-300">
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-xs font-mono text-gray-500">{order.id}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.status} />
              </div>
            </div>
            {/* Card Body */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{order.service_name}</h3>
                  <p className="text-gray-500 text-sm">{order.vendor_name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{order.service_date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{order.location}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-gray-900">₹{order.total_price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Paid:</span>
                    <span className={`font-semibold ${order.paid_price === order.total_price ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ₹{order.paid_price.toLocaleString()}
                    </span>
                  </div>
                  {/* Payment Progress */}
                  {order.paid_price < order.total_price && order.status !== 'cancelled' && (
                    <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all"
                        style={{ width: `${(order.paid_price / order.total_price) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {order.status === 'completed' && (
                    <button className="px-4 py-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold hover:bg-amber-500/25 transition-colors">
                      Write Review
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button className="px-4 py-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-500/25 transition-colors">
                      Pay Now
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishlistSection({ items, onRemove }: { items: WishlistItem[], onRemove: (id: string) => void }) {

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Heart className="w-5 h-5 text-rose-400" /> Wishlist
        <span className="text-sm font-normal text-gray-500 ml-1">({items.length} items)</span>
      </h2>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Your wishlist is empty</p>
          <Link href="/shop" className="text-orange-400 text-sm mt-1 inline-block hover:underline">Browse Services →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-200 transition-all duration-300 group">
            {/* Image Placeholder */}
            <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Gift className="w-12 h-12 text-gray-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-gray-900">{item.rating}</span>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 bg-orange-500/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-0.5">{item.service_name}</h3>
              <p className="text-gray-500 text-sm mb-3">{item.vendor_name}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-orange-400">₹{item.base_price.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/services/${item.id}`}
                    className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueriesSection({ queries, loading }: { queries: Query[], loading: boolean }) {

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-400" /> My Inquiries (Quotes)
      </h2>
      
      {loading ? (
        <div className="py-20 text-center text-gray-500 font-semibold animate-pulse">
          Loading your inquiries...
        </div>
      ) : queries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">You haven't requested any quotes yet</p>
          <Link href="/shop" className="text-orange-400 text-sm mt-1 inline-block hover:underline">Browse Services →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {queries.map((q: Query) => (
            <div key={q.id} className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 hover:border-gray-200 transition-all duration-300">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{q.service_name}</h3>
                    {q.is_urgent && (
                      <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">🔥 Urgent</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">Query ID: {q.id} • Posted: {q.timestamp}</p>
                </div>
                <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  q.is_accepted
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {q.is_accepted ? '✓ Accepted' : '⏳ Awaiting Vendor'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: MapPin, label: 'Location', value: q.location },
                  { icon: Calendar, label: 'Service Date', value: q.service_date },
                  { icon: Wallet, label: 'Est Budget', value: q.approx_budget > 0 ? `₹${q.approx_budget.toLocaleString()}` : 'Negotiable' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-100 rounded-xl px-3 py-2">
                    <p className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                      <item.icon className="w-3 h-3" /> {item.label}
                    </p>
                    <p className="text-gray-900 text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button className="flex-1 py-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-semibold hover:bg-blue-500/25 transition-colors">
                  View Chat
                </button>
                <button className="flex-1 py-2 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Cancel Query
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsSection() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400" /> My Reviews
      </h2>
      <div className="space-y-4">
        {MOCK_REVIEWS.map(r => (
          <div key={r.id} className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 hover:border-gray-200 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{r.service_name}</h3>
                <p className="text-gray-500 text-sm">{r.vendor_name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StarRating rating={r.rating} size="md" />
                <span className="text-gray-400 text-xs">{r.created_at}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-100 rounded-xl px-4 py-3">
              "{r.review_text}"
            </p>
            {r.has_image && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> Photo review
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <button className="px-4 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button className="px-4 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold hover:bg-rose-500/20 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressesSection() {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" /> Saved Addresses
        </h2>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors">
          + Add New
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map(addr => (
          <div key={addr.id} className={`bg-white shadow-sm border rounded-2xl p-5 transition-all duration-300 hover:border-gray-200 ${addr.is_default ? 'border-orange-500/40 bg-orange-500/5' : 'border-gray-200'}`}>
            {addr.is_default && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full mb-3 border border-orange-500/30">
                ✓ Default
              </span>
            )}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">{addr.address}</p>
                <p className="text-gray-500 text-sm">{addr.city}, {addr.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              {!addr.is_default && (
                <button
                  onClick={() => setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === addr.id })))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors"
                >
                  Set Default
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold hover:bg-rose-500/20 transition-colors ml-auto">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditProfileSection({ user }: { user: { name: string; email: string; number?: string; address?: string } | null }) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    number: user?.number ?? '',
    address: user?.address ?? '',
    city: 'Indore',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/auth/profile/', form);
      // Wait to simulate UX feeling before confirming
      await new Promise(r => setTimeout(r, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Let's force a reload to get fresh data in context
      window.location.reload();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-400" /> Edit Profile
      </h2>

      {/* Avatar */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-3xl font-bold text-white">
              {form.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-slate-700 border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Upload a profile picture</p>
            <p className="text-gray-400 text-xs">JPG, PNG or GIF. Max 5MB.</p>
            <button className="mt-2 px-4 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors">
              Choose File
            </button>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Your full name' },
            { key: 'number', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '+91 XXXXX XXXXX' },
            { key: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'your@email.com' },
            { key: 'city', label: 'City', icon: MapPin, type: 'text', placeholder: 'Your city' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                {field.label}
              </label>
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-500/60 focus-within:bg-gray-100 transition-all">
                <field.icon className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder-slate-500"
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Address</label>
          <textarea
            value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            placeholder="Enter your address..."
            rows={3}
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none placeholder-slate-500 focus:border-orange-500/60 focus:bg-gray-100 transition-all resize-none"
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-blue-400" /> Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['New Password', 'Confirm Password'].map(label => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none placeholder-slate-500 focus:border-orange-500/60 focus:bg-gray-100 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-purple-400" /> Notifications
        </h3>
        {[
          { label: 'Order Updates', desc: 'Get notified about your order status', default: true },
          { label: 'New Offers', desc: 'Receive promotional deals and discounts', default: true },
          { label: 'Query Replies', desc: 'Alerts when vendors respond to your queries', default: true },
          { label: 'WhatsApp Alerts', desc: 'Receive alerts via WhatsApp', default: false },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
            <div>
              <p className="text-gray-900 text-sm font-medium">{item.label}</p>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </div>
            <button
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${item.default ? 'bg-orange-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${item.default ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 md:flex-none md:px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" />Saved!</>
          ) : (
            'Save Changes'
          )}
        </button>
        <button className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Headphones className="w-5 h-5 text-teal-400" /> Help & Support
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our support team in real time.', action: 'Chat Now', color: 'from-blue-500/20 to-blue-600/20', btnColor: 'bg-blue-500 hover:bg-blue-600' },
          { icon: Phone, title: 'Call Us', desc: 'Speak directly with our customer care.', action: 'Call Now', color: 'from-emerald-500/20 to-emerald-600/20', btnColor: 'bg-emerald-500 hover:bg-emerald-600' },
          { icon: Mail, title: 'Email Support', desc: 'Send us your query, we\'ll respond within 24h.', action: 'Send Email', color: 'from-purple-500/20 to-purple-600/20', btnColor: 'bg-purple-500 hover:bg-purple-600' },
          { icon: FileText, title: 'Report Issue', desc: 'Report a vendor or service issue.', action: 'File Report', color: 'from-rose-500/20 to-rose-600/20', btnColor: 'bg-rose-500 hover:bg-rose-600' },
        ].map(item => (
          <div key={item.title} className={`bg-gradient-to-br ${item.color} border border-gray-200 rounded-2xl p-5 hover:border-gray-200 transition-all duration-300`}>
            <item.icon className="w-8 h-8 text-orange-500 mb-3 opacity-80" />
            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-gray-500 text-sm mb-4">{item.desc}</p>
            <button className={`px-5 py-2 ${item.btnColor} text-white text-sm font-bold rounded-xl transition-colors`}>
              {item.action}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { q: 'How do I cancel an order?', a: 'Go to My Orders, select the order and click "Cancel". Cancellations are allowed up to 24 hours before the service date.' },
            { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days to your original payment method.' },
            { q: 'Can I reschedule my booking?', a: 'Yes, contact the vendor via chat to reschedule. Changes must be made 48 hours prior.' },
            { q: 'How does the bidding system work?', a: 'Submit a request with your requirements and budget. Vendors will place bids and you choose the best one.' },
          ].map((item, i) => (
            <details key={i} className="group px-5 py-4 cursor-pointer">
              <summary className="flex items-center justify-between text-gray-900 font-medium text-sm list-none">
                {item.q}
                <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Nav Items ─────────────────────────────────────────────────────────────────

type Section = 'overview' | 'orders' | 'wishlist' | 'queries' | 'reviews' | 'addresses' | 'edit' | 'support';

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global counts and arrays for real DB items
  const [queries, setQueries] = useState<Query[]>([]);
  const [queriesLoading, setQueriesLoading] = useState(true);

  // Sync wishlist mock across reloads
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(MOCK_WISHLIST);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mockWishlist');
      if (saved) {
        setWishlistItems(JSON.parse(saved));
      } else {
        localStorage.setItem('mockWishlist', JSON.stringify(MOCK_WISHLIST));
      }
    }
  }, []);

  const handleRemoveWishlist = (id: string) => {
    const newItems = wishlistItems.filter(i => i.id !== id);
    setWishlistItems(newItems);
    localStorage.setItem('mockWishlist', JSON.stringify(newItems));
  };

  useEffect(() => {
    if (isLoggedIn) {
      const endpoint = user?.role === 'vendor' ? '/api/queries/vendor/' : '/api/queries/my/';
      
      api.get<any[]>(endpoint)
        .then(data => {
          const mapped = data.map(q => ({
            id: `Q-${q.query_id}`,
            service_name: q.service_name || 'Custom Service Request',
            location: q.location || 'Not specified',
            service_date: q.service_date ? new Date(q.service_date).toLocaleDateString() : 'Not specified',
            approx_budget: q.approx_budget || 0,
            is_urgent: q.is_urgent,
            is_accepted: q.is_accepted,
            timestamp: q.time_stamp ? new Date(q.time_stamp).toLocaleDateString() : '',
          }));
          setQueries(mapped);
        })
        .catch(err => {
          // Log without throwing Error object to avoid Next.js overlay
          console.warn('Failed to load queries:', err?.message || 'Unknown error');
        })
        .finally(() => setQueriesLoading(false));
    }
  }, [isLoggedIn, user?.role]);

  // Dynamic NAV Items
  const navItems = [
    { id: 'overview' as Section,   label: 'Overview',    icon: LayoutDashboard },
    { id: 'orders' as Section,     label: 'My Orders',   icon: ShoppingBag,    badge: MOCK_ORDERS.length },
    { id: 'wishlist' as Section,   label: 'Wishlist',    icon: Heart,          badge: wishlistItems.length },
    { id: 'queries' as Section,    label: 'My Queries',  icon: MessageSquare,  badge: queries.length },
    { id: 'reviews' as Section,    label: 'Reviews',     icon: Star },
    { id: 'addresses' as Section,  label: 'Addresses',   icon: MapPin },
    { id: 'edit' as Section,       label: 'Edit Profile',icon: Settings },
    { id: 'support' as Section,    label: 'Support',     icon: Headphones },
  ];

  // Redirect if not logged in (can enhance with useRouter)
  if (!isLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-500 mb-6">You need to be logged in to view your profile.</p>
          <Link href="/auth/Login?from=/profile" className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
            Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const activeNav = navItems.find(n => n.id === activeSection)!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.04),transparent_50%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 xl:px-8 py-6 md:py-10">
        <div className="flex gap-6 md:gap-8 relative">

          {/* ── Sidebar ── */}
          <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} md:relative md:flex md:inset-auto md:z-auto`}>
            {/* Mobile backdrop */}
            {sidebarOpen && (
              <div className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="relative w-72 md:w-64 xl:w-72 shrink-0">
              <div className="sticky top-24 bg-white/90 border border-gray-200 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                {/* User card */}
                <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-orange-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-md">
                      {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user?.name ?? 'User'}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Nav */}
                <nav className="p-3 space-y-1">
                  {navItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-orange-500/15 text-orange-400 shadow-inner'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm'
                      }`}
                    >
                      <item.icon className={`w-4.5 h-4.5 shrink-0 ${activeSection === item.id ? 'text-orange-400' : ''}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">
            {/* Mobile header */}
            <div className="flex items-center gap-3 mb-5 md:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600"
              >
                <activeNav.icon className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-gray-900 text-lg">{activeNav.label}</h1>
            </div>

            {/* Section Render */}
            <div className="animate-fadeIn">
              {activeSection === 'overview'   && <OverviewSection user={user} queryCount={queries.length} wishlistCount={wishlistItems.length} />}
              {activeSection === 'orders'     && <OrdersSection />}
              {activeSection === 'wishlist'   && <WishlistSection items={wishlistItems} onRemove={handleRemoveWishlist} />}
              {activeSection === 'queries'    && <QueriesSection queries={queries} loading={queriesLoading} />}
              {activeSection === 'reviews'    && <ReviewsSection />}
              {activeSection === 'addresses'  && <AddressesSection />}
              {activeSection === 'edit'       && <EditProfileSection user={user} />}
              {activeSection === 'support'    && <SupportSection />}
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
