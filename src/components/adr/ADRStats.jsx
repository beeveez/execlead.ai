import React from "react";

const STAT_CARDS = [
  { key: "total", label: "Total ADRs", color: "#6366f1" },
  { key: "accepted", label: "Accepted", color: "#10b981" },
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "deprecated", label: "Deprecated / Superseded", color: "#f97316" },
];

export default function ADRStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STAT_CARDS.map((s) => (
        <div key={s.key} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{s.label}</div>
          <div className="text-2xl font-bold text-white" style={{ color: s.color }}>{stats[s.key] || 0}</div>
        </div>
      ))}
    </div>
  );
}