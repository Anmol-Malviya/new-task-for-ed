'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone, CheckCircle, IndianRupee, MapPin, Calendar,
  Clock, AlertTriangle, ArrowLeft, Star, MessageSquare,
  Shield, Package, User
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, {
    ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
};

const PIPELINE = [
  { key: 'lead_accepted', label: 'Lead Accepted', desc: 'Call the client and agree on final price' },
  { key: 'price_confirmed', label: 'Price Confirmed', desc: 'Payment link sent to client automatically' },
  { key: 'payment_received', label: 'Payment Received', desc: 'Full address unlocked — confirm D-1 readiness' },
  { key: 'd1_ready', label: 'D-1 Ready', desc: 'You\'re confirmed for tomorrow — arrive on time!' },
  { key: 'delivered', label: 'Delivered', desc: 'Client will confirm. Payout in 24-72 hours.' },
  { key: 'paid_out', label: 'Paid Out', desc: '85% payout transferred to your bank account' },
];

const STATUS_COLOR: Record<string, string> = {
  lead_accepted: 'text-blue-400', price_confirmed: 'text-purple-400',
  payment_received: 'text-yellow-400', d1_ready: 'text-orange-400',
  delivered: 'text-green-400', paid_out: 'text-emerald-400',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalAmount, setFinalAmount] = useState('');
  const [msg, setMsg] = useState('');

  const loadOrder = useCallback(async () => {
    const r = await api(`/vendor/orders/${orderId}/`);
    if (r.ok) { const d = await r.json(); setOrder(d); }
    setLoading(false);
  }, [orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  const confirmPrice = async () => {
    if (!finalAmount) return;
    setSaving(true); setMsg('');
    const r = await api(`/vendor/orders/${orderId}/confirm-price/`, {
      method: 'PATCH', body: JSON.stringify({ final_amount: parseFloat(finalAmount) }),
    });
    const d = await r.json();
    setMsg(d.message || (r.ok ? 'Price confirmed!' : 'Error'));
    if (r.ok) await loadOrder();
    setSaving(false);
  };

  const markDelivered = async () => {
    if (!confirm('Mark this order as delivered? This will start the payout process.')) return;
    setSaving(true);
    const r = await api(`/vendor/orders/${orderId}/mark-delivered/`, { method: 'PATCH' });
    const d = await r.json();
    setMsg(d.message || (r.ok ? 'Marked delivered!' : 'Error'));
    if (r.ok) await loadOrder();
    setSaving(false);
  };

  const initiateCall = async () => {
    setSaving(true);
    const r = await api(`/vendor/orders/${orderId}/call/`, { method: 'POST' });
    const d = await r.json();
    setMsg(d.message || 'Call initiated');
    setSaving(false);
  };

  const markD1Ready = async (isReady: boolean) => {
    setSaving(true);
    const r = await api(`/vendor/orders/${orderId}/d1-ready/`, {
      method: 'PATCH', body: JSON.stringify({ is_ready: isReady, needs_help: !isReady }),
    });
    const d = await r.json();
    setMsg(d.message);
    if (r.ok) await loadOrder();
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-12 text-[#8b949e]">Order not found.</div>
  );

  const curIdx = PIPELINE.findIndex(p => p.key === order.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#8b949e] hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#8b949e] mb-1">Order #{order.order_id}</p>
            <h1 className="text-xl font-bold text-white capitalize">{order.occasion || 'Event'} Decoration</h1>
            {order.event_date && (
              <div className="flex items-center gap-1.5 text-sm text-[#8b949e] mt-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.event_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                {order.arrival_time && <span className="text-orange-400">· {order.arrival_time}</span>}
              </div>
            )}
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-xl bg-[#1c2333] border border-[#30363d] ${STATUS_COLOR[order.status] || 'text-[#8b949e]'}`}>
            {PIPELINE.find(p => p.key === order.status)?.label || order.status}
          </span>
        </div>
      </div>

      {/* Pipeline stepper */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4">Order Pipeline</h2>
        <div className="space-y-0">
          {PIPELINE.map((step, i) => {
            const done = i <= curIdx;
            const active = i === curIdx;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    done ? 'bg-orange-500 border-orange-500 text-white' :
                    active ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                    'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                  }`}>
                    {done && i < curIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 transition-all ${i < curIdx ? 'bg-orange-500' : 'bg-[#30363d]'}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`font-medium text-sm ${done ? 'text-white' : 'text-[#8b949e]'}`}>{step.label}</p>
                  {active && <p className="text-xs text-orange-400 mt-0.5">{step.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financials */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4">Financial Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#8b949e]">Approx Budget</span>
            <span className="text-white">₹{(order.approx_budget || 0).toLocaleString('en-IN')}</span>
          </div>
          {order.final_amount && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Final Amount</span>
                <span className="font-bold text-white">₹{order.final_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-[#30363d]" />
              <div className="flex justify-between text-sm">
                <span className="text-[#8b949e]">Commission ({Math.round((order.commission_rate || 0.15) * 100)}%)</span>
                <span className="text-red-400">−₹{(order.commission_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-white">Your Payout (85%)</span>
                <span className="text-2xl font-black text-green-400">₹{(order.vendor_payout_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#8b949e]">
                <IndianRupee className="w-3 h-3" /> Payout status: <span className="text-white font-medium">{order.payout_status}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Client info (gated) */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4">Client Information</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-[#8b949e] shrink-0" />
            <div>
              <p className="text-xs text-[#8b949e]">Client Name</p>
              <p className="text-sm text-white font-medium">{order.client_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#8b949e] shrink-0" />
            <div>
              <p className="text-xs text-[#8b949e]">Phone ({order.full_address ? 'D-1 direct' : 'masked'})</p>
              <p className="text-sm text-white font-mono">{order.client_phone}</p>
            </div>
          </div>
          {order.full_address ? (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8b949e]">Full Address (Unlocked)</p>
                <p className="text-sm text-white">{order.full_address}</p>
                {order.floor_details && <p className="text-xs text-[#8b949e] mt-1">Floor: {order.floor_details}</p>}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 text-xs text-yellow-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Full address hidden until payment confirmed
            </div>
          )}
          {order.city_area && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#8b949e] shrink-0" />
              <div>
                <p className="text-xs text-[#8b949e]">City Area</p>
                <p className="text-sm text-white">{order.city_area}</p>
              </div>
            </div>
          )}
          {order.theme_notes && (
            <div className="flex items-start gap-3">
              <Star className="w-4 h-4 text-[#8b949e] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#8b949e]">Theme Notes</p>
                <p className="text-sm text-white">{order.theme_notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {msg && (
        <div className={`p-3 rounded-xl text-sm border ${msg.toLowerCase().includes('error') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {msg}
        </div>
      )}

      {/* Call Button */}
      {['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready'].includes(order.status) && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-white">Call Client</h2>
              <p className="text-xs text-[#8b949e]">Via masked relay — real numbers hidden on both sides</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-white">{order.relay_phone || '88XX XXXX XX'}</p>
              <p className="text-[10px] text-[#8b949e]">Relay number</p>
            </div>
          </div>
          <button
            onClick={initiateCall} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            <Phone className="w-4 h-4" /> Initiate Masked Call
          </button>
          <div className="mt-3 space-y-1">
            {['Do NOT share your personal number or Instagram', 'Do NOT ask for direct UPI payment', 'Do NOT offer discounts for direct bookings'].map(r => (
              <p key={r} className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {r}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Price */}
      {order.status === 'lead_accepted' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-1">Confirm Final Price</h2>
          <p className="text-xs text-[#8b949e] mb-4">After calling the client and agreeing on a price, enter it here. A payment link will be sent to the client automatically.</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] text-sm">₹</span>
              <input
                type="number" value={finalAmount} onChange={e => setFinalAmount(e.target.value)}
                placeholder="Enter agreed amount"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-7 pr-4 py-3 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              onClick={confirmPrice} disabled={saving || !finalAmount}
              className="px-5 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {saving ? '...' : 'Confirm'}
            </button>
          </div>
          {finalAmount && (
            <p className="text-xs text-green-400 mt-2">
              Your payout: ₹{Math.round(parseFloat(finalAmount) * (1 - (order.commission_rate || 0.15))).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}

      {/* D-1 Readiness */}
      {order.status === 'payment_received' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-1">D-1 Readiness Check</h2>
          <p className="text-xs text-[#8b949e] mb-4">Event is tomorrow. Confirm you're ready.</p>
          <div className="flex gap-3">
            <button onClick={() => markD1Ready(false)} disabled={saving}
              className="flex-1 py-3 rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-sm font-bold transition-all disabled:opacity-50">
              Need Help
            </button>
            <button onClick={() => markD1Ready(true)} disabled={saving}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all disabled:opacity-50">
              <CheckCircle className="w-4 h-4 inline mr-2" /> Ready to Go!
            </button>
          </div>
        </div>
      )}

      {/* Mark Delivered */}
      {order.status === 'd1_ready' && (
        <button onClick={markDelivered} disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-green-500/20">
          <CheckCircle className="w-5 h-5 inline mr-2" />
          {saving ? 'Processing...' : 'Mark Order as Delivered'}
        </button>
      )}

      {/* Payout info */}
      {order.status === 'delivered' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="font-bold text-green-400">Order Delivered!</p>
          <p className="text-sm text-[#8b949e] mt-1">
            Payout of <span className="text-white font-bold">₹{(order.vendor_payout_amount || 0).toLocaleString('en-IN')}</span> will be processed after client confirms or within 72 hours.
          </p>
        </div>
      )}

      {order.status === 'paid_out' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
          <IndianRupee className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="font-bold text-emerald-400">Payout Completed!</p>
          <p className="text-sm text-[#8b949e] mt-1">₹{(order.vendor_payout_amount || 0).toLocaleString('en-IN')} transferred to your bank account.</p>
        </div>
      )}

      {/* Platform rules reminder */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-white">Platform Rules</span>
        </div>
        <div className="space-y-1 text-xs text-[#8b949e]">
          <p>❌ Never share your personal phone or social media</p>
          <p>❌ Never ask for direct UPI payment outside EventDhara</p>
          <p>❌ Never try to book clients directly for future events</p>
          <p>✅ All communication and payments must go through EventDhara</p>
        </div>
      </div>
    </div>
  );
}
