"use client";

import { useEffect, useState } from "react";
import { fetchLeadPipeline, reassignLead } from "@/lib/adminApi";
import { ListFilter, Clock, AlertCircle, PhoneCall, RefreshCw, UserCheck } from "lucide-react";

export default function LeadPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reassigningId, setReassigningId] = useState<number | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeadPipeline();
      setLeads(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load leads pipeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 30000); // 30 sec refresh
    return () => clearInterval(interval);
  }, []);

  const handleReassign = async (rawId: number) => {
    if (!confirm("Force reassign this lead to a new vendor?")) return;
    setReassigningId(rawId);
    try {
      await reassignLead(rawId);
      await loadLeads();
    } catch (err: any) {
      alert(err.message || "Failed to reassign lead");
    } finally {
      setReassigningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ListFilter className="h-6 w-6 text-indigo-400" /> Lead Pipeline
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Real-time tracking of all active leads (last 24 hours).</p>
        </div>
        <button 
          onClick={loadLeads} 
          disabled={loading} 
          className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e2336] p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <ListFilter className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Leads</p>
            <p className="text-2xl font-bold text-white">{leads.length}</p>
          </div>
        </div>
        <div className="bg-[#1e2336] p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Assignment</p>
            <p className="text-2xl font-bold text-white">
              {leads.filter(l => l.status === 'Pending' || l.status === 'Urgent').length}
            </p>
          </div>
        </div>
        <div className="bg-[#1e2336] p-5 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Accepted</p>
            <p className="text-2xl font-bold text-white">
              {leads.filter(l => l.status === 'Accepted').length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#1e2336] border border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700">
                <th className="px-6 py-4 font-semibold">Lead ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Assignment</th>
                <th className="px-6 py-4 font-semibold">Aging Timer</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="h-8 w-8 text-indigo-500/50 animate-spin mx-auto mb-3" />
                    Loading pipeline...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No leads found in the past 24 hours.</td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isExpired = lead.status === "Pending" && lead.age_minutes > 15;
                  
                  return (
                    <tr key={lead.raw_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-indigo-300 font-medium">{lead.query_id}</div>
                        {lead.is_urgent && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="h-3 w-3" /> Urgent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">{lead.user_name}</div>
                        <div className="text-xs text-slate-500 max-w-[150px] truncate">{lead.city}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{lead.service}</div>
                        <div className="text-xs text-slate-500">For: {lead.service_date}</div>
                        {lead.approx_budget > 0 && (
                          <div className="text-xs text-emerald-400/80 mt-1">₹{lead.approx_budget?.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            lead.status === 'Accepted' ? 'bg-emerald-500' : 
                            lead.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          <span className={`${
                            lead.status === 'Accepted' ? 'text-emerald-400' : 'text-slate-300'
                          }`}>{lead.vendor}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{lead.status}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-mono text-lg ${
                          lead.status === 'Accepted' ? 'text-emerald-500/50' :
                          isExpired ? 'text-rose-500 font-bold' : 'text-amber-400'
                        }`}>
                          {lead.status === 'Accepted' ? '—' : `${lead.age_minutes}m`}
                        </div>
                        {isExpired && (
                          <div className="text-[10px] text-rose-500 uppercase tracking-widest mt-1">Timer Breached</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(lead.status === 'Pending' || lead.status === 'Urgent' || isExpired) ? (
                          <button
                            onClick={() => handleReassign(lead.raw_id)}
                            disabled={reassigningId === lead.raw_id}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                              isExpired 
                                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            {reassigningId === lead.raw_id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <PhoneCall className="h-4 w-4" /> 
                                {isExpired ? 'Force Reassign' : 'Reassign'}
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No action needed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
