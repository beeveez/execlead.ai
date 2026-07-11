import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { EXEC_KNOWLEDGE_INDEX, EXEC_FRAMEWORK_HIERARCHY, EXEC_KNOWLEDGE_VERSION, EXEC_KNOWLEDGE_LAST_SYNC, EXEC_PROMPT_VERSION } from "@/lib/execKnowledgeBase";
import { ROUTE_REGISTRY } from "@/lib/routeRegistry";
import { CheckCircle2, AlertTriangle, Info, RefreshCw, Brain, Layers, Map, Zap } from "lucide-react";

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

  // ── Cross-reference routes vs knowledge index ──
  const knowledgePaths = new Set(EXEC_KNOWLEDGE_INDEX.map((m) => m.path));
  const unindexedRoutes = ROUTE_REGISTRY.filter(
    (r) => !isExempt(r.url) && !knowledgePaths.has(r.url) && !r.public
  );
  const indexedCount = ROUTE_REGISTRY.filter(
    (r) => knowledgePaths.has(r.url)
  ).length;
  const totalRelevant = ROUTE_REGISTRY.filter(
    (r) => !isExempt(r.url) && !r.public
  ).length;
  const coveragePct = totalRelevant > 0 ? Math.round((indexedCount / totalRelevant) * 100) : 100;

  // ── Framework coverage check ──
  const frameworkCount = EXEC_FRAMEWORK_HIERARCHY.length;
  const moduleCount = EXEC_KNOWLEDGE_INDEX.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Brain size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">EXEC™ Knowledge Audit</h3>
            <p className="text-white/40 text-xs">Synchronization status, framework versions, and coverage validation</p>
          </div>
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

      {/* Version Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <VersionCard label="Knowledge Version" value={EXEC_KNOWLEDGE_VERSION} icon={Brain} color="indigo" />
        <VersionCard label="Prompt Version" value={EXEC_PROMPT_VERSION} icon={Zap} color="purple" />
        <VersionCard label="Last Sync" value={EXEC_KNOWLEDGE_LAST_SYNC} icon={RefreshCw} color="cyan" />
        <VersionCard label="Route Coverage" value={`${coveragePct}%`} icon={Map} color="emerald" />
      </div>

      {/* Framework Hierarchy */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-indigo-400" />
          <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Framework Hierarchy</h4>
          <span className="text-white/30 text-xs ml-auto">{frameworkCount} frameworks</span>
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

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Indexed Modules" value={moduleCount} icon={CheckCircle2} color="emerald" />
        <StatCard label="Indexed Routes" value={indexedCount} icon={Map} color="indigo" />
        <StatCard label="Unindexed Routes" value={unindexedRoutes.length} icon={AlertTriangle} color={unindexedRoutes.length > 0 ? "amber" : "emerald"} />
      </div>

      {/* Warnings */}
      {unindexedRoutes.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <h4 className="text-amber-400 text-sm font-medium uppercase tracking-wider">Missing Knowledge Entries</h4>
          </div>
          <p className="text-white/50 text-xs mb-3">These routes exist in the platform but have no corresponding entry in the EXEC™ Knowledge Index. EXEC™ cannot navigate users to these pages.</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {unindexedRoutes.map((r) => (
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
              w.level === 'warning' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-blue-500/5 border-blue-500/10'
            }`}>
              {w.level === 'warning' ? <AlertTriangle size={14} className="text-amber-400 mt-0.5" /> : <Info size={14} className="text-blue-400 mt-0.5" />}
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
            <Brain size={16} className="text-purple-400" />
            <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider">Knowledge Pack Engine™</h4>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-3 rounded-lg bg-white/[0.02]">
              <div className="text-2xl font-bold text-white">{syncData.knowledge_packs?.active || 0}</div>
              <div className="text-white/30 text-xs">Active Packs</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/[0.02]">
              <div className="text-2xl font-bold text-white">{syncData.knowledge_packs?.total || 0}</div>
              <div className="text-white/30 text-xs">Total Packs</div>
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

      {/* Sync Status */}
      {syncData && (
        <div className="flex items-center gap-2 text-xs text-white/30">
          <CheckCircle2 size={12} className="text-emerald-400" />
          Last server sync: {new Date(syncData.synchronized_at).toLocaleString()}
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

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
    amber: "text-amber-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-3">
      <Icon size={20} className={colors[color]} />
      <div>
        <div className="text-white font-bold text-xl">{value}</div>
        <div className="text-white/30 text-xs">{label}</div>
      </div>
    </div>
  );
}