import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Activity, Wrench, ShieldCheck, RefreshCw, Rocket,
  Boxes, Brain, Code2, Clock,
} from "lucide-react";

const EVENT_CONFIG = {
  self_healing_analysis: { icon: Activity, color: "text-blue-400", label: "Platform Scan" },
  self_healing_repair: { icon: Wrench, color: "text-emerald-400", label: "Self-Healing" },
  guardian_scan: { icon: ShieldCheck, color: "text-teal-400", label: "Guardian Scan" },
  guardian_passed: { icon: ShieldCheck, color: "text-emerald-400", label: "Guardian Passed" },
  guardian_warning: { icon: ShieldCheck, color: "text-amber-400", label: "Guardian Warning" },
  knowledge_sync: { icon: Brain, color: "text-violet-400", label: "Knowledge Sync" },
  manifest_updated: { icon: Boxes, color: "text-indigo-400", label: "Manifest Updated" },
  deployment: { icon: Rocket, color: "text-cyan-400", label: "Deployment" },
  feature_flag: { icon: Code2, color: "text-amber-400", label: "Feature Flag" },
  config_updated: { icon: RefreshCw, color: "text-blue-400", label: "Configuration" },
};

export default function SystemTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [healingEvents, guardianEvents] = await Promise.all([
          base44.entities.SelfHealingEvent.list("-created_date", 10).catch(() => []),
          base44.entities.GuardianActivity.list("-created_date", 10).catch(() => []),
        ]);

        const merged = [
          ...healingEvents.map((e) => ({
            id: e.id,
            type: e.event_type === "repair" ? "self_healing_repair" : "self_healing_analysis",
            title: e.event_type === "repair"
              ? `${e.issues_repaired || 0} issues repaired`
              : `${e.total_findings || 0} findings detected`,
            timestamp: e.created_date,
          })),
          ...guardianEvents.map((e) => ({
            id: e.id,
            type: e.result === "passed" ? "guardian_passed" : e.result === "warning" ? "guardian_warning" : "guardian_scan",
            title: e.action || "Guardian scan completed",
            timestamp: e.created_date,
          })),
        ];

        merged.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setEvents(merged.slice(0, 15));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center">
        <Clock size={20} className="text-white/30 mx-auto mb-2" />
        <p className="text-white/50 text-sm">No recent platform activity.</p>
        <p className="text-white/30 text-xs mt-1">Run a scan or self-healing to populate the timeline.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {events.map((event, i) => {
          const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.self_healing_analysis;
          const Icon = config.icon;
          return (
            <div key={event.id || i} className="flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <div className={`w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0`}>
                  <Icon size={12} className={config.color} />
                </div>
                {i < events.length - 1 && <div className="w-px h-6 bg-white/5 mt-1" />}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{config.label}</span>
                  <span className="text-[10px] text-white/20">·</span>
                  <span className="text-[10px] text-white/30">
                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">{event.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}