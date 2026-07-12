import React, { useState } from "react";
import { AlertOctagon, AlertTriangle, Info, Filter } from "lucide-react";

const LEVEL_CONFIG = {
  error: { label: "Error", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: AlertOctagon },
  warning: { label: "Warning", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: AlertTriangle },
  info: { label: "Info", color: "#06b6d4", bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", icon: Info },
};

export default function FindingsTable({ findings = [] }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? findings : findings.filter((f) => f.level === filter);
  const errorCount = findings.filter((f) => f.level === "error").length;
  const warningCount = findings.filter((f) => f.level === "warning").length;

  const filters = [
    { id: "all", label: "All", count: findings.length },
    { id: "error", label: "Errors", count: errorCount },
    { id: "warning", label: "Warnings", count: warningCount },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-bold text-white">Platform Findings</span>
        <div className="flex items-center gap-1">
          <Filter size={11} className="text-white/30 mr-1" />
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                filter === f.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <AlertOctagon size={24} className="mx-auto text-emerald-400/50 mb-2" />
          <p className="text-sm text-white/50">No findings at this level</p>
          <p className="text-[10px] text-white/30 mt-1">Platform is clean</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {filtered.map((finding, idx) => {
            const config = LEVEL_CONFIG[finding.level] || LEVEL_CONFIG.info;
            const Icon = config.icon;
            return (
              <div key={idx} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                <Icon size={14} className="flex-shrink-0 mt-0.5" style={{ color: config.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${config.bg} ${config.border} ${config.text} font-medium`}>
                      {config.label}
                    </span>
                    {finding.code && <span className="text-[9px] text-white/30 font-mono">{finding.code}</span>}
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">{finding.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}