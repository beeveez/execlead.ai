import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, ArrowRight, Brain, Briefcase, Crown, Target, CheckCircle2, AlertCircle, AlertOctagon } from "lucide-react";

function coverageColor(coverage) {
  if (coverage >= 80) return "#10b981";
  if (coverage >= 50) return "#f59e0b";
  if (coverage > 0) return "#f97316";
  return "#ef4444";
}

function ConfidenceDimension({ label, value, icon: Icon }) {
  const color = coverageColor(value);
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={10} style={{ color }} />
      <span className="text-[9px] text-muted-foreground truncate">{label}</span>
      <span className="text-[10px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function EvidenceCompletenessPanel({ coverage, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  if (!coverage || !coverage.hasAnyData) return null;

  const color = coverageColor(coverage.overallCoverage);
  const { diagnostics } = coverage;

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
          {coverage.overallCoverage}%
        </span>
        <div className="flex items-center gap-1.5">
          {diagnostics.available.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-medium">
              {diagnostics.available.length}
            </span>
          )}
          {diagnostics.missing.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 font-medium">
              {diagnostics.missing.length}
            </span>
          )}
          {diagnostics.failed.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 font-medium">
              {diagnostics.failed.length}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-3 space-y-3 animate-fade-in">
          {/* Confidence Dimensions */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 py-2 border-y border-border">
            <ConfidenceDimension label="Behavioral" value={coverage.behavioralConfidence} icon={Brain} />
            <ConfidenceDimension label="Career" value={coverage.careerConfidence} icon={Briefcase} />
            <ConfidenceDimension label="Leadership" value={coverage.leadershipConfidence} icon={Crown} />
            <ConfidenceDimension label="Recommendation" value={coverage.recommendationConfidence} icon={Target} />
          </div>

          {/* Sources */}
          <div className="space-y-1.5">
            {coverage.sources.map((source) => {
              const sc = coverageColor(source.coverage);
              return (
                <div key={source.id} className="flex items-center gap-2">
                  {source.status === "failed" ? (
                    <AlertOctagon size={9} className="text-red-500 flex-shrink-0" />
                  ) : source.coverage > 0 ? (
                    <CheckCircle2 size={9} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={9} className="text-amber-500 flex-shrink-0" />
                  )}
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
          </div>

          {/* Diagnostics Summary */}
          <div className="flex items-center gap-3 text-[9px] pt-1.5 border-t border-border">
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={9} /> {diagnostics.available.length} available
            </span>
            <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={9} /> {diagnostics.missing.length} missing
            </span>
            {diagnostics.failed.length > 0 && (
              <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertOctagon size={9} /> {diagnostics.failed.length} failed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}