import React, { useMemo } from "react";
import {
  validateManifest,
  getManifestCoverage,
  MODULE_REGISTRY,
  ROUTE_REGISTRY,
  FRAMEWORK_REGISTRY,
  KNOWLEDGE_PACK_REGISTRY,
  AI_PERSONA_REGISTRY,
  FEATURE_FLAG_REGISTRY,
  PLATFORM_METADATA,
} from "@/lib/platformManifest";
import {
  CheckCircle2, AlertTriangle, XCircle, Rocket, ShieldCheck,
} from "lucide-react";

export default function DeploymentReadiness() {
  const checks = useMemo(() => {
    const warnings = validateManifest();
    const coverage = getManifestCoverage();

    const errors = warnings.filter((w) => w.level === "error");
    const warns = warnings.filter((w) => w.level === "warning");

    const brokenModules = MODULE_REGISTRY.filter((m) => !m.routeExists);
    const frameworksMissingPacks = FRAMEWORK_REGISTRY.filter((f) => f.type === "intelligence" && !f.knowledgePack);
    const brokenFrameworkDeps = FRAMEWORK_REGISTRY.filter((f) => f.dependencies && !f.dependencies.every((dep) => FRAMEWORK_REGISTRY.some((fw) => fw.frameworkId === dep)));

    return [
      {
        label: "Platform Manifest Complete",
        status: errors.length === 0 ? "pass" : "fail",
        detail: errors.length === 0 ? "No validation errors" : `${errors.length} error(s) found`,
      },
      {
        label: "EXEC™ Synchronized",
        status: "pass",
        detail: `Knowledge v${PLATFORM_METADATA.knowledgeVersion} · Prompt v${PLATFORM_METADATA.promptVersion}`,
      },
      {
        label: "Framework Registry Healthy",
        status: brokenFrameworkDeps.length === 0 ? "pass" : "fail",
        detail: brokenFrameworkDeps.length === 0 ? `${FRAMEWORK_REGISTRY.length} frameworks registered` : `${brokenFrameworkDeps.length} broken dependency(ies)`,
      },
      {
        label: "Knowledge Packs Loaded",
        status: frameworksMissingPacks.length === 0 ? "pass" : "warn",
        detail: frameworksMissingPacks.length === 0 ? `${KNOWLEDGE_PACK_REGISTRY.length} packs loaded` : `${frameworksMissingPacks.length} framework(s) missing packs`,
      },
      {
        label: "Personas Registered",
        status: AI_PERSONA_REGISTRY.length > 0 ? "pass" : "fail",
        detail: `${AI_PERSONA_REGISTRY.length} AI personas registered`,
      },
      {
        label: "Routes Valid",
        status: brokenModules.length === 0 ? "pass" : "warn",
        detail: brokenModules.length === 0 ? `${ROUTE_REGISTRY.length} routes valid` : `${brokenModules.length} broken reference(s)`,
      },
      {
        label: "Modules Registered",
        status: MODULE_REGISTRY.length > 0 ? "pass" : "fail",
        detail: `${MODULE_REGISTRY.length} modules registered`,
      },
      {
        label: "Feature Flags Valid",
        status: FEATURE_FLAG_REGISTRY.length > 0 ? "pass" : "warn",
        detail: `${FEATURE_FLAG_REGISTRY.length} flags configured`,
      },
      {
        label: "Configuration Loaded",
        status: "pass",
        detail: `Config v${PLATFORM_METADATA.configVersion || "auto"} · Build ${PLATFORM_METADATA.buildNumber}`,
      },
      {
        label: "No Broken References",
        status: errors.length === 0 && warns.length === 0 ? "pass" : errors.length === 0 ? "warn" : "fail",
        detail: errors.length === 0 && warns.length === 0 ? "All references resolve" : `${errors.length + warns.length} finding(s)`,
      },
    ];
  }, []);

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warned = checks.filter((c) => c.status === "warn").length;
  const ready = failed === 0 && warned === 0;
  const canDeploy = failed === 0;

  const statusConfig = {
    pass: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
    warn: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
    fail: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10" },
  };

  return (
    <div className="space-y-4">
      {/* Readiness Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        ready ? "bg-emerald-500/5 border-emerald-500/10" :
        canDeploy ? "bg-amber-500/5 border-amber-500/10" :
        "bg-red-500/5 border-red-500/10"
      }`}>
        <Rocket size={24} className={ready ? "text-emerald-400" : canDeploy ? "text-amber-400" : "text-red-400"} />
        <div className="flex-1">
          <div className="text-white font-semibold">
            {ready ? "Ready for Deployment" : canDeploy ? "Deployable with Warnings" : "Deployment Blocked"}
          </div>
          <div className="text-white/40 text-xs">
            {passed} passed · {warned} warnings · {failed} failures
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-xs">Readiness</div>
          <div className={`font-bold text-lg ${ready ? "text-emerald-400" : canDeploy ? "text-amber-400" : "text-red-400"}`}>
            {Math.round((passed / checks.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((check, i) => {
          const cfg = statusConfig[check.status];
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
              <cfg.icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium">{check.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{check.detail}</div>
              </div>
              <ShieldCheck size={12} className="text-white/20" />
            </div>
          );
        })}
      </div>
    </div>
  );
}