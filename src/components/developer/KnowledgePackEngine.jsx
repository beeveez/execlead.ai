import React, { useMemo } from "react";
import {
  KNOWLEDGE_PACK_REGISTRY,
  MODULE_REGISTRY,
  AI_PERSONA_REGISTRY,
  FRAMEWORK_REGISTRY,
} from "@/lib/platformManifest";
import { Package, Layers, Network, CheckCircle2, RefreshCw } from "lucide-react";

export default function KnowledgePackEngine() {
  const stats = useMemo(() => {
    const active = KNOWLEDGE_PACK_REGISTRY.filter((p) => p.status === "active");
    const totalModules = KNOWLEDGE_PACK_REGISTRY.reduce((sum, p) => sum + (p.supportedModules?.length || 0), 0);
    const coveredFrameworks = new Set(KNOWLEDGE_PACK_REGISTRY.map((p) => p.supportedFramework));
    const frameworkCoverage = FRAMEWORK_REGISTRY.length > 0
      ? Math.round((coveredFrameworks.size / FRAMEWORK_REGISTRY.length) * 100)
      : 0;
    return { active: active.length, totalModules, frameworkCoverage };
  }, []);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <Package size={16} className="text-amber-400" />
          <div>
            <div className="text-white font-bold text-lg">{KNOWLEDGE_PACK_REGISTRY.length}</div>
            <div className="text-white/30 text-[10px]">Knowledge Packs</div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <Layers size={16} className="text-purple-400" />
          <div>
            <div className="text-white font-bold text-lg">{stats.frameworkCoverage}%</div>
            <div className="text-white/30 text-[10px]">Framework Coverage</div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <Network size={16} className="text-cyan-400" />
          <div>
            <div className="text-white font-bold text-lg">{stats.totalModules}</div>
            <div className="text-white/30 text-[10px]">Supported Modules</div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div>
            <div className="text-white font-bold text-lg">{stats.active}</div>
            <div className="text-white/30 text-[10px]">Active Packs</div>
          </div>
        </div>
      </div>

      {/* Pack Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
          <div className="col-span-3">Knowledge Pack</div>
          <div className="col-span-1">Version</div>
          <div className="col-span-2">Framework</div>
          <div className="col-span-2">Modules</div>
          <div className="col-span-2">Personas</div>
          <div className="col-span-1 text-center">Contents</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {KNOWLEDGE_PACK_REGISTRY.map((p) => {
            const modules = MODULE_REGISTRY.filter((m) => m.knowledgePack === p.packId);
            const personas = AI_PERSONA_REGISTRY.filter((pa) => pa.knowledgePacks?.includes(p.packId));
            return (
              <div key={p.packId} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors items-center">
                <div className="col-span-3">
                  <div className="text-xs text-white/80 font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-white/30 truncate">{p.description}</div>
                </div>
                <div className="col-span-1 text-xs text-white/50 font-mono">v{p.version}</div>
                <div className="col-span-2 text-xs text-purple-400/80">{p.supportedFrameworkName}</div>
                <div className="col-span-2">
                  <div className="text-xs text-white/50">{modules.length} modules</div>
                  <div className="text-[10px] text-white/20 truncate">{modules.slice(0, 2).map((m) => m.moduleName).join(", ")}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-white/50">{personas.length} personas</div>
                  <div className="text-[10px] text-white/20 truncate">{personas.slice(0, 2).map((pa) => pa.name).join(", ")}</div>
                </div>
                <div className="col-span-1 text-center text-xs text-white/50">{p.contents?.length || 0}</div>
                <div className="col-span-1 text-center">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    p.status === "active" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                  }`}>{p.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-xs text-white/30">
        <RefreshCw size={12} />
        Last Updated: {KNOWLEDGE_PACK_REGISTRY[0]?.lastUpdated || "Unknown"}
      </div>
    </div>
  );
}