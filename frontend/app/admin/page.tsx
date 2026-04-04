"use client";

import { useEffect, useState } from "react";
import { Users, Store, Activity, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { fetchAdminStats, fetchAdminOrders } from "@/lib/adminApi";

interface Stats {
  total_users: number;
  total_vendors: number;
  total_orders: number;
  pending_queries: number;
  completed_orders: number;
}

interface Order {
  order_id: number;
  user_name: string;
  vendor_name: string;
  total_price: number;
  status: string;
  payment_type: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, ordersData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminOrders(),
      ]);
      setStats(statsData);
      setOrders(ordersData.slice(0, 6));
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statCards = stats
    ? [
        { title: "Total Users", value: stats.total_users.toLocaleString(), change: "+Active", isPositive: true, icon: Users, color: "from-blue-500 to-cyan-400" },
        { title: "Active Vendors", value: stats.total_vendors.toLocaleString(), change: "+Registered", isPositive: true, icon: Store, color: "from-purple-500 to-indigo-500" },
        { title: "Total Orders", value: stats.total_orders.toLocaleString(), change: `${stats.completed_orders} completed`, isPositive: true, icon: DollarSign, color: "from-emerald-400 to-teal-500" },
        { title: "Pending Queries", value: stats.pending_queries.toLocaleString(), change: "Needs review", isPositive: false, icon: Activity, color: "from-orange-400 to-rose-500" },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Overview</h2>
          <p className="text-slate-400 mt-1">Live data from EventDhara backend.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-800 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-800 rounded w-1/3"></div>
              </div>
            ))
          : statCards.map((stat, i) => (
              <div key={i} className="group relative bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300 overflow-hidden">
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</h3>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
                    <stat.icon className="h-6 w-6 text-slate-200" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 relative z-10">
                  {stat.isPositive ? <ArrowUpRight className="h-4 w-4 text-emerald-400" /> : <ArrowDownRight className="h-4 w-4 text-rose-400" />}
                  <span className={`text-sm font-medium ${stat.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{stat.change}</span>
                </div>
              </div>
            ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All →</a>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded animate-pulse"></div>)}
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((order) => (
                  <tr key={order.order_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 font-mono text-indigo-300">#{order.order_id}</td>
                    <td className="py-4 text-slate-200">{order.user_name}</td>
                    <td className="py-4 text-slate-400">{order.vendor_name}</td>
                    <td className="py-4 font-medium text-white">₹{order.total_price?.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No orders yet. Start by seeding data via Django admin at <span className="text-indigo-400">localhost:8000/admin</span></p>
        )}
      </div>
    </div>
  );
}
