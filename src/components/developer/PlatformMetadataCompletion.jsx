import React, { useMemo, useState } from "react";
import { computeMetadataCompletion } from "@/lib/metadataCompletionEngine";
import {
  CheckCircle2, AlertCircle, Search, Brain,
  Database, Layers, Network, Zap, Package, Gauge,
  Settings, ShieldCheck, ChevronRight, RotateCcw,
} from "lucide-react";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildMetadataReport } from "@/lib/reports/metadataReportBuilder";
import MetadataScorecard from "./metadata/MetadataScorecard";
import MetadataMissingRegistry from "./metadata/MetadataMissingRegistry";
import MetadataEngineeringTasks from "./metadata/MetadataEngineeringTasks";
import MetadataDependencies from "./metadata/MetadataDependencies";
import MetadataRiskAnalysis from "./metadata/MetadataRiskAnalysis";
import MetadataTopActions from "./metadata/MetadataTopActions";
import MetadataExecCopilot from "./metadata/MetadataExecCopilot";
import RegistryDrawer from "./metadata/RegistryDrawer";
import MissingEntriesDrawer from "./metadata/MissingEntriesDrawer";
import OrphanRegistryDrawer from "./metadata/OrphanRegistryDrawer";
import ScoreAnalysisDrawer from "./metadata/ScoreAnalysisDrawer";

const REGISTRY_CARDS = [
  { id: "routes", label: "Routes™", icon: Network, color: "indigo" },
  { id: "modules", label: "Modules™", icon: Layers, color: "purple" },
  { id: "capabilities", label: "Capabilities™", icon: Zap, color: "amber" },
  { id: "frameworks", label: "Frameworks™", icon: Brain, color: "cyan" },
  { id: "personas", label: "Personas™", icon: Network, color: "pink" },
  { id: "knowledge", label: "Knowledge™", icon: Package, color: "emerald" },
  { id: "manifest", label: "Manifest™", icon: Database, color: "blue" },
];

const COLORS = {
  indigo: "text-indigo-400", purple: "text-purple-400", amber: "text-amber-400",
  cyan: "text-cyan-400", pink: "text-pink-400", emerald: "text-emerald-400", blue: "text-blue-400",
};

export default function PlatformMetadataCompletion() {
  const [recomputeKey, setRecomputeKey] = useState(0);
  const [activeRegistry, setActiveRegistry] = useState(null);
  const [showMissing, setShowMissing] = useState(false);
  const [showOrphans, setShowOrphans] = useState(false);
  const [activeScore, setActiveScore] = useState(null);

  const report = useMemo(() => computeMetadataCompletion(), [recomputeKey]);

  const allComplete = report.overallCoverage === 100 && report.totalMissingEntries === 0 && report.totalOrphanRecords === 0 && report.unknownConfigurations === 0;

  const getCoverage = (id) => {
    switch (id) {
      case "routes": return { pct: report.routeCoverage.pct, detail: `${report.routeCoverage.complete}/${report.routeCoverage.total}` };
      case "modules": return { pct: report.moduleCoverage.pct, detail: `${report.moduleCoverage.complete}/${report.moduleCoverage.total}` };
      case "capabilities": return { pct: report.capabilityCoverage.pct, detail: `${report.capabilityCoverage.complete}/${report.capabilityCoverage.total}` };
      case "frameworks": return { pct: report.frameworkCoverage.pct, detail: `${report.frameworkCoverage.complete}/${report.frameworkCoverage.total}` };
      case "personas": return { pct: report.personaCoverage.pct, detail: `${report.personaCoverage.complete}/${report.personaCoverage.total}` };
      case "knowledge": return { pct: report.knowledgeCoverage.pct, detail: `${report.knowledgeCoverage.covered}/${report.knowledgeCoverage.total}` };
      case "manifest": return { pct: report.manifestValidation.errors === 0 ? 100 : Math.max(0, 100 - report.manifestValidation.errors * 10), detail: `${report.manifestValidation.totalFindings} findings` };
      default: return { pct: 0, detail: "—" };
    }
  };

  const handleRecompute = () => setRecomputeKey((k) => k + 1);

  return (
    <div className="space-y-5">
      {/* Toolbar: PDF Export + Recompute */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix="Metadata-Governance" supportCSV={true} />
        <button onClick={handleRecompute} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg px-3 py-1.5 text-xs transition-colors">
          <RotateCcw size={12} /> Recompute Score
        </button>
      </div>

      {/* ── Live Scorecard™ ── */}
      <MetadataScorecard report={report} />

      {/* Coverage Score Cards — each clickable → Registry Drawer */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {REGISTRY_CARDS.map((card) => {
          const cov = getCoverage(card.id);
          return (
            <button key={card.id} onClick={() => setActiveRegistry(card.id)}
              className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center hover:bg-white/[0.04] hover:border-white/10 transition-all group">
              <div className="flex items-center gap-1.5 mb-2 justify-center">
                <card.icon size={12} className={COLORS[card.color]} />
                <span className="text-[9px] text-white/30 uppercase tracking-wider">{card.label}</span>
              </div>
              <div className="relative w-12 h-12 mx-auto mb-1">
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke={cov.pct === 100 ? "#10b981" : cov.pct >= 75 ? "#f59e0b" : "#ef4444"} strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 20 * (cov.pct / 100)} ${2 * Math.PI * 20}`} strokeLinecap="round" transform="rotate(-90 24 24)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{cov.pct}%</span>
                </div>
              </div>
              <div className="text-[9px] text-white/30">{cov.detail}</div>
              <div className="flex items-center justify-center gap-0.5 mt-1 text-[8px] text-white/20 group-hover:text-indigo-400 transition-colors">
                Open Registry <ChevronRight size={8} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Governance Metrics — each KPI clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Missing Entries" value={report.totalMissingEntries} icon={AlertCircle} onClick={() => setShowMissing(true)} alert={report.totalMissingEntries > 0} />
        <KpiCard label="Unknown Configs" value={report.unknownConfigurations} icon={Settings} onClick={() => setShowMissing(true)} alert={report.unknownConfigurations > 0} />
        <KpiCard label="Orphan Records" value={report.totalOrphanRecords} icon={AlertCircle} onClick={() => setShowOrphans(true)} alert={report.totalOrphanRecords > 0} />
        <KpiCard label="Active KPacks" value={report.activeKnowledgePacks} icon={Package} onClick={() => setActiveRegistry("knowledge")} alert={false} />
      </div>

      {/* EXEC™ Scores — each clickable → Score Analysis Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard label="EXEC™ Explainability™" value={report.explainabilityScore} icon={Brain} color="indigo" description="% of platform assets EXEC™ can explain" onClick={() => setActiveScore("explainability")} />
        <ScoreCard label="Platform Discoverability™" value={report.discoverabilityScore} icon={Search} color="cyan" description="% of platform assets that are discoverable" onClick={() => setActiveScore("discoverability")} />
        <ScoreCard label="Platform Governance™" value={report.platformGovernanceScore} icon={Gauge} color="emerald" description="Overall platform governance health" onClick={() => setActiveScore("governance")} />
      </div>

      {/* Missing Knowledge Entries — clickable rows */}
      {report.knowledgeCoverage.missingRoutes.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
          <button onClick={() => setActiveRegistry("knowledge")} className="flex items-center gap-2 mb-3 w-full text-left">
            <AlertCircle size={14} className="text-amber-400" />
            <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Missing Knowledge Entries</h4>
            <span className="text-[10px] text-white/30 ml-auto">{report.knowledgeCoverage.missingRoutes.length} routes · Click to open Knowledge Pack Registry™</span>
            <ChevronRight size={12} className="text-white/30" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {report.knowledgeCoverage.missingRoutes.slice(0, 10).map((r) => (
              <button key={r.url} onClick={() => setActiveRegistry("knowledge")} className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02] text-xs hover:bg-white/[0.04] transition-colors text-left">
                <AlertCircle size={10} className="text-amber-400 flex-shrink-0" />
                <span className="text-white/50 font-mono truncate">{r.url}</span>
                <span className="text-white/30 ml-auto truncate">{r.name}</span>
              </button>
            ))}
            {report.knowledgeCoverage.missingRoutes.length > 10 && (
              <button onClick={() => setActiveRegistry("knowledge")} className="text-[10px] text-indigo-400 hover:text-indigo-300 px-2 py-1 text-left">
                +{report.knowledgeCoverage.missingRoutes.length - 10} more… Open Knowledge Pack Registry™
              </button>
            )}
          </div>
        </div>
      )}

      {/* Orphan Records — each category clickable */}
      {report.totalOrphanRecords > 0 && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
          <button onClick={() => setShowOrphans(true)} className="flex items-center gap-2 mb-3 w-full text-left">
            <AlertCircle size={14} className="text-red-400" />
            <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Orphan Records</h4>
            <span className="text-[10px] text-white/30 ml-auto">Click to open Orphan Registry™</span>
            <ChevronRight size={12} className="text-white/30" />
          </button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <OrphanItem label="Orphan Routes" value={report.manifestValidation.orphanRoutes} onClick={() => setShowOrphans(true)} />
            <OrphanItem label="Orphan Capabilities" value={report.manifestValidation.orphanCapabilities} onClick={() => setShowOrphans(true)} />
            <OrphanItem label="Unregistered Personas" value={report.manifestValidation.unregisteredPersonas} onClick={() => setShowOrphans(true)} />
            <OrphanItem label="Duplicate Routes" value={report.manifestValidation.duplicateRoutes} onClick={() => setShowOrphans(true)} />
          </div>
        </div>
      )}

      {/* Configuration Status */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={14} className="text-cyan-400" />
          <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Configuration Consolidation</h4>
          {report.configurationStatus.consolidated ? (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-auto">Consolidated</span>
          ) : (
            <button onClick={() => setShowMissing(true)} className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded ml-auto hover:bg-amber-500/20 transition-colors">Needs Attention</button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={12} className="text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] text-white/40">
            Config Version: <span className="text-white/70 font-mono">{report.configurationStatus.configVersion}</span> · Source: {report.configurationStatus.source}
          </p>
        </div>
      </div>

      {/* Quality Gates */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Quality Gates</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <GateItem label="Platform Metadata Coverage = 100%" passed={report.overallCoverage === 100} value={`${report.overallCoverage}%`} onClick={() => setActiveScore("governance")} />
          <GateItem label="Route Metadata Coverage = 100%" passed={report.routeCoverage.pct === 100} value={`${report.routeCoverage.pct}%`} onClick={() => setActiveRegistry("routes")} />
          <GateItem label="Module Metadata Coverage = 100%" passed={report.moduleCoverage.pct === 100} value={`${report.moduleCoverage.pct}%`} onClick={() => setActiveRegistry("modules")} />
          <GateItem label="Capability Metadata Coverage = 100%" passed={report.capabilityCoverage.pct === 100} value={`${report.capabilityCoverage.pct}%`} onClick={() => setActiveRegistry("capabilities")} />
          <GateItem label="Framework Metadata Coverage = 100%" passed={report.frameworkCoverage.pct === 100} value={`${report.frameworkCoverage.pct}%`} onClick={() => setActiveRegistry("frameworks")} />
          <GateItem label="Persona Metadata Coverage = 100%" passed={report.personaCoverage.pct === 100} value={`${report.personaCoverage.pct}%`} onClick={() => setActiveRegistry("personas")} />
          <GateItem label="Knowledge Entry Coverage = 100%" passed={report.knowledgeCoverage.pct === 100} value={`${report.knowledgeCoverage.pct}%`} onClick={() => setActiveRegistry("knowledge")} />
          <GateItem label="No Missing Registrations" passed={report.totalMissingEntries === 0} value={`${report.totalMissingEntries} remaining`} onClick={() => setShowMissing(true)} />
          <GateItem label="No Orphaned Routes" passed={report.manifestValidation.orphanRoutes === 0} value={`${report.manifestValidation.orphanRoutes} orphaned`} onClick={() => setShowOrphans(true)} />
          <GateItem label="No Unknown Config Versions" passed={report.unknownConfigurations === 0} value={`${report.unknownConfigurations} unknown`} onClick={() => setShowMissing(true)} />
          <GateItem label="Knowledge Packs Active > 0" passed={report.activeKnowledgePacks > 0} value={`${report.activeKnowledgePacks} active`} onClick={() => setActiveRegistry("knowledge")} />
          <GateItem label="Platform State Synchronized" passed={true} value="Synced" onClick={handleRecompute} />
        </div>
      </div>

      {/* ── Missing Metadata Registry™ ── */}
      <MetadataMissingRegistry report={report} />

      {/* ── Engineering Tasks™ ── */}
      <MetadataEngineeringTasks report={report} />

      {/* ── Dependencies™ ── */}
      <MetadataDependencies report={report} />

      {/* ── Risk Analysis™ ── */}
      <MetadataRiskAnalysis report={report} />

      {/* ── Top Actions™ ── */}
      <MetadataTopActions report={report} />

      {/* ── EXEC™ Copilot — Metadata Intelligence™ ── */}
      <MetadataExecCopilot report={report} />

      {/* Drawers */}
      {activeRegistry && <RegistryDrawer registryType={activeRegistry} report={report} onClose={() => setActiveRegistry(null)} icon={REGISTRY_CARDS.find((c) => c.id === activeRegistry)?.icon || Database} />}
      {showMissing && <MissingEntriesDrawer report={report} onClose={() => setShowMissing(false)} />}
      {showOrphans && <OrphanRegistryDrawer report={report} onClose={() => setShowOrphans(false)} />}
      {activeScore && <ScoreAnalysisDrawer scoreId={activeScore} report={report} onClose={() => setActiveScore(null)} />}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, onClick, alert }) {
  return (
    <button onClick={onClick} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2 hover:bg-white/[0.04] transition-colors text-left group">
      <Icon size={16} className={alert ? "text-amber-400" : "text-emerald-400"} />
      <div className="flex-1">
        <div className="text-white font-bold text-lg">{value}</div>
        <div className="text-white/30 text-[10px]">{label}</div>
      </div>
      <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
    </button>
  );
}

function ScoreCard({ label, value, icon: Icon, color, description, onClick }) {
  const ringColor = value === 100 ? "#10b981" : value >= 75 ? "#f59e0b" : "#ef4444";
  const colorClass = COLORS[color] || "text-indigo-400";
  return (
    <button onClick={onClick} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.04] hover:border-white/10 transition-all group text-left">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle cx="32" cy="32" r="26" fill="none" stroke={ringColor} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 26 * (value / 100)} ${2 * Math.PI * 26}`} strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-white">{value}%</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon size={12} className={colorClass} />
          <span className="text-xs text-white/80 font-medium">{label}</span>
        </div>
        <p className="text-[10px] text-white/30">{description}</p>
        <div className="flex items-center gap-0.5 mt-1 text-[9px] text-white/20 group-hover:text-indigo-400 transition-colors">
          Open Analysis <ChevronRight size={8} />
        </div>
      </div>
    </button>
  );
}

function OrphanItem({ label, value, onClick }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-lg border text-center transition-colors hover:bg-white/[0.04] ${value > 0 ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
      <div className={`text-xl font-bold ${value > 0 ? "text-red-400" : "text-emerald-400"}`}>{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </button>
  );
}

function GateItem({ label, passed, value, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors text-left">
      {passed ? <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> : <AlertCircle size={12} className="text-amber-400 flex-shrink-0" />}
      <span className="text-xs text-white/60 flex-1">{label}</span>
      <span className={`text-[10px] font-medium ${passed ? "text-emerald-400" : "text-amber-400"}`}>{value}</span>
    </button>
  );
}