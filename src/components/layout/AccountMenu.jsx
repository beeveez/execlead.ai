import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useTheme } from "@/lib/ThemeContext";
import {
  ChevronDown, LogOut, LayoutDashboard, UserCircle, Settings as SettingsIcon,
  Palette, Moon, Sun, Monitor, Check, ChevronLeft, Shield, CreditCard
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ExecutiveMark from "@/components/layout/ExecutiveMark";

const THEME_OPTS = [
  { id: 'dark', label: 'Executive Dark', desc: 'Premium dark · gold & purple', icon: Moon },
  { id: 'light', label: 'Executive Light', desc: 'Clean white · executive blue', icon: Sun },
  { id: 'system', label: 'System Theme', desc: 'Follow OS preference', icon: Monitor },
];

export default function AccountMenu() {
  const { user } = useAuth();
  const { subscription, membership } = useSubscription();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('main');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setView('main'); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => base44.auth.logout("/login");
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Account";
  const close = () => { setOpen(false); setView('main'); };
  const go = (path) => { navigate(path); close(); };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
      >
        <ExecutiveMark size={24} className="shrink-0 rounded-md" />
        <span className="text-xs font-medium text-white/70 max-w-[120px] truncate">{displayName}</span>
        <ChevronDown size={12} className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {view === 'appearance' ? (
            <>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <button onClick={() => setView('main')} className="text-white/40 hover:text-white transition-colors" aria-label="Back">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <Palette size={14} className="text-indigo-400" /> Appearance
                </span>
              </div>
              <div className="p-2">
                {THEME_OPTS.map((opt) => {
                  const Icon = opt.icon;
                  const active = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg transition-colors ${active ? "bg-indigo-500/10" : "hover:bg-white/5"}`}
                    >
                      <Icon size={16} className={active ? "text-indigo-400" : "text-white/40"} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${active ? "text-white" : "text-white/70"}`}>{opt.label}</div>
                        <div className="text-xs text-white/30">{opt.desc}</div>
                      </div>
                      {active && <Check size={14} className="text-indigo-400 flex-shrink-0" />}
                    </button>
                  );
                })}
                <div className="px-3 py-2 mt-1 text-xs text-white/30 border-t border-white/5">
                  Active: <span className="capitalize text-white/50">{resolvedTheme}</span>
                  {theme === 'system' && <span> (system)</span>}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ExecutiveMark size={36} className="shrink-0 rounded-lg" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{displayName}</p>
                    {user?.email && <p className="text-xs text-white/40 truncate">{user.email}</p>}
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Subscription</span>
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: subscription.color }}>
                    <span>{subscription.icon}</span>
                    {subscription.planName}
                  </span>
                </div>
                {membership && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">Membership</span>
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: membership.color }}>
                        <span>{membership.icon}</span>
                        {membership.name}
                      </span>
                    </div>
                    {membership.discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">Lifetime Discount</span>
                        <span className="text-xs font-medium text-emerald-400">{membership.discount}% off</span>
                      </div>
                    )}
                    {membership.number && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">Member #</span>
                        <span className="text-xs font-mono text-white/60">{membership.number}</span>
                      </div>
                    )}
                    {membership.since && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">Member Since</span>
                        <span className="text-xs text-white/60">{new Date(membership.since).toLocaleDateString()}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="py-1">
                <button onClick={() => go("/dashboard")} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <LayoutDashboard size={14} className="text-white/30" /> Dashboard
                </button>
                <button onClick={() => go("/profile")} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <UserCircle size={14} className="text-white/30" /> Profile & Credentials
                </button>
                <button onClick={() => go("/billing")} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <CreditCard size={14} className="text-white/30" /> Billing
                </button>
                <button onClick={() => go("/settings")} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <SettingsIcon size={14} className="text-white/30" /> Settings
                </button>
                <button onClick={() => setView('appearance')} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <Palette size={14} className="text-white/30" /> Appearance
                  <span className="ml-auto text-xs text-white/30 capitalize">{theme}</span>
                </button>
                <button onClick={() => go("/security")} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                  <Shield size={14} className="text-white/30" /> Security
                </button>
              </div>
              <div className="border-t border-white/5 py-1">
                <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-sm text-red-400 hover:bg-red-500/5 transition-colors">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}