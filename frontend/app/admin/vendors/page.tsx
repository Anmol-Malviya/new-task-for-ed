"use client";

import { useEffect, useState } from "react";
import { fetchVendorScoreboard, suspendVendor } from "@/lib/adminApi";
import { Store, RefreshCw, Trophy, ShieldAlert, Award, TrendingUp, AlertTriangle } from "lucide-react";

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await fetchVendorScoreboard();
      setVendors(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load vendor scoreboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleSuspendToggle = async (vendorId: number, isSuspended: boolean, name: string) => {
    const action = isSuspended ? 'unsuspend' : 'suspend';
    if (!confirm(`Are you sure you want to ${action} ${name}?`)) return;
    
    setActionId(vendorId);
    try {
      await suspendVendor(vendorId, action);
      await loadVendors();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} vendor`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Store className="h-6 w-6 text-pink-500" /> Vendor Scoreboard
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Gamified ranking based on total GMV and AI Algorithm scoring. 1-click suspension controls.</p>
        </div>
        <button onClick={loadVendors} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4 pt-4">
        {vendors.slice(0, 3).map((v, i) => (
          <div key={v.vendor_id} className={`relative bg-[#1e2336] p-6 rounded-2xl border ${
            i === 0 ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] transform md:-translate-y-4' : 
            i === 1 ? 'border-slate-400/50' : 'border-amber-700/50'
          }`}>
            <div className={`absolute -top-4 -right-4 h-12 w-12 rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-lg ${
              i === 0 ? 'bg-yellow-500 text-yellow-900' :
              i === 1 ? 'bg-slate-300 text-slate-700' : 'bg-amber-600 text-amber-100'
            }`}>
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1 truncate">{v.business_name}</h3>
              <p className="text-slate-400 text-sm mb-4">{v.city}</p>
              
              <div className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: i === 0 ? 'linear-gradient(to right, #fef08a, #eab308)' : i === 1 ? 'linear-gradient(to right, #e2e8f0, #94a3b8)' : 'linear-gradient(to right, #fcd34d, #d97706)' }}>
                {v.score}
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Algorithm Score</p>
              
              <div className="flex justify-between items-center text-sm border-t border-slate-700/50 pt-4">
                <span className="text-slate-400">Total GMV</span>
                <span className="text-emerald-400 font-semibold">₹{((v.total_gmv || 0)/1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-[#1e2336] border border-slate-700/50 rounded-xl overflow-hidden shadow-lg mt-8">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" /> Full Leaderboard
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-700">
                <th className="px-6 py-4 font-semibold w-16">Rank</th>
                <th className="px-6 py-4 font-semibold">Vendor Details</th>
                <th className="px-6 py-4 font-semibold">Total Leads Assigned</th>
                <th className="px-6 py-4 font-semibold">Total GMV</th>
                <th className="px-6 py-4 font-semibold">Algo Score</th>
                <th className="px-6 py-4 font-semibold text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && vendors.length === 0 ? (
                 <tr>
                 <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                   <RefreshCw className="h-8 w-8 text-indigo-500/50 animate-spin mx-auto mb-3" />
                   Calculating scores...
                 </td>
               </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No active vendors found.</td>
                </tr>
              ) : (
                vendors.map((v, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={v.vendor_id} className={`hover:bg-slate-800/30 transition-colors ${
                      v.is_suspended ? 'opacity-50 grayscale bg-rose-500/5' : ''
                    }`}>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${
                          rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                          rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                          rank === 3 ? 'bg-amber-600/20 text-amber-500' : 'text-slate-500 font-mono text-lg'
                        }`}>
                          #{rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-semibold ${v.is_suspended ? 'text-rose-400 line-through' : 'text-white'}`}>
                          {v.business_name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{v.city} · {v.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 font-medium">{v.leads_assigned || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-emerald-400 font-semibold">₹{(v.total_gmv || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`h-4 w-4 ${v.score > 50 ? 'text-emerald-500' : 'text-rose-500'}`} />
                          <span className="font-mono text-lg font-bold text-indigo-300">{v.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={actionId === v.vendor_id}
                          onClick={() => handleSuspendToggle(v.vendor_id, v.is_suspended, v.business_name)}
                          className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            v.is_suspended 
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                          }`}
                        >
                          {actionId === v.vendor_id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldAlert className="h-3.5 w-3.5" /> 
                              {v.is_suspended ? 'Unsuspend' : 'Suspend'}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
