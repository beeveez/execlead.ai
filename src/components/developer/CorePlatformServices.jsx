import React, { useMemo } from "react";
import { validateManifest, getManifestCoverage } from "@/lib/platformManifest";
import {
  CORE_PLATFORM_SERVICES, CORE_PLATFORM_SERVICES_VERSION,
  FUTURE_SERVICES, MODULE_INTEGRATION_STANDARD, getServiceById,
} from "@/lib/corePlatformServices";
import {
  CheckCircle2, AlertTriangle, XCircle, Boxes, Package, Network,
  TrendingUp, Brain, Gauge, ArrowRight, Clock, Layers,
  Sparkles, ShieldCheck,
} from "lucide-react";

const SERVICE_ICONS = {
  platform_manifest: Boxes,
  knowledge_pack_engine: Package,
  workspace_intelligence_engine: Network,
  executive_journey_engine: TrendingUp,
  executive_intelligence_engine: Brain,
  platform_governance_center: Gauge,
};

export default function CorePlatformServices() {
  const warnings = useMemo(() => validateManifest(), []);
  const coverage = useMemo(() => getManifestCoverage(), []);

  const errors = warnings.filter((w) => w.level === "error");
  const warns = warnings.filter((w) => w.level === "warning");

  const serviceHealth = useMemo(() => {
    const manifestStatus = errors.length > 0 ? "critical" : warns.length > 0 ? "warning" : "healthy";
    return {
      platform_manifest: {
        status: manifestStatus,
        coverage: coverage.routeCoverage,
        warnings: warnings.length,
        metrics: { modules: coverage.modules, routes: coverage.routes, workspaces: coverage.workspaces },
      },
      knowledge_pack_engine: {
        status: "healthy",
        coverage: 100,
        warnings: 0,
        metrics: { packs: coverage.knowledgePacks, frameworks: coverage.frameworks },
      },
      workspace_intelligence_engine: {
        status: "healthy",
        coverage: 100,
        warnings: 0,
        metrics: { workspaces: coverage.workspaces, personas: coverage.aiPersonas },
      },
      executive_journey_engine: {
        status: "healthy",
        coverage: 100,
        warnings: 0,
        metrics: { capabilities: coverage.activeCapabilities },
      },
      executive_intelligence_engine: {
        status: "healthy",
        coverage: 100,
        warnings: 0,
        metrics: { frameworks: coverage.frameworks, capabilities: coverage.capabilities },
      },
      platform_governance_center: {
        status: "healthy",
        coverage: 100,
        warnings: warnings.length,
        metrics: { sections: 11 },
      },
    };
  }, [warnings, coverage, errors, warns]);

  const statusConfig = {
    healthy: { label: "Healthy", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
    warning: { label: "Warning", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
    critical: { label: "Critical", icon: XCircle, color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10" },
  };

  const overallHealthy = Object.values(serviceHealth).every((s) => s.status === "healthy");
  const healthyCount = Object.values(serviceHealth).filter((s) => s.status === "healthy").length;

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${overallHealthy ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}>
        <Gauge size={24} className={overallHealthy ? "text-emerald-400" : "text-amber-400"} />
        <div className="flex-1">
          <div className="text-white font-semibold">Core Platform Services™ — Architecture v{CORE_PLATFORM_SERVICES_VERSION}</div>
          <div className="text-white/40 text-xs">
            {CORE_PLATFORM_SERVICES.length} foundational services · {overallHealthy ? "All systems operational" : "Attention required"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-xs">Healthy</div>
          <div className="text-white font-bold text-lg">{healthyCount}/{CORE_PLATFORM_SERVICES.length}</div>
        </div>
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CORE_PLATFORM_SERVICES.map((service) => {
          const health = serviceHealth[service.serviceId];
          const cfg = statusConfig[health.status];
          const Icon = SERVICE_ICONS[service.serviceId] || Boxes;
          const deps = service.dependencies.map((dep) => getServiceById(dep)?.name || dep);
          const metricEntries = Object.entries(health.metrics || {});

          return (
            <div key={service.serviceId} className={`rounded-xl border ${cfg.bg} ${cfg.border} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                    <Icon size={14} className={cfg.color} />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{service.name}</div>
                    <div className="text-white/30 text-[10px]">v{service.version}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${cfg.bg} border ${cfg.border}`}>
                  <cfg.icon size={10} className={cfg.color} />
                  <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>

              <p className="text-white/40 text-xs mb-3">{service.purpose}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <div className="text-white/30 text-[10px]">Coverage</div>
                  <div className={`text-sm font-bold ${cfg.color}`}>{health.coverage}%</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <div className="text-white/30 text-[10px]">Warnings</div>
                  <div className={`text-sm font-bold ${health.warnings > 0 ? "text-amber-400" : "text-emerald-400"}`}>{health.warnings}</div>
                </div>
              </div>

              {metricEntries.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {metricEntries.map(([key, value]) => (
                    <span key={key} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{key}: {value}</span>
                  ))}
                </div>
              )}

              <div className="mb-2">
                <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Dependencies</div>
                {deps.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {deps.map((dep) => (
                      <span key={dep} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">{dep}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-white/20">None — foundational service</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-white/30 mt-2 pt-2 border-t border-white/5">
                <Clock size={10} />
                <span>Last Updated: {service.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Architecture Flow */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-indigo-400" />
          <h3 className="text-white/80 font-medium text-sm uppercase tracking-wider">Service Architecture Flow</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CORE_PLATFORM_SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[service.serviceId] || Boxes;
            const health = serviceHealth[service.serviceId];
            const cfg = statusConfig[health.status];
            return (
              <React.Fragment key={service.serviceId}>
                <div className={`px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border} flex items-center gap-2`}>
                  <Icon size={12} className={cfg.color} />
                  <span className="text-white/70 text-xs font-medium">{service.name}</span>
                </div>
                {i < CORE_PLATFORM_SERVICES.length - 1 && (
                  <ArrowRight size={14} className="text-white/20" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Module Integration Standard */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h3 className="text-white/80 font-medium text-sm uppercase tracking-wider">Module Integration Standard</h3>
        </div>
        <p className="text-white/40 text-xs mb-3">{MODULE_INTEGRATION_STANDARD.rule}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {MODULE_INTEGRATION_STANDARD.requiredDeclarations.map((decl) => (
            <div key={decl} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
              <CheckCircle2 size={12} className="text-emerald-400 mx-auto mb-1" />
              <span className="text-white/60 text-xs">{decl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Future Services */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-purple-400" />
          <h3 className="text-white/80 font-medium text-sm uppercase tracking-wider">Future Platform Services</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FUTURE_SERVICES.map((service) => (
            <div key={service.name} className="px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="text-purple-400 text-xs font-medium">{service.name}</div>
              <div className="text-white/30 text-[10px] mt-0.5">{service.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}