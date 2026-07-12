import React from "react";
import { GitCompare, Check, X, AlertTriangle, TrendingUp } from "lucide-react";

function confColor(v) {
  if (v >= 80) return "#10b981";
  if (v >= 60) return "#f59e0b";
  if (v >= 40) return "#f97316";
  return "#ef4444";
}

function riskColor(risk) {
  const r = (risk || "").toLowerCase();
  if (r.includes("low")) return "#10b981";
  if (r.includes("med")) return "#f59e0b";
  return "#ef4444";
}

function OptionCard({ option }) {
  const isTop = option.rank === 1;
  return (
    <div className={`rounded-lg border p-2.5 ${isTop ? "border-indigo-500/30 bg-indigo-500/5" : "border-border bg-muted/30"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isTop ? "bg-indigo-500 text-white" : "bg-muted text-muted-foreground"}`}>
          {option.rank}
        </span>
        <span className="text-xs font-bold text-foreground flex-1 truncate">{option.title}</span>
        {isTop && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 font-medium">RECOMMENDED</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[9px] font-medium text-emerald-500 mb-0.5 flex items-center gap-0.5"><Check size={9} /> Pros</div>
          <ul className="space-y-0.5">
            {(option.pros || []).slice(0, 3).map((p, i) => (
              <li key={i} className="text-[9px] text-muted-foreground leading-tight">• {p}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[9px] font-medium text-red-500 mb-0.5 flex items-center gap-0.5"><X size={9} /> Cons</div>
          <ul className="space-y-0.5">
            {(option.cons || []).slice(0, 3).map((c, i) => (
              <li key={i} className="text-[9px] text-muted-foreground leading-tight">• {c}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border">
        <span className="text-[9px] text-muted-foreground">Risk:</span>
        <span className="text-[9px] font-medium" style={{ color: riskColor(option.risk_level) }}>{option.risk_level || "—"}</span>
        <span className="text-[9px] text-muted-foreground">•</span>
        <span className="text-[9px] text-muted-foreground">Confidence:</span>
        <span className="text-[9px] font-bold" style={{ color: confColor(option.confidence) }}>{option.confidence || 0}%</span>
        <span className="text-[9px] text-muted-foreground">•</span>
        <span className="text-[9px] text-muted-foreground">{option.timeline || "—"}</span>
      </div>
      {option.expected_outcome && (
        <p className="text-[9px] text-muted-foreground mt-1 italic">{option.expected_outcome}</p>
      )}
    </div>
  );
}

export default function OptionsComparison({ options }) {
  if (!options || options.length === 0) return null;
  const sorted = [...options].sort((a, b) => (a.rank || 99) - (b.rank || 99));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <GitCompare size={12} className="text-indigo-500" />
        <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wide">Executive Options Analysis™</h4>
        <span className="text-[9px] text-muted-foreground ml-auto">{sorted.length} options compared</span>
      </div>
      <div className="space-y-1.5">
        {sorted.map((opt, i) => <OptionCard key={i} option={opt} />)}
      </div>
      <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
        <TrendingUp size={11} className="text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-muted-foreground">
          Top option ranked #1 based on evidence coverage, confidence, risk-adjusted outcomes, and alignment with your Executive Readiness trajectory.
        </p>
      </div>
    </div>
  );
}