import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, ChevronRight } from "lucide-react";

export default function SecCategoryGrid({ categories, onCategoryClick }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Test Categories ({categories.length})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {categories.map((cat) => {
          const hasFailures = cat.failed > 0;
          const hasCritical = cat.criticalFailures > 0;
          const Icon = !hasFailures ? CheckCircle2 : hasCritical ? XCircle : AlertTriangle;
          const iconColor = !hasFailures ? "#10b981" : hasCritical ? "#ef4444" : "#f59e0b";
          const barColor = cat.passRate === 100 ? "#10b981" : hasCritical ? "#ef4444" : "#f59e0b";

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat)}
              className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 hover:border-white/15 hover:bg-white/[0.04] transition-colors text-left group"
            >
              <Icon size={14} style={{ color: iconColor }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-white/70 group-hover:text-white/90 transition-colors">{cat.label}</div>
                <div className="text-[9px] text-white/30 truncate">{cat.description}</div>
              </div>
              {cat.type === "platform" && (
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">PLATFORM</span>
              )}
              {hasCritical && (
                <span className="text-[9px] font-mono text-red-400 shrink-0">{cat.criticalFailures} crit</span>
              )}
              {cat.warningFailures > 0 && (
                <span className="text-[9px] font-mono text-amber-400 shrink-0">{cat.warningFailures} warn</span>
              )}
              <span className="text-[10px] font-mono text-white/50 shrink-0">{cat.passed}/{cat.total}</span>
              <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
                <div className="h-full rounded-full transition-all" style={{ width: `${cat.passRate}%`, background: barColor }} />
              </div>
              <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}