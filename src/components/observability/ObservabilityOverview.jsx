import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Zap, AlertTriangle, Clock } from "lucide-react";
import { Spinner, Empty, Panel } from "./Shared";
import { StatCard } from "./Shared";

export default function ObservabilityOverview() {
  const [events, setEvents] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, aiData] = await Promise.all([
          base44.entities.TelemetryEvent.list("-created_date", 100),
          base44.entities.UsageLog.list("-created_date", 50),
        ]);
        setEvents(eventData || []);
        setAiLogs(aiData || []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  const errors = events.filter((e) => e.event_category === "error");
  const today = new Date().setHours(0, 0, 0, 0);
  const eventsToday = events.filter((e) => new Date(e.created_date).getTime() >= today);
  const uniqueSessions = new Set(events.map((e) => e.session_id)).size;

  const typeCounts = {};
  events.forEach((e) => { typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1; });
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCount = topTypes[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Total Events" value={events.length} sublabel={`${eventsToday.length} today`} color="indigo" />
        <StatCard icon={Zap} label="AI Requests" value={aiLogs.length} sublabel="tracked" color="purple" />
        <StatCard icon={AlertTriangle} label="Errors" value={errors.length} sublabel="captured" color="red" />
        <StatCard icon={Clock} label="Active Sessions" value={uniqueSessions} sublabel="unique" color="cyan" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Event Type Distribution">
          {topTypes.length === 0 ? <Empty text="No events captured yet." /> : (
            <div className="space-y-2">
              {topTypes.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-white/50 text-xs w-40 truncate">{type}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500/60 h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-white/60 text-xs font-mono w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Live Event Stream">
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {events.slice(0, 25).map((e, i) => (
              <div key={e.id || i} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${e.event_category === "error" ? "bg-red-400" : e.event_category === "navigation" ? "bg-indigo-400" : "bg-white/30"}`} />
                <span className="text-white/60 font-mono">{e.event_type}</span>
                <span className="text-white/30 truncate flex-1">{e.page_path || e.module || ""}</span>
                <span className="text-white/20">{new Date(e.created_date).toLocaleTimeString()}</span>
              </div>
            ))}
            {events.length === 0 && <Empty text="No events captured yet." />}
          </div>
        </Panel>
      </div>
    </div>
  );
}