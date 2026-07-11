import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { resolveWorkspacePersona } from "@/lib/execWorkspacePersonas";
import {
  MODULE_REGISTRY, ROUTE_REGISTRY, KNOWLEDGE_PACK_REGISTRY,
  CAPABILITY_REGISTRY, FRAMEWORK_REGISTRY, SUBSCRIPTION_REGISTRY,
  routeMatches,
} from "@/lib/platformManifest";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

export default function ContextValidation() {
  const location = useLocation();
  const { activeWorkspace, role, plan, profile } = useWorkspace();
  const { subscription } = useSubscription();

  const persona = useMemo(
    () => resolveWorkspacePersona(activeWorkspace, location.pathname),
    [activeWorkspace, location.pathname]
  );

  const currentModule = useMemo(
    () => MODULE_REGISTRY.find((m) => routeMatches(m.route, location.pathname) || location.pathname.startsWith(m.route + "/")),
    [location.pathname]
  );

  const checks = useMemo(() => {
    const results = [];

    // Active Workspace
    results.push({
      label: "Active Workspace",
      value: activeWorkspace || "None",
      status: activeWorkspace ? "pass" : "fail",
      severity: activeWorkspace ? "low" : "high",
    });

    // Active Persona
    results.push({
      label: "Active Persona",
      value: persona?.tagline || "None",
      status: persona ? "pass" : "fail",
      severity: persona ? "low" : "high",
    });

    // Active Route
    const routeExists = ROUTE_REGISTRY.some((r) => routeMatches(r.url, location.pathname));
    results.push({
      label: "Active Route",
      value: location.pathname,
      status: routeExists ? "pass" : "warn",
      severity: routeExists ? "low" : "medium",
    });

    // Active Module
    results.push({
      label: "Active Module",
      value: currentModule?.moduleName || "Unregistered",
      status: currentModule ? "pass" : "warn",
      severity: currentModule ? "low" : "medium",
    });

    // Active Knowledge Pack
    const hasPack = currentModule?.knowledgePack && KNOWLEDGE_PACK_REGISTRY.some((p) => p.packId === currentModule.knowledgePack);
    results.push({
      label: "Active Knowledge Pack",
      value: currentModule?.knowledgePack ? KNOWLEDGE_PACK_REGISTRY.find((p) => p.packId === currentModule.knowledgePack)?.name : "None",
      status: hasPack ? "pass" : currentModule ? "warn" : "info",
      severity: hasPack ? "low" : "low",
    });

    // Active Subscription
    const subExists = SUBSCRIPTION_REGISTRY.some((s) => s.planId === plan);
    results.push({
      label: "Active Subscription",
      value: plan || "free",
      status: subExists ? "pass" : "warn",
      severity: subExists ? "low" : "low",
    });

    // Active Organization
    results.push({
      label: "Active Organization",
      value: profile?.organization_id ? (profile?.current_company || "Connected") : "None",
      status: "pass",
      severity: "low",
    });

    // Active Feature Flags
    results.push({
      label: "Active Feature Flags",
      value: currentModule?.featureFlag ? "Gated" : "Open",
      status: "pass",
      severity: "low",
    });

    // Active Framework
    const framework = currentModule?.knowledgePack
      ? FRAMEWORK_REGISTRY.find((f) => f.knowledgePack === currentModule.knowledgePack)
      : null;
    results.push({
      label: "Active Framework",
      value: framework?.name || "None",
      status: framework ? "pass" : "info",
      severity: "low",
    });

    // Active Configuration Version
    results.push({
      label: "Configuration Version",
      value: subscription?.configVersion || "Unknown",
      status: subscription?.configVersion ? "pass" : "warn",
      severity: subscription?.configVersion ? "low" : "low",
    });

    return results;
  }, [activeWorkspace, persona, location.pathname, currentModule, plan, profile, subscription]);

  const hasHighSeverity = checks.some((c) => c.severity === "high" && c.status !== "pass");
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
          hasHighSeverity ? "bg-red-500/10 border-red-500/20 text-red-400" :
          warnCount > 0 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        }`}>
          {hasHighSeverity ? <XCircle size={12} /> : warnCount > 0 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
          {hasHighSeverity ? "High Severity Mismatch" : warnCount > 0 ? `${warnCount} Warning(s)` : "All Checks Passed"}
        </div>
        <span className="text-white/30 text-xs">{checks.filter((c) => c.status === "pass").length}/{checks.length} passed</span>
      </div>

      {/* High Severity Warning */}
      {hasHighSeverity && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-400 mt-0.5" />
          <div>
            <div className="text-red-400 text-sm font-medium">High Severity Warning</div>
            <div className="text-white/50 text-xs mt-0.5">One or more critical context validations failed. EXEC™ may not have correct platform context for the current session.</div>
          </div>
        </div>
      )}

      {/* Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {checks.map((check, i) => (
          <div key={i} className={`p-3 rounded-lg border ${
            check.status === "pass" ? "bg-emerald-500/5 border-emerald-500/10" :
            check.status === "warn" ? "bg-amber-500/5 border-amber-500/10" :
            check.status === "fail" ? "bg-red-500/5 border-red-500/10" :
            "bg-blue-500/5 border-blue-500/10"
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/30 text-[10px] uppercase tracking-wider">{check.label}</span>
              {check.status === "pass" && <CheckCircle2 size={12} className="text-emerald-400" />}
              {check.status === "warn" && <AlertTriangle size={12} className="text-amber-400" />}
              {check.status === "fail" && <XCircle size={12} className="text-red-400" />}
              {check.status === "info" && <ShieldCheck size={12} className="text-blue-400" />}
            </div>
            <div className="text-xs text-white/70 font-medium truncate">{check.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}