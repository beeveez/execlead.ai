import React from "react";
import { Database, Layers, BookOpen, FileStack, Users, Building2, Fingerprint, Boxes, Navigation, Brain } from "lucide-react";

const REGISTRY_ICONS = {
  platform: Database,
  capability: Boxes,
  knowledgePack: BookOpen,
  framework: FileStack,
  persona: Users,
  workspace: Building2,
  evidence: Fingerprint,
  module: Layers,
  navigation: Navigation,
  execKnowledgeIndex: Brain,
  knowledge: Database,
};

export default function RegistryBreakdown({ registries }) {
  if (!registries) return null;
  const entries = Object.entries(registries);
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Knowledge Registries — {entries.length} registries built</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {entries.map(([key, reg]) => {
          const Icon = REGISTRY_ICONS[key] || Database;
          const count = reg.count ?? reg.registered?.routes ?? reg.items?.length ?? reg.sources ?? reg.modules ?? "—";
          return (
            <div key={key} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={12} className="text-violet-400" />
                <span className="text-[10px] text-white/50 truncate">{reg.name}</span>
              </div>
              <div className="text-2xl font-bold text-white">{count}</div>
              {reg.version && <div className="text-[10px] text-white/30 mt-0.5">v{reg.version}</div>}
              {reg.live != null && <div className="text-[10px] text-emerald-400 mt-0.5">{reg.live} live</div>}
              {reg.active != null && <div className="text-[10px] text-cyan-400 mt-0.5">{reg.active} active</div>}
              {reg.brokenLinks != null && reg.brokenLinks > 0 && <div className="text-[10px] text-red-400 mt-0.5">{reg.brokenLinks} broken</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}