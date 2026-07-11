import React, { useState } from "react";
import {
  FileText, Database, Brain, RefreshCw, Rocket, Activity, Building2,
  AlertTriangle, Wrench, Clock,
} from "lucide-react";
import GovernanceHealthScore from "./GovernanceHealthScore";
import GovernanceDrillDown from "./GovernanceDrillDown";

const DIMENSION_CONFIG = [
  { key: "manifestHealth", label: "Manifest Health", stageId: "s01_manifest", icon: FileText },
  { key: "registryHealth", label: "Registry Health", stageId: "registry", icon: Database },
  { key: "knowledgeHealth", label: "Knowledge Health", stageId: "knowledge", icon: Brain },
  { key: "synchronizationHealth", label: "Synchronization Health", stageId: "s12_registry_sync", icon: RefreshCw },
  { key: "deploymentReadiness", label: "Deployment Readiness", stageId: "s14_deployment", icon: Rocket },
  { key: "platformState", label: "Platform State", stageId: "s11_platform_state", icon: Activity },
  { key: "enterpriseReadiness", label: "Enterprise Readiness", stageId: "s16_certification", icon: Building2 },
];

function getStageFindings(certificate, dimension) {
  if (!certificate) return [];
  if (dimension.stageId === "registry") {
    const registryStageIds = ["s02_modules", "s03_routes", "s04_capabilities", "s05_frameworks", "s08_workspaces", "s09_navigation"];
    return certificate.findings.filter((f) => registryStageIds.includes(f.stageId));
  }
  if (dimension.stageId === "knowledge") {
    const knowledgeStageIds = ["s06_knowledge_packs", "s07_personas", "s10_exec_index"];
    return certificate.findings.filter((f) => knowledgeStageIds.includes(f.stageId));
  }
  return certificate.findings.filter((f) => f.stageId === dimension.stageId);
}

export default function GovernanceCertificateCard({ certificate, pipelineRunning, onRefresh }) {
  const [activeDimension, setActiveDimension] = useState(null);

  if (!certificate) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  const activeFindings = activeDimension ? getStageFindings(certificate, activeDimension) : [];

  return (
    <div className="space-y-4">
      {/* Health Score Grid */}
      <div>
        <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Governance Certificate™ — Health Dimensions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {DIMENSION_CONFIG.map((dim) => (
            <GovernanceHealthScore
              key={dim.key}
              label={dim.label}
              score={certificate[dim.key]}
              icon={dim.icon}
              onClick={() => setActiveDimension(dim)}
            />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat icon={AlertTriangle} label="Failures" value={certificate.failures} color="text-red-400" />
        <SummaryStat icon={AlertTriangle} label="Warnings" value={certificate.warnings} color="text-amber-400" />
        <SummaryStat icon={Wrench} label="Repair Actions" value={certificate.repairActions} color="text-emerald-400" />
        <SummaryStat icon={Clock} label="Execution Time" value={`${certificate.duration}ms`} color="text-indigo-400" />
      </div>

      {/* Certification Footer */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>Certificate ID: <span className="text-white/60 font-mono">{certificate.certificateId}</span></span>
          <span className="text-white/20">·</span>
          <span>Pipeline v{certificate.pipelineVersion}</span>
          <span className="text-white/20">·</span>
          <span>Platform v{certificate.platformVersion}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Clock size={12} />
          <span>{new Date(certificate.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Drill-Down Panel */}
      {activeDimension && (
        <GovernanceDrillDown
          title={activeDimension.label}
          findings={activeFindings}
          onClose={() => setActiveDimension(null)}
        />
      )}
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <Icon size={16} className={color} />
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}