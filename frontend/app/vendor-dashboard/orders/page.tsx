'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle, Phone, IndianRupee, Calendar, ChevronRight, MapPin } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers } });
};

const PIPELINE = ['lead_accepted', 'price_confirmed', 'payment_received', 'd1_ready', 'delivered', 'paid_out'];
const PIPELINE_LABELS: Record<string, string> = {
  lead_accepted: 'Lead Accepted', price_confirmed: 'Price Confirmed',
  payment_received: 'Payment Received', d1_ready: 'D-1 Ready',
  delivered: 'Delivered', paid_out: 'Paid Out',
};
const STATUS_COLOR: Record<string, string> = {
  lead_accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  price_confirmed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  payment_received: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  d1_ready: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  paid_out: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function PipelineStepper({ status }: { status: string }) {
  const cur = PIPELINE.indexOf(status);
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {PIPELINE.map((s, i) => {
        const done = i <= cur;
        const active = i === cur;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex flex-col items-center ${i > 0 ? 'ml-0' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                done ? 'bg-orange-500 border-orange-500 text-white' : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
              } ${active ? 'ring-2 ring-orange-400/30 ring-offset-2 ring-offset-[#161b22]' : ''}`}>
                {done ? <CheckCircle className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[8px] mt-1 whitespace-nowrap font-medium ${done ? 'text-orange-400' : 'text-[#8b949e]'}`}>
                {PIPELINE_LABELS[s].split(' ')[0]}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={`w-6 h-0.5 mx-0.5 mb-4 transition-all ${i < cur ? 'bg-orange-500' : 'bg-[#30363d]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const loadOrders = useCallback(async () => {
    const r = await api('/vendor/orders/');
    if (r.ok) { const d = await r.json(); setOrders(d); }
    setLoading(false);
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = filter === 'active'
    ? orders.filter(o => !['paid_out', 'cancelled'].includes(o.status))
    : filter === 'completed'
    ? orders.filter(o => o.status === 'paid_out')
    : orders;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Orders</h1>
        <p className="text-sm text-[#8b949e] mt-1">Track every job through the 6-stage pipeline.</p>
      </div>

      <div className="flex gap-2">
        {[['active', 'Active'], ['completed', 'Completed'], ['all', 'All']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === v ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'text-[#8b949e] hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-[#30363d] mx-auto mb-3" />
          <p className="text-[#8b949e] text-sm">No {filter} orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(o => (
            <Link key={o.order_id} href={`/vendor-dashboard/orders/${o.order_id}`}
              className="block bg-[#161b22] border border-[#30363d] hover:border-[#444] rounded-2xl overflow-hidden transition-all group">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white capitalize">{o.occasion || 'Event'} Decoration</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[o.status] || 'bg-[#30363d] text-[#8b949e] border-transparent'}`}>
                        {PIPELINE_LABELS[o.status] || o.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                      {o.city_area && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.city_area}</span>}
                      {o.event_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{o.event_date}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">
                      ₹{((o.vendor_payout_amount || o.final_amount || o.approx_budget || 0)).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-[#8b949e]">your payout</p>
                  </div>
                </div>
                {/* Pipeline stepper */}
                <PipelineStepper status={o.status} />
              </div>
              {/* Bottom bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#0d1117] border-t border-[#30363d]">
                <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                  <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />Commission: {o.commission_rate ? `${Math.round(o.commission_rate * 100)}%` : '—'}</span>
                  {o.relay_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.relay_phone}</span>}
                </div>
                <ChevronRight className="w-4 h-4 text-[#8b949e] group-hover:text-orange-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
