"use client";

import { useEffect, useState } from "react";
import { Store, RefreshCw, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchAdminVendors } from "@/lib/adminApi";

interface Vendor {
  vendor_id: number;
  name: string;
  business_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filtered, setFiltered] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminVendors();
      setVendors(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(vendors.filter(v =>
      v.business_name?.toLowerCase().includes(q) ||
      v.name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q)
    ));
  }, [search, vendors]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-pink-400" />
            Vendor Partners
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            {loading ? "Loading..." : `${vendors.length} vendors registered on the platform`}
          </p>
        </div>
        <button onClick={loadVendors} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-colors w-fit">
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
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name, city, email..."
              className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 text-sm">
                <th className="p-4 font-medium">Business Info</th>
                <th className="p-4 font-medium">Owner</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-slate-800 rounded animate-pulse"></div></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">
                  No vendors found{search ? " matching your search" : ". Vendors can register via the signup page."}
                </td></tr>
              ) : (
                filtered.map((vendor) => (
                  <tr key={vendor.vendor_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-white">{vendor.business_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: VEND-{vendor.vendor_id}</p>
                    </td>
                    <td className="p-4 text-slate-300">{vendor.name}</td>
                    <td className="p-4">
                      <p className="text-slate-300">{vendor.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{vendor.phone || "—"}</p>
                    </td>
                    <td className="p-4 text-slate-400">
                      {[vendor.city, vendor.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
            Showing {filtered.length} of {vendors.length} vendors
          </div>
        )}
      </div>
    </div>
  );
}
