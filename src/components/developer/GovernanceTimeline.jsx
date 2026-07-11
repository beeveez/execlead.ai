import React, { useMemo } from "react";
import {
  PLATFORM_METADATA,
  FRAMEWORK_REGISTRY,
  KNOWLEDGE_PACK_REGISTRY,
} from "@/lib/platformManifest";
import { EXEC_KNOWLEDGE_LAST_SYNC, EXEC_FRAMEWORK_HIERARCHY } from "@/lib/execKnowledgeBase";
import {
  Clock, Rocket, GitBranch, RefreshCw, Layers, Package,
  Cpu, ShieldCheck, CheckCircle2, Calendar,
} from "lucide-react";

export default function GovernanceTimeline() {
  const events = useMemo(() => {
    const items = [
      {
        type: "release",
        icon: Rocket,
        title: "Platform Release",
        description: `${PLATFORM_METADATA.platformName} v${PLATFORM_METADATA.platformVersion} deployed to ${PLATFORM_METADATA.environment}`,
        timestamp: PLATFORM_METADATA.releaseDate,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        type: "build",
        icon: Cpu,
        title: "Build Compiled",
        description: `Build ${PLATFORM_METADATA.buildNumber} · Manifest v${PLATFORM_METADATA.manifestVersion}`,
        timestamp: PLATFORM_METADATA.buildNumber,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
      },
      {
        type: "knowledge_sync",
        icon: RefreshCw,
        title: "EXEC™ Knowledge Synchronized",
        description: `Knowledge v${PLATFORM_METADATA.knowledgeVersion} · Prompt v${PLATFORM_METADATA.promptVersion}`,
        timestamp: EXEC_KNOWLEDGE_LAST_SYNC,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
      },
      {
        type: "framework_update",
        icon: Layers,
        title: "Framework Registry Updated",
        description: `${FRAMEWORK_REGISTRY.length} frameworks registered · EELM™ v${PLATFORM_METADATA.frameworkVersion}`,
        timestamp: PLATFORM_METADATA.releaseDate,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
      },
      {
        type: "knowledge_pack",
        icon: Package,
        title: "Knowledge Packs Loaded",
        description: `${KNOWLEDGE_PACK_REGISTRY.length} packs active across ${new Set(KNOWLEDGE_PACK_REGISTRY.map((p) => p.supportedFramework)).size} frameworks`,
        timestamp: KNOWLEDGE_PACK_REGISTRY[0]?.lastUpdated || PLATFORM_METADATA.releaseDate,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
      },
      {
        type: "manifest",
        icon: ShieldCheck,
        title: "Platform Manifest™ Published",
        description: `Manifest v${PLATFORM_METADATA.manifestVersion} · ${EXEC_FRAMEWORK_HIERARCHY.length} frameworks in hierarchy`,
        timestamp: PLATFORM_METADATA.releaseDate,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
      },
    ];

    return items.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime() || 0;
      const dateB = new Date(b.timestamp).getTime() || 0;
      return dateB - dateA;
    });
  }, []);

  const eventTypes = [
    { label: "Configuration Changes", count: 1, icon: Cpu },
    { label: "Manifest Changes", count: 1, icon: ShieldCheck },
    { label: "Framework Updates", count: 1, icon: Layers },
    { label: "Knowledge Sync Events", count: 1, icon: RefreshCw },
    { label: "Deployments", count: 1, icon: Rocket },
    { label: "Version History", count: FRAMEWORK_REGISTRY.length, icon: GitBranch },
    { label: "Platform Health Events", count: 1, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4">
      {/* Event Type Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {eventTypes.map((t, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <t.icon size={14} className="text-white/40 mx-auto mb-1" />
            <div className="text-white font-bold text-lg">{t.count}</div>
            <div className="text-white/30 text-[10px]">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-indigo-400" />
          <h3 className="text-white/80 font-medium text-sm uppercase tracking-wider">Governance Timeline</h3>
        </div>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <div className={`absolute -left-[18px] w-3 h-3 rounded-full ${event.bg} border-2 border-[#0a0a0f]`} />
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${event.bg} flex items-center justify-center flex-shrink-0`}>
                    <event.icon size={14} className={event.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-sm font-medium">{event.title}</span>
                      <span className="text-white/30 text-[10px]">{event.timestamp}</span>
                    </div>
                    <div className="text-white/40 text-xs mt-0.5">{event.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={16} className="text-purple-400" />
          <h3 className="text-white/80 font-medium text-sm uppercase tracking-wider">Version History</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {FRAMEWORK_REGISTRY.slice(0, 10).map((f) => (
            <div key={f.frameworkId} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={10} className="text-white/30" />
                <span className="text-white/60 text-xs font-medium truncate">{f.name}</span>
              </div>
              <div className="text-white/30 text-[10px]">v{f.version} · {f.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}