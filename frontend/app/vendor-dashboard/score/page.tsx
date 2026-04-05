'use client';
import { useEffect, useState, useCallback } from 'react';
import { Star, ShieldAlert, Award, TrendingUp, Info, Activity } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers } });
};

export default function ScorePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const r = await api('/vendor/score/');
    if (r.ok) setData(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  const scorePct = ((data?.score || 0) / 100) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Performance Score & Tier</h1>
        <p className="text-sm text-[#8b949e] mt-1">Your score determines your placement in the lead assignment queue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Score Visual */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
           {data?.has_new_vendor_boost && (
             <div className="absolute top-0 inset-x-0 bg-blue-500/20 text-blue-400 text-[10px] font-bold py-1 uppercase tracking-widest border-b border-blue-500/20">
               +20 New Vendor Boost Active
             </div>
           )}
           <div className={`mt-4 w-32 h-32 relative flex flex-col items-center justify-center ${data?.score >= 80 ? 'text-green-400' : data?.score >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
             <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="#30363d" strokeWidth="8" />
               <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                 strokeLinecap="round" strokeDasharray={`${scorePct * 2.827} ${282.7 - scorePct * 2.827}`} className="transition-all duration-1000 ease-out" />
             </svg>
             <span className="text-4xl font-black">{data?.score || 0}</span>
             <span className="text-[10px] text-[#8b949e] uppercase mt-1">Out of 100</span>
           </div>
           
           <div className="mt-6 w-full">
             <div className="flex justify-between items-end mb-2">
               <span className="text-sm font-bold text-white uppercase tracking-wider">{data?.tier || 'Starter'} Tier</span>
               <span className="text-xs text-[#8b949e]">
                 Next recalculation: {data?.next_recalculation ? new Date(data.next_recalculation).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric'}) : 'Monday'}
               </span>
             </div>
             {data?.tier !== 'premium' && (
               <Link href="/vendor-dashboard/premium" className="block w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400 transition-colors uppercase tracking-widest">
                 Upgrade to Premium
               </Link>
             )}
           </div>
        </div>

        {/* Breakdown */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            Current Metrics
          </h2>
          <div className="space-y-4">
             <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-sm text-[#8b949e]">Response Rate (30d)</span>
                 <span className="text-sm font-bold text-white">{data?.breakdown?.response_rate || 0}%</span>
               </div>
               <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data?.breakdown?.response_rate || 0}%` }} />
               </div>
               <p className="text-[10px] text-[#8b949e] mt-2">Leads accepted ÷ Leads received. Drops when you let timer expire.</p>
             </div>

             <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-sm text-[#8b949e]">Avg Cust Rating</span>
                 <span className="text-sm font-bold text-amber-400">{data?.breakdown?.avg_rating ? data.breakdown.avg_rating.toFixed(1) : '—'} ★</span>
               </div>
               <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((data?.breakdown?.avg_rating || 0)/5)*100}%` }} />
               </div>
               <p className="text-[10px] text-[#8b949e] mt-2">Driven by post-event client reviews.</p>
             </div>

             <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-sm text-[#8b949e]">Completion Rate</span>
                 <span className="text-sm font-bold text-green-400">{data?.breakdown?.completion_rate || 0}%</span>
               </div>
               <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 rounded-full" style={{ width: `${data?.breakdown?.completion_rate || 0}%` }} />
               </div>
               <p className="text-[10px] text-[#8b949e] mt-2">Orders marked 'Delivered' ÷ Orders Accepted.</p>
             </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#1c2333] border border-[#30363d] rounded-2xl p-5">
         <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
           <Info className="w-5 h-5 text-blue-400" />
           The Assignment Algorithm
         </h2>
         <p className="text-sm text-[#8b949e] leading-relaxed mb-4">
           EventDhara routes new event leads sequentially (Vendor 1 → Vendor 2 → Vendor 3). Only one vendor sees the lead at a time. They have 20 minutes to accept. Position #1 always goes to the vendor with the highest match score.
         </p>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(data?.score_factors || {}).map(([k, v]: [string, any]) => (
              <div key={k} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3">
                <p className="text-[10px] uppercase text-[#8b949e] font-bold mb-1">{k.replace(/_/g, ' ')}</p>
                <p className="text-sm text-white font-medium">{v}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Audit Log */}
      <div>
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Recent Score Changes
        </h2>
        {data?.recent_changes?.length === 0 ? (
          <p className="text-sm text-[#8b949e]">No recent score changes.</p>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden divide-y divide-[#30363d]">
            {data?.recent_changes?.map((log: any) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                <div>
                  <p className="text-sm text-white font-medium">{log.reason}</p>
                  <p className="text-[10px] text-[#8b949e] mt-0.5">
                    {new Date(log.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8b949e] font-mono">{log.old_score} → {log.new_score}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold font-mono min-w-[40px] text-center ${log.delta > 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {log.delta > 0 ? '+' : ''}{log.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
