/**
 * EXEC™ Operating System™ — Dashboard
 * ============================================================
 * The unified control center for platform health, navigation
 * analytics, search, performance, history, and favorites.
 * Accessible at /exec-os.
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getCommandIndex } from "@/lib/execOS/commandRegistry";
import { getHistory, getRecent } from "@/lib/execOS/workspaceHistory";
import {
  ShieldCheck, Activity, Search, Clock, Keyboard, Zap,
  TrendingUp, ArrowRight, Command, Layers, Gauge, Globe,
} from "lucide-react";

const QUICK_LINKS = [
  { path: "/enterprise/governance", label: "Governance Command Center™", icon: ShieldCheck, color: "#6366f1" },
  { path: "/developer/diagnostics", label: "Platform Governance Center™", icon: Gauge, color: "#10b981" },
  { path: "/privacy-compliance", label: "Privacy & Compliance Center™", icon: ShieldCheck, color: "#f59e0b" },
  { path: "/developer/security-intelligence", label: "Security Intelligence™", icon: Activity, color: "#ef4444" },
  { path: "/trust-center", label: "Trust Center™", icon: ShieldCheck, color: "#06b6d4" },
  { path: "/developer/experience-audit", label: "Experience Engine™", icon: Globe, color: "#8b5cf6" },
];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/30">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children, action }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function ExecOSDashboard() {
  const { activeWorkspace, availableWorkspaces } = useWorkspace();
  const commandIndex = useMemo(() => getCommandIndex(), []);
  const history = useMemo(() => getHistory(), []);
  const recent = useMemo(() => getRecent(5), []);

  const navCount = commandIndex.filter((c) => c.type === "navigation").length;
  const commandCount = commandIndex.filter((c) => c.type === "command").length;
  const wsCount = availableWorkspaces.length;
  const recentCommands = useMemo(() => {
    return recent
      .map((r) => {
        const item = commandIndex.find((i) => i.path === r.path);
        return item ? { ...item, timestamp: r.timestamp } : null;
      })
      .filter(Boolean);
  }, [recent, commandIndex]);

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Command size={14} className="text-white/25" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">EXEC™ Operating System™</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Enterprise Platform Control Center</h1>
          <p className="text-white/40 text-sm mt-1.5">One platform. One navigation. One experience.</p>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("exec:command-palette"))}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white/80 transition-colors"
        >
          <Search size={14} /> Search <kbd className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded font-mono ml-1">⌘K</kbd>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Layers} label="Indexed Pages" value={navCount} sub="Across all workspaces" color="#6366f1" />
        <StatCard icon={Command} label="Commands" value={commandCount} sub="Quick actions" color="#10b981" />
        <StatCard icon={Globe} label="Workspaces" value={wsCount} sub={`Active: ${activeWorkspace || "—"}`} color="#06b6d4" />
        <StatCard icon={Clock} label="Pages Visited" value={history.length} sub="This session" color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <SectionCard icon={Clock} title="Recently Viewed" className="lg:col-span-2">
          {recentCommands.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No recent activity yet. Start navigating!</p>
          ) : (
            <div className="space-y-1">
              {recentCommands.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    {item.icon ? <item.icon size={13} className="text-white/40" /> : <Command size={13} className="text-white/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white/70 group-hover:text-white/90 truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-white/20">{formatTime(item.timestamp)}</span>
                  <ArrowRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Keyboard Shortcuts */}
        <SectionCard icon={Keyboard} title="Shortcuts">
          <div className="space-y-2">
            {[
              { keys: "⌘K", label: "Command Palette" },
              { keys: "⌘P", label: "Print Page" },
              { keys: "⌘⇧P", label: "Export PDF" },
              { keys: "⌘/", label: "Shortcuts Help" },
              { keys: "Alt ←", label: "Back" },
              { keys: "Alt →", label: "Forward" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/50">{s.label}</span>
                <kbd className="text-[10px] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Quick Access */}
      <SectionCard icon={Zap} title="Quick Access — Governance Workspaces" action={
        <Link to="/enterprise/governance" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          All Domains <ArrowRight size={11} />
        </Link>
      }>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/15 hover:bg-white/[0.04] transition-all group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: link.color + "15" }}>
                <link.icon size={16} style={{ color: link.color }} />
              </div>
              <span className="text-sm text-white/70 group-hover:text-white/90 flex-1 truncate">{link.label}</span>
              <ArrowRight size={13} className="text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* Design Principles */}
      <div className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Operating System Principles</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {["Clickable", "Explainable", "Repairable", "Verifiable", "Searchable", "Printable", "Interconnected"].map((p, i) => (
            <div key={i} className="text-xs text-white/40 py-2 px-1 bg-white/[0.02] rounded-lg border border-white/5">{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}