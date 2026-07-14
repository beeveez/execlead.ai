import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Clock, Layers, Activity } from "lucide-react";
import { Spinner, Empty, Panel, BarRow, StatCard } from "./Shared";

export default function ErrorIntelligencePanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.TelemetryEvent.filter({ event_category: "error" }, "-created_date", 100)
      .then((data) => setEvents(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const moduleCounts = {};
  events.forEach((e) => { if (e.module) moduleCounts[e.module] = (moduleCounts[e.module] || 0) + 1; });
  const sortedModules = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]);

  const typeCounts = {};
  events.forEach((e) => { typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1; });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const today = new Date().setHours(0, 0, 0, 0);
  const errorsToday = events.filter((e) => new Date(e.created_date).getTime() >= today);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={AlertTriangle} label="Total Errors" value={events.length} color="red" />
        <StatCard icon={Clock} label="Errors Today" value={errorsToday.length} color="amber" />
        <StatCard icon={Layers} label="Affected Modules" value={sortedModules.length} color="purple" />
        <StatCard icon={Activity} label="Unique Types" value={sortedTypes.length} color="indigo" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Errors by Module">
          {sortedModules.length === 0 ? <Empty text="No errors captured." /> : (
            <div className="space-y-1">
              {sortedModules.map(([mod, count]) => (
                <BarRow key={mod} label={mod} value={count} max={sortedModules[0][1]} color="bg-red-500/60" />
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Error Types">
          {sortedTypes.length === 0 ? <Empty text="No error types captured." /> : (
            <div className="space-y-1">
              {sortedTypes.map(([type, count]) => (
                <BarRow key={type} label={type} value={count} max={sortedTypes[0][1]} color="bg-amber-500/60" />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Recent Errors">
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {events.slice(0, 20).map((e, i) => (
            <div key={e.id || i} className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-white/60 font-mono truncate flex-1">{e.page_path || e.module || "unknown"}</span>
              <span className="text-white/20">{new Date(e.created_date).toLocaleTimeString()}</span>
            </div>
          ))}
          {events.length === 0 && <Empty text="No errors captured." />}
        </div>
      </Panel>
    </div>
  );
}