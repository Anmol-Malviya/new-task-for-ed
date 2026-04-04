'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, CheckCircle, CreditCard, Smartphone, Banknote, MapPin, Clock, Lock, ChevronRight } from 'lucide-react';
import { edImg } from '@/lib/edImages';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay via GPay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay at the time of service' },
];

const ORDER_SUMMARY = {
  items: [{ title: 'Premium Balloon Decoration', category: 'Balloon Decoration', price: 2499, img: edImg('birthday', 0) }],
  subtotal: 2499,
  savings: 1000,
  platformFee: 49,
  total: 2548,
};

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: 'Indore', date: '', notes: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = () => {
    if (!form.name || !form.phone || !form.date) return;
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Confirmed! 🎉</h2>
          <p className="text-gray-500 mb-2">Your order has been placed successfully.</p>
          <p className="text-sm text-gray-400 mb-8">A confirmation with details has been sent to <span className="font-semibold text-gray-600">{form.phone}</span> via WhatsApp.</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">Order Summary</p>
            {ORDER_SUMMARY.items.map(item => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.title}</p>
                  <p className="text-xs text-orange-500">{item.category}</p>
                </div>
                <p className="ml-auto font-black text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/" className="py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors">
              Back to Home
            </Link>
            <Link href="/shop" className="py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-2xl transition-colors border border-gray-200">
              Browse More Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
          <Link href="/cart" className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Cart
          </Link>
          <div className="flex items-center gap-2 ml-4">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= s ? 'text-orange-500' : 'text-gray-300'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{step > s ? '✓' : s}</span>
                  <span className="hidden sm:inline">{['Details', 'Payment', 'Review'][s - 1]}</span>
                </div>
                {s < 3 && <ChevronRight className={`w-3.5 h-3.5 ${step > s ? 'text-orange-400' : 'text-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5 text-green-500" /> Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Form ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-base mb-5 pb-3 border-b border-gray-100">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Arjun Patel', required: true },
                  { key: 'phone', label: 'WhatsApp Number', type: 'tel', placeholder: '9876543210', required: true },
                  { key: 'email', label: 'Email (optional)', type: 'email', placeholder: 'you@example.com' },
                  { key: 'city', label: 'City', type: 'select' },
                ].map(field => (
                  <div key={field.key} className={field.key === 'address' || field.key === 'notes' ? 'sm:col-span-2' : ''}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{field.label}{field.required && <span className="text-rose-500 ml-0.5">*</span>}</label>
                    {field.type === 'select' ? (
                      <select
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all"
                      >
                        {['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Rewa'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all"
                      />
                    )}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" /> Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" /> Venue Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Enter your venue address..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Special Requests / Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special instructions or requests..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.phone || !form.date}
                className="mt-6 w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-5 font-medium transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h2 className="font-bold text-gray-900 text-base mb-5 pb-3 border-b border-gray-100">Choose Payment Method</h2>
              <div className="space-y-3 mb-6">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPayment(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedPayment === id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPayment === id ? 'bg-orange-500' : 'bg-gray-200'}`}>
                      <Icon className={`w-5 h-5 ${selectedPayment === id ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === id ? 'border-orange-500' : 'border-gray-300'}`}>
                      {selectedPayment === id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                  </button>
                ))}
              </div>

              {selectedPayment === 'upi' && (
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@gpay"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-medium mb-5">
                <Shield className="w-4 h-4 text-green-500 shrink-0" />
                Your payment is secured with 256-bit SSL encryption
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                Review Order <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-5 font-medium transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h2 className="font-bold text-gray-900 text-base mb-5 pb-3 border-b border-gray-100">Review Your Order</h2>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Booking Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-500 text-xs">Name</p><p className="font-semibold">{form.name}</p></div>
                    <div><p className="text-gray-500 text-xs">Phone</p><p className="font-semibold">{form.phone}</p></div>
                    <div><p className="text-gray-500 text-xs">City</p><p className="font-semibold">{form.city}</p></div>
                    <div><p className="text-gray-500 text-xs">Event Date</p><p className="font-semibold">{form.date}</p></div>
                    {form.address && <div className="col-span-2"><p className="text-gray-500 text-xs">Address</p><p className="font-semibold">{form.address}</p></div>}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Method</p>
                  <p className="font-semibold text-sm capitalize">{PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label}</p>
                  {upiId && <p className="text-xs text-gray-500 mt-1">UPI ID: {upiId}</p>}
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Place Order — ₹{ORDER_SUMMARY.total.toLocaleString('en-IN')}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                By placing this order, you agree to our{' '}
                <Link href="#" className="text-orange-500 hover:underline">Terms of Service</Link>
              </p>
            </div>
          )}
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-[130px]">
            <h3 className="font-bold text-gray-900 text-sm mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
            {ORDER_SUMMARY.items.map(item => (
              <div key={item.title} className="flex gap-3 mb-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{item.category}</p>
                  <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{item.title}</p>
                  <p className="text-sm font-black text-gray-900 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}

            <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{ORDER_SUMMARY.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Savings</span>
                <span className="font-semibold">-₹{ORDER_SUMMARY.savings.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform fee</span>
                <span className="font-semibold">₹{ORDER_SUMMARY.platformFee}</span>
              </div>
              <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>₹{ORDER_SUMMARY.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5 text-green-500" /> Secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
