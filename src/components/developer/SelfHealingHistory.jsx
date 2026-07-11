import React from "react";
import { ArrowLeft, Activity, Wrench, Clock } from "lucide-react";

export default function SelfHealingHistory({ events, onBack }) {
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

      {events.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No self-healing events recorded yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Run an analysis or repair to start tracking history.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {events.map((event, i) => (
            <div key={event.id || i} className="bg-background/50 border border-border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {event.event_type === "repair" ? (
                    <Wrench size={12} className="text-emerald-500" />
                  ) : (
                    <Activity size={12} className="text-blue-500" />
                  )}
                  <span className="text-xs font-medium text-foreground capitalize">{event.event_type}</span>
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
                <HistStat label="Time" value={`${event.analysis_time_ms + event.repair_time_ms}ms`} />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Developer: {event.user_name || "—"}</span>
                <span>v{event.platform_version || "—"}</span>
              </div>
            </div>
          ))}
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