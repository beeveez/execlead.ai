import React, { useState, useMemo } from "react";
import { X, Search, Filter, ChevronDown } from "lucide-react";
import { DEPLOYMENT_PIPELINE_STAGES } from "@/lib/deploymentPipeline";
import ExecCopilot from "./ExecCopilot";
import BuildDiagnostics from "./stages/BuildDiagnostics";
import PlatformValidationDiagnostics from "./stages/PlatformValidationDiagnostics";
import GuardianDiagnostics from "./stages/GuardianDiagnostics";
import KnowledgeSyncDiagnostics from "./stages/KnowledgeSyncDiagnostics";
import IntelligenceRefreshDiagnostics from "./stages/IntelligenceRefreshDiagnostics";
import DeploymentVerificationDiagnostics from "./stages/DeploymentVerificationDiagnostics";
import ProductionCertificationDiagnostics from "./stages/ProductionCertificationDiagnostics";
import SecurityRegressionDiagnostics from "./stages/SecurityRegressionDiagnostics";

const STAGE_COMPONENTS = {
  security_hardening: GuardianDiagnostics,
  security_verification: SecurityRegressionDiagnostics,
  rc1: PlatformValidationDiagnostics,
  executive_release_review: ProductionCertificationDiagnostics,
  production_certification: ProductionCertificationDiagnostics,
  sprint_4: ProductionCertificationDiagnostics,
};

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "error", label: "Critical" },
  { key: "warning", label: "Warnings" },
  { key: "info", label: "Info" },
];

export default function DiagnosticsDrawer({ stageId, stageData, initialFilter, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState(initialFilter || "all");
  const [showFilters, setShowFilters] = useState(false);

  const stage = DEPLOYMENT_PIPELINE_STAGES.find((s) => s.id === stageId);
  const DiagComponent = STAGE_COMPONENTS[stageId];

  const contextSummary = useMemo(() => {
    if (!stageData) return "No data available.";
    return JSON.stringify({ stage: stage?.name, status: stageData.status, data: stageData.data }, null, 2).slice(0, 3000);
  }, [stageData, stage]);

  if (!stage || !DiagComponent) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0f] border-l border-white/10 flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg">{stage.name}</h2>
            <p className="text-white/40 text-xs">{stage.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {stageData?.status && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                stageData.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                stageData.status === "warning" ? "bg-amber-500/10 text-amber-400" :
                stageData.status === "failed" ? "bg-red-500/10 text-red-400" :
                stageData.status === "running" ? "bg-blue-500/10 text-blue-400" :
                "bg-white/5 text-white/40"
              }`}>{stageData.status}</span>
            )}
            <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="px-5 py-3 border-b border-white/10 shrink-0 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search findings, codes, root causes..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400/40"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 rounded-lg border transition-colors text-xs ${showFilters ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-white/40 border-white/5 hover:text-white/60"}`}
            >
              <Filter size={14} /> Filters
              <ChevronDown size={10} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map((f) => (
                <button key={f.key} onClick={() => setSeverityFilter(f.key)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${severityFilter === f.key ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-white/40 border-white/5 hover:text-white/60"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <DiagComponent query={searchQuery} initialFilter={severityFilter} />
        </div>

        {/* EXEC Copilot */}
        <div className="shrink-0">
          <ExecCopilot context={contextSummary} />
        </div>
      </div>
    </div>
  );
}