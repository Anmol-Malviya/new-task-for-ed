"use client";

import { useEffect, useState } from "react";
import { 
  Users, Store, Activity, DollarSign, ArrowUpRight, 
  ArrowDownRight, RefreshCw, AlertTriangle, Info, Clock, CheckCircle2
} from "lucide-react";
import { fetchLiveDashboard, resolveAlert, reassignLead } from "@/lib/adminApi";

export default function LiveDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const liveData = await fetchLiveDashboard();
      setData(liveData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: number) => {
    try {
      await resolveAlert(alertId);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!data && loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const kpis = data?.kpis || { leads_today: 0, active_orders: 0, open_alerts: 0, gmv_today: 0 };
  const alerts = data?.alerts || [];
  const pipeline = data?.pipeline || [];
  const cityHealth = data?.city_health || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Live Dashboard</h2>
          <p className="text-slate-400 mt-1 text-sm bg-[#1e1b4b] px-3 py-1 rounded-full inline-flex border border-indigo-500/30">
            Control Tower — Auto-refreshing <span className="relative flex h-2 w-2 ml-2 mt-1.5 ">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </p>
        </div>
        <button onClick={loadData} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors text-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          ⚠️ {error} — Make sure Django backend is running.
        </div>
      )}

      {/* 4 KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "LEADS TODAY", value: (kpis.leads_today || 0).toLocaleString(), color: "from-blue-500 to-cyan-400", amount: "+12% vs yesterday" },
          { title: "ACTIVE ORDERS", value: (kpis.active_orders || 0).toLocaleString(), color: "from-emerald-400 to-teal-500", amount: "Across 6 cities" },
          { title: "ALERTS", value: (kpis.open_alerts || 0).toLocaleString(), color: "from-rose-500 to-red-400", amount: "Need action now" },
          { title: "TODAY GMV", value: `₹${((kpis.gmv_today || 0)/100000).toFixed(2)}L`, color: "from-purple-500 to-indigo-500", amount: "Est. commission included" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e2336] border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
            <h3 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r mb-1 tracking-tighter ${stat.color}`} style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>{stat.value}</h3>
            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-3">{stat.title}</p>
            <p className="text-slate-500 text-xs">{stat.amount}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACTIVE ALERT FEED - takes 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Alert Feed</h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{alerts.length} Types</span>
          </div>
          
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-[#1e2336] border border-slate-700/50 rounded-xl p-8 text-center text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-50" />
                <p>No active alerts requiring attention.</p>
              </div>
            ) : alerts.map((alert: any) => (
              <div key={alert.alert_id} className={`flex items-start gap-4 p-4 rounded-xl border ${
                alert.severity === 'CRITICAL' ? 'bg-rose-500/5 border-rose-500/20' : 
                alert.severity === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' : 
                'bg-blue-500/5 border-blue-500/20'
              }`}>
                <div className={`mt-1 flex-shrink-0 ${
                  alert.severity === 'CRITICAL' ? 'text-rose-500' : 
                  alert.severity === 'WARNING' ? 'text-amber-500' : 'text-blue-500'
                }`}>
                  {alert.severity === 'CRITICAL' && <AlertTriangle className="h-6 w-6" />}
                  {alert.severity === 'WARNING' && <Clock className="h-6 w-6" />}
                  {alert.severity === 'INFO' && <Info className="h-6 w-6" />}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold ${
                      alert.severity === 'CRITICAL' ? 'text-rose-400' : 
                      alert.severity === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
                    }`}>{alert.title} — {alert.minutes_ago} Minutes</h4>
                    <span className="text-xs text-slate-500">{alert.minutes_ago} min ago</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <button 
                    onClick={() => handleResolveAlert(alert.alert_id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 
                      alert.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 
                      'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {alert.action_label || 'Acknowledge'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CITY HEALTH BARS - takes 1/3 width */}
        <div className="bg-[#1e2336] border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-6">City Health Bars</h3>
          <div className="space-y-5">
            {cityHealth.map((city: any, i: number) => {
              // Calculate width based on max GMV or leads
              const maxGmv = Math.max(...cityHealth.map((c: any) => c.gmv_today || 1));
              const width = Math.max(10, ((city.gmv_today || 0) / maxGmv) * 100);
              
              // Colors alternate similar to mockup
              const barColor = i % 2 === 0 ? "bg-emerald-500" : "bg-orange-500";
              
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 flex-shrink-0">
                    <span className="text-xs text-slate-400 block truncate">{city.city_name}</span>
                  </div>
                  <div className="flex-grow bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${width}%` }}></div>
                  </div>
                  <div className="w-24 flex-shrink-0 flex justify-between text-xs font-mono">
                    <span className="text-slate-400">{city.active_leads}L</span>
                    <span className="text-blue-400 px-1">{city.total_orders}O</span>
                    <span className="text-emerald-400">{(city.gmv_today/1000).toFixed(0)}k</span>
                  </div>
                </div>
              );
            })}
            {cityHealth.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No city data available</p>
            )}
          </div>
        </div>
      </div>

      {/* LIVE LEAD PIPELINE TABLE */}
      <div className="bg-[#1e2336] border border-slate-700/50 rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Live Lead Pipeline</h3>
          <button className="text-xs text-indigo-400 hover:text-indigo-300">View All Leads →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-700/50">
                <th className="px-5 py-3 font-medium">Lead ID</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Occasion</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Timer</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {pipeline.map((lead: any, i: number) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 text-rose-400 font-medium">{lead.query_id}</td>
                  <td className="px-5 py-3 text-slate-300">{lead.city}</td>
                  <td className="px-5 py-3 text-slate-300">{lead.occasion}</td>
                  <td className="px-5 py-3 text-slate-400">{lead.date}</td>
                  <td className="px-5 py-3 text-slate-400">{lead.vendor}</td>
                  <td className={`px-5 py-3 font-medium ${
                    lead.status === 'NO VENDOR' ? 'text-slate-500' :
                    lead.timer_minutes > 15 && lead.status !== 'Confirmed' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {lead.status === 'Confirmed' ? '—' : 
                     lead.status === 'NO VENDOR' ? 'EXPIRED' : 
                     `${lead.timer_minutes}m`}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-medium uppercase tracking-wider text-[10px] ${
                      lead.status === 'NO VENDOR' ? 'text-rose-500' : 
                      lead.status === 'Confirmed' ? 'text-blue-400' : 'text-orange-500'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pipeline.length === 0 && (
                <tr className="text-center py-8">
                  <td colSpan={7} className="px-5 py-8 text-slate-500">No leads in the pipeline for the last 24 hours.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
