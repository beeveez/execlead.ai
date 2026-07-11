import React from "react";
import { Radio } from "lucide-react";
import { usePlatformState } from "@/lib/PlatformStateContext";

const EVENT_COLORS = {
  PlatformStateUpdated: "text-blue-400",
  ManifestUpdated: "text-purple-400",
  KnowledgeUpdated: "text-cyan-400",
  KnowledgeSyncCompleted: "text-cyan-400",
  SelfHealingStarted: "text-amber-400",
  SelfHealingCompleted: "text-emerald-400",
  PlatformCommitted: "text-emerald-400",
  DeploymentStarted: "text-amber-400",
  DeploymentCompleted: "text-emerald-400",
  GuardianStarted: "text-amber-400",
  GuardianCompleted: "text-emerald-400",
  WorkspaceChanged: "text-indigo-400",
  CacheInvalidated: "text-orange-400",
  ConfigUpdated: "text-blue-400",
  EntityChanged: "text-violet-400",
};

export default function LivePlatformEvents() {
  const state = usePlatformState();
  const liveEvents = state?.liveEvents || [];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Radio size={16} className="text-emerald-400 animate-pulse" />
        <h3 className="text-sm font-bold text-white">Live Platform Events</h3>
        <span className="ml-auto text-[10px] text-white/30">{liveEvents?.length || 0} recent</span>
      </div>
      {liveEvents && liveEvents.length > 0 ? (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {liveEvents.map((ev, i) => {
            const isCompleted = ev.event.includes("Completed") || ev.event.includes("Committed");
            return (
              <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-white/[0.02]">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCompleted ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className={`font-medium ${EVENT_COLORS[ev.event] || "text-white/60"}`}>{ev.event}</span>
                <span className="text-white/30 ml-auto">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-white/30 text-xs">No recent events. Run Analyze or Repair to generate platform events.</p>
      )}
    </div>
  );
}