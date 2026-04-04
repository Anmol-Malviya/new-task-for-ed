'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, MapPin, Clock, Shield, Tag, ArrowRight, Plus, Minus, ChevronRight, Gift } from 'lucide-react';
import { edImg } from '@/lib/edImages';

// ─── Types ──────────────────────────────────────────────
interface CartItem {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  img: string;
  city: string;
  date: string;
  quantity: number;
}

// ─── Mock Initial Cart ───────────────────────────────────
const INITIAL_CART: CartItem[] = [
  {
    id: 1,
    title: 'Premium Balloon Decoration',
    category: 'Balloon Decoration',
    price: 2499,
    originalPrice: 3499,
    img: edImg('birthday', 0),
    city: 'Indore',
    date: '',
    quantity: 1,
  },
];

const OFFERS = [
  { code: 'FIRST200', discount: 200, desc: '₹200 off on first booking' },
  { code: 'INDORE50', discount: 0.5, desc: '50% off Indore exclusive', isPercent: true },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof OFFERS[0] | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const savings = originalTotal - subtotal;
  const couponDiscount = appliedCoupon
    ? appliedCoupon.isPercent
      ? Math.round(subtotal * (appliedCoupon.discount as number))
      : (appliedCoupon.discount as number)
    : 0;
  const platformFee = 49;
  const total = subtotal - couponDiscount + platformFee;

  const updateQty = (id: number, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(item => item.id !== id));

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const found = OFFERS.find(o => o.code === coupon.toUpperCase().trim());
    if (found) {
      setAppliedCoupon(found);
      setCouponSuccess(`Coupon "${found.code}" applied! ${found.desc}`);
    } else {
      setCouponError('Invalid coupon code. Try FIRST200 or INDORE50.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
    setCouponSuccess('');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="w-28 h-28 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-14 h-14 text-orange-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Browse our services and add something special for your next event!</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-200 hover:-translate-y-0.5"
          >
            Browse Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            My Cart
            <span className="text-sm font-normal text-gray-500 ml-1">({items.length} item{items.length !== 1 ? 's' : ''})</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const disc = Math.round((1 - item.price / item.originalPrice) * 100);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div className="relative w-full sm:w-32 h-28 sm:h-auto aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                  {disc > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{disc}% OFF</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">{item.category}</p>
                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">{item.title}</h3>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-orange-400" /> {item.city}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" /> {item.date || 'Date not set'}</span>
                  </div>

                  {/* Date Input */}
                  <input
                    type="date"
                    value={item.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, date: e.target.value } : i))}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-orange-400 mb-3 bg-gray-50"
                  />

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Price */}
                    <div className="flex items-end gap-2">
                      <span className="text-lg font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      <span className="text-sm text-gray-400 line-through pb-0.5">₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQty(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-rose-300 hover:text-rose-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-500" /> Apply Coupon
            </h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-green-700">{appliedCoupon.code} applied</p>
                  <p className="text-xs text-green-600">{appliedCoupon.desc}</p>
                </div>
                <button onClick={removeCoupon} className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1 bg-rose-50 rounded-lg">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  placeholder="Enter coupon code (try FIRST200)"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all uppercase placeholder-normal"
                />
                <button onClick={applyCoupon} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors">
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-rose-500 mt-2 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-green-600 mt-2 font-medium">{couponSuccess}</p>}

            {/* Offer Pills */}
            {!appliedCoupon && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {OFFERS.map(o => (
                  <button key={o.code} onClick={() => { setCoupon(o.code); }} className="text-xs px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full font-semibold border border-orange-100 hover:bg-orange-100 transition-colors">
                    {o.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: 'Secure Payment', desc: 'SSL encrypted' },
              { icon: Gift, label: 'Easy Returns', desc: 'Free cancellation' },
              { icon: Clock, label: '24/7 Support', desc: 'Always here to help' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <Icon className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-[140px]">
            <h3 className="font-bold text-gray-900 text-base mb-5 pb-3 border-b border-gray-100">Order Summary</h3>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>You save</span>
                <span className="font-semibold">-₹{savings.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount</span>
                  <span className="font-semibold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Platform fee</span>
                <span className="font-semibold">₹{platformFee}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between font-black text-gray-900 text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-semibold flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              You're saving ₹{(savings + couponDiscount).toLocaleString('en-IN')} on this order!
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ChevronRight className="w-4 h-4" />
            </Link>

            <Link href="/shop" className="block text-center mt-3 text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors">
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
