"use client";

import { useEffect, useState } from "react";
import { fetchCityManagerStats } from "@/lib/adminApi";
import { Map, RefreshCw, AlertCircle, Users, Activity, Target } from "lucide-react";

export default function CityManagerPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchCityManagerStats();
      setStats(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load city manager stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Map className="h-6 w-6 text-cyan-500" /> City Capacity Manager
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Monitor vendor saturation, serviceability tracking, and unserviceable drop-offs.</p>
        </div>
        <button onClick={loadStats} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && stats.length === 0 ? (
          <div className="xl:col-span-3 py-20 text-center text-slate-500">
             <RefreshCw className="h-10 w-10 text-cyan-500/50 animate-spin mx-auto mb-4" />
             Loading capacity metrics...
          </div>
        ) : stats.length === 0 ? (
          <div className="xl:col-span-3 py-12 text-center text-slate-500 bg-[#1e2336] rounded-xl border border-slate-800">
            No city data configured.
          </div>
        ) : stats.map((city, idx) => {
          // Calculate Capacity Health Score
          // Assuming each vendor can handle roughly 10 leads before saturation.
          // This is purely visual mapping derived from data.
          const leadToVendorRatio = city.active_vendors > 0 ? (city.total_leads / city.active_vendors) : 100;
          let statusText = "HEALTHY";
          let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          let barGradient = "from-emerald-400 to-emerald-600";
          
          if (leadToVendorRatio > 20 || city.unserviceable_leads > 10) {
            statusText = "CRITICAL CAPACITY";
            statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
            barGradient = "from-rose-400 to-rose-600";
          } else if (leadToVendorRatio > 10 || city.unserviceable_leads > 0) {
            statusText = "WARNING";
            statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            barGradient = "from-amber-400 to-amber-600";
          }

          return (
            <div key={idx} className={`bg-[#1e2336] rounded-2xl border border-slate-700/50 p-6 relative overflow-hidden`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{city.city_name}</h3>
                  <div className={`mt-2 inline-flex text-xs font-bold px-2 py-1 uppercase tracking-widest rounded-md border ${statusColor}`}>
                    {statusText}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <Map className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-2"><Activity className="h-4 w-4" /> Total Leads</span>
                  <span className="text-white font-medium">{city.total_leads}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-2"><Users className="h-4 w-4" /> Active Vendors</span>
                  <span className="text-white font-medium">{city.active_vendors}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-2"><Target className="h-4 w-4" /> Unserviceable Leads</span>
                  <span className={`font-medium ${city.unserviceable_leads > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {city.unserviceable_leads}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Saturation Level</span>
                  <span className="text-slate-300 font-mono">{Math.min(100, Math.round((leadToVendorRatio/30)*100))}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${barGradient}`} style={{ width: `${Math.min(100, (leadToVendorRatio/30)*100)}%` }}></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
