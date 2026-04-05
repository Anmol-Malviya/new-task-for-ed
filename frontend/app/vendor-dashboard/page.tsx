'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell, ShoppingBag, TrendingUp, IndianRupee, Star,
  AlertCircle, CheckCircle, Clock, ChevronRight, Crown,
  ArrowUpRight, Zap
} from 'lucide-react';

const API = (path: string) => `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api${path}`;

function useVendorApi(endpoint: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    if (!token) { setLoading(false); return; }
    fetch(API(endpoint), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [endpoint]);
  return { data, loading };
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 hover:border-[#444] transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[#8b949e] text-sm">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-[#8b949e] mt-1">{sub}</p>}
    </div>
  );
}

const PIPELINE_LABELS: Record<string, string> = {
  lead_accepted: 'Lead Accepted',
  price_confirmed: 'Price Confirmed',
  payment_received: 'Payment Received',
  d1_ready: 'D-1 Ready',
  delivered: 'Delivered',
  paid_out: 'Paid Out',
};
const PIPELINE_COLORS: Record<string, string> = {
  lead_accepted: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  price_confirmed: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  payment_received: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  d1_ready: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  delivered: 'text-green-400 bg-green-500/10 border-green-500/20',
  paid_out: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function VendorDashboardHome() {
  const { data: profile } = useVendorApi('/vendor/profile/');
  const { data: onboarding } = useVendorApi('/vendor/onboarding-status/');
  const { data: earnings } = useVendorApi('/vendor/earnings/');
  const { data: orders } = useVendorApi('/vendor/orders/');
  const { data: leads } = useVendorApi('/vendor/leads/?status=pending');

  const activeOrders = orders?.filter((o: any) =>
    !['paid_out', 'cancelled'].includes(o.status)
  ) || [];
  const pendingLeads = leads?.filter((l: any) => l.status === 'pending') || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a1f2e] via-[#1c2333] to-[#161b22] border border-[#30363d] rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[#8b949e] text-sm mb-1">Welcome back,</p>
              <h1 className="text-xl font-bold text-white">{profile?.business_name || profile?.name || 'Vendor'}</h1>
              <p className="text-sm text-[#8b949e] mt-1">
                {profile?.city ? `${profile.city}` : ''} · {profile?.vendor_type || 'Event Services'}
              </p>
            </div>
            {profile?.is_premium && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">Premium Partner</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Onboarding gate ── */}
      {onboarding && !onboarding.can_receive_leads && (
        <div className="bg-[#1c2333] border border-yellow-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-400 mb-1">Complete Onboarding to Receive Leads</h3>
              <p className="text-sm text-[#8b949e] mb-4">
                {onboarding.admin_approval_status === 'pending'
                  ? 'Your profile is awaiting admin approval (within 24 hours).'
                  : `You are on Step ${onboarding.step} of 5. Complete all steps to go live.`}
              </p>
              {/* Step indicators */}
              <div className="flex gap-2 flex-wrap mb-4">
                {Object.entries(onboarding.steps_detail || {}).map(([key, done]: any) => (
                  <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    done ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[#30363d] text-[#8b949e]'
                  }`}>
                    {done ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-[#8b949e]" />}
                    {key.replace(/^\d_/, '').replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
              <Link
                href="/vendor-dashboard/onboarding"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
              >
                Continue Onboarding <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Pending leads alert ── */}
      {pendingLeads.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-400">{pendingLeads.length} New Lead{pendingLeads.length > 1 ? 's' : ''} — Act Now!</h3>
              <p className="text-sm text-[#8b949e]">You have {pendingLeads[0]?.seconds_remaining || 0}s remaining on the first lead. Accept or decline within 20 minutes.</p>
            </div>
            <Link href="/vendor-dashboard/leads" className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              View Leads <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Score" icon={TrendingUp}
          value={profile?.score || 50}
          sub={`${profile?.tier || 'Starter'} Tier`}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="This Month" icon={IndianRupee}
          value={`₹${(earnings?.this_month || 0).toLocaleString('en-IN')}`}
          sub={`${earnings?.this_month_orders || 0} orders`}
          color="bg-green-500/10 text-green-400"
        />
        <StatCard
          label="Active Orders" icon={ShoppingBag}
          value={activeOrders.length}
          sub="In pipeline"
          color="bg-orange-500/10 text-orange-400"
        />
        <StatCard
          label="Avg Rating" icon={Star}
          value={profile?.avg_rating?.toFixed(1) || '—'}
          sub={`${profile?.response_rate || 0}% response`}
          color="bg-amber-500/10 text-amber-400"
        />
      </div>

      {/* ── Active orders ── */}
      {activeOrders.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
            <h2 className="font-semibold text-white">Active Orders</h2>
            <Link href="/vendor-dashboard/orders" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#30363d]">
            {activeOrders.slice(0, 4).map((o: any) => (
              <Link key={o.order_id} href={`/vendor-dashboard/orders/${o.order_id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#1c2333] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 text-[#8b949e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white">{o.occasion || 'Event'} Decoration</p>
                  <p className="text-xs text-[#8b949e]">{o.city_area || o.event_date || '—'}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${PIPELINE_COLORS[o.status] || 'text-[#8b949e] bg-[#30363d] border-transparent'}`}>
                    {PIPELINE_LABELS[o.status] || o.status}
                  </span>
                  <p className="text-xs text-[#8b949e] mt-1">₹{(o.final_amount || o.approx_budget || 0).toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Score + quick links ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score breakdown */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Performance Score</h2>
            <Link href="/vendor-dashboard/score" className="text-xs text-orange-400 hover:text-orange-300">Details →</Link>
          </div>
          {/* Score ring visual */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#30363d" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(profile?.score || 50) * 2.01} ${201 - (profile?.score || 50) * 2.01}`}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{profile?.score || 50}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Response Rate', value: `${profile?.response_rate || 0}%` },
                { label: 'Avg Rating', value: `${profile?.avg_rating?.toFixed(1) || '—'} ★` },
                { label: 'Completion', value: `${profile?.completion_rate || 0}%` },
              ].map(m => (
                <div key={m.label} className="flex justify-between text-sm">
                  <span className="text-[#8b949e]">{m.label}</span>
                  <span className="font-medium text-white">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/vendor-dashboard/leads', label: 'Check New Leads', icon: Bell, color: 'text-red-400' },
              { href: '/vendor-dashboard/availability', label: 'Update Availability', icon: Clock, color: 'text-blue-400' },
              { href: '/vendor-dashboard/portfolio', label: 'Upload Photos', icon: Zap, color: 'text-purple-400' },
              { href: '/vendor-dashboard/earnings', label: 'View Earnings', icon: IndianRupee, color: 'text-green-400' },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
              >
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm text-[#8b949e] group-hover:text-white transition-colors">{label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8b949e] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
