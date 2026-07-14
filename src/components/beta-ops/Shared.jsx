import React from "react";
import { Loader2 } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sublabel, color }) {
  const colors = { emerald: "#10b981", amber: "#f59e0b", red: "#ef4444", indigo: "#8b5cf6", blue: "#3b82f6", cyan: "#06b6d4", purple: "#a855f7" };
  const c = colors[color] || "#94a3b8";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon size={13} style={{ color: c }} />}
        <span className="text-[10px] text-white/40 uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {sublabel && <div className="text-[10px] text-white/30 mt-0.5">{sublabel}</div>}
    </div>
  );
}

export function Panel({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-indigo-400" />}
          <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className="text-center py-8">
      <p className="text-white/30 text-xs">{text || "No data available."}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    pending: "#f59e0b", approved: "#10b981", rejected: "#ef4444", invited: "#3b82f6",
    activated: "#06b6d4", waitlisted: "#a855f7", withdrawn: "#64748b",
    sent: "#3b82f6", opened: "#06b6d4", accepted: "#10b981", expired: "#ef4444", declined: "#64748b",
    forming: "#f59e0b", active: "#10b981", graduating: "#a855f7", graduated: "#06b6d4", archived: "#64748b",
    draft: "#64748b", scheduled: "#f59e0b", sent: "#3b82f6",
  };
  const c = colors[status] || "#94a3b8";
  return (
    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: c, backgroundColor: `${c}1a` }}>{status}</span>
  );
}

export function PriorityBadge({ priority }) {
  const colors = { P0: "#ef4444", P1: "#f59e0b", P2: "#3b82f6" };
  const c = colors[priority] || "#64748b";
  return (
    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: c, backgroundColor: `${c}1a` }}>{priority}</span>
  );
}

export function HealthRing({ score, label }) {
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex items-center gap-3">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 40 40)" />
        <text x="40" y="44" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{score}</text>
      </svg>
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label || "Health Score"}</div>
        <div className="text-sm font-bold" style={{ color }}>{score >= 70 ? "Healthy" : score >= 40 ? "At Risk" : "Critical"}</div>
      </div>
    </div>
  );
}

export function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-white/50 text-xs flex-1 truncate">{label}</span>
      <div className="w-24 bg-white/5 rounded-full h-2 overflow-hidden">
        <div className={`${color || "bg-indigo-500/60"} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white/60 text-xs font-mono w-8 text-right">{value}</span>
    </div>
  );
}

export function FunnelRow({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/60 text-xs">{label}</span>
        <span className="text-white/40 text-xs font-mono">{value} ({Math.round(pct)}%)</span>
      </div>
      <div className="bg-white/5 rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}