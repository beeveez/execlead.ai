import React from "react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pass: { label: "Pass", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  fail: { label: "Fail", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  warning: { label: "Warning", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  pending: { label: "Pending", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  on_track: { label: "On Track", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  at_risk: { label: "At Risk", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  blocked: { label: "Blocked", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  open: { label: "Open", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  in_progress: { label: "In Progress", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  resolved: { label: "Resolved", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  verified: { label: "Verified", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  completed: { label: "Completed", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  upcoming: { label: "Upcoming", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  critical: { label: "Critical", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  high: { label: "High", cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  medium: { label: "Medium", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  low: { label: "Low", cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export function StatusBadge({ status, customLabel }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium", config.cls)}>
      {customLabel || config.label}
    </span>
  );
}

export function ScoreRing({ score, size = 120, stroke = 8, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        {label && <span className="text-[10px] text-white/50 uppercase tracking-wide mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, sublabel, color = "white" }) {
  const colorMap = {
    white: "text-white",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    indigo: "text-indigo-400",
    orange: "text-orange-400",
    slate: "text-slate-400",
  };
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
      <div className={cn("text-xl font-bold mt-0.5", colorMap[color] || colorMap.white)}>{value}</div>
      {sublabel && <div className="text-[10px] text-white/40 mt-0.5">{sublabel}</div>}
    </div>
  );
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

export function ProgressBar({ value, color = "indigo" }) {
  const colorMap = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    indigo: "bg-indigo-500",
    slate: "bg-slate-500",
    blue: "bg-blue-500",
  };
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700", colorMap[color] || colorMap.indigo)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
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
      <div className="text-3xl mb-2 opacity-30">✓</div>
      <p className="text-sm text-white/40">{label}</p>
    </div>
  );
}