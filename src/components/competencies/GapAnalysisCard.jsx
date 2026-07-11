import React from "react";
import { Target, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { getCategoryById } from "@/lib/competencyCatalog";

export default function GapAnalysisCard({ gap }) {
  const readinessColor = gap.readinessPct >= 75 ? "text-emerald-400" : gap.readinessPct >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="mb-4 p-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.03]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Target Role Gap Analysis</h3>
        </div>
        <span className={`text-2xl font-bold ${readinessColor}`}>{gap.readinessPct}%</span>
      </div>

      <p className="text-white/40 text-xs mb-3">
        Readiness for <span className="text-white/70 font-medium">{gap.targetRole}</span> — {gap.haveCount} of {gap.totalRequired} key competencies achieved
      </p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${gap.readinessPct}%`,
            background: gap.readinessPct >= 75 ? "#10b981" : gap.readinessPct >= 50 ? "#f59e0b" : "#ef4444",
          }}
        />
      </div>

      {gap.missing.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle size={12} className="text-amber-400" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Missing Competencies</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gap.missing.map((comp) => {
              const cat = getCategoryById(comp.category);
              return (
                <span
                  key={comp.name}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border"
                  style={{ borderColor: `${cat?.color}20`, backgroundColor: `${cat?.color}08`, color: "rgba(255,255,255,0.5)" }}
                >
                  {cat?.icon && <cat.icon size={9} style={{ color: cat?.color }} />}
                  {comp.name}
                </span>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
            <TrendingUp size={11} className="text-emerald-400" />
            Completing each missing competency will increase your role readiness score.
          </div>
        </div>
      )}

      {gap.missing.length === 0 && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <TrendingUp size={16} />
          You have all key competencies for this role. Focus on advancing your maturity levels.
        </div>
      )}
    </div>
  );
}