import React, { useState, useEffect } from "react";
import { ArrowLeft, Activity, Wrench, Clock, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SelfHealingHistory({ events: propEvents, onBack }) {
  const [fetchedEvents, setFetchedEvents] = useState(propEvents || []);
  const [loading, setLoading] = useState(!propEvents);

  useEffect(() => {
    if (propEvents) return;
    base44.entities.SelfHealingEvent.list("-created_date", 20)
      .then((data) => setFetchedEvents(data || []))
      .catch(() => setFetchedEvents([]))
      .finally(() => setLoading(false));
  }, [propEvents]);

  const events = propEvents || fetchedEvents;

  const parseRepairsJson = (json) => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) return { repairs: parsed };
      return parsed;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Self-Healing History</h3>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={12} /> Back
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No self-healing events recorded yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Run an analysis or repair to start tracking history.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {events.map((event, i) => {
            const repairData = event.event_type === "repair" ? parseRepairsJson(event.repairs_json) : null;
            const lifecycle = repairData?.lifecycle;
            const persistence = repairData?.persistence;
            const validationResult = repairData?.validationResult;
            const coverageDelta = (event.coverage_after || 0) - (event.coverage_before || 0);

            return (
              <div key={event.id || i} className="bg-background/50 border border-border rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {event.event_type === "repair" ? (
                      <Wrench size={12} className="text-emerald-500" />
                    ) : (
                      <Activity size={12} className="text-blue-500" />
                    )}
                    <span className="text-xs font-medium text-foreground capitalize">{event.event_type}</span>
                    {validationResult && (
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${validationResult === "passed" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {validationResult === "passed" ? <ShieldCheck size={9} /> : <AlertTriangle size={9} />}
                        {validationResult}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {event.created_date ? new Date(event.created_date).toLocaleString() : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <HistStat label="Found" value={event.total_findings} />
                  <HistStat label="Repaired" value={event.issues_repaired} />
                  <HistStat label="Remaining" value={event.remaining_issues} />
                  <HistStat label="Coverage" value={`${event.coverage_before}%→${event.coverage_after}%`} />
                  <HistStat label="Health" value={`${event.health_before}→${event.health_after}`} />
                  <HistStat label="Time" value={`${(event.analysis_time_ms || 0) + (event.repair_time_ms || 0)}ms`} />
                </div>
                {coverageDelta !== 0 && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={9} className={coverageDelta > 0 ? "text-emerald-500" : "text-red-500"} />
                    <span className={`text-[10px] font-medium ${coverageDelta > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      Coverage Delta: {coverageDelta > 0 ? "+" : ""}{coverageDelta}%
                    </span>
                    {persistence && (
                      <span className={`text-[10px] font-medium ml-3 ${persistence.allPersistent ? "text-emerald-500" : "text-red-500"}`}>
                        Persistence: {persistence.persistedCount}/{persistence.totalCount}
                      </span>
                    )}
                  </div>
                )}
                {lifecycle && (
                  <div className="flex flex-wrap items-center gap-1 text-[9px] text-muted-foreground">
                    {lifecycle.analysisStarted && <span className="px-1 py-0.5 rounded bg-muted">Analysis Started</span>}
                    {lifecycle.analysisCompleted && <span className="px-1 py-0.5 rounded bg-muted">→ Completed</span>}
                    {lifecycle.repairStarted && <span className="px-1 py-0.5 rounded bg-muted">→ Repair Started</span>}
                    {lifecycle.repairCompleted && <span className="px-1 py-0.5 rounded bg-muted">→ Completed</span>}
                    {lifecycle.commitStarted && <span className="px-1 py-0.5 rounded bg-muted">→ Commit Started</span>}
                    {lifecycle.commitCompleted && <span className="px-1 py-0.5 rounded bg-muted">→ Completed</span>}
                    {lifecycle.validationCompleted && <span className="px-1 py-0.5 rounded bg-muted">→ Validation Done</span>}
                  </div>
                )}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>Developer: {event.user_name || "—"}</span>
                  <span>v{event.platform_version || "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistStat({ label, value }) {
  return (
    <div className="flex flex-col px-2 py-1 rounded bg-muted/50">
      <span className="text-[9px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-medium text-foreground">{value}</span>
    </div>
  );
}