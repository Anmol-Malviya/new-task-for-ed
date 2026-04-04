"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ShoppingCart, 
  MessageSquare, 
  FileText, 
  Settings,
  Bell,
  Box,
  Image as ImageIcon
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Queries", href: "/admin/queries", icon: MessageSquare },
  { name: "Services & Packages", href: "/admin/services", icon: Box },
  { name: "AI Bidding", href: "/admin/bidding", icon: ImageIcon },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col h-screen fixed top-0 left-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          EVENTDHARA 2.0
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-400" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
          AD
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">Super Admin</p>
          <p className="text-xs text-slate-500">System Dashboard</p>
        </div>
      </div>
    </aside>
  );
}
