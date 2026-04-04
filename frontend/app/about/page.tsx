import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, Award, Heart, MapPin, Star, CheckCircle, Zap } from 'lucide-react';
import { edImg } from '@/lib/edImages';

export const metadata: Metadata = {
  title: 'About Us | EventDhara — Crafting Unforgettable Events',
  description: "Learn about EventDhara — India's fastest growing event planning marketplace connecting you with 500+ verified vendors across 6 cities.",
};

const STATS = [
  { value: '10K+', label: 'Happy Customers', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: '500+', label: 'Verified Vendors', icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { value: '6', label: 'Cities Live', icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-50' },
  { value: '4.8★', label: 'Average Rating', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const TEAM = [
  { name: 'Arjun Patel', role: 'Co-Founder & CEO', emoji: '👨‍💼', desc: 'Serial entrepreneur passionate about connecting people with premium services.' },
  { name: 'Priya Sharma', role: 'Co-Founder & COO', emoji: '👩‍💼', desc: 'Event industry veteran with 8+ years of experience in vendor management.' },
  { name: 'Rahul Verma', role: 'Head of Technology', emoji: '👨‍💻', desc: 'Building scalable platforms that make event booking seamless and delightful.' },
  { name: 'Sneha Gupta', role: 'Head of Vendor Relations', emoji: '👩‍🤝‍👨', desc: 'Ensuring every vendor on our platform delivers extraordinary experiences.' },
];

const VALUES = [
  { title: 'Trust & Transparency', desc: 'Every vendor is verified, every review is real, and every price is upfront.', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { title: 'Customer First', desc: 'Your happiness is our KPI. We go above and beyond to make your event perfect.', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
  { title: 'Speed & Reliability', desc: 'Book in minutes. Confirm instantly. Party on time — always.', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: 'Local Excellence', desc: 'We celebrate local talent, helping the best vendors in your city shine.', icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const CITIES = ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Rewa'];

const TIMELINE = [
  { year: '2022', event: 'EventDhara founded in Indore with 12 vendors and a big dream.' },
  { year: '2023', event: 'Expanded to 5 cities, crossed 1000 happy customers.' },
  { year: '2024', event: 'Launched our mobile app, onboarded 300+ verified vendors.' },
  { year: '2025', event: 'Serving 10,000+ customers across 6 cities with 500+ vendors.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-rose-50 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-rose-200/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            🎉 India's fastest growing event marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
            Crafting Memories,<br />
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">One Event at a Time</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            EventDhara is a curated marketplace connecting you with India's best event vendors — photographers, decorators, DJs, makeup artists, and more — for every occasion that matters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-200 hover:-translate-y-0.5">
              Browse Services <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/become-a-vendor" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-700 font-bold rounded-2xl transition-all hover:-translate-y-0.5">
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map(({ value, label, icon: Icon, color, bg }) => (
            <div key={label} className="text-center">
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <p className="text-3xl md:text-4xl font-black text-gray-900 mb-1">{value}</p>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={edImg('wedding', 0)}
                alt="EventDhara Team at Work"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
              <p className="text-2xl font-black text-orange-500">3+ yrs</p>
              <p className="text-xs text-gray-500 font-medium">Serving events with love ❤️</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-5">
              Making Premium Event Planning Accessible to Everyone
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              We started EventDhara with a simple belief: every celebration deserves to be extraordinary. Too often, people settle for less because finding reliable, affordable vendors is overwhelming.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Our platform changes that by bringing the best local talent to your fingertips — verified, reviewed, and ready to make your event unforgettable. No middlemen, no hassle, just pure celebration.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['Verified vendors only', 'Transparent pricing', 'Instant booking', 'Dedicated support'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map(({ title, desc, icon: Icon, color, bg }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Our Journey</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">How We Got Here</h2>
          </div>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-8">
              {TIMELINE.map(({ year, event }) => (
                <div key={year} className="flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm relative z-10">
                    {year.slice(2)}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 flex-1 border border-gray-100">
                    <span className="text-xs font-bold text-orange-500 mb-1 block">{year}</span>
                    <p className="text-sm text-gray-700 font-medium">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">The People Behind EventDhara</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map(({ name, role, emoji, desc }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
                  {emoji}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{name}</h3>
                <p className="text-[11px] text-orange-500 font-semibold mb-2">{role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cities ── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3">Where We Operate</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Serving 6 Cities Across MP</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map(city => (
              <span key={city} className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 border border-orange-100 text-orange-700 font-semibold rounded-full text-sm hover:bg-orange-100 transition-colors">
                <MapPin className="w-4 h-4" /> {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Create Magic?</h2>
          <p className="text-white/90 mb-8 text-lg">Join thousands of happy customers who made their events unforgettable with EventDhara.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="px-8 py-3.5 bg-white text-orange-500 font-extrabold rounded-2xl hover:bg-gray-50 transition-all shadow-lg">
              Browse Services
            </Link>
            <Link href="/auth/Register" className="px-8 py-3.5 border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
              Sign Up Free →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
