"use client";

import { Bell, Search, RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("ed_admin_token");
    localStorage.removeItem("ed_admin_auth");
    router.push("/admin-login");
  };

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, vendors, tracking IDs..."
            className="w-full bg-slate-800/50 border border-slate-700 text-sm text-slate-200 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
          <span className="text-xs font-medium text-emerald-400">Backend Live</span>
        </div>

        <button className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
        </button>

        <div className="h-6 w-[1px] bg-slate-800"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
