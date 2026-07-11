import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  PLATFORM_METADATA, MODULE_REGISTRY, ROUTE_REGISTRY,
  WORKSPACE_REGISTRY, FRAMEWORK_REGISTRY, KNOWLEDGE_PACK_REGISTRY,
  AI_PERSONA_REGISTRY, CAPABILITY_REGISTRY, SUBSCRIPTION_REGISTRY,
  FEATURE_FLAG_REGISTRY,
} from "@/lib/platformManifest";
import { usePlatformState } from "@/lib/PlatformStateContext";
import {
  CheckCircle2, AlertTriangle, Info, RefreshCw, Boxes, Layers,
  Map, Network, Package, Cpu, ShieldCheck, Zap, Crown, Flag,
} from "lucide-react";

export default function PlatformManifestDashboard() {
  const [syncData, setSyncData] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const runSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("syncPlatformManifest", {});
      setSyncData(res.data);
    } catch (e) {
      // Non-admin or function unavailable
    }
    setSyncing(false);
  };

  useEffect(() => {
    runSync();
  }, []);

  const { coverage, warnings } = usePlatformState();
  const hasIssues = warnings.some((w) => w.level === "error" || w.level === "warning") || (syncData?.warnings?.some((w) => w.level === "warning") ?? false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Boxes size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Platform Manifest™</h3>
            <p className="text-white/40 text-xs">The single source of truth for platform intelligence · v{PLATFORM_METADATA.manifestVersion}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            hasIssues ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            {hasIssues ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
            {hasIssues ? "Needs Attention" : "Synced"}
          </div>
          <button onClick={runSync} disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Re-sync"}
          </button>
        </div>
      </div>

      {/* Platform Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetaCard label="Platform" value={PLATFORM_METADATA.platformVersion} icon={Cpu} color="indigo" />
        <MetaCard label="Manifest" value={`v${PLATFORM_METADATA.manifestVersion}`} icon={Boxes} color="purple" />
        <MetaCard label="Knowledge" value={PLATFORM_METADATA.knowledgeVersion} icon={Zap} color="cyan" />
        <MetaCard label="Framework" value={PLATFORM_METADATA.frameworkVersion} icon={Layers} color="blue" />
        <MetaCard label="Prompt" value={PLATFORM_METADATA.promptVersion} icon={Cpu} color="emerald" />
        <MetaCard label="Build" value={PLATFORM_METADATA.buildNumber} icon={ShieldCheck} color="amber" />
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Modules" value={coverage.modules} icon={Package} color="indigo" />
        <StatCard label="Routes" value={`${coverage.indexedRoutes}/${coverage.relevantRoutes}`} icon={Map} color="emerald" sublabel={`${coverage.routeCoverage}% coverage`} />
        <StatCard label="Workspaces" value={coverage.workspaces} icon={Network} color="cyan" />
        <StatCard label="Frameworks" value={coverage.frameworks} icon={Layers} color="purple" />
        <StatCard label="Knowledge Packs" value={coverage.knowledgePacks} icon={Package} color="amber" />
        <StatCard label="AI Personas" value={coverage.aiPersonas} icon={Network} color="pink" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Capabilities" value={`${coverage.activeCapabilities}/${coverage.capabilities}`} icon={Zap} color="indigo" sublabel={`${coverage.futureCapabilities} future`} />
        <StatCard label="Subscriptions" value={coverage.subscriptions} icon={Crown} color="purple" />
        <StatCard label="Feature Flags" value={coverage.featureFlags} icon={Flag} color="cyan" sublabel={`${coverage.liveFeatures} live · ${coverage.betaFeatures} beta`} />
        <StatCard label="Total Routes" value={coverage.routes} icon={Map} color="emerald" />
      </div>

      {/* Registry Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module Registry */}
        <RegistrySection title="Module Registry" icon={Package} color="indigo" count={MODULE_REGISTRY.length}>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {MODULE_REGISTRY.map((m) => (
              <div key={m.moduleId} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.routeExists ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-xs text-white/70 flex-1 truncate">{m.moduleName}</span>
                <span className="text-[10px] text-white/30">{m.workspace}</span>
                {m.knowledgePack ? <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">KP</span> : <span className="text-[9px] text-white/20">no pack</span>}
              </div>
            ))}
          </div>
        </RegistrySection>

        {/* Framework Registry */}
        <RegistrySection title="Framework Registry" icon={Layers} color="purple" count={FRAMEWORK_REGISTRY.length}>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {FRAMEWORK_REGISTRY.map((f) => (
              <div key={f.frameworkId} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color || "#6366f1" }} />
                <span className="text-xs text-white/70 flex-1 truncate">{f.name}</span>
                <span className="text-[10px] text-white/30">v{f.version}</span>
                <span className="text-[9px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{f.type}</span>
              </div>
            ))}
          </div>
        </RegistrySection>

        {/* Workspace Registry */}
        <RegistrySection title="Workspace Registry" icon={Network} color="cyan" count={WORKSPACE_REGISTRY.length}>
          <div className="space-y-1">
            {WORKSPACE_REGISTRY.map((w) => (
              <div key={w.workspaceId} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: w.color }} />
                <span className="text-xs text-white/70 flex-1">{w.name}</span>
                <span className="text-[10px] text-white/30">{w.moduleCount} modules</span>
                <span className="text-[10px] text-cyan-400">{w.aiPersona}</span>
              </div>
            ))}
          </div>
        </RegistrySection>

        {/* AI Persona Registry */}
        <RegistrySection title="AI Persona Registry" icon={Network} color="pink" count={AI_PERSONA_REGISTRY.length}>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {AI_PERSONA_REGISTRY.map((p) => (
              <div key={p.personaId} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <span className="text-xs text-white/70 flex-1 truncate">{p.name}</span>
                <span className="text-[9px] text-white/30">{p.type.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </RegistrySection>

        {/* Capability Registry */}
        <RegistrySection title="Capability Registry" icon={Zap} color="indigo" count={CAPABILITY_REGISTRY.length}>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {CAPABILITY_REGISTRY.map((c) => (
              <div key={c.capabilityId} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.status === "active" ? "bg-emerald-400" : c.status === "future" ? "bg-amber-400" : "bg-white/20"}`} />
                <span className="text-xs text-white/70 flex-1 truncate">{c.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${c.status === "active" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </RegistrySection>

        {/* Subscription Registry */}
        <RegistrySection title="Subscription Registry" icon={Crown} color="purple" count={SUBSCRIPTION_REGISTRY.length}>
          <div className="space-y-1">
            {SUBSCRIPTION_REGISTRY.map((s) => (
              <div key={s.planId} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors">
                <span className="text-xs text-white/70 flex-1 capitalize">{s.name}</span>
                <span className="text-[10px] text-white/30">{s.modules?.length || 0} modules</span>
                <span className="text-[10px] text-white/30">tier {s.tier}</span>
              </div>
            ))}
          </div>
        </RegistrySection>
      </div>

      {/* Knowledge Pack Registry */}
      <RegistrySection title="Knowledge Pack Registry" icon={Package} color="amber" count={KNOWLEDGE_PACK_REGISTRY.length}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {KNOWLEDGE_PACK_REGISTRY.map((p) => (
            <div key={p.packId} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/70 font-medium truncate">{p.name}</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{p.status}</span>
              </div>
              <div className="text-[10px] text-white/30">v{p.version} · {p.supportedFrameworkName}</div>
              <div className="text-[10px] text-white/20 mt-0.5">{p.supportedModules?.length || 0} modules · {p.contents?.length || 0} contents</div>
            </div>
          ))}
        </div>
      </RegistrySection>

      {/* Feature Flag Summary */}
      <RegistrySection title="Feature Flag Registry" icon={Flag} color="cyan" count={FEATURE_FLAG_REGISTRY.length}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["live", "beta", "development", "deprecated"].map((status) => {
            const count = FEATURE_FLAG_REGISTRY.filter((f) => f.status === status).length;
            const colors = { live: "emerald", beta: "amber", development: "blue", deprecated: "red" };
            return (
              <div key={status} className={`p-3 rounded-lg bg-${colors[status]}-500/5 border border-${colors[status]}-500/10 text-center`}>
                <div className={`text-2xl font-bold text-${colors[status]}-400`}>{count}</div>
                <div className="text-white/30 text-xs capitalize">{status}</div>
              </div>
            );
          })}
        </div>
      </RegistrySection>

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Manifest Validation</h4>
            <span className="text-white/30 text-xs ml-auto">{warnings.length} findings</span>
          </div>
          {warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${
              w.level === "error" ? "bg-red-500/5 border-red-500/10" :
              w.level === "warning" ? "bg-amber-500/5 border-amber-500/10" :
              "bg-blue-500/5 border-blue-500/10"
            }`}>
              {w.level === "error" ? <AlertTriangle size={14} className="text-red-400 mt-0.5" /> :
               w.level === "warning" ? <AlertTriangle size={14} className="text-amber-400 mt-0.5" /> :
               <Info size={14} className="text-blue-400 mt-0.5" />}
              <div>
                <div className="text-white/70 text-sm font-medium">{w.code}</div>
                <div className="text-white/40 text-xs">{w.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backend Sync Data */}
      {syncData && (
        <>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-emerald-400" />
              <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Server-Side Validation</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                <div className="text-xl font-bold text-white">{syncData.knowledge_packs?.active || 0}</div>
                <div className="text-white/30 text-xs">Active Packs</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                <div className="text-xl font-bold text-white">{syncData.knowledge_packs?.total || 0}</div>
                <div className="text-white/30 text-xs">Total Packs</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                <div className="text-xl font-bold text-white">{Object.values(syncData.entity_health || {}).filter((e) => e.accessible).length}</div>
                <div className="text-white/30 text-xs">Healthy Entities</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                <div className="text-xl font-bold text-white">{syncData.warning_count || 0}</div>
                <div className="text-white/30 text-xs">Warnings</div>
              </div>
            </div>
            {syncData.warnings?.length > 0 && (
              <div className="space-y-1.5">
                {syncData.warnings.map((w, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${
                    w.level === "warning" ? "bg-amber-500/5 border-amber-500/10" : "bg-blue-500/5 border-blue-500/10"
                  }`}>
                    {w.level === "warning" ? <AlertTriangle size={12} className="text-amber-400 mt-0.5" /> : <Info size={12} className="text-blue-400 mt-0.5" />}
                    <span className="text-white/50">{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-white/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-400" />
              Last server sync: {new Date(syncData.synchronized_at).toLocaleString()}
            </div>
            <div>Triggered by: {syncData.triggered_by?.replace(/_/g, " ")}</div>
          </div>
        </>
      )}
    </div>
  );
}

function MetaCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={16} />
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sublabel }) {
  const colors = {
    emerald: "text-emerald-400", indigo: "text-indigo-400", purple: "text-purple-400",
    cyan: "text-cyan-400", pink: "text-pink-400", amber: "text-amber-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-3">
      <Icon size={20} className={colors[color]} />
      <div className="min-w-0">
        <div className="text-white font-bold text-xl">{value}</div>
        <div className="text-white/30 text-xs">{label}</div>
        {sublabel && <div className="text-white/20 text-xs truncate">{sublabel}</div>}
      </div>
    </div>
  );
}

function RegistrySection({ title, icon: Icon, color, count, children }) {
  const colors = {
    indigo: "text-indigo-400", purple: "text-purple-400", cyan: "text-cyan-400",
    pink: "text-pink-400", amber: "text-amber-400", emerald: "text-emerald-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className={colors[color]} />
        <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">{title}</h4>
        <span className="text-white/30 text-xs ml-auto">{count} registered</span>
      </div>
      {children}
    </div>
  );
}