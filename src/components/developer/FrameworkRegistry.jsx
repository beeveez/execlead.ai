import React, { useMemo } from "react";
import { FRAMEWORK_REGISTRY, MODULE_REGISTRY, KNOWLEDGE_PACK_REGISTRY } from "@/lib/platformManifest";
import { Layers, Package, CheckCircle2, AlertTriangle } from "lucide-react";

export default function FrameworkRegistry() {
  const frameworkData = useMemo(() => {
    return FRAMEWORK_REGISTRY.map((f) => {
      const knowledgePack = f.knowledgePack
        ? KNOWLEDGE_PACK_REGISTRY.find((p) => p.packId === f.knowledgePack)
        : null;
      const relatedModules = MODULE_REGISTRY.filter((m) =>
        f.relatedModules?.some((rm) => rm.includes(f.frameworkId) || f.frameworkId.includes(rm) || m.knowledgePack === f.knowledgePack)
      );
      const depStatus = f.dependencies?.every((dep) =>
        FRAMEWORK_REGISTRY.some((fw) => fw.frameworkId === dep)
      );
      return {
        ...f,
        knowledgePackInfo: knowledgePack,
        moduleCount: relatedModules.length,
        modules: relatedModules,
        depStatus,
      };
    });
  }, []);

  const stats = useMemo(() => {
    const active = frameworkData.filter((f) => f.status === "active" || f.type === "methodology" || f.type === "platform").length;
    const withPacks = frameworkData.filter((f) => f.knowledgePack).length;
    const coverage = frameworkData.length > 0 ? Math.round((withPacks / frameworkData.length) * 100) : 0;
    return { active, withPacks, coverage };
  }, [frameworkData]);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <Layers size={16} className="text-purple-400" />
          <div>
            <div className="text-white font-bold text-lg">{frameworkData.length}</div>
            <div className="text-white/30 text-[10px]">Total Frameworks</div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <Package size={16} className="text-amber-400" />
          <div>
            <div className="text-white font-bold text-lg">{stats.withPacks}</div>
            <div className="text-white/30 text-[10px]">With Knowledge Pack</div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div>
            <div className="text-white font-bold text-lg">{stats.coverage}%</div>
            <div className="text-white/30 text-[10px]">Pack Coverage</div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle size={16} className={stats.coverage === 100 ? "text-emerald-400" : "text-amber-400"} />
          <div>
            <div className="text-white font-bold text-lg">{frameworkData.filter((f) => !f.depStatus).length}</div>
            <div className="text-white/30 text-[10px]">Broken Dependencies</div>
          </div>
        </div>
      </div>

      {/* Framework Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
          <div className="col-span-3">Framework</div>
          <div className="col-span-1">Version</div>
          <div className="col-span-3">Knowledge Pack</div>
          <div className="col-span-3">Dependencies</div>
          <div className="col-span-1 text-center">Modules</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {frameworkData.map((f) => (
            <div key={f.frameworkId} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors items-center">
              <div className="col-span-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color || "#6366f1" }} />
                <div className="min-w-0">
                  <div className="text-xs text-white/80 font-medium truncate">{f.name}</div>
                  <div className="text-[10px] text-white/30 truncate">{f.type}</div>
                </div>
              </div>
              <div className="col-span-1 text-xs text-white/50 font-mono">v{f.version}</div>
              <div className="col-span-3">
                {f.knowledgePackInfo ? (
                  <span className="text-xs text-amber-400/80">{f.knowledgePackInfo.name}</span>
                ) : (
                  <span className="text-[10px] text-white/20">— none —</span>
                )}
              </div>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-1">
                  {f.dependencies?.length > 0 ? (
                    f.dependencies.map((dep) => (
                      <span key={dep} className={`text-[10px] px-1.5 py-0.5 rounded ${
                        f.depStatus ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                      }`}>{dep}</span>
                    ))
                  ) : (
                    <span className="text-[10px] text-white/20">none</span>
                  )}
                </div>
              </div>
              <div className="col-span-1 text-center text-xs text-white/50">{f.moduleCount}</div>
              <div className="col-span-1 text-center">
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                  f.type === "methodology" ? "text-indigo-400 bg-indigo-500/10" :
                  f.type === "intelligence" ? "text-purple-400 bg-purple-500/10" :
                  "text-cyan-400 bg-cyan-500/10"
                }`}>{f.type === "methodology" ? "governing" : f.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}