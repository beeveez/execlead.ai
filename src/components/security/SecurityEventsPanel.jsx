import React, { useState, useEffect } from "react";
import { Activity, AlertTriangle, ShieldAlert, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SEVERITY_CONFIG = {
  critical: { label: "Critical", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  high: { label: "High", cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  medium: { label: "Medium", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  low: { label: "Low", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  info: { label: "Info", cls: "bg-white/5 text-white/40 border-white/10" },
};

export default function SecurityEventsPanel({ isAdmin = false }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadEvents();
  }, [isAdmin]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SecurityEvent.filter(
        isAdmin ? {} : {},
        "-created_date",
        50
      );
      setEvents(data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all"
    ? events
    : events.filter(e => e.severity === filter);

  const counts = events.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/80">Security Events</h3>
          {isAdmin && <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Admin View</span>}
        </div>
        <button onClick={loadEvents} className="text-white/30 hover:text-white/60">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Severity filter */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", "critical", "high", "medium", "low", "info"].map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              filter === sev ? "bg-indigo-500/15 text-indigo-400" : "text-white/30 hover:text-white/50"
            }`}
          >
            {sev === "all" ? "All" : SEVERITY_CONFIG[sev]?.label || sev}
            {sev !== "all" && counts[sev] ? ` (${counts[sev]})` : ""}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-xs text-white/30">
          <ShieldAlert size={24} className="mx-auto mb-2 text-white/10" />
          No security events
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(event => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                event.severity === "critical" ? "bg-red-400" :
                event.severity === "high" ? "bg-orange-400" :
                event.severity === "medium" ? "bg-amber-400" :
                event.severity === "low" ? "bg-blue-400" : "bg-white/20"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70 font-medium truncate">{event.description || event.event_type}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${SEVERITY_CONFIG[event.severity]?.cls || SEVERITY_CONFIG.info.cls}`}>
                    {SEVERITY_CONFIG[event.severity]?.label || event.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30">
                  <span>{event.event_type}</span>
                  {event.ip_address && event.ip_address !== "unknown" && (
                    <>
                      <span>·</span>
                      <span>{event.ip_address}</span>
                    </>
                  )}
                  {event.user_name && (
                    <>
                      <span>·</span>
                      <span>{event.user_name}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{event.created_date ? new Date(event.created_date).toLocaleString() : "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}