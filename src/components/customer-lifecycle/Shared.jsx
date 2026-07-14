import React from "react";
import { cn } from "@/lib/utils";

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-3 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-white/40 text-xs">{label}</p>
    </div>
  );
}

export function StatCard({ label, value, sublabel, icon: Icon, accent = "indigo" }) {
  const colorMap = {
    indigo: "text-indigo-400", emerald: "text-emerald-400", amber: "text-amber-400",
    rose: "text-rose-400", cyan: "text-cyan-400", purple: "text-purple-400",
  };
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs">{label}</span>
        {Icon && <Icon size={16} className={colorMap[accent]} />}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sublabel && <p className="text-white/30 text-xs mt-1">{sublabel}</p>}
    </div>
  );
}

export function ScoreRing({ score, max = 100, size = 64, label }) {
  const pct = Math.min(1, score / max);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : score >= 25 ? "#f97316" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <span className="text-lg font-bold" style={{ color }}>{score}</span>
      {label && <span className="text-white/40 text-xs">{label}</span>}
    </div>
  );
}

export function StatusBadge({ status, color }) {
  const colors = {
    healthy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    moderate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    at_risk: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    critical: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", colors[color] || colors[status] || "bg-white/5 text-white/40 border-white/10")}>
      {typeof status === "string" ? status.replace(/_/g, " ") : status}
    </span>
  );
}

export function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          {Icon && <Icon size={16} className="text-indigo-400" />}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ message = "No data available" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-white/30 text-sm">{message}</p>
    </div>
  );
}

export const RISK_COLORS = {
  healthy: "#10b981", low: "#10b981", moderate: "#f59e0b", medium: "#f59e0b",
  at_risk: "#f97316", high: "#f97316", critical: "#ef4444",
};

export const STAGE_COLORS = {
  applicant: "#64748b", reviewed: "#0ea5e9", invited: "#6366f1", activated: "#8b5cf6",
  active: "#10b981", power_user: "#14b8a6", champion: "#f59e0b",
  enterprise_advocate: "#ec4899", renewal: "#f97316", alumni: "#6b7280",
};