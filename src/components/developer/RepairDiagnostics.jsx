import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Activity,
} from "lucide-react";

/**
 * RepairDagnostics — displays the full repair execution trace
 * and a per-repair persistence table.
 *
 * For every repaired item, shows:
 *   • Issue (the original finding message)
 *   • Repair Action (what was done)
 *   • Registry Updated (which authoritative registry was mutated)
 *   • Persistent: YES / NO
 */
export default function RepairDagnostics({ data }) {
  const [showSteps, setShowSteps] = useState(false);
  const [showRepairs, setShowRepairs] = useState(false);

  if (!data) return null;

  const {
    repairs = [],
    diagnostics = [],
    coverageBefore,
    coverageAfter,
    warningsBefore,
    warningsAfter,
  } = data;

  const coverageImproved = coverageAfter > coverageBefore;
  const warningsReduced = warningsAfter < warningsBefore;

  return (
    <div className="space-y-3">
      {/* Before → After Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-background/50">
          <span className="text-[10px] text-muted-foreground">Coverage Delta</span>
          <span
            className={`text-xs font-medium ${
              coverageImproved ? "text-emerald-500" : "text-foreground"
            }`}
          >
            {coverageBefore}% → {coverageAfter}%
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-background/50">
          <span className="text-[10px] text-muted-foreground">Warnings Delta</span>
          <span
            className={`text-xs font-medium ${
              warningsReduced ? "text-emerald-500" : "text-foreground"
            }`}
          >
            {warningsBefore} → {warningsAfter}
          </span>
        </div>
      </div>

      {/* Diagnostic Steps */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-background/50 hover:bg-accent transition-colors"
        >
          {showSteps ? (
            <ChevronDown size={12} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={12} className="text-muted-foreground" />
          )}
          <Activity size={12} className="text-emerald-500" />
          <span className="text-xs font-medium text-foreground">
            Execution Trace ({diagnostics.length} steps)
          </span>
        </button>
        {showSteps && (
          <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
            {diagnostics.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                <span className="text-muted-foreground">{d.step}</span>
                {d.value !== undefined && (
                  <span className="text-foreground font-medium ml-auto">{d.value}</span>
                )}
                {d.count !== undefined && (
                  <span className="text-foreground font-medium ml-auto">{d.count}</span>
                )}
                {d.coverage !== undefined && (
                  <span className="text-foreground font-medium ml-auto">
                    {d.coverage}% / {d.warnings} warnings
                  </span>
                )}
                {d.registries && (
                  <span className="text-foreground font-medium ml-auto truncate">
                    {d.registries.join(", ")}
                  </span>
                )}
                {d.storage && (
                  <span className="text-foreground font-medium ml-auto">{d.storage}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-Repair Persistence Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowRepairs(!showRepairs)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-background/50 hover:bg-accent transition-colors"
        >
          {showRepairs ? (
            <ChevronDown size={12} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={12} className="text-muted-foreground" />
          )}
          <Database size={12} className="text-emerald-500" />
          <span className="text-xs font-medium text-foreground">
            Repair Details ({repairs.length} items)
          </span>
        </button>
        {showRepairs && (
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {repairs.length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center py-2">
                No repairs were applied.
              </p>
            )}
            {repairs.map((r, i) => (
              <div
                key={i}
                className="border border-border/50 rounded-md p-2.5 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {r.code}
                  </span>
                  <span className="text-[11px] text-foreground font-medium truncate flex-1">
                    {r.target}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      r.persistent
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {r.persistent ? "✓ Persistent" : "✗ Not Persistent"}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  {r.issue}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                  <span className="text-muted-foreground">
                    Action:{" "}
                    <span className="text-foreground">{r.action}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Registry:{" "}
                    <span className="text-foreground">{r.registryUpdated}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}