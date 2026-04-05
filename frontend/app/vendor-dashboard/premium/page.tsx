'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Crown, CheckCircle, Zap, Shield, Sparkles, TrendingUp,
  X, AlertTriangle, Calculator, ChevronRight, Loader2,
  BadgeCheck, Calendar, BarChart2, Headphones, Star,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vendor_token') : '';
  return fetch(`${API_BASE}/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers as Record<string, string> | undefined),
    },
  });
};

declare global {
  interface Window { Razorpay: any; }
}

// ─── types ────────────────────────────────────────────────────────────────────
interface PremiumData {
  is_premium: boolean;
  premium_since: string | null;
  premium_expires_at: string | null;
  razorpay_subscription_id: string | null;
  is_eligible: boolean;
  completed_orders: number;
  orders_needed_for_eligibility: number;
  current_commission: string;
  premium_commission: string;
  current_lead_cap: number;
  premium_lead_cap: number;
  benefits: string[];
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function daysUntil(date: string | null): number {
  if (!date) return 0;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function commissionPct(str: string): number {
  return parseInt(str.replace('%', ''), 10) || 15;
}

// ─── savings calculator ───────────────────────────────────────────────────────
function SavingsCalculator({ current_commission }: { current_commission: string }) {
  const [monthly, setMonthly] = useState(20000);
  const currentRate = commissionPct(current_commission) / 100;
  const premiumRate = 0.10;
  const savings = Math.round(monthly * (currentRate - premiumRate));
  const roi = savings - 999;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-white">ROI Calculator</h3>
      </div>
      <p className="text-xs text-[#8b949e] mb-4">
        Adjust your expected monthly booking revenue to see what Premium saves you.
      </p>

      <label className="block text-xs text-[#8b949e] mb-1">Monthly Revenue from EventDhara</label>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-[#8b949e]">₹</span>
        <input
          type="range"
          min={5000} max={200000} step={1000}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="flex-1 accent-amber-500"
        />
        <span className="text-sm font-bold text-white w-20 text-right">
          {monthly.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-[#0d1117] rounded-xl p-3">
          <p className="text-[#8b949e] text-xs mb-1">Current commission ({current_commission})</p>
          <p className="font-bold text-red-400">−₹{Math.round(monthly * currentRate).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#0d1117] rounded-xl p-3">
          <p className="text-[#8b949e] text-xs mb-1">Premium commission (10%)</p>
          <p className="font-bold text-green-400">−₹{Math.round(monthly * premiumRate).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className={`mt-4 rounded-xl p-4 flex items-center justify-between ${roi > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-[#0d1117] border border-[#30363d]'}`}>
        <div>
          <p className="text-xs text-[#8b949e]">Monthly savings</p>
          <p className={`text-2xl font-black ${roi > 0 ? 'text-green-400' : 'text-[#8b949e]'}`}>
            ₹{savings.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8b949e]">Net ROI (after ₹999 fee)</p>
          <p className={`text-lg font-bold ${roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {roi >= 0 ? '+' : ''}₹{roi.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── cancel modal ─────────────────────────────────────────────────────────────
function CancelModal({
  onConfirm, onClose, loading,
}: {
  onConfirm: (atCycleEnd: boolean) => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <h2 className="text-lg font-bold text-white">Cancel Premium?</h2>
        </div>
        <p className="text-sm text-[#8b949e] mb-6">
          Cancelling will stop your subscription. Choose when it takes effect:
        </p>
        <div className="space-y-3 mb-6">
          <button
            onClick={() => onConfirm(true)}
            disabled={loading}
            className="w-full text-left bg-[#1c2333] hover:bg-[#21262d] border border-[#30363d] rounded-xl p-4 transition-colors"
          >
            <p className="text-sm font-semibold text-white mb-1">Cancel at end of billing cycle</p>
            <p className="text-xs text-[#8b949e]">Keep all premium benefits until your next renewal date. Recommended.</p>
          </button>
          <button
            onClick={() => onConfirm(false)}
            disabled={loading}
            className="w-full text-left bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl p-4 transition-colors"
          >
            <p className="text-sm font-semibold text-red-400 mb-1">Cancel immediately</p>
            <p className="text-xs text-[#8b949e]">Premium access ends right now. No refund for remaining days.</p>
          </button>
        </div>
        <button onClick={onClose} disabled={loading} className="w-full py-3 text-sm text-[#8b949e] hover:text-white transition-colors">
          Keep Premium
        </button>
      </div>
    </div>
  );
}

// ─── benefit card ─────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: <BarChart2 className="w-5 h-5" />,
    color: 'green',
    title: 'Lowest Commission — 10%',
    desc: 'Compared to 12–15% for standard vendors. At ₹1L/month revenue, you save ₹5,000+.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    color: 'blue',
    title: '40 Leads / Month Cap',
    desc: 'Standard cap is 8–18 leads. Premium gives you 40, maximising your calendar fill rate.',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'orange',
    title: '+15 Algorithm Score Boost',
    desc: 'Permanent 15-point boost in the lead-assignment algorithm. More Position #1 leads.',
  },
  {
    icon: <BadgeCheck className="w-5 h-5" />,
    color: 'amber',
    title: 'Verified Partner Badge',
    desc: 'Gold badge on your public profile and marketplace listing. Builds instant client trust.',
  },
  {
    icon: <Star className="w-5 h-5" />,
    color: 'purple',
    title: 'Homepage Showcase',
    desc: 'Your portfolio featured on the EventDhara homepage — free exposure to all site visitors.',
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    color: 'cyan',
    title: '2-Hour Priority Support',
    desc: 'Dedicated support queue with 2-hour response guarantee vs. 24 hours for standard.',
  },
];

const COLOR_MAP: Record<string, string> = {
  green:  'bg-green-500/10 text-green-400',
  blue:   'bg-blue-500/10 text-blue-400',
  orange: 'bg-orange-500/10 text-orange-400',
  amber:  'bg-amber-500/10 text-amber-400',
  purple: 'bg-purple-500/10 text-purple-400',
  cyan:   'bg-cyan-500/10 text-cyan-400',
};

// ─── main page ────────────────────────────────────────────────────────────────
export default function PremiumPage() {
  const [data, setData]               = useState<PremiumData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling]   = useState(false);
  const [showCancel, setShowCancel]   = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api('/vendor/premium/status/');
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Razorpay checkout ─────────────────────────────────────────────────── */
  const handleSubscribe = async () => {
    setSubscribing(true);
    setMsg(null);
    try {
      const r = await api('/vendor/premium/subscribe/', { method: 'POST' });
      const d = await r.json();

      if (!r.ok) {
        setMsg({ text: d.message || 'Could not initiate subscription.', type: 'error' });
        return;
      }

      // If Razorpay key is present, open checkout modal
      if (d.razorpay_key && d.subscription_id) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay({
            key: d.razorpay_key,
            subscription_id: d.subscription_id,
            name: d.name || 'EventDhara Premium',
            description: d.description,
            amount: 99900,
            currency: 'INR',
            prefill: d.prefill,
            theme: { color: '#f59e0b' },
            handler: () => {
              setMsg({ text: '🎉 Payment successful! Your premium is being activated. Refresh in a moment.', type: 'success' });
              setTimeout(loadData, 3000);
            },
            modal: { ondismiss: () => setMsg({ text: 'Checkout closed. You can retry anytime.', type: 'info' }) },
          });
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        // No Razorpay configured — show admin message
        setMsg({ text: d.message || 'Subscription requested. Admin will enable premium shortly.', type: 'info' });
      }
    } catch {
      setMsg({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSubscribing(false);
    }
  };

  /* ── Cancel subscription ───────────────────────────────────────────────── */
  const handleCancel = async (atCycleEnd: boolean) => {
    setCancelling(true);
    setShowCancel(false);
    try {
      const r = await api('/vendor/premium/cancel/', {
        method: 'POST',
        body: JSON.stringify({ cancel_at_cycle_end: atCycleEnd }),
      });
      const d = await r.json();
      setMsg({ text: d.message || 'Cancellation processed.', type: r.ok ? 'info' : 'error' });
      if (r.ok) setTimeout(loadData, 1500);
    } catch {
      setMsg({ text: 'Cancellation request failed. Please try again.', type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  /* ── Loading state ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const isPremium  = data?.is_premium ?? false;
  const isEligible = data?.is_eligible ?? false;
  const daysLeft   = daysUntil(data?.premium_expires_at ?? null);

  return (
    <>
      {showCancel && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          loading={cancelling}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Banner ──────────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden border rounded-2xl p-8 ${
          isPremium
            ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-[#161b22] border-amber-500/30'
            : 'bg-[#161b22] border-[#30363d]'
        }`}>
          {isPremium && (
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          )}

          <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${
              isPremium
                ? 'bg-gradient-to-br from-amber-400 to-orange-600'
                : 'bg-[#1c2333] border border-[#30363d]'
            }`}>
              <Crown className={`w-10 h-10 ${isPremium ? 'text-white' : 'text-[#8b949e]'}`} />
            </div>

            <div className="flex-1">
              {isPremium ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                    <Sparkles className="w-3 h-3" /> Active Premium Partner
                  </div>
                  <h1 className="text-3xl font-black text-white mb-1">EventDhara Premium</h1>
                  <p className="text-amber-200 text-sm">Paying only 10% commission — the best deal on the platform.</p>
                  <div className="mt-4 flex flex-wrap gap-6 justify-center md:justify-start text-sm">
                    <span className="text-[#8b949e]">
                      Since:{' '}
                      <span className="text-white font-semibold">
                        {data?.premium_since ? new Date(data.premium_since).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </span>
                    <span className="text-[#8b949e]">
                      Renews:{' '}
                      <span className="text-white font-semibold">
                        {data?.premium_expires_at ? new Date(data.premium_expires_at).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </span>
                    {daysLeft > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                        <Calendar className="w-4 h-4" /> {daysLeft} days remaining
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-white mb-1">EventDhara Premium</h1>
                  <p className="text-[#8b949e]">₹999/mo — Maximize bookings with priority leads and the lowest commission.</p>
                </>
              )}
            </div>

            {isPremium && (
              <button
                onClick={() => setShowCancel(true)}
                className="shrink-0 text-xs text-[#8b949e] hover:text-red-400 transition-colors mt-2 md:mt-0"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>

        {/* ── Flash message ───────────────────────────────────────────── */}
        {msg && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            msg.type === 'error'   ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                     'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}>
            <span className="flex-1">{msg.text}</span>
            <button onClick={() => setMsg(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* ── NON-PREMIUM: upgrade flow ───────────────────────────────── */}
        {!isPremium && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left column: eligibility + CTA */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Upgrade to Premium</h2>
                <p className="text-sm text-[#8b949e]">
                  Exclusive for vendors who've proven reliability — requires 15 completed orders.
                </p>
              </div>

              {/* Eligibility progress */}
              <div className="bg-[#1c2333] border border-[#30363d] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white">Eligibility Progress</span>
                  <span className="text-sm font-bold text-amber-400">{data?.completed_orders ?? 0} / 15 orders</span>
                </div>
                <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(((data?.completed_orders ?? 0) / 15) * 100, 100)}%` }}
                  />
                </div>
                {isEligible ? (
                  <div className="flex items-center gap-2 mt-3 text-xs text-green-400">
                    <CheckCircle className="w-4 h-4" /> You're eligible — upgrade now!
                  </div>
                ) : (
                  <p className="text-xs text-[#8b949e] mt-3">
                    Complete <strong className="text-white">{data?.orders_needed_for_eligibility} more order{data?.orders_needed_for_eligibility !== 1 ? 's' : ''}</strong> to unlock Premium.
                  </p>
                )}
              </div>

              {/* Pricing card */}
              <div className="bg-[#161b22] border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_40px_-15px_rgba(245,158,11,0.25)]">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <h3 className="font-bold text-white">Premium Partner Plan</h3>
                    <p className="text-xs text-[#8b949e] mt-0.5">Cancel anytime</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-amber-400">₹999</span>
                    <span className="text-xs text-[#8b949e]">/month</span>
                  </div>
                </div>
                <p className="text-xs text-[#8b949e] mb-5">
                  Commission drops from <span className="text-white font-semibold">{data?.current_commission}</span> to <span className="text-green-400 font-semibold">10%</span>
                </p>

                <ul className="space-y-2 mb-6">
                  {['10% commission',  '40 leads / month', '+15 score boost', 'Partner badge', 'Priority support'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleSubscribe}
                  disabled={!isEligible || subscribing}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isEligible
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-500/20 active:scale-[0.98]'
                      : 'bg-[#30363d] text-[#8b949e] cursor-not-allowed opacity-60'
                  }`}
                >
                  {subscribing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : isEligible ? (
                    <><Crown className="w-4 h-4" /> Subscribe via Razorpay<ChevronRight className="w-4 h-4" /></>
                  ) : (
                    'Locked — complete 15 orders first'
                  )}
                </button>
              </div>
            </div>

            {/* Right column: ROI calculator */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Is it worth it?</h2>
                <p className="text-sm text-[#8b949e]">See exactly how much you save every month.</p>
              </div>
              <SavingsCalculator current_commission={data?.current_commission ?? '15%'} />

              {/* Comparison table */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#30363d]">
                      <th className="text-left p-4 text-[#8b949e] font-medium">Feature</th>
                      <th className="text-center p-4 text-[#8b949e] font-medium">Standard</th>
                      <th className="text-center p-4 text-amber-400 font-semibold">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {[
                      ['Commission', data?.current_commission ?? '15%', '10%'],
                      ['Monthly leads', `${data?.current_lead_cap ?? 8}–18`, '40'],
                      ['Score boost', '—', '+15 pts'],
                      ['Partner badge', '—', '✓'],
                      ['Support SLA', '24 hrs', '2 hrs'],
                    ].map(([feat, std, prem]) => (
                      <tr key={feat} className="hover:bg-[#0d1117] transition-colors">
                        <td className="px-4 py-3 text-[#8b949e]">{feat}</td>
                        <td className="px-4 py-3 text-center text-[#8b949e]">{std}</td>
                        <td className="px-4 py-3 text-center text-amber-400 font-semibold">{prem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PREMIUM ACTIVE: benefit cards ───────────────────────────── */}
        {isPremium && (
          <>
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Your Active Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex gap-4 hover:border-[#8b949e]/40 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${COLOR_MAP[b.color]}`}>
                      {b.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">{b.title}</h4>
                      <p className="text-xs text-[#8b949e] leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI calculator even for active premium */}
            <SavingsCalculator current_commission={data?.current_commission ?? '10%'} />

            {/* Subscription details */}
            <div className="bg-[#1c2333] border border-[#30363d] rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> Subscription Details
              </h3>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                {[
                  ['Plan', 'EventDhara Premium Partner'],
                  ['Price', '₹999 / month (auto-renews)'],
                  ['Commission', '10% per completed order'],
                  ['Lead cap', '40 leads / month'],
                  ['Subscription ID', data?.razorpay_subscription_id ?? '—'],
                  ['Active since', data?.premium_since ? new Date(data.premium_since).toLocaleDateString('en-IN') : '—'],
                  ['Next renewal', data?.premium_expires_at ? new Date(data.premium_expires_at).toLocaleDateString('en-IN') : '—'],
                  ['Status', '🟢 Active'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[#8b949e]">{k}</dt>
                    <dd className="text-white font-medium truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        )}
      </div>
    </>
  );
}
