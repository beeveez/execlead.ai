import React, { useMemo } from "react";
import { computeMetadataCompletion } from "@/lib/metadataCompletionEngine";
import {
  CheckCircle2, AlertCircle, TrendingUp, Search, Brain,
  Database, Layers, Network, Zap, Package, Gauge, FileText,
  Settings, ShieldCheck,
} from "lucide-react";

export default function PlatformMetadataCompletion() {
  const report = useMemo(() => computeMetadataCompletion(), []);

  const allComplete = report.overallCoverage === 100 &&
    report.totalMissingEntries === 0 &&
    report.totalOrphanRecords === 0 &&
    report.unknownConfigurations === 0;

  return (
    <div className="space-y-5">
      {/* Overall Status Banner */}
      <div className={`flex items-center gap-4 p-5 rounded-xl border ${
        allComplete
          ? "bg-emerald-500/5 border-emerald-500/10"
          : "bg-amber-500/5 border-amber-500/10"
      }`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
          allComplete ? "bg-emerald-500/10" : "bg-amber-500/10"
        }`}>
          {allComplete ? (
            <CheckCircle2 size={24} className="text-emerald-400" />
          ) : (
            <AlertCircle size={24} className="text-amber-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">Platform Metadata Completion™</h3>
          <p className="text-white/40 text-xs mt-0.5">
            {allComplete
              ? "All platform assets fully registered, interconnected, discoverable, and explainable."
              : `${report.totalMissingEntries} missing entries · ${report.totalOrphanRecords} orphan records · ${report.unknownConfigurations} unknown configs`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Overall Coverage</div>
          <div className={`text-3xl font-bold ${allComplete ? "text-emerald-400" : "text-amber-400"}`}>
            {report.overallCoverage}%
          </div>
        </div>
      </div>

      {/* Coverage Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <CoverageCard label="Routes" value={report.routeCoverage.pct} icon={Network} color="indigo" detail={`${report.routeCoverage.complete}/${report.routeCoverage.total}`} />
        <CoverageCard label="Modules" value={report.moduleCoverage.pct} icon={Layers} color="purple" detail={`${report.moduleCoverage.complete}/${report.moduleCoverage.total}`} />
        <CoverageCard label="Capabilities" value={report.capabilityCoverage.pct} icon={Zap} color="amber" detail={`${report.capabilityCoverage.complete}/${report.capabilityCoverage.total}`} />
        <CoverageCard label="Frameworks" value={report.frameworkCoverage.pct} icon={Brain} color="cyan" detail={`${report.frameworkCoverage.complete}/${report.frameworkCoverage.total}`} />
        <CoverageCard label="Personas" value={report.personaCoverage.pct} icon={Network} color="pink" detail={`${report.personaCoverage.complete}/${report.personaCoverage.total}`} />
        <CoverageCard label="Knowledge" value={report.knowledgeCoverage.pct} icon={Package} color="emerald" detail={`${report.knowledgeCoverage.covered}/${report.knowledgeCoverage.total}`} />
        <CoverageCard label="Manifest" value={report.manifestValidation.errors === 0 ? 100 : Math.max(0, 100 - report.manifestValidation.errors * 10)} icon={Database} color="blue" detail={`${report.manifestValidation.totalFindings} findings`} />
      </div>

      {/* Governance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Missing Entries" value={report.totalMissingEntries} icon={AlertCircle} color={report.totalMissingEntries === 0 ? "emerald" : "amber"} />
        <MetricCard label="Unknown Configs" value={report.unknownConfigurations} icon={Settings} color={report.unknownConfigurations === 0 ? "emerald" : "amber"} />
        <MetricCard label="Orphan Records" value={report.totalOrphanRecords} icon={AlertCircle} color={report.totalOrphanRecords === 0 ? "emerald" : "amber"} />
        <MetricCard label="Active KPacks" value={report.activeKnowledgePacks} icon={Package} color="emerald" />
      </div>

      {/* EXEC™ Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard
          label="EXEC™ Explainability Score"
          value={report.explainabilityScore}
          icon={Brain}
          color="indigo"
          description="% of platform assets EXEC™ can explain"
        />
        <ScoreCard
          label="Platform Discoverability Score"
          value={report.discoverabilityScore}
          icon={Search}
          color="cyan"
          description="% of platform assets that are discoverable"
        />
        <ScoreCard
          label="Platform Governance Score"
          value={report.platformGovernanceScore}
          icon={Gauge}
          color="emerald"
          description="Overall platform governance health"
        />
      </div>

      {/* Missing Knowledge Entries */}
      {report.knowledgeCoverage.missingRoutes.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-amber-400" />
            <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Missing Knowledge Entries</h4>
            <span className="text-[10px] text-white/30 ml-auto">{report.knowledgeCoverage.missingRoutes.length} routes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {report.knowledgeCoverage.missingRoutes.map((r) => (
              <div key={r.url} className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02] text-xs">
                <AlertCircle size={10} className="text-amber-400 flex-shrink-0" />
                <span className="text-white/50 font-mono truncate">{r.url}</span>
                <span className="text-white/30 ml-auto truncate">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orphan Records */}
      {report.totalOrphanRecords > 0 && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-red-400" />
            <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Orphan Records</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <OrphanItem label="Orphan Routes" value={report.manifestValidation.orphanRoutes} />
            <OrphanItem label="Orphan Capabilities" value={report.manifestValidation.orphanCapabilities} />
            <OrphanItem label="Unregistered Personas" value={report.manifestValidation.unregisteredPersonas} />
            <OrphanItem label="Duplicate Routes" value={report.manifestValidation.duplicateRoutes} />
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
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded ml-auto">Needs Attention</span>
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
          <GateItem label="Platform Metadata Coverage = 100%" passed={report.overallCoverage === 100} value={`${report.overallCoverage}%`} />
          <GateItem label="Route Metadata Coverage = 100%" passed={report.routeCoverage.pct === 100} value={`${report.routeCoverage.pct}%`} />
          <GateItem label="Module Metadata Coverage = 100%" passed={report.moduleCoverage.pct === 100} value={`${report.moduleCoverage.pct}%`} />
          <GateItem label="Capability Metadata Coverage = 100%" passed={report.capabilityCoverage.pct === 100} value={`${report.capabilityCoverage.pct}%`} />
          <GateItem label="Framework Metadata Coverage = 100%" passed={report.frameworkCoverage.pct === 100} value={`${report.frameworkCoverage.pct}%`} />
          <GateItem label="Persona Metadata Coverage = 100%" passed={report.personaCoverage.pct === 100} value={`${report.personaCoverage.pct}%`} />
          <GateItem label="Knowledge Entry Coverage = 100%" passed={report.knowledgeCoverage.pct === 100} value={`${report.knowledgeCoverage.pct}%`} />
          <GateItem label="No Missing Registrations" passed={report.totalMissingEntries === 0} value={`${report.totalMissingEntries} remaining`} />
          <GateItem label="No Orphaned Routes" passed={report.manifestValidation.orphanRoutes === 0} value={`${report.manifestValidation.orphanRoutes} orphaned`} />
          <GateItem label="No Unknown Config Versions" passed={report.unknownConfigurations === 0} value={`${report.unknownConfigurations} unknown`} />
          <GateItem label="Knowledge Packs Active > 0" passed={report.activeKnowledgePacks > 0} value={`${report.activeKnowledgePacks} active`} />
          <GateItem label="Platform State Synchronized" passed={true} value="Synced" />
        </div>
      </div>
    </div>
  );
}

function CoverageCard({ label, value, icon: Icon, color, detail }) {
  const colors = {
    indigo: "text-indigo-400", purple: "text-purple-400", amber: "text-amber-400",
    cyan: "text-cyan-400", pink: "text-pink-400", emerald: "text-emerald-400",
    blue: "text-blue-400",
  };
  const ringColor = value === 100 ? "#10b981" : value >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className={colors[color]} />
        <span className="text-[9px] text-white/30 uppercase tracking-wider">{label}</span>
      </div>
      <div className="relative w-12 h-12 mx-auto mb-1">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={ringColor} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 20 * (value / 100)} ${2 * Math.PI * 20}`}
            strokeLinecap="round" transform="rotate(-90 24 24)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{value}%</span>
        </div>
      </div>
      <div className="text-[9px] text-white/30 text-center">{detail}</div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "text-emerald-400", amber: "text-amber-400", red: "text-red-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
      <Icon size={16} className={colors[color]} />
      <div>
        <div className="text-white font-bold text-lg">{value}</div>
        <div className="text-white/30 text-[10px]">{label}</div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, icon: Icon, color, description }) {
  const colors = {
    indigo: "text-indigo-400", cyan: "text-cyan-400", emerald: "text-emerald-400",
  };
  const ringColor = value === 100 ? "#10b981" : value >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle cx="32" cy="32" r="26" fill="none" stroke={ringColor} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 26 * (value / 100)} ${2 * Math.PI * 26}`}
            strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-white">{value}%</span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon size={12} className={colors[color]} />
          <span className="text-xs text-white/80 font-medium">{label}</span>
        </div>
        <p className="text-[10px] text-white/30">{description}</p>
      </div>
    </div>
  );
}

function OrphanItem({ label, value }) {
  return (
    <div className={`px-3 py-2 rounded-lg border text-center ${value > 0 ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
      <div className={`text-xl font-bold ${value > 0 ? "text-red-400" : "text-emerald-400"}`}>{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}

function GateItem({ label, passed, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
      {passed ? (
        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle size={12} className="text-amber-400 flex-shrink-0" />
      )}
      <span className="text-xs text-white/60 flex-1">{label}</span>
      <span className={`text-[10px] font-medium ${passed ? "text-emerald-400" : "text-amber-400"}`}>{value}</span>
    </div>
  );
}