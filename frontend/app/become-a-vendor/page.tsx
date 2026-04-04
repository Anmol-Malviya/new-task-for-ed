import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Star, TrendingUp, Users, Zap, Shield, MessageSquare, IndianRupee, BarChart3, Award } from 'lucide-react';
import { edImg } from '@/lib/edImages';

export const metadata: Metadata = {
  title: 'Become a Vendor | EventDhara — Grow Your Event Business',
  description: 'Join 500+ verified event vendors on EventDhara and get quality leads directly on WhatsApp. No cold calling, no hustling — just events.',
};

const BENEFITS = [
  {
    icon: MessageSquare,
    title: 'Leads on WhatsApp',
    desc: 'Receive pre-qualified customer inquiries directly on WhatsApp. No spam, only serious leads.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Bookings',
    desc: 'Access a pool of 10,000+ active customers searching for exactly what you offer.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Shield,
    title: 'Verified Badge',
    desc: 'Get a verified vendor badge that builds trust and helps you win more clients.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: IndianRupee,
    title: 'Zero Commission',
    desc: 'Keep 100% of what you earn. We charge only a small monthly platform fee.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Track your profile views, lead conversions, and revenue from your vendor dashboard.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Award,
    title: 'Premium Visibility',
    desc: 'Premium vendors appear at the top of search results and on the homepage.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register & Verify', desc: 'Create your vendor profile in under 5 minutes. Our team verifies your business within 24 hours.' },
  { step: '02', title: 'Set Up Your Services', desc: 'List your services with pricing, photos, and availability. We guide you through every step.' },
  { step: '03', title: 'Get Leads on WhatsApp', desc: 'Start receiving qualified lead inquiries directly on WhatsApp as soon as your profile goes live.' },
  { step: '04', title: 'Book, Earn & Grow', desc: 'Convert leads into bookings, build your portfolio, and earn 5-star reviews to grow faster.' },
];

const TESTIMONIALS = [
  { name: 'Ramesh Photography', city: 'Indore', rating: 5, review: 'EventDhara gave my business the visibility it needed. I now receive 10-15 quality leads per week and have doubled my revenue!', earnings: '₹2.5L/mo', category: 'Photography' },
  { name: 'Shobha Decor Studio', city: 'Bhopal', rating: 5, review: 'Best platform for event vendors in MP. The WhatsApp lead system is brilliant — serious customers only!', earnings: '₹1.8L/mo', category: 'Decoration' },
  { name: 'Beat Box DJ', city: 'Ujjain', rating: 5, review: 'Joined 6 months ago and already booked 40+ events. The verified badge makes a HUGE difference with clients.', earnings: '₹3.2L/mo', category: 'DJ & Music' },
];

const PLANS = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    color: 'border-gray-200',
    badge: null,
    features: ['5 WhatsApp leads/month', 'Basic profile listing', 'Photo gallery (10 photos)', 'Standard support', '1 service category'],
  },
  {
    name: 'Professional',
    price: '₹2,499',
    period: '/month',
    color: 'border-orange-400',
    badge: 'Most Popular',
    features: ['30 WhatsApp leads/month', 'Priority listing', 'Photo & video gallery', 'Verified vendor badge', '3 service categories', 'Analytics dashboard', 'Dedicated support'],
    highlight: true,
  },
  {
    name: 'Premium',
    price: '₹4,999',
    period: '/month',
    color: 'border-indigo-400',
    badge: 'Best Value',
    features: ['Unlimited WhatsApp leads', 'Homepage featured placement', 'Unlimited media gallery', 'Verified vendor badge', 'Unlimited categories', 'Advanced analytics', '24/7 priority support', 'Social media promotion'],
  },
];

export default function BecomeAVendorPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ── */}
      <section className="relative bg-gray-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={edImg('wedding', 1)}
            alt="EventDhara Vendors"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/70" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" /> 500+ vendors already growing with us
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
              Grow Your Event<br />
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Business Faster</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 max-w-xl">
              Join EventDhara and get pre-qualified leads on WhatsApp. No cold calling, no hustling — just bookings from customers who are ready to hire.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/auth/VendorRegister"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5"
              >
                Register as Vendor <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-gray-400 text-sm">Free to start • No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Stats ── */}
      <section className="py-12 bg-orange-500 text-white">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'Active Vendors' },
            { value: '10K+', label: 'Monthly Leads' },
            { value: '6', label: 'Cities Covered' },
            { value: '₹50K+', label: 'Avg Monthly Earning' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black mb-1">{s.value}</p>
              <p className="text-orange-100 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Why EventDhara</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Everything You Need to Succeed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-6 hover:shadow-md transition-all duration-300 group">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Start Getting Leads in 24 Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-lg shadow-sm">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Vendor Stories</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Vendors Who Made It Big</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-700 italic leading-relaxed mb-4">"{t.review}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.category} • {t.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-green-600">{t.earnings}</p>
                    <p className="text-[10px] text-gray-400">avg. earnings</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Pricing Plans</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 mt-2">Start free. Scale as you grow. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 ${plan.color} ${plan.highlight ? 'shadow-xl scale-[1.02]' : 'shadow-sm'} p-6 relative transition-all hover:-translate-y-1`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full text-white ${plan.highlight ? 'bg-orange-500' : 'bg-indigo-500'}`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm pb-1">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/VendorRegister"
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${plan.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Join 500+ Successful Vendors</h2>
          <p className="text-gray-400 mb-8">Register today and start receiving leads within 24 hours of verification.</p>
          <Link
            href="/auth/VendorRegister"
            className="inline-flex items-center gap-2 px-10 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/30 text-lg hover:-translate-y-0.5"
          >
            Register as Vendor Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
