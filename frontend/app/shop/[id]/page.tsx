'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { edImg } from '@/lib/edImages';
import {
  ArrowLeft, Star, ShoppingCart, Heart, Share2, Shield,
  Clock, MapPin, CheckCircle, ChevronDown, ChevronUp, Zap, Award, X
} from 'lucide-react';

// ─── Fallback Data ───────────────────────────────────────
const FALLBACK_SERVICES: Record<string, any> = {
  '1': { id: 1, title: 'Premium Balloon Decoration', category: 'Balloon Decoration', price: 2499, originalPrice: 3499, rating: 4.9, reviews: 312, badge: 'Best Seller', img: edImg('birthday', 0), occasion: 'birthday', description: 'Transform your birthday venue into a magical wonderland with our premium balloon decoration service. Our expert decorators use high-quality foil and latex balloons in custom color schemes to create stunning backdrops, arches, and centerpieces.', duration: '3-4 hours', includes: ['Setup & teardown', 'Custom color theme', 'Balloon arch', 'Photo backdrop', 'Table centerpieces'], city: 'Indore' },
  '2': { id: 2, title: 'Birthday Cake + Decoration', category: 'Cake & Desserts', price: 1899, originalPrice: 2499, rating: 4.8, reviews: 198, badge: 'PRICE DROP', img: edImg('birthday', 1), occasion: 'birthday', description: 'Delight your guests with a custom birthday cake paired with matching decorations. Our pastry chefs create personalized cakes in any flavor and design while our decorators ensure the venue ambiance perfectly complements your cake.', duration: '2-3 hours', includes: ['Custom 2kg cake', 'Table decoration', 'Candles & props', 'Cutting ceremony setup'], city: 'Indore' },
};

const RELATED_SERVICES = [
  { id: 3, title: 'Photography + Reels Package', category: 'Photography', price: 4999, originalPrice: 6500, rating: 5.0, reviews: 87, img: edImg('ring_ceremony', 0) },
  { id: 4, title: 'DJ Setup — 4 Hours', category: 'DJ & Music', price: 3499, originalPrice: 4500, rating: 4.7, reviews: 143, img: edImg('stage', 0) },
  { id: 5, title: 'Rose & Candle Decoration', category: 'Floral Decoration', price: 2999, originalPrice: 3999, rating: 4.9, reviews: 221, img: edImg('anniversary', 0) },
  { id: 6, title: 'Couple Photography Session', category: 'Photography', price: 5499, originalPrice: 7000, rating: 5.0, reviews: 104, img: edImg('ring_ceremony', 1) },
];

const REVIEWS = [
  { name: 'Kritika Sharma', loc: 'Indore', date: 'Jan 2025', review: 'Absolutely stunning decoration! The team was professional and set everything up on time. Highly recommend!', rating: 5, img: '' },
  { name: 'Rahul Verma', loc: 'Bhopal', date: 'Feb 2025', review: 'Very professional team. Everything was set up perfectly for the birthday bash. Will book again!', rating: 5, img: '' },
  { name: 'Sneha Patel', loc: 'Ujjain', date: 'Mar 2025', review: 'The decor was exactly how I imagined. The team was cooperative and exceeded expectations.', rating: 4, img: '' },
];

const FAQ = [
  { q: 'How far in advance should I book?', a: 'We recommend booking at least 3-5 days in advance to ensure availability and proper planning for your event.' },
  { q: 'What if I need to cancel or reschedule?', a: 'Free cancellation up to 48 hours before the event. Rescheduling is available subject to availability.' },
  { q: 'Do you provide services outside Indore?', a: 'Yes! We serve Indore, Bhopal, Jabalpur, Gwalior, Ujjain, and Rewa. Additional travel charges may apply.' },
  { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and cash on delivery for eligible orders.' },
];

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id);

  const [service, setService] = useState<any>(FALLBACK_SERVICES[id] || FALLBACK_SERVICES['1']);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faq'>('details');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [added, setAdded] = useState(false);

  // Quote form state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteBudget, setQuoteBudget] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<any>(`/api/services/${id}/`);
        if (data) setService({
          ...data,
          img: data.image_url || service.img,
          title: data.name,
          category: data.category_name || '',
          price: data.price ?? 0,
          originalPrice: data.original_price ?? data.price ?? 0,
          rating: data.ratings ?? 4.5,
          reviews: data.review_count ?? 0,
        });
      } catch { /* use fallback */ }
    }
    load();
  }, [id]);

  const discount = Math.round((1 - service.price / service.originalPrice) * 100);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleRequestQuote = async () => {
    setIsSubmittingQuote(true);
    try {
      if (!selectedDate && !isUrgent) {
          throw new Error('Please select an Event Date on the main page first, or mark as Urgent');
      }
      await api.post('/api/queries/create/', {
        service: id,
        location: selectedCity,
        service_date: selectedDate ? new Date(selectedDate).toISOString() : null,
        is_urgent: isUrgent,
        approx_budget: quoteBudget ? Number(quoteBudget) : null,
      });
      alert('Quote requested successfully! View it in your User Profile under "My Inquiries".');
      setQuoteModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to request quote. Please login first.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-orange-500 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <Link href="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{service?.title}</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* ── Left: Images ── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-sm">
              <Image src={service?.img} alt={service?.title} fill className="object-cover" priority />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg">
                  {discount}% OFF
                </span>
              )}
              {service?.badge && (
                <span className={`absolute top-4 right-4 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-sm ${service.badge === 'PRICE DROP' ? 'bg-red-500 text-white' : 'bg-violet-600 text-white'}`}>
                  {service.badge}
                </span>
              )}
            </div>
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-2">
              {[service?.img, edImg('anniversary', 1), edImg('birthday', 2), edImg('wedding', 1)].map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 border-transparent hover:border-orange-400 transition-all">
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Info & Booking ── */}
          <div className="space-y-5">
            {/* Category & Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{service?.category}</span>
              {service?.occasion && (
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full capitalize">{service.occasion.replace('_', ' ')}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{service?.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(service?.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
              <span className="font-bold text-gray-800">{service?.rating}</span>
              <span className="text-gray-500 text-sm">({service?.reviews} reviews)</span>
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-end gap-3 mb-3">
                <span className="text-3xl md:text-4xl font-black text-gray-900">₹{service?.price?.toLocaleString('en-IN')}</span>
                <span className="text-lg text-gray-400 font-semibold line-through pb-1">₹{service?.originalPrice?.toLocaleString('en-IN')}</span>
                {discount > 0 && <span className="text-sm font-bold text-rose-500 pb-1">You save ₹{(service.originalPrice - service.price).toLocaleString('en-IN')}</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-green-500" /> Secure booking • Free cancellation 48h before
              </div>
            </div>

            {/* Booking Options */}
            <div className="space-y-3">
              {/* City */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" /> Select City
                </label>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                >
                  {['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Rewa'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-500" /> Event Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Secure Booking', color: 'text-green-600' },
                { icon: Award, label: 'Verified Vendor', color: 'text-indigo-600' },
                { icon: Zap, label: 'Instant Confirm', color: 'text-orange-600' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                  <Icon className={`w-5 h-5 ${color} mb-1`} />
                  <span className="text-[11px] font-semibold text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center transition-all duration-200 shadow-sm ${added ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                title="Add to standard cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-2xl py-3.5 hover:from-orange-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>Request Details / Quote</span>
              </button>
              <button
                onClick={() => setIsWishlisted(w => !w)}
                className={`px-4 py-3.5 rounded-2xl border-2 font-bold transition-all ${isWishlisted ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-gray-200 text-gray-500 hover:border-rose-400 hover:text-rose-400'}`}
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-500 font-bold transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* What's Included */}
            {service?.includes && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <p className="text-sm font-bold text-green-800 mb-3">What's Included</p>
                <ul className="space-y-1.5">
                  {service.includes.map((item: string) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs: Details / Reviews / FAQ ── */}
        <div className="mt-12">
          <div className="flex border-b border-gray-200 mb-6">
            {(['details', 'reviews', 'faq'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'faq' ? 'FAQ' : tab}
                {tab === 'reviews' && <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{REVIEWS.length}</span>}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">About This Service</h2>
                <p className="text-gray-600 leading-relaxed">{service?.description || 'Premium event service by verified professionals. Book with confidence and create unforgettable memories.'}</p>
                {service?.duration && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold">Duration:</span> {service.duration}
                  </div>
                )}
                {service?.city && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold">City:</span> {service.city}
                  </div>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Our Guarantee</h3>
                <ul className="space-y-2 text-sm text-amber-700">
                  {['100% verified vendors', 'On-time service guarantee', 'Free rescheduling', 'Hassle-free cancellation', '24/7 customer support'].map(g => (
                    <li key={g} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> {g}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REVIEWS.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />)}
                    <span className="ml-auto text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed italic mb-4">"{r.review}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center font-bold text-orange-600 text-sm">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Verified • {r.loc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="max-w-2xl space-y-3">
              {FAQ.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-gray-900 text-sm">{f.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-orange-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Related Services ── */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-rose-500 inline-block pb-1 pr-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {RELATED_SERVICES.map(s => {
              const disc = Math.round((1 - s.price / s.originalPrice) * 100);
              return (
                <Link key={s.id} href={`/shop/${s.id}`} className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <Image src={s.img} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    {disc > 0 && <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{disc}% OFF</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">{s.category}</p>
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">{s.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black text-gray-900">₹{s.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-gray-400 line-through">₹{s.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quote Modal ── */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setQuoteModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Request Quote</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">Let the vendor know your requirements and receive a personalized offer for <span className="font-semibold">{service?.title}</span>.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500"/>Target City</label>
                <input type="text" value={selectedCity} readOnly className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed" />
              </div>
              {selectedDate && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500"/>Event Date</label>
                  <input type="text" value={selectedDate} readOnly className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed" />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Estimated Budget (₹) <span className="font-normal text-gray-400 text-xs ml-1">(Optional)</span></label>
                <input type="number" value={quoteBudget} onChange={e => setQuoteBudget(e.target.value)} placeholder="e.g. 25000" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20" />
              </div>
              <div className="flex items-center gap-3 bg-orange-50 p-3.5 rounded-xl border border-orange-100 mt-2">
                <input type="checkbox" id="urgent" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded cursor-pointer shrink-0" />
                <label htmlFor="urgent" className="text-sm font-semibold text-orange-900 cursor-pointer">This is an urgent request (need response ASAP)</label>
              </div>
            </div>
            
            <button
              onClick={handleRequestQuote}
              disabled={isSubmittingQuote}
              className="w-full mt-6 bg-gray-900 text-white font-bold rounded-xl py-3.5 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            >
              {isSubmittingQuote ? 'Submitting...' : 'Send Inquiry to Vendor'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
