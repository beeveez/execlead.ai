import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/layout/TopBar";
import { useSubscription } from "@/lib/SubscriptionContext";
import {
  LayoutDashboard, Swords, Brain, MessageSquare, GraduationCap,
  BarChart3, Building2, BookOpen, Settings as SettingsIcon, Scale, PenLine,
  LogOut, Menu, X, ChevronRight, UserCircle, Cpu, Shield, CreditCard, FileText, Briefcase
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/academy", label: "Academy", icon: GraduationCap },
  { path: "/coach", label: "Coach", icon: MessageSquare },
  { path: "/simulator", label: "Simulator", icon: Brain },
  { path: "/debate", label: "Debate", icon: Scale },
  { path: "/career", label: "Career", icon: BookOpen },
  { path: "/companies", label: "Companies", icon: Building2 },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/journal", label: "Journal", icon: PenLine },
  { path: "/resume", label: "Resume AI", icon: FileText },
  { path: "/career-studio", label: "Career Studio", icon: Briefcase },
  { path: "/profile", label: "Profile", icon: UserCircle },
  { path: "/enterprise", label: "Enterprise", icon: Building2 },
  { path: "/ai-usage", label: "AI Usage", icon: Cpu },
  { path: "/admin", label: "Admin", icon: Shield },
  { path: "/billing", label: "Billing", icon: CreditCard },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function AppLayout() {
  const location = useLocation();
  const { subscription, loading: loadingSub } = useSubscription();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0d0d14] border-r border-white/5 fixed h-full z-30">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="block">
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-indigo-400">EXEC</span>
              <span className="text-white/80">LEAD</span>
              <span className="text-indigo-400">.</span>
              <span className="text-[10px] text-white/30 ml-2 font-normal tracking-widest uppercase">AI</span>
            </h1>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <item.icon size={18} className={active ? "text-indigo-400" : "text-white/30 group-hover:text-white/60"} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto text-indigo-400/50" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d0d14]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/">
            <h1 className="text-base font-bold">
              <span className="text-indigo-400">EXEC</span>
              <span className="text-white/80">LEAD</span>
              <span className="text-indigo-400">.</span>
              <span className="text-[10px] text-white/30 ml-1">AI</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/billing" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5">
              {loadingSub ? (
                <span className="text-xs text-white/20">···</span>
              ) : (
                <>
                  <span className="text-xs">{subscription.icon}</span>
                  <span className="text-xs font-medium" style={{ color: subscription.color }}>{subscription.planName}</span>
                </>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 p-1">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="w-72 h-full bg-[#0d0d14] border-r border-white/5 p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-6 pb-4 border-b border-white/5">
              <h1 className="text-lg font-bold">
                <span className="text-indigo-400">EXEC</span>
                <span className="text-white/80">LEAD</span>
                <span className="text-indigo-400">.</span>
              </h1>
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 mt-6 rounded-lg text-sm text-white/30 hover:text-red-400 w-full"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <TopBar />
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}