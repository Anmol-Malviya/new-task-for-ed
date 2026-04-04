"use client";

import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw, AlertTriangle } from "lucide-react";
import { fetchAdminQueries } from "@/lib/adminApi";

interface Query {
  query_id: number;
  user_name: string;
  service_name: string;
  location: string;
  service_date: string;
  is_urgent: boolean | null;
  is_accepted: boolean | null;
  approx_budget: number | null;
  time_stamp: string;
}

export default function AdminQueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminQueries();
      setQueries(data);
    } catch (err: any) {
      setError(err.message || "Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";

  const getStatusLabel = (q: Query) => {
    if (q.is_accepted === true) return { label: "Accepted", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (q.is_accepted === false) return { label: "Rejected", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    return { label: "Pending", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-violet-400" />
            Service Queries
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            {loading ? "Loading..." : `${queries.length} total inquiries from users`}
          </p>
        </div>
        <button onClick={loadQueries} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-colors w-fit">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 text-sm">
                <th className="p-4 font-medium">Query ID</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Event Date</th>
                <th className="p-4 font-medium">Budget</th>
                <th className="p-4 font-medium">Urgent</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-slate-800 rounded animate-pulse"></div></td>
                    ))}
                  </tr>
                ))
              ) : queries.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500">No queries yet.</td></tr>
              ) : (
                queries.map((q) => {
                  const { label, cls } = getStatusLabel(q);
                  return (
                    <tr key={q.query_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-mono text-xs text-violet-400">QRY-{q.query_id}</td>
                      <td className="p-4 font-medium text-slate-200">{q.user_name}</td>
                      <td className="p-4 text-slate-300">{q.service_name}</td>
                      <td className="p-4 text-slate-400">{q.location || "—"}</td>
                      <td className="p-4 text-slate-400">{formatDate(q.service_date)}</td>
                      <td className="p-4 text-white font-medium">{q.approx_budget ? `₹${q.approx_budget.toLocaleString()}` : "—"}</td>
                      <td className="p-4">
                        {q.is_urgent ? (
                          <span className="flex items-center gap-1 text-rose-400 text-xs font-medium">
                            <AlertTriangle className="h-3 w-3" /> Urgent
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Normal</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
            Total: {queries.length} queries
          </div>
        )}
      </div>
    </div>
  );
}
