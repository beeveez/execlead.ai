import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Activity,
  AlertTriangle,
  ShieldCheck,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/**
 * RepairDiagnostics — full repair execution trace, per-repair persistence
 * table, post-repair validation summary, and failure detection with
 * root cause analysis.
 */
export default function RepairDiagnostics({ data }) {
  const [showSteps, setShowSteps] = useState(false);
  const [showRepairs, setShowRepairs] = useState(false);
  const [showFailures, setShowFailures] = useState(false);

  if (!data) return null;

  const {
    repairs = [],
    diagnostics = [],
    coverageBefore,
    coverageAfter,
    warningsBefore,
    warningsAfter,
    healthBefore,
    healthAfter,
    issuesRepaired = 0,
    repairsPersisted = 0,
    persistence = null,
    validationResult = "unknown",
    lifecycle = null,
  } = data;

  const coverageImproved = coverageAfter > coverageBefore;
  const warningsReduced = warningsAfter < warningsBefore;
  const healthImproved = healthAfter > healthBefore;
  const nonPersistentRepairs = persistence?.nonPersistent || [];

  return (
    <div className="space-y-3">
      {/* ── Post-Repair Validation Summary ── */}
      <div className="grid grid-cols-2 gap-2">
        <ValidationStat label="Coverage" before={`${coverageBefore}%`} after={`${coverageAfter}%`} improved={coverageImproved} />
        <ValidationStat label="Warnings" before={warningsBefore} after={warningsAfter} improved={warningsReduced} />
        <ValidationStat label="Health Score" before={healthBefore} after={healthAfter} improved={healthImproved} />
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-background/50">
          <span className="text-[10px] text-muted-foreground">Validation</span>
          <span className={`text-xs font-medium flex items-center gap-1 ${validationResult === "passed" ? "text-emerald-500" : "text-red-500"}`}>
            {validationResult === "passed" ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
            {validationResult === "passed" ? "Passed" : "Failed"}
          </span>
        </div>
      </div>

      {/* ── Repairs Applied vs Persisted ── */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-background/50">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Repairs Applied:</span>
          <span className="text-xs font-medium text-foreground">{issuesRepaired}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Repairs Persisted:</span>
          <span className={`text-xs font-medium ${repairsPersisted === issuesRepaired ? "text-emerald-500" : "text-red-500"}`}>
            {repairsPersisted}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {validationResult === "passed" ? (
            <ShieldCheck size={12} className="text-emerald-500" />
          ) : (
            <AlertTriangle size={12} className="text-red-500" />
          )}
          <span className={`text-[10px] font-medium ${validationResult === "passed" ? "text-emerald-500" : "text-red-500"}`}>
            {validationResult === "passed" ? "All Repairs Persistent" : "Non-Persistent Repairs Detected"}
          </span>
        </div>
      </div>

      {/* ── Non-Persistent Repair Warnings ── */}
      {nonPersistentRepairs.length > 0 && (
        <div className="border border-red-500/30 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowFailures(!showFailures)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/5 hover:bg-red-500/10 transition-colors"
          >
            {showFailures ? <ChevronDown size={12} className="text-red-500" /> : <ChevronRight size={12} className="text-red-500" />}
            <AlertTriangle size={12} className="text-red-500" />
            <span className="text-xs font-medium text-red-500">
              Non-Persistent Repairs ({nonPersistentRepairs.length})
            </span>
          </button>
          {showFailures && (
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                The repair was applied but did not persist. Possible causes: registry regeneration,
                manifest overwrite, runtime-only modification, missing commit, or source registry conflict.
              </p>
              {nonPersistentRepairs.map((np, i) => (
                <div key={i} className="border border-red-500/20 rounded-md p-2.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <XCircle size={10} className="text-red-500" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">
                      {np.finding.code}
                    </span>
                    <span className="text-[11px] text-foreground truncate flex-1">
                      {np.finding.context?.route || np.finding.context?.moduleId || "unknown"}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed">
                    <strong className="text-red-500">Root Cause: </strong>
                    {np.rootCause}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Execution Trace ── */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-background/50 hover:bg-accent transition-colors"
        >
          {showSteps ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
          <Activity size={12} className="text-emerald-500" />
          <span className="text-xs font-medium text-foreground">
            Execution Trace ({diagnostics.length} steps)
          </span>
        </button>
        {showSteps && (
          <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
            {diagnostics.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                {d.rootCause ? (
                  <XCircle size={10} className="text-red-500 flex-shrink-0" />
                ) : (
                  <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />
                )}
                <span className={d.rootCause ? "text-red-500" : "text-muted-foreground"}>{d.step}</span>
                {d.value !== undefined && <span className="text-foreground font-medium ml-auto">{d.value}</span>}
                {d.count !== undefined && <span className="text-foreground font-medium ml-auto">{d.count}</span>}
                {d.coverage !== undefined && (
                  <span className="text-foreground font-medium ml-auto">{d.coverage}% / {d.warnings} warnings</span>
                )}
                {d.registries && <span className="text-foreground font-medium ml-auto truncate">{d.registries.join(", ")}</span>}
                {d.storage && <span className="text-foreground font-medium ml-auto">{d.storage}</span>}
                {d.cache && <span className="text-foreground font-medium ml-auto">{d.cache}</span>}
                {d.rootCause && <span className="text-red-500 font-medium ml-auto truncate">NON-PERSISTENT</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Per-Repair Persistence Table ── */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowRepairs(!showRepairs)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-background/50 hover:bg-accent transition-colors"
        >
          {showRepairs ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
          <Database size={12} className="text-emerald-500" />
          <span className="text-xs font-medium text-foreground">
            Repair Details ({repairs.length} items)
          </span>
        </button>
        {showRepairs && (
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {repairs.length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center py-2">No repairs were applied.</p>
            )}
            {repairs.map((r, i) => (
              <div key={i} className="border border-border/50 rounded-md p-2.5 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {r.repairId || `RPR-${i}`}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {r.code}
                  </span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${r.persistent ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {r.persistent ? "✓ Persistent" : "✗ Not Persistent"}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">{r.issue}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <span className="text-muted-foreground">Action: <span className="text-foreground">{r.action}</span></span>
                  <span className="text-muted-foreground">Registry: <span className="text-foreground">{r.registryUpdated}</span></span>
                  <span className="text-muted-foreground">Entity: <span className="text-foreground">{r.entityUpdated || r.target}</span></span>
                  <span className="text-muted-foreground">Commit: <span className={`font-medium ${r.commitStatus === "committed" ? "text-emerald-500" : r.commitStatus === "already_committed" ? "text-blue-500" : "text-muted-foreground"}`}>{r.commitStatus || "—"}</span></span>
                  <span className="text-muted-foreground">Validation: <span className={`font-medium ${r.validationStatus === "passed" ? "text-emerald-500" : "text-muted-foreground"}`}>{r.validationStatus || "—"}</span></span>
                  <span className="text-muted-foreground">Persistence: <span className={`font-medium ${r.persistenceStatus === "verified" ? "text-emerald-500" : "text-muted-foreground"}`}>{r.persistenceStatus || "—"}</span></span>
                </div>
                {r.timestamp && (
                  <div className="text-[9px] text-muted-foreground/60">
                    {new Date(r.timestamp).toLocaleString()} · v{r.platformVersion || "—"} · {r.executionTimeMs || 0}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ValidationStat({ label, before, after, improved }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-background/50">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        {before !== undefined && before !== "" && (
          <>
            <span className="text-[10px] text-muted-foreground">{before}</span>
            <span className="text-[9px] text-muted-foreground">→</span>
          </>
        )}
        <span className={`text-xs font-medium flex items-center gap-1 ${improved ? "text-emerald-500" : "text-foreground"}`}>
          {improved && <TrendingUp size={10} />}
          {after}
        </span>
      </div>
    </div>
  );
}