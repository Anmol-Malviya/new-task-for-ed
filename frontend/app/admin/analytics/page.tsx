"use client";

import { useEffect, useState } from "react";
import { BarChart as BarChartIcon, RefreshCw, TrendingUp, AlertCircle, PieChart, Activity } from "lucide-react";
import { fetchAnalytics } from "@/lib/adminApi";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await fetchAnalytics();
      setData(stats);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const momTrends = data?.mom_trends || { revenue_growth: 0, user_growth: 0, conversion_rate: 0 };
  const cityPerf = data?.city_performance || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <BarChartIcon className="h-6 w-6 text-purple-500" /> Analytics & Reports
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Month-over-month trends, City performance, and Platform health.</p>
        </div>
        <button onClick={loadAnalytics} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* MoM Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Revenue Growth (MoM)", value: `+${momTrends.revenue_growth}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "User Growth (MoM)", value: `+${momTrends.user_growth}%`, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Platform Conversion", value: `${momTrends.conversion_rate}%`, icon: PieChart, color: "text-purple-400", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e2336] p-6 rounded-2xl border border-slate-700/50 flex items-center gap-5">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{loading ? '...' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* City Performance Table */}
      <div className="bg-[#1e2336] border border-slate-700/50 rounded-xl overflow-hidden shadow-lg mt-8">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">City Performance Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-700">
                <th className="px-6 py-4 font-semibold">City Name</th>
                <th className="px-6 py-4 font-semibold">Total Revenue Map</th>
                <th className="px-6 py-4 font-semibold text-right">Vendor Density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && cityPerf.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="h-8 w-8 text-indigo-500/50 animate-spin mx-auto mb-3" />
                    Crunching numbers...
                  </td>
                </tr>
              ) : cityPerf.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">No performance data available.</td>
                </tr>
              ) : (
                cityPerf.map((city: any, i: number) => {
                  const maxGmv = Math.max(...cityPerf.map((c: any) => c.total_gmv || 1));
                  const width = Math.max(5, ((city.total_gmv || 0) / maxGmv) * 100);
                  
                  return (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{city.city_name}</td>
                      <td className="px-6 py-4 w-2/3">
                        <div className="flex items-center gap-3">
                          <div className="flex-grow bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full" style={{ width: `${width}%` }}></div>
                          </div>
                          <span className="text-emerald-400 font-medium w-24">₹{(city.total_gmv/1000).toLocaleString()}k</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-center bg-slate-800/80 px-3 py-1 rounded-lg">
                          <span className="text-indigo-300 font-bold">{city.active_vendors}</span>
                          <span className="text-slate-500 ml-1">vendors</span>
                        </div>
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
