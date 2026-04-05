"use client";

import { useEffect, useState } from "react";
import { fetchDisputes, resolveDispute } from "@/lib/adminApi";
import { AlertTriangle, Clock, RefreshCw, HandCoins, CheckCircle2, PauseCircle } from "lucide-react";

export default function DisputeManagementPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [notes, setNotes] = useState<{ [key: number]: string }>({});

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await fetchDisputes();
      setDisputes(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleAction = async (disputeId: number, action: 'resolve'|'refund'|'hold') => {
    const confirmation = confirm(`Are you sure you want to ${action} this dispute?`);
    if (!confirmation) return;
    
    setActionId(disputeId);
    try {
      await resolveDispute(disputeId, action, notes[disputeId] || '');
      await loadDisputes();
    } catch (err: any) {
      alert(err.message || `Failed to perform ${action}`);
    } finally {
      setActionId(null);
    }
  };

  const handleNoteChange = (id: number, text: string) => {
    setNotes(prev => ({ ...prev, [id]: text }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-500" /> Dispute Management
          </h2>
          <p className="text-slate-400 mt-1 text-sm">48hr SLA countdown. Manual override for payouts and refunds.</p>
        </div>
        <button onClick={loadDisputes} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* Disputes Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading && disputes.length === 0 ? (
          <div className="xl:col-span-2 py-20 text-center text-slate-500">
            <RefreshCw className="h-10 w-10 text-indigo-500/50 animate-spin mx-auto mb-4" />
            Loading SLA queue...
          </div>
        ) : disputes.length === 0 ? (
          <div className="xl:col-span-2 bg-[#1e2336] p-12 rounded-xl border border-slate-800 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Zero Open Disputes!</h3>
            <p className="text-slate-400">Your SLA queue is completely clear.</p>
          </div>
        ) : (
          disputes.map((d) => {
            const isResolved = d.status === 'RESOLVED' || d.status === 'REFUNDED';
            const isBreached = d.is_sla_breached && !isResolved;
            
            return (
              <div key={d.dispute_id} className={`bg-[#1e2336] rounded-2xl border overflow-hidden transition-all shadow-lg ${
                isBreached ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-slate-700/50 hover:border-slate-600'
              }`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b flex justify-between items-start ${
                  isBreached ? 'bg-rose-500/10 border-rose-500/20' : 'bg-slate-800/30 border-slate-700/50'
                }`}>
                  <div>
                    <h3 className="font-bold text-white text-lg">Dispute #{d.dispute_id} <span className="text-slate-500 font-normal">| Order #{d.order_id}</span></h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded tracking-wider ${
                        d.status === 'OPEN' ? 'bg-amber-500/20 text-amber-500' :
                        d.status === 'PAYOUT_HELD' ? 'bg-purple-500/20 text-purple-400' :
                        d.status === 'REFUNDED' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {/* SLA Tracker Box */}
                  <div className={`text-right px-4 py-2 rounded-xl flex items-center justify-between gap-3 min-w-[140px] ${
                    isResolved ? 'bg-slate-800/80 text-emerald-500' :
                    isBreached ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold animate-pulse' : 
                    'bg-slate-800 text-amber-400'
                  }`}>
                    <Clock className="h-5 w-5" />
                    <div className="text-right">
                      <div className="text-sm font-mono tracking-wider">
                        {isResolved ? '00:00' : `${d.hours_remaining}h`}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                        {isResolved ? 'Closed' : isBreached ? 'Breached' : 'SLA Remaining'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase mb-1">User Complaint</p>
                      <p className="text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800 h-24 overflow-y-auto">
                        {d.user_complaint_text || <span className="italic text-slate-600">No text provided...</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase mb-1">System Reason</p>
                      <p className="text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800 h-24 overflow-y-auto">
                        {d.reason}
                      </p>
                    </div>
                  </div>

                  {!isResolved && (
                    <div className="pt-2">
                      <textarea
                        disabled={actionId !== null}
                        value={notes[d.dispute_id] || ''}
                        onChange={(e) => handleNoteChange(d.dispute_id, e.target.value)}
                        placeholder="Add resolution notes before taking action..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isResolved && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <button 
                        disabled={actionId !== null}
                        onClick={() => handleAction(d.dispute_id, 'hold')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-purple-500/50 text-slate-300 group transition-all"
                      >
                        <PauseCircle className="h-5 w-5 mb-2 group-hover:text-purple-400 transition-colors" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Hold Payout</span>
                      </button>
                      
                      <button 
                        disabled={actionId !== null}
                        onClick={() => handleAction(d.dispute_id, 'refund')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 group transition-all"
                      >
                        <HandCoins className="h-5 w-5 mb-2 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Issue Refund</span>
                      </button>

                      <button 
                        disabled={actionId !== null}
                        onClick={() => handleAction(d.dispute_id, 'resolve')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 group transition-all"
                      >
                        <CheckCircle2 className="h-5 w-5 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Mark Resolved</span>
                      </button>
                    </div>
                  )}
                  {isResolved && (
                    <div className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl text-sm">
                      <p className="text-slate-500 text-xs font-semibold uppercase mb-2">Resolution Note</p>
                      <p className="text-slate-300">{d.resolution_notes || '—'}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
