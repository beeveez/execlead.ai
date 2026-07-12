import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, ArrowRight } from "lucide-react";

function coverageColor(coverage) {
  if (coverage >= 80) return "#10b981";
  if (coverage >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function EvidenceCompletenessPanel({ coverage, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  if (!coverage) return null;

  const color = coverageColor(coverage.overallConfidence);

  return (
    <div className="border-b border-border bg-card flex-shrink-0">
      {/* Collapsed Bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-accent transition-colors"
      >
        <ShieldCheck size={13} style={{ color }} />
        <span className="text-[11px] font-medium text-foreground flex-1 text-left">
          Evidence Completeness
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {coverage.overallConfidence}%
        </span>
        {coverage.gaps.length > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 font-medium">
            {coverage.gaps.length} gaps
          </span>
        )}
        {expanded ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-3 space-y-1.5 animate-fade-in">
          {coverage.sources.map((source) => {
            const sc = coverageColor(source.coverage);
            return (
              <div key={source.id} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-28 truncate flex-shrink-0">{source.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${source.coverage}%`, backgroundColor: sc }}
                  />
                </div>
                <span className="text-[10px] font-medium w-7 text-right" style={{ color: sc }}>
                  {source.coverage}%
                </span>
                {source.coverage < 50 && source.improveAction && onNavigate && (
                  <button
                    onClick={() => onNavigate(source.improveAction.path)}
                    className="text-[9px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-0.5 flex-shrink-0"
                  >
                    Add <ArrowRight size={8} />
                  </button>
                )}
              </div>
            );
          })}
          {coverage.gaps.length > 0 && (
            <p className="text-[9px] text-muted-foreground pt-1.5 leading-relaxed">
              EXEC™ recommendations in these areas will note where additional data improves precision.
            </p>
          )}
        </div>
      )}
    </div>
  );
}