import React from "react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  enabled: { label: "Enabled", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  disabled: { label: "Disabled", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  hidden: { label: "Hidden", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  internal: { label: "Internal", cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  beta: { label: "Beta", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  experimental: { label: "Experimental", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  deprecated: { label: "Deprecated", cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  scheduled: { label: "Scheduled", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  created: { label: "Created", cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  killed: { label: "Killed", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  unblocked: { label: "Unblocked", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  rollout_changed: { label: "Rollout Changed", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  targeting_changed: { label: "Targeting Changed", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  status_changed: { label: "Status Changed", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  strategy_changed: { label: "Strategy Changed", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
};

const TYPE_CLS = {
  global: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  workspace: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  organization: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  role: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  beta_cohort: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  user: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  environment: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function StatusBadge({ status, customLabel }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium", config.cls)}>
      {customLabel || config.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const cls = TYPE_CLS[type] || TYPE_CLS.environment;
  const label = type ? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium", cls)}>{label}</span>;
}

export function SectionCard({ title, icon: Icon, action, children, className }) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function StatCard({ label, value, sublabel, color = "white" }) {
  const colorMap = {
    white: "text-white", emerald: "text-emerald-400", amber: "text-amber-400",
    red: "text-red-400", indigo: "text-indigo-400", orange: "text-orange-400",
    slate: "text-slate-400", blue: "text-blue-400", purple: "text-purple-400",
  };
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
      <div className={cn("text-xl font-bold mt-0.5", colorMap[color] || colorMap.white)}>{value}</div>
      {sublabel && <div className="text-[10px] text-white/40 mt-0.5">{sublabel}</div>}
    </div>
  );
}

export function ProgressBar({ value, color = "indigo" }) {
  const colorMap = {
    emerald: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500",
    indigo: "bg-indigo-500", slate: "bg-slate-500", blue: "bg-blue-500", purple: "bg-purple-500",
  };
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", colorMap[color] || colorMap.indigo)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Spinner({ label }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
      {label && <span className="ml-3 text-sm text-white/40">{label}</span>}
    </div>
  );
}

export function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-3xl mb-2 opacity-30">⚑</div>
      <p className="text-sm text-white/40">{label}</p>
    </div>
  );
}