import React from "react";
import { ShieldAlert } from "lucide-react";

const LEVELS = ["low", "medium", "high"];
const CELL_COLORS = {
  "low-low": "bg-emerald-500/10 border-emerald-500/15",
  "low-medium": "bg-emerald-500/5 border-emerald-500/10",
  "low-high": "bg-amber-500/5 border-amber-500/10",
  "medium-low": "bg-emerald-500/5 border-emerald-500/10",
  "medium-medium": "bg-amber-500/10 border-amber-500/15",
  "medium-high": "bg-red-500/10 border-red-500/15",
  "high-low": "bg-amber-500/5 border-amber-500/10",
  "high-medium": "bg-red-500/10 border-red-500/15",
  "high-high": "bg-red-500/15 border-red-500/20",
};

export default function RiskMatrix({ risks }) {
  if (!risks || risks.length === 0) return null;

  const grid = {};
  for (const l of LEVELS) for (const i of LEVELS) grid[`${l}-${i}`] = [];
  risks.forEach((r) => {
    const key = `${r.likelihood || "medium"}-${r.impact || "medium"}`;
    if (grid[key]) grid[key].push(r);
  });

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-red-400" />
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Risk Matrix</h3>
      </div>

      <div className="flex">
        {/* Y axis label */}
        <div className="flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-wider text-white/30 -rotate-90 whitespace-nowrap">Impact →</span>
        </div>

        <div className="flex-1 ml-2">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1">
            {/* Header row */}
            <div />
            {LEVELS.map((l) => (
              <div key={l} className="text-center text-[10px] uppercase tracking-wider text-white/30 pb-1 capitalize">{l}</div>
            ))}
            {/* Grid rows (high impact at top) */}
            {[...LEVELS].reverse().map((impact) => (
              <React.Fragment key={impact}>
                <div className="flex items-center justify-end pr-2 text-[10px] uppercase tracking-wider text-white/30 capitalize w-12">{impact}</div>
                {LEVELS.map((likelihood) => {
                  const cellRisks = grid[`${likelihood}-${impact}`] || [];
                  const colorKey = `${likelihood}-${impact}`;
                  return (
                    <div key={`${likelihood}-${impact}`} className={`min-h-[72px] rounded-lg border p-1.5 ${CELL_COLORS[colorKey]}`}>
                      {cellRisks.map((r, i) => (
                        <div key={i} className="text-[10px] text-white/60 leading-tight mb-1" title={r.mitigation}>
                          <span className="text-white/40">•</span> {r.risk}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center text-[10px] uppercase tracking-wider text-white/30 pt-1">Likelihood →</div>
        </div>
      </div>

      {/* Mitigations */}
      <div className="mt-4 space-y-1.5">
        {risks.filter((r) => r.mitigation).map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="text-red-400/60 mt-0.5">⚠</span>
            <span className="text-white/50"><span className="text-white/70 font-medium">{r.risk}:</span> <span className="text-white/40">{r.mitigation}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}