import React, { useMemo } from "react";
import { Database, Boxes, Route, Network, Brain, BookOpen, Users, AlertCircle } from "lucide-react";
import { discoverPlatformAssets, validateKnowledgeSync, buildRegistries } from "@/lib/execKnowledgeSyncEngine";
import FindingCard from "../FindingCard";

export default function KnowledgeSyncDiagnostics({ query }) {
  const { assets, validation, registries } = useMemo(() => {
    const a = discoverPlatformAssets();
    const v = validateKnowledgeSync(a);
    const r = buildRegistries(a, v);
    return { assets: a, validation: v, registries: r };
  }, []);

  const stats = [
    { label: "Routes Synchronized", value: assets.counts.routes, icon: Route },
    { label: "Modules Discovered", value: assets.counts.modules, icon: Boxes },
    { label: "Capabilities Registered", value: assets.counts.capabilities, icon: Database },
    { label: "Frameworks Synced", value: assets.counts.frameworks, icon: Network },
    { label: "Knowledge Packs Loaded", value: assets.counts.knowledgePacks, icon: BookOpen },
    { label: "Personas Registered", value: assets.counts.personas, icon: Users },
    { label: "Nav Items Synced", value: assets.counts.navItems, icon: Network },
    { label: "Live Capabilities", value: assets.counts.liveCapabilities, icon: Brain },
  ];

  const findings = validation.findings.map((f) => ({
    id: `${f.code}:${f.target || f.message}`,
    code: f.code, level: f.level, message: f.message,
    rootCause: `Asset validation detected: ${f.code.replace(/_/g, " ").toLowerCase()} in ${f.registry}.`,
    impact: "May reduce platform discoverability and AI awareness.",
    recommendedAction: `Review ${f.target || f.registry} and resolve the ${f.code} finding.`,
    autoRepairable: ["UNASSIGNED_WORKSPACE", "MODULE_MISSING_PACK", "ORPHAN_ROUTE"].includes(f.code),
    evidence: [`Registry: ${f.registry}`, `Target: ${f.target || "—"}`],
    affectedModules: f.target ? [f.target] : [],
    relatedRegistries: [f.registry],
  }));

  return (
    <div className="space-y-4">
      {/* Sync Health */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/80 text-sm font-semibold">Synchronization Health</h3>
          <span className={`text-lg font-bold ${validation.health >= 85 ? "text-emerald-400" : validation.health >= 60 ? "text-amber-400" : "text-red-400"}`}>{validation.health}%</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><div className="text-red-400 text-xl font-bold">{validation.errors.length}</div><div className="text-white/30 text-xs">Errors</div></div>
          <div><div className="text-amber-400 text-xl font-bold">{validation.warnings.length}</div><div className="text-white/30 text-xs">Warnings</div></div>
          <div><div className="text-blue-400 text-xl font-bold">{validation.infos.length}</div><div className="text-white/30 text-xs">Info</div></div>
        </div>
      </div>

      {/* Asset Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={12} className="text-indigo-400" />
              <span className="text-white/30 text-xs">{s.label}</span>
            </div>
            <div className="text-lg font-bold text-white/80">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Registry Breakdown */}
      <div>
        <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">10 Platform Registries</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(registries).map(([key, reg]) => (
            <div key={key} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/50 text-xs font-medium">{reg.name}</div>
              <div className="text-white/80 text-sm mt-0.5">{reg.count ?? reg.registered?.routes ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Findings */}
      {findings.length > 0 && (
        <div>
          <h3 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Validation Findings ({findings.length})</h3>
          <div className="space-y-2">
            {findings.map((f) => <FindingCard key={f.id} finding={f} query={query} />)}
          </div>
        </div>
      )}
    </div>
  );
}