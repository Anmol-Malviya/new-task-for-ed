'use client';
import { useEffect, useState, useCallback } from 'react';
import { IndianRupee, TrendingUp, Clock, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers } });
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [eRes, pRes] = await Promise.all([
      api('/vendor/earnings/'),
      api('/vendor/payouts/')
    ]);
    if (eRes.ok) setEarnings(await eRes.json());
    if (pRes.ok) setPayouts(await pRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Earnings & Payouts</h1>
        <p className="text-sm text-[#8b949e] mt-1">Track your revenue, commissions, and bank transfers.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-400">Total Cleared</span>
          </div>
          <p className="text-3xl font-black text-white">₹{(earnings?.total_earned || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#8b949e] mt-1">All time completed payouts</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-blue-400">Pending & Processing</span>
          </div>
          <p className="text-3xl font-black text-white">₹{(earnings?.pending_payout || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#8b949e] mt-1">Expected within 72 hrs</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-sm font-medium text-orange-400">This Month</span>
          </div>
          <p className="text-3xl font-black text-white">₹{(earnings?.this_month || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#8b949e] mt-1">{earnings?.this_month_orders || 0} orders completed</p>
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Current Commission Rate: <span className="text-orange-400">{earnings?.commission_rate || '15%'}</span></h2>
            <p className="text-xs text-[#8b949e] mt-1">
              {earnings?.tier === 'premium' ? 'You have the lowest rate (10%) as a Premium Partner.' :
               earnings?.tier === 'active' ? 'You unlocked the 12% rate! Upgrade to Premium for 10%.' :
               'Complete 5 orders to unlock the 12% rate, or upgrade to Premium for 10% immediately.'}
            </p>
          </div>
          {earnings?.tier !== 'premium' && (
             <Link href="/vendor-dashboard/premium" className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-all">
               Upgrade
             </Link>
          )}
        </div>
      </div>

      {/* Payout History */}
      <h2 className="text-lg font-bold text-white mt-8 mb-4">Payout History</h2>
      
      {payouts.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center">
           <IndianRupee className="w-10 h-10 text-[#30363d] mx-auto mb-3" />
           <p className="text-[#8b949e] text-sm">No payouts yet.</p>
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden divide-y divide-[#30363d]">
          {payouts.map((p) => (
            <div key={p.payout_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors">
               <div>
                 <div className="flex items-center gap-2">
                   <p className="font-semibold text-white">Order #{p.order_id}</p>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${p.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                        p.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                        p.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'}`
                   }>
                     {p.status}
                   </span>
                 </div>
                 <p className="text-xs text-[#8b949e] mt-1">
                   {new Date(p.initiated_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                 </p>
                 {p.status === 'completed' && p.completed_at && (
                    <p className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Cleared: {new Date(p.completed_at).toLocaleDateString('en-IN')}
                    </p>
                 )}
                 {p.status === 'pending' && (
                    <p className="text-[10px] text-yellow-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Processing usually takes 24-72 hrs
                    </p>
                 )}
               </div>

               <div className="flex items-center gap-6 sm:justify-end border-t sm:border-t-0 border-[#30363d] pt-3 sm:pt-0">
                 <div className="text-right">
                   <p className="text-[10px] text-[#8b949e] uppercase">Gross</p>
                   <p className="text-sm text-white">₹{(p.gross_amount || 0).toLocaleString('en-IN')}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] text-[#8b949e] uppercase">Fee ({p.commission_rate})</p>
                   <p className="text-sm text-red-400">-₹{(p.commission_amount || 0).toLocaleString('en-IN')}</p>
                 </div>
                 <div className="text-right lg:w-32">
                   <p className="text-[10px] text-[#8b949e] uppercase">Net Payout</p>
                   <p className={`text-lg font-bold ${p.status === 'completed' ? 'text-green-400' : 'text-white'}`}>
                     ₹{(p.net_amount || 0).toLocaleString('en-IN')}
                   </p>
                 </div>
                 <Link href={`/vendor-dashboard/orders/${p.order_id}`} className="shrink-0">
                   <ChevronRight className="w-5 h-5 text-[#8b949e] group-hover:text-orange-400 transition-colors" />
                 </Link>
               </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1c2333] border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[#8b949e]">
          <p className="font-semibold text-blue-400 mb-1">Payout Protocol</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Payouts are triggered automatically when an order is marked as <span className="text-white">Delivered</span>.</li>
            <li>Funds are transferred via Razorpay Route to your verified bank account.</li>
            <li>Standard settlement takes <span className="text-white">T+2 days</span> (2-3 business days excluding bank holidays).</li>
            <li>If a client raises a dispute, the payout is held until resolution.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
