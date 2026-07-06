import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/layout/TopBar";
import Logo from "@/components/layout/Logo";
import { useSubscription } from "@/lib/SubscriptionContext";
import {
  LayoutDashboard, Swords, Brain, MessageSquare, GraduationCap,
  BarChart3, Building2, BookOpen, Settings as SettingsIcon, Scale, PenLine,
  LogOut, Menu, X, ChevronRight, UserCircle, Cpu, Shield, CreditCard, FileText, Briefcase, DollarSign, Layers, Boxes, Link2, Receipt,
  Users, Fingerprint, Store, Network, TrendingUp, ClipboardCheck, KeyRound, Code2
} from "lucide-react";
import { useDeveloper } from "@/lib/DeveloperContext";
import DebugPanel from "@/components/developer/DebugPanel";
import DeveloperBadge from "@/components/developer/DeveloperBadge";
import ImpersonationBanner from "@/components/developer/ImpersonationBanner";

const NAV_GROUPS = [
  {
    label: "Platform",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/academy", label: "Academy", icon: GraduationCap },
      { path: "/coach", label: "Coach", icon: MessageSquare },
      { path: "/simulator", label: "Simulator", icon: Brain },
      { path: "/debate", label: "Debate", icon: Scale },
      { path: "/council", label: "Council", icon: Users },
      { path: "/marketplace", label: "Marketplace", icon: Store },
    ],
  },
  {
    label: "Career",
    items: [
      { path: "/career", label: "Career Advisor", icon: BookOpen },
      { path: "/companies", label: "Companies", icon: Building2 },
      { path: "/resume", label: "Resume AI", icon: FileText },
      { path: "/career-studio", label: "Career Studio", icon: Briefcase },
      { path: "/journal", label: "Journal", icon: PenLine },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { path: "/analytics", label: "Analytics", icon: BarChart3 },
      { path: "/leadership-dna", label: "Leadership DNA", icon: Fingerprint },
      { path: "/ai-usage", label: "AI Usage", icon: Cpu },
    ],
  },
  {
    label: "HR & Talent",
    items: [
      { path: "/hr-dashboard", label: "HR Dashboard", icon: Users },
      { path: "/succession-planning", label: "Succession", icon: Network },
      { path: "/promotion-readiness", label: "Promotion", icon: TrendingUp },
      { path: "/learning-assignments", label: "Assignments", icon: ClipboardCheck },
    ],
  },
  {
    label: "Account",
    items: [
      { path: "/profile", label: "Profile", icon: UserCircle },
      { path: "/billing", label: "Billing", icon: CreditCard },
      { path: "/compare-plans", label: "Compare Plans", icon: Layers },
      { path: "/settings", label: "Settings", icon: SettingsIcon },
      { path: "/connected-accounts", label: "Connected Accounts", icon: Link2 },
    ],
  },
  {
    label: "Enterprise & Admin",
    items: [
      { path: "/enterprise", label: "Enterprise", icon: Building2 },
      { path: "/admin", label: "Admin", icon: Shield },
      { path: "/pricing-admin", label: "Pricing Admin", icon: DollarSign },
      { path: "/feature-management", label: "Features", icon: Boxes },
      { path: "/billing-admin", label: "Billing Admin", icon: Receipt },
      { path: "/sso", label: "SSO & Identity", icon: KeyRound },
      { path: "/developer", label: "Developer", icon: Code2 },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

function NavItem({ item, active, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
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
}

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
          <Logo />
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/20">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.path} item={item} active={location.pathname === item.path} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="mb-2 flex justify-center">
            <DeveloperBadge />
          </div>
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
          <Logo size="sm" aiTagClass="ml-1" />
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
          <div className="w-72 h-full bg-[#0d0d14] border-r border-white/5 p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="mb-6 pb-4 border-b border-white/5">
              <Logo showAiTag={false} />
            </div>
            <nav>
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-4">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/20">{group.label}</div>
                  <div className="space-y-0.5">
                    {group.items.map(item => (
                      <NavItem key={item.path} item={item} active={location.pathname === item.path} onClick={() => setMobileOpen(false)} />
                    ))}
                  </div>
                </div>
              ))}
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
        <ImpersonationBanner />
        <TopBar />
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <DebugPanel />
    </div>
  );
}