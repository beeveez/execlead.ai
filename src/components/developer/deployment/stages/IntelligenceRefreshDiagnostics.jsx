import React, { useMemo } from "react";
import { Brain, Network, Database, Zap } from "lucide-react";
import { discoverPlatformAssets, validateKnowledgeSync, buildRegistries, refreshIntelligenceCaches } from "@/lib/execKnowledgeSyncEngine";

export default function IntelligenceRefreshDiagnostics({ query }) {
  const intelligence = useMemo(() => {
    const assets = discoverPlatformAssets();
    const validation = validateKnowledgeSync(assets);
    const registries = buildRegistries(assets, validation);
    return refreshIntelligenceCaches(assets, registries);
  }, []);

  const caches = Object.values(intelligence).filter((c) => c.status);
  const graphs = caches.filter((c) => c.nodes !== undefined);

  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
        <Brain className="text-emerald-400 shrink-0" size={20} />
        <div>
          <div className="text-sm font-medium text-emerald-400">Intelligence Caches Rebuilt</div>
          <div className="text-xs text-white/40">{caches.length} caches refreshed · {graphs.length} graphs rebuilt</div>
        </div>
      </div>

      {/* Caches */}
      <div>
        <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Intelligence Caches</h3>
        <div className="grid grid-cols-2 gap-2">
          {caches.map((c) => (
            <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/50 text-xs font-medium">{c.name}</span>
                <span className="text-emerald-400 text-xs flex items-center gap-1"><Zap size={8} /> {c.status}</span>
              </div>
              {c.nodes !== undefined ? (
                <div className="text-white/80 text-sm font-mono">{c.nodes} nodes · {c.edges} edges</div>
              ) : (
                <div className="text-white/80 text-sm font-mono">{c.items} items</div>
              )}
              <div className="text-white/20 text-xs mt-0.5">Refreshed: {new Date(c.refreshedAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphs */}
      {graphs.length > 0 && (
        <div>
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Knowledge Graphs</h3>
          <div className="grid grid-cols-2 gap-2">
            {graphs.map((g) => (
              <div key={g.id} className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Network size={12} className="text-violet-400" />
                  <span className="text-white/50 text-xs font-medium">{g.name}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-white/80 font-mono">{g.nodes} <span className="text-white/30 text-xs">nodes</span></span>
                  <span className="text-white/80 font-mono">{g.edges} <span className="text-white/30 text-xs">edges</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}