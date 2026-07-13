import React from "react";
import { ShieldAlert } from "lucide-react";

function CoverageTile({ label, pct, onClick }) {
  const color = pct === 100 ? "#10b981" : pct >= 80 ? "#f59e0b" : "#ef4444";
  return (
    <button onClick={onClick} className="text-center hover:opacity-80 transition-opacity cursor-pointer">
      <div className="text-[9px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>{pct}%</div>
    </button>
  );
}

export default function SecCoverage({ coverage, onNavigate }) {
  const items = [
    { label: "Platform", pct: coverage.platform.coverage, key: "platform" },
    { label: "Organization", pct: coverage.organization.coverage, key: "organization" },
    { label: "User", pct: coverage.user.coverage, key: "user" },
    { label: "Critical", pct: coverage.criticalCoverage, key: "critical" },
  ];
  return (
    <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase tracking-wider mb-3">
        <ShieldAlert size={12} /> Risk-Based Coverage™
      </div>
      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => (
          <CoverageTile key={item.key} label={item.label} pct={item.pct} onClick={() => onNavigate("coverage", item.key)} />
        ))}
      </div>
    </div>
  );
}