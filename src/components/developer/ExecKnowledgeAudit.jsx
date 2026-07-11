import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  EXEC_KNOWLEDGE_INDEX, EXEC_FRAMEWORK_HIERARCHY,
  EXEC_KNOWLEDGE_VERSION, EXEC_KNOWLEDGE_LAST_SYNC, EXEC_PROMPT_VERSION,
  EXEC_PLATFORM_VERSION,
} from "@/lib/execKnowledgeBase";
import { ROUTE_REGISTRY, routeMatches } from "@/lib/routeRegistry";
import { WORKSPACE_PERSONAS, PAGE_PERSONA_OVERRIDES } from "@/lib/execWorkspacePersonas";
import { MODULE_PERSONA_OVERRIDES } from "@/lib/execModulePersonas";
import {
  CheckCircle2, AlertTriangle, Info, RefreshCw, Brain, Layers,
  Map, Zap, Network, Package, Cpu, ShieldCheck,
} from "lucide-react";

// Routes that are infrastructure/auth/utility and don't need knowledge index entries
const EXEMPT_ROUTES = [
  "/login", "/register", "/forgot-password", "/reset-password", "/onboarding",
  "/legal", "/about", "/contact", "/u/:username", "/home", "/metrics",
  "/compare-plans", "/notifications", "/profile", "/settings", "/feedback",
  "/connected-accounts", "/developer", "/developer/audit-logs", "/developer/system-health",
  "/developer/api-keys", "/developer/database", "/developer/migrations", "/developer/deployments",
  "/developer/organizations", "/developer/diagnostics", "/developer/ai-command-center",
  "/developer/product", "/concierge", "/portal/:quoteId", "/verify/:verificationId",
  "/founders", "/founders-wall", "/trust-center", "/company-library", "/company-library/:id",
];

function isExempt(path) {
  return EXEMPT_ROUTES.some((e) => {
    if (e === path) return true;
    const a = e.split("/").filter(Boolean);
    const b = path.split("/").filter(Boolean);
    if (a.length !== b.length) return false;
    return a.every((p, i) => p.startsWith(":") || p === b[i]);
  });
}

export default function ExecKnowledgeAudit() {
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const runSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("syncExecKnowledge", {});
      setSyncData(res.data);
    } catch (e) {
      // Non-admin or function unavailable — still show frontend audit
    }
    setSyncing(false);
    setLoading(false);
  };

  useEffect(() => {
    runSync();
  }, []);

  // ── Compute coverage metrics from frontend registries ──
  const metrics = useMemo(() => {
    const knowledgePaths = new Set(EXEC_KNOWLEDGE_INDEX.map((m) => m.path));

    // Unindexed routes: routes that exist but have no knowledge index entry
    const unindexedRoutes = ROUTE_REGISTRY.filter(
      (r) => !isExempt(r.url) && !knowledgePaths.has(r.url) && !r.public
    );

    // Broken references: knowledge index entries whose paths don't exist in route registry
    const brokenReferences = EXEC_KNOWLEDGE_INDEX.filter(
      (m) => !ROUTE_REGISTRY.some((r) => routeMatches(r.url, m.path))
    );

    const indexedCount = ROUTE_REGISTRY.filter(
      (r) => knowledgePaths.has(r.url)
    ).length;
    const totalRelevant = ROUTE_REGISTRY.filter(
      (r) => !isExempt(r.url) && !r.public
    ).length;
    const coveragePct = totalRelevant > 0 ? Math.round((indexedCount / totalRelevant) * 100) : 100;

    // AI Persona counts
    const basePersonaCount = Object.keys(WORKSPACE_PERSONAS).length;
    const pageOverrideCount = PAGE_PERSONA_OVERRIDES.length;
    const moduleOverrideCount = MODULE_PERSONA_OVERRIDES.length;
    const totalPersonas = basePersonaCount + pageOverrideCount + moduleOverrideCount;

    return {
      unindexedRoutes,
      brokenReferences,
      indexedCount,
      totalRelevant,
      coveragePct,
      moduleCount: EXEC_KNOWLEDGE_INDEX.length,
      frameworkCount: EXEC_FRAMEWORK_HIERARCHY.length,
      basePersonaCount,
      pageOverrideCount,
      moduleOverrideCount,
      totalPersonas,
    };
  }, []);

  // ── Synchronization status ──
  const syncStatus = syncData?.sync_status || (loading ? "checking" : "unknown");
  const hasIssues = metrics.unindexedRoutes.length > 0 || metrics.brokenReferences.length > 0 || (syncData?.warnings?.some(w => w.level === "warning") ?? false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Brain size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">EXEC™ Knowledge Status</h3>
            <p className="text-white/40 text-xs">Continuous synchronization engine · self-healing · version-tracked</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            hasIssues
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            {hasIssues ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
            {hasIssues ? "Needs Attention" : "Synced"}
          </div>
          <button
            onClick={runSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Re-sync"}
          </button>
        </div>
      </div>

      {/* Version Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <VersionCard label="Platform Version" value={EXEC_PLATFORM_VERSION} icon={Cpu} color="indigo" />
        <VersionCard label="Knowledge Version" value={EXEC_KNOWLEDGE_VERSION} icon={Brain} color="purple" />
        <VersionCard label="Prompt Version" value={EXEC_PROMPT_VERSION} icon={Zap} color="cyan" />
        <VersionCard label="Last Sync" value={EXEC_KNOWLEDGE_LAST_SYNC} icon={RefreshCw} color="blue" />
        <VersionCard label="Route Coverage" value={`${metrics.coveragePct}%`} icon={Map} color="emerald" />
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Modules Indexed" value={metrics.moduleCount} icon={Package} color="indigo" />
        <StatCard label="Frameworks Indexed" value={metrics.frameworkCount} icon={Layers} color="purple" />
        <StatCard label="AI Personas" value={metrics.totalPersonas} icon={Network} color="cyan" sublabel={`${metrics.basePersonaCount} base · ${metrics.pageOverrideCount + metrics.moduleOverrideCount} overrides`} />
        <StatCard label="Routes Indexed" value={`${metrics.indexedCount}/${metrics.totalRelevant}`} icon={Map} color="emerald" />
      </div>

      {/* Framework Hierarchy */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-indigo-400" />
          <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Framework Hierarchy</h4>
          <span className="text-white/30 text-xs ml-auto">{metrics.frameworkCount} frameworks</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {EXEC_FRAMEWORK_HIERARCHY.map((f, i) => (
            <React.Fragment key={f.id}>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                <div className="text-white font-medium text-sm">{f.name}</div>
                <div className="text-white/30 text-xs">v{f.version}</div>
              </div>
              {i < EXEC_FRAMEWORK_HIERARCHY.length - 1 && (
                <span className="text-white/20 text-lg">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* AI Persona Breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Network size={16} className="text-cyan-400" />
          <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Workspace Intelligence</h4>
          <span className="text-white/30 text-xs ml-auto">{metrics.totalPersonas} total personas</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <PersonaStat label="Base Workspaces" value={metrics.basePersonaCount} items={Object.keys(WORKSPACE_PERSONAS).join(", ")} />
          <PersonaStat label="Page Overrides" value={metrics.pageOverrideCount} items={PAGE_PERSONA_OVERRIDES.map(p => p.tagline).join(", ")} />
          <PersonaStat label="Module Overrides" value={metrics.moduleOverrideCount} items={MODULE_PERSONA_OVERRIDES.map(p => p.tagline).join(", ")} />
        </div>
      </div>

      {/* Broken References — Self-Healing Detection */}
      {metrics.brokenReferences.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-400" />
            <h4 className="text-red-400 text-sm font-medium uppercase tracking-wider">Broken Navigation References</h4>
          </div>
          <p className="text-white/50 text-xs mb-3">EXEC™ Knowledge Index entries point to routes that don't exist in the Route Registry. These will produce broken navigation links.</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {metrics.brokenReferences.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <span className="text-red-400/60 text-xs font-mono">{m.path}</span>
                <span className="text-white/30 text-xs">— {m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Knowledge — Unindexed Routes */}
      {metrics.unindexedRoutes.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <h4 className="text-amber-400 text-sm font-medium uppercase tracking-wider">Missing Knowledge Entries</h4>
          </div>
          <p className="text-white/50 text-xs mb-3">These routes exist in the platform but have no corresponding entry in the EXEC™ Knowledge Index. EXEC™ cannot navigate users to these pages.</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {metrics.unindexedRoutes.map((r) => (
              <div key={r.url} className="flex items-center gap-2 text-sm">
                <span className="text-amber-400/60 text-xs font-mono">{r.url}</span>
                <span className="text-white/30 text-xs">— {r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backend Sync Warnings */}
      {syncData?.warnings?.length > 0 && (
        <div className="space-y-2">
          {syncData.warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${
              w.level === "warning" ? "bg-amber-500/5 border-amber-500/10" : "bg-blue-500/5 border-blue-500/10"
            }`}>
              {w.level === "warning" ? <AlertTriangle size={14} className="text-amber-400 mt-0.5" /> : <Info size={14} className="text-blue-400 mt-0.5" />}
              <div>
                <div className="text-white/70 text-sm font-medium">{w.code}</div>
                <div className="text-white/40 text-xs">{w.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Knowledge Pack Status */}
      {syncData && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-purple-400" />
            <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Knowledge Pack Engine™</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-3 rounded-lg bg-white/[0.02]">
              <div className="text-2xl font-bold text-white">{syncData.knowledge_packs?.active || 0}</div>
              <div className="text-white/30 text-xs">Active</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/[0.02]">
              <div className="text-2xl font-bold text-white">{syncData.knowledge_packs?.draft || 0}</div>
              <div className="text-white/30 text-xs">Draft</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/[0.02]">
              <div className="text-2xl font-bold text-white">{syncData.knowledge_packs?.total || 0}</div>
              <div className="text-white/30 text-xs">Total</div>
            </div>
          </div>
          {syncData.knowledge_packs?.active_packs?.length > 0 && (
            <div className="space-y-1.5">
              {syncData.knowledge_packs.active_packs.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-white/[0.02]">
                  <span className="text-white/70">{p.name}</span>
                  <span className="text-white/30 text-xs">{p.framework_id} · v{p.version}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Entity Health */}
      {syncData?.entity_health && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Entity Health</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(syncData.entity_health).map(([name, health]) => (
              <div key={name} className={`p-2 rounded-lg border text-center ${
                health.accessible ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
              }`}>
                <div className={`text-xs font-medium ${health.accessible ? "text-emerald-400" : "text-red-400"}`}>
                  {health.accessible ? "✓" : "✗"}
                </div>
                <div className="text-white/50 text-xs mt-0.5">{name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Metadata */}
      {syncData && (
        <div className="flex items-center justify-between text-xs text-white/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Last server sync: {new Date(syncData.synchronized_at).toLocaleString()}
          </div>
          <div>Triggered by: {syncData.triggered_by?.replace(/_/g, " ")}</div>
        </div>
      )}
    </div>
  );
}

function VersionCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
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
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
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

function PersonaStat({ label, value, items }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="text-white font-bold text-lg mb-1">{value}</div>
      <div className="text-white/40 text-xs mb-1">{label}</div>
      <div className="text-white/20 text-xs leading-relaxed">{items}</div>
    </div>
  );
}