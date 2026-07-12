import React from "react";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

const METRICS = [
  { key: "platform_score", label: "Platform Score", suffix: "%", higherIsBetter: true },
  { key: "warnings", label: "Warnings", suffix: "", higherIsBetter: false },
  { key: "failures", label: "Failures", suffix: "", higherIsBetter: false },
  { key: "security_score", label: "Security", suffix: "%", higherIsBetter: true },
  { key: "readiness_score", label: "Readiness", suffix: "%", higherIsBetter: true },
];

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ReportCompareView({ reportA, reportB }) {
  if (!reportA || !reportB) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <p className="text-white/40 text-sm">Select two report versions to compare metrics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">From</div>
          <div className="text-white font-medium text-sm">{fmtDate(reportA.generated_date)}</div>
          <div className="text-white/30 text-xs">v{reportA.version}</div>
        </div>
        <ArrowRight size={18} className="text-indigo-400" />
        <div className="text-center">
          <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">To</div>
          <div className="text-white font-medium text-sm">{fmtDate(reportB.generated_date)}</div>
          <div className="text-white/30 text-xs">v{reportB.version}</div>
        </div>
      </div>

      <div className="space-y-2">
        {METRICS.map((m) => {
          const a = reportA[m.key] ?? 0;
          const b = reportB[m.key] ?? 0;
          const diff = b - a;
          const improved = m.higherIsBetter ? diff > 0 : diff < 0;
          const regressed = m.higherIsBetter ? diff < 0 : diff > 0;
          const toneClass = improved ? "bg-emerald-500/10 text-emerald-400" : regressed ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/40";
          const TrendIcon = diff === 0 ? Minus : improved ? TrendingUp : TrendingDown;

          return (
            <div key={m.key} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
              <span className="text-white/60 text-sm">{m.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm font-mono">{a}{m.suffix}</span>
                <ArrowRight size={12} className="text-white/20" />
                <span className="text-white text-sm font-mono font-medium">{b}{m.suffix}</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${toneClass}`}>
                  <TrendIcon size={10} />
                  {diff > 0 ? "+" : ""}{diff}{m.suffix}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}