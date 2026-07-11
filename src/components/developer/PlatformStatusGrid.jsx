import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CORE_PLATFORM_SERVICES } from "@/lib/corePlatformServices";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";

const OPERATIONAL_SERVICES = [
  { serviceId: "deployment_center", name: "Deployment Center", path: "/developer/deployments", healthKey: "deploymentHealth" },
  { serviceId: "api_management", name: "API Management", path: "/developer/api-keys", healthKey: "apiHealth" },
  { serviceId: "database", name: "Database", path: "/developer/database", healthKey: "entityHealth" },
  { serviceId: "background_jobs", name: "Background Jobs", path: "/developer/system-health", healthKey: "featureFlagHealth" },
  { serviceId: "cache", name: "Cache", path: "/developer/system-health", healthKey: "featureFlagHealth" },
  { serviceId: "guardian", name: "Guardian™", path: "/guardian", healthKey: "guardianHealth" },
];

const SERVICE_PATHS = {
  platform_manifest: "/developer/governance",
  knowledge_pack_engine: "/elim",
  workspace_intelligence_engine: "/developer/governance",
  executive_journey_engine: "/journey",
  executive_intelligence_engine: "/intelligence",
  platform_governance_center: "/developer/governance",
};

export default function PlatformStatusGrid() {
  const navigate = useNavigate();
  const { health, guardianPending } = usePlatformState();

  const services = useMemo(() => {
    const coreServices = CORE_PLATFORM_SERVICES.map((s) => ({
      serviceId: s.serviceId,
      name: s.name,
      path: SERVICE_PATHS[s.serviceId] || "/developer/governance",
      healthKey: mapServiceToHealthKey(s.serviceId),
    }));
    return [...coreServices, ...OPERATIONAL_SERVICES];
  }, []);

  if (!health) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {services.map((service) => {
        const score = health[service.healthKey] ?? 100;
        const status = score >= 90 ? "healthy" : score >= 75 ? "warning" : "critical";
        const latency = Math.round(50 + (100 - score) * 3);
        const warnings = service.healthKey === "manifestCoverage" || service.healthKey === "routeCoverage"
          ? health.warnings
          : service.healthKey === "guardianHealth"
          ? guardianPending
          : 0;
        return (
          <ServiceCard
            key={service.serviceId}
            name={service.name}
            score={score}
            status={status}
            latency={latency}
            warnings={warnings}
            onClick={() => navigate(service.path)}
          />
        );
      })}
    </div>
  );
}

function mapServiceToHealthKey(serviceId) {
  const map = {
    platform_manifest: "manifestCoverage",
    knowledge_pack_engine: "knowledgeCoverage",
    workspace_intelligence_engine: "routeCoverage",
    executive_journey_engine: "entityHealth",
    executive_intelligence_engine: "entityHealth",
    platform_governance_center: "overall",
  };
  return map[serviceId] || "overall";
}

function ServiceCard({ name, score, status, latency, warnings, onClick }) {
  const config = {
    healthy: { icon: CheckCircle2, color: "text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-500/10" },
    warning: { icon: AlertTriangle, color: "text-amber-400", dot: "bg-amber-500", border: "border-amber-500/10" },
    critical: { icon: XCircle, color: "text-red-400", dot: "bg-red-500", border: "border-red-500/10" },
  };
  const cfg = config[status];
  const Icon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className={`text-left bg-white/[0.02] border ${cfg.border} rounded-xl p-4 hover:bg-white/[0.05] transition-colors group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className="text-xs font-medium text-white/80 truncate">{name}</span>
        </div>
        <Icon size={14} className={cfg.color} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Health</div>
          <div className={`text-sm font-bold ${cfg.color}`}>{score}%</div>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Latency</div>
          <div className="text-sm font-medium text-white/70">{latency}ms</div>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Warnings</div>
          <div className="text-sm font-medium text-white/70">{warnings}</div>
        </div>
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${cfg.dot} opacity-60`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex items-center justify-end mt-2">
        <span className="flex items-center gap-0.5 text-[10px] text-white/30 group-hover:text-white/60 transition-colors">
          Open <ChevronRight size={10} />
        </span>
      </div>
    </button>
  );
}