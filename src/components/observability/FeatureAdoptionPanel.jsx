import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, MousePointerClick, Eye, EyeOff } from "lucide-react";
import { Spinner, Empty, Panel, BarRow, StatCard } from "./Shared";

export default function FeatureAdoptionPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.TelemetryEvent.filter({ event_category: "navigation" }, "-created_date", 200)
      .then((data) => setEvents(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const pageCounts = {};
  events.forEach((e) => { if (e.page_path) pageCounts[e.page_path] = (pageCounts[e.page_path] || 0) + 1; });
  const sortedPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]);
  const topPages = sortedPages.slice(0, 10);

  const moduleCounts = {};
  events.forEach((e) => { if (e.module) moduleCounts[e.module] = (moduleCounts[e.module] || 0) + 1; });
  const sortedModules = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={MousePointerClick} label="Navigation Events" value={events.length} color="indigo" />
        <StatCard icon={Eye} label="Unique Pages" value={sortedPages.length} color="cyan" />
        <StatCard icon={TrendingUp} label="Top Module" value={sortedModules[0]?.[0] || "—"} sublabel={`${sortedModules[0]?.[1] || 0} visits`} color="emerald" />
        <StatCard icon={EyeOff} label="Inactive Modules" value={Math.max(0, 12 - sortedModules.length)} sublabel="no visits" color="amber" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Most Visited Pages">
          {topPages.length === 0 ? <Empty text="No navigation events captured yet." /> : (
            <div className="space-y-1">
              {topPages.map(([path, count]) => (
                <BarRow key={path} label={path} value={count} max={topPages[0][1]} />
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Module Adoption">
          {sortedModules.length === 0 ? <Empty text="No module data yet." /> : (
            <div className="space-y-1">
              {sortedModules.map(([mod, count]) => (
                <BarRow key={mod} label={mod} value={count} max={sortedModules[0][1]} color="bg-cyan-500/60" />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}