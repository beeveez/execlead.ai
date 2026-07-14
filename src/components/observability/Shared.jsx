import React from "react";

export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
    </div>
  );
}

export function Empty({ text = "No data available." }) {
  return <p className="text-white/30 text-sm py-4">{text}</p>;
}

export function Panel({ title, children, action }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function BarRow({ label, value, max, color = "bg-indigo-500/60" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-white/50 text-xs w-40 truncate">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white/60 text-xs font-mono w-10 text-right">{value}</span>
    </div>
  );
}

export function FunnelRow({ label, value, total, color = "bg-indigo-500/60" }) {
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

export function HealthBar({ label, value }) {
  const v = value || 0;
  const color = v >= 80 ? "bg-emerald-500/60" : v >= 50 ? "bg-amber-500/60" : "bg-red-500/60";
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-white/50 text-xs w-32 truncate">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-white/60 text-xs font-mono w-10 text-right">{v}</span>
    </div>
  );
}

export function StatusRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-white/40">{label}</span>
      <span className="text-white/70 font-medium">{value ?? "—"}</span>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sublabel, color = "indigo" }) {
  const colorMap = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    red: "text-red-400 bg-red-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.indigo}`}>
            <Icon size={18} />
          </div>
        )}
        <span className="text-white/40 text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sublabel && <div className="text-white/30 text-xs mt-1">{sublabel}</div>}
    </div>
  );
}