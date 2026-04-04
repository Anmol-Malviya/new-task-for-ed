"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Download, CircleDot, RefreshCw } from "lucide-react";
import { fetchAdminOrders } from "@/lib/adminApi";

interface Order {
  order_id: number;
  user_name: string;
  vendor_name: string;
  total_price: number;
  status: string;
  payment_type: string;
  service_date: string;
  time_stamp: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-emerald-400" />
            Order Management
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            {loading ? "Loading..." : `${orders.length} total orders on the platform`}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadOrders} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
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
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Event Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Total Price</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-slate-800 rounded animate-pulse"></div></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No orders placed yet.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-indigo-300 font-medium">ORD-{order.order_id}</td>
                    <td className="p-4 text-slate-300">{formatDate(order.service_date)}</td>
                    <td className="p-4 font-medium text-slate-200">{order.user_name}</td>
                    <td className="p-4 text-slate-400">{order.vendor_name}</td>
                    <td className="p-4 font-bold text-white">₹{order.total_price?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.payment_type === 'full' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {order.payment_type || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CircleDot className={`h-3 w-3 ${
                          order.status === 'completed' ? 'text-emerald-500' :
                          order.status === 'in_progress' ? 'text-blue-500' : 'text-amber-500'
                        }`} />
                        <span className="text-slate-300 capitalize">{order.status}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
            Total: {orders.length} orders
          </div>
        )}
      </div>
    </div>
  );
}
