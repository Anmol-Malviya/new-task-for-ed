"use client";

import { useEffect, useState } from "react";
import { Users, MoreVertical, Search, RefreshCw } from "lucide-react";
import { fetchAdminUsers, toggleUserBlacklist } from "@/lib/adminApi";

interface User {
  user_id: number;
  name: string;
  email: string;
  number: string;
  blacklist_status: string;
  address: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.number?.includes(q)));
  }, [search, users]);

  const handleToggleBlacklist = async (userId: number) => {
    setTogglingId(userId);
    try {
      const res = await toggleUserBlacklist(userId);
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, blacklist_status: res.blacklist_status } : u));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            User Management
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            {loading ? "Loading..." : `${users.length} total users registered`}
          </p>
        </div>
        <button onClick={loadUsers} disabled={loading} className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-colors w-fit">
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
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 text-sm">
                <th className="p-4 font-medium">User ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Contact Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
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
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found{search ? " matching your search" : ". Add users via registration."}</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.user_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500">USR-{user.user_id}</td>
                    <td className="p-4 font-medium text-slate-200">{user.name}</td>
                    <td className="p-4">
                      <p className="text-slate-300">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.number || "—"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user.blacklist_status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {user.blacklist_status === 'active' ? 'Active' : 'Blacklisted'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleBlacklist(user.user_id)}
                        disabled={togglingId === user.user_id}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors mr-2 ${
                          user.blacklist_status === 'active'
                            ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        } disabled:opacity-50`}
                      >
                        {togglingId === user.user_id ? '...' : user.blacklist_status === 'active' ? 'Blacklist' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
