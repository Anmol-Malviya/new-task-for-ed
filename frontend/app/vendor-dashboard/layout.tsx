'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ClipboardList, ShoppingBag, Phone,
  Calendar, IndianRupee, Image, TrendingUp, Crown,
  Shield, Menu, X, LogOut, ChevronRight, Bell,
  CheckCircle, AlertCircle, Star
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/vendor-dashboard', icon: LayoutDashboard, label: 'Dashboard', key: '' },
  { href: '/vendor-dashboard/onboarding', icon: ClipboardList, label: 'Onboarding', key: 'onboarding' },
  { href: '/vendor-dashboard/leads', icon: Bell, label: 'New Leads', key: 'leads', badge: true },
  { href: '/vendor-dashboard/orders', icon: ShoppingBag, label: 'My Orders', key: 'orders' },
  { href: '/vendor-dashboard/calls', icon: Phone, label: 'Call Flow', key: 'calls' },
  { href: '/vendor-dashboard/availability', icon: Calendar, label: 'Availability', key: 'availability' },
  { href: '/vendor-dashboard/earnings', icon: IndianRupee, label: 'Earnings', key: 'earnings' },
  { href: '/vendor-dashboard/portfolio', icon: Image, label: 'Portfolio', key: 'portfolio' },
  { href: '/vendor-dashboard/score', icon: TrendingUp, label: 'Score & Tier', key: 'score' },
  { href: '/vendor-dashboard/premium', icon: Crown, label: 'Premium', key: 'premium' },
  { href: '/vendor-dashboard/rules', icon: Shield, label: 'Platform Rules', key: 'rules' },
];

function useVendorData() {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    if (!token) { setLoading(false); return; }
    fetch('/api/proxy/vendor/profile/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setVendor(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { vendor, loading };
}

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { vendor, loading } = useVendorData();

  const handleLogout = () => {
    localStorage.removeItem('vendor_token');
    router.push('/auth/VendorLogin');
  };

  const activeKey = pathname.split('/vendor-dashboard/')[1]?.split('/')[0] || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#161b22] border-r border-[#30363d]
        z-30 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:shrink-0
      `}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-0.5">EventDhara</div>
            <div className="font-bold text-sm text-white">Vendor Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#8b949e] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vendor info */}
        {vendor && (
          <div className="px-5 py-4 border-b border-[#30363d]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 ${
                vendor.is_premium
                  ? 'bg-gradient-to-br from-amber-400 to-orange-600 ring-2 ring-amber-400/30'
                  : 'bg-gradient-to-br from-orange-500 to-rose-600'
              }`}>
                {vendor.is_premium ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  vendor.business_name?.[0] || 'V'
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-white truncate">{vendor.business_name || vendor.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {vendor.is_premium ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Crown className="w-2.5 h-2.5" /> PREMIUM
                    </span>
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      vendor.tier === 'active' ? 'bg-green-500/20 text-green-400' :
                      'bg-[#30363d] text-[#8b949e]'
                    }`}>
                      {vendor.tier?.toUpperCase() || 'STARTER'}
                    </span>
                  )}
                  <span className="text-[10px] text-[#8b949e]">Score: {vendor.score}</span>
                </div>
              </div>
            </div>

            {/* Onboarding progress bar */}
            {!vendor.onboarding_completed && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-[#8b949e] mb-1">
                  <span>Onboarding</span>
                  <span>{vendor.onboarding_percent || 0}%</span>
                </div>
                <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all"
                    style={{ width: `${vendor.onboarding_percent || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Active / Pending badge */}
            <div className="mt-2 flex items-center gap-1.5">
              {vendor.is_approved ? (
                <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-[10px] text-green-400">Profile Active</span></>
              ) : (
                <><AlertCircle className="w-3 h-3 text-yellow-500" /><span className="text-[10px] text-yellow-400">Pending Approval</span></>
              )}
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label, key, badge }) => {
            const isActive = activeKey === key;
            const isPremiumItem = key === 'premium';
            const showUpgradeGlow = isPremiumItem && vendor && !vendor.is_premium;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                    : showUpgradeGlow
                    ? 'text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/5 border border-amber-500/10'
                    : isPremiumItem && vendor?.is_premium
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-[#8b949e] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-orange-400'
                  : isPremiumItem && vendor?.is_premium ? 'text-amber-400'
                  : showUpgradeGlow ? 'text-amber-400/70'
                  : 'text-[#8b949e] group-hover:text-white'
                }`} />
                <span className="flex-1">{label}</span>
                {badge && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                {showUpgradeGlow && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse">
                    UPGRADE
                  </span>
                )}
                {isPremiumItem && vendor?.is_premium && !isActive && (
                  <Crown className="w-3 h-3 text-amber-400" />
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-orange-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#30363d]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center px-4 gap-4 shrink-0 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#8b949e] hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-white">
              {NAV_ITEMS.find(n => n.key === activeKey)?.label || 'Dashboard'}
            </h1>
          </div>

          {vendor?.is_premium && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <Crown className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">PREMIUM PARTNER</span>
            </div>
          )}

          {vendor && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{vendor.score}</span>
              <span className="text-[10px] text-[#8b949e]">/ 100</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
