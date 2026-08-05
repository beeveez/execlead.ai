import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";

const CLASS_STYLE = {
  Critical: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Low: "bg-sky-500/15 text-sky-400 border-sky-500/25",
};

const STATUS_STYLE = {
  open: "bg-rose-500/10 text-rose-300",
  partial: "bg-amber-500/10 text-amber-300",
  acceptable: "bg-emerald-500/10 text-emerald-300",
};

const TYPE_ICON = { entity: AlertTriangle, ai: AlertTriangle, auth: ShieldCheck, storage: Info, config: Info, connector: ShieldCheck };

export default function DependencyAuditTable({ report }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Critical", "Medium", "Low"];
  const items = filter === "All" ? report.groups.Critical.concat(report.groups.Medium, report.groups.Low) : report.groups[filter];

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">Phase 1</div>
          <h3 className="text-sm font-semibold text-white">Migration Dependency Report</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                filter === f ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-white/50 hover:text-white/80 border border-transparent"
              }`}
            >
              {f} {f !== "All" && `(${report.groups[f].length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Stat label="Total" value={report.summary.total} />
        <Stat label="Critical" value={report.summary.critical} accent="text-rose-400" />
        <Stat label="Open" value={report.summary.open} accent="text-amber-400" />
        <Stat label="Acceptable" value={report.summary.acceptable} accent="text-emerald-400" />
      </div>

      <div className="space-y-2">
        {items.map((d) => {
          const Icon = TYPE_ICON[d.type] || Info;
          return (
            <div key={d.id} className="rounded-xl bg-white/[0.02] border border-white/8 p-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[11px] font-mono text-white/40">{d.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${CLASS_STYLE[d.classification]}`}>{d.classification}</span>
                    <span className="text-[9px] uppercase tracking-wider text-white/30">{d.type}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                  </div>
                  <div className="text-[12px] text-white/80 leading-snug">{d.description}</div>
                  <div className="text-[10px] text-white/30 mt-1">📍 {d.location}</div>
                  {d.recommendedService && (
                    <div className="text-[10px] text-indigo-300 mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 font-medium">→ {d.recommendedService}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-white/40 mt-1">{d.recommendation}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/8 p-2.5 text-center">
      <div className={`text-lg font-bold ${accent}`}>{value}</div>
      <div className="text-[9px] text-white/40 uppercase tracking-wider">{label}</div>
    </div>
  );
}