import React from "react";
import { Network, Layers, Repeat } from "lucide-react";

/**
 * Engagement Breadth Card — surfaces that every module is feeding the
 * Executive Readiness Engine™. Three signals:
 *   • Modules engaged (breadth of platform use)
 *   • Competency breadth (dimensions touched)
 *   • Readiness Loop™ coverage (operating-rhythm stages activated)
 */
export default function EngagementBreadthCard({ engagement, loopLength = 6 }) {
  const modules = engagement?.modulesEngaged ?? 0;
  const breadth = engagement?.competencyBreadth ?? 0;
  const loopPct = engagement?.loopCoveragePct ?? 0;

  const stats = [
    { icon: Network, label: "Modules engaged", value: modules, hint: "distinct screens feeding the engine", color: "#6366f1" },
    { icon: Layers, label: "Competency breadth", value: breadth, hint: "dimensions strengthened", color: "#10b981" },
    { icon: Repeat, label: "Readiness Loop™ coverage", value: `${loopPct}%`, hint: "operating-rhythm stages active", color: "#f59e0b" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Network size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Module Engagement → Readiness Engine</h3>
        <span className="text-[10px] text-white/30">Every screen you visit feeds the engine</span>
      </div>
      <p className="text-white/40 text-[11px] mb-4 leading-relaxed">
        Breadth of platform engagement is a leading indicator of readiness velocity — leaders who
        develop across more dimensions accelerate faster. This card proves every module is
        connected to your journey, not isolated.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                <s.icon size={13} style={{ color: s.color }} />
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{s.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}