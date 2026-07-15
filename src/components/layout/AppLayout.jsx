import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/layout/TopBar";
import Logo from "@/components/layout/Logo";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useAuth } from "@/lib/AuthContext";
import { useGuardian } from "@/lib/GuardianContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import WorkspaceGuard from "@/components/WorkspaceGuard";
import RoleRoute from "@/components/RoleRoute";
import { LogOut, ChevronRight } from "lucide-react";
import DebugPanel from "@/components/developer/DebugPanel";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GlobalBreadcrumbs from "@/components/exec-os/GlobalBreadcrumbs";
import PageTransition from "@/components/PageTransition";
import DeveloperBadge from "@/components/developer/DeveloperBadge";
import ImpersonationBanner from "@/components/developer/ImpersonationBanner";
import SimulationBanner from "@/components/developer/SimulationBanner";
import GracePeriodBanner from "@/components/identity/GracePeriodBanner";

function NavItem({ item, active, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group text-xs ${
      active ?
      "bg-indigo-500/10 text-indigo-400" :
      "text-white/40 hover:text-white/80 hover:bg-white/5"}`
      }>
      
      <item.icon size={18} className={active ? "text-indigo-400" : "text-white/30 group-hover:text-white/60"} />
      {item.label}
      {active && <ChevronRight size={14} className="ml-auto text-indigo-400/50" />}
    </Link>);

}

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { subscription, loading: loadingSub, profile } = useSubscription();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { navGroups: workspaceNavGroups, activeWorkspace } = useWorkspace();
  const { brokenNavPaths } = useGuardian() || {};
  const navGroups = workspaceNavGroups.
  map((g) => ({ ...g, items: g.items.filter((i) => !brokenNavPaths?.has(i.path)) })).
  filter((g) => g.items.length > 0);

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0d14] border-r border-white/5 fixed h-full z-30">
        <div className="p-6 border-b border-white/5">
          <Logo />
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {navGroups.map((group) =>
          <div key={group.label} className="mb-1 mt-4 first:mt-0">
              <div className="px-3 pb-1.5 mb-1 border-b border-white/[0.06]">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#A1AAB8" }}>{group.label}</span>
              </div>
              <div className="space-y-0.5 mt-1.5">
                {group.items.map((item) =>
              <NavItem key={`${item.path}-${item.label}`} item={item} active={location.pathname === item.path} />
              )}
              </div>
            </div>
          )}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="mb-2 space-y-2">
            <DeveloperBadge />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 w-full transition-colors">
            
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header — dynamic page title + conditional Back button */}
      <MobileHeader mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Overlay */}
      {mobileOpen &&
      <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="w-72 h-full bg-[#0d0d14] border-r border-white/5 p-4 overflow-y-auto" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))", paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 pb-4 border-b border-white/5">
              <Logo showAiTag={false} />
            </div>
            <nav>
              {navGroups.map((group) =>
            <div key={group.label} className="mb-1 mt-4 first:mt-0">
                  <div className="px-3 pb-1.5 mb-1 border-b border-white/[0.06]">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#A1AAB8" }}>{group.label}</span>
                  </div>
                  <div className="space-y-0.5 mt-1.5">
                    {group.items.map((item) =>
                <NavItem key={`${item.path}-${item.label}`} item={item} active={location.pathname === item.path} onClick={() => setMobileOpen(false)} />
                )}
                  </div>
                </div>
            )}
            </nav>
            <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 mt-6 rounded-lg text-sm text-white/30 hover:text-red-400 w-full">
            
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      }

      {/* Main Content — every page is role-enforced via RoleRoute */}
      <main className="flex-1 md:ml-64 pt-[calc(3.5rem_+_env(safe-area-inset-top))] md:pt-0 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0 min-h-screen">
        <ImpersonationBanner />
        <SimulationBanner />
        <GracePeriodBanner />
        <TopBar />
        <div className="px-4 md:px-8 pt-2 max-w-7xl mx-auto">
          <GlobalBreadcrumbs />
        </div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <RoleRoute>
            <WorkspaceGuard>
              <PageTransition />
            </WorkspaceGuard>
          </RoleRoute>
        </div>
      </main>
      <MobileBottomNav />
      <DebugPanel />
    </div>);

}