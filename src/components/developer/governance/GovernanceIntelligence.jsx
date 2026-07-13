import React, { useMemo, useState } from "react";
import {
  ShieldCheck, Target, TrendingUp, AlertCircle, Brain, EyeOff,
  Boxes, FileText, GitMerge, RotateCcw, ChevronRight,
} from "lucide-react";
import { computeMetadataCompletion } from "@/lib/metadataCompletionEngine";
import { buildMetadataReport } from "@/lib/reports/metadataReportBuilder";
import ReportToolbar from "@/components/reports/ReportToolbar";
import MetadataCopilot from "../metadata/MetadataCopilot";
import MissingEntriesDrawer from "../metadata/MissingEntriesDrawer";
import OrphanRegistryDrawer from "../metadata/OrphanRegistryDrawer";
import GovernanceScorecard from "./GovernanceScorecard";
import ExplainabilityDiagnostics from "./ExplainabilityDiagnostics";
import DiscoverabilityRegistry from "./DiscoverabilityRegistry";
import TopActionCard from "./TopActionCard";

export default function GovernanceIntelligence({ ctx }) {
  const [recomputeKey, setRecomputeKey] = useState(0);
  const [showScorecard, setShowScorecard] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [showOrphans, setShowOrphans] = useState(false);
  const [showExplainability, setShowExplainability] = useState(false);
  const [showDiscoverability, setShowDiscoverability] = useState(false);

  const report = useMemo(() => computeMetadataCompletion(), [recomputeKey]);
  const govScore = report.platformGovernanceScore;
  const govGap = 100 - govScore;
  const ringColor = govScore >= 90 ? "#10b981" : govScore >= 75 ? "#f59e0b" : "#ef4444";

  // Top action metrics
  const missingHours = useMemo(() => {
    const entries = report.routeCoverage.missingEntries.length + report.moduleCoverage.missingEntries.length + report.personaCoverage.unregistered.length + report.knowledgeCoverage.missing;
    return Math.round(entries * 0.5 * 10) / 10;
  }, [report]);
  const explainabilityGaps = useMemo(() => {
    const routes = report.routeCoverage.detailed.filter((r) => !r.metadata.execSummary).length;
    const modules = report.moduleCoverage.detailed.filter((m) => !m.metadata.description).length;
    const caps = report.capabilityCoverage.detailed.filter((c) => !c.chain?.knowledgePack).length;
    return routes + modules + caps;
  }, [report]);
  const discoverabilityGaps = useMemo(() => {
    const routes = report.routeCoverage.detailed.filter((r) => !r.metadata.navigationGroup || !r.metadata.searchKeywords).length;
    const modules = report.moduleCoverage.detailed.filter((m) => !m.metadata.navigationLocation).length;
    return routes + modules;
  }, [report]);

  const handleRecompute = () => setRecomputeKey((k) => k + 1);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix="Platform-Governance" supportCSV={true} />
        <button onClick={handleRecompute} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg px-3 py-1.5 text-xs transition-colors">
          <RotateCcw size={12} /> Recompute
        </button>
      </div>

      {/* Governance Score Hero — clickable */}
      <button onClick={() => setShowScorecard(true)}
        className={`w-full flex items-center gap-5 p-5 rounded-xl border text-left transition-colors hover:bg-white/[0.02] ${govGap === 0 ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}>
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={ringColor} strokeWidth="5" strokeDasharray={`${2 * Math.PI * 34 * (govScore / 100)} ${2 * Math.PI * 34}`} strokeLinecap="round" transform="rotate(-90 40 40)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{govScore}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className={govGap === 0 ? "text-emerald-400" : "text-amber-400"} />
            <h3 className="text-base font-bold text-white">Platform Governance™</h3>
            <ChevronRight size={12} className="text-white/30" />
          </div>
          <p className="text-white/40 text-xs mt-0.5">
            {govGap === 0 ? "All governance metrics at target — platform fully governed."
              : `${govGap}-point gap to 100%. ${report.totalMissingEntries} missing entries, ${report.totalOrphanRecords} orphans, ${100 - report.explainabilityScore}% explainability gap. Click to open Governance Scorecard™.`}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-white/40">Target: 100%</span>
            <span className="text-[10px] text-white/40">·</span>
            <span className="text-[10px] text-white/40">Remaining: {govGap}%</span>
            <span className="text-[10px] text-white/40">·</span>
            <span className="text-[10px] text-white/40">Formula: (Coverage + Explainability + Discoverability + Config) / 4</span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Remaining Gap</div>
          <div className="text-2xl font-bold" style={{ color: govGap > 0 ? "#f59e0b" : "#10b981" }}>{govGap}%</div>
        </div>
      </button>

      {/* 4 Metric Cards — each clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Metadata Coverage" value={`${report.overallCoverage}%`} gap={100 - report.overallCoverage} sub={`${report.totalMissingEntries} missing entries`} icon={Boxes} color="amber" onClick={() => setShowMissing(true)} />
        <MetricCard label="EXEC™ Explainability" value={`${report.explainabilityScore}%`} gap={100 - report.explainabilityScore} sub={`${explainabilityGaps} assets lacking`} icon={Brain} color="indigo" onClick={() => setShowExplainability(true)} />
        <MetricCard label="Platform Discoverability" value={`${report.discoverabilityScore}%`} gap={100 - report.discoverabilityScore} sub={`${discoverabilityGaps} dark assets`} icon={EyeOff} color="cyan" onClick={() => setShowDiscoverability(true)} />
        <MetricCard label="Orphan Records" value={report.totalOrphanRecords} gap={0} sub="orphan records" icon={AlertCircle} color="red" isCount onClick={() => setShowOrphans(true)} />
      </div>

      {/* Top 3 Actions — each interactive */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-violet-400" />
          <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Top 3 Actions</h3>
          <span className="text-[10px] text-white/30 ml-auto">Click any action to open the repair workspace</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TopActionCard
            icon={Boxes}
            title="Mass Ingestion Sprint™"
            metric={report.totalMissingEntries}
            metricLabel="missing entries"
            progress={Math.round(((report.routeCoverage.total + report.moduleCoverage.total - report.totalMissingEntries) / Math.max(1, report.routeCoverage.total + report.moduleCoverage.total)) * 100)}
            estimatedHours={`${missingHours}h estimated`}
            owner="Platform Engineering"
            dependencies={["Module Registry™", "Route Registry™", "Knowledge Pack Registry™"]}
            color="indigo"
            onOpen={() => setShowMissing(true)}
            onExport={() => setShowMissing(true)}
          />
          <TopActionCard
            icon={FileText}
            title="Asset Documentation Audit™"
            metric={explainabilityGaps}
            metricLabel="undocumented assets"
            progress={report.explainabilityScore}
            estimatedHours={`${(explainabilityGaps * 0.5).toFixed(1)}h estimated`}
            owner="AI Engineering"
            dependencies={["EXEC™ Knowledge Index™", "Module Registry™", "Capability Registry™"]}
            color="amber"
            onOpen={() => setShowExplainability(true)}
            onExport={() => setShowExplainability(true)}
          />
          <TopActionCard
            icon={GitMerge}
            title="Orphan Integration™"
            metric={report.totalOrphanRecords}
            metricLabel="orphan records"
            progress={report.totalOrphanRecords === 0 ? 100 : Math.round((1 - report.totalOrphanRecords / Math.max(1, report.routeCoverage.total)) * 100)}
            estimatedHours={`${(report.totalOrphanRecords * 1).toFixed(1)}h estimated`}
            owner="Platform Engineering"
            dependencies={["Platform Manifest™", "Module Registry™", "AI Persona Registry™"]}
            color="cyan"
            onOpen={() => setShowOrphans(true)}
            onExport={() => setShowOrphans(true)}
          />
        </div>
      </div>

      {/* Discoverability Quick View — clickable */}
      {discoverabilityGaps > 0 && (
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4">
          <button onClick={() => setShowDiscoverability(true)} className="flex items-center gap-2 w-full text-left mb-2">
            <EyeOff size={14} className="text-cyan-400" />
            <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Discoverability Gaps</h4>
            <span className="text-[10px] text-white/30 ml-auto">{discoverabilityGaps} dark/unindexed assets · Click to open Discoverability Registry™</span>
            <ChevronRight size={12} className="text-white/30" />
          </button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            <DiscoverabilityStat label="Missing Navigation" value={report.routeCoverage.detailed.filter((r) => !r.metadata.navigationGroup).length + report.moduleCoverage.detailed.filter((m) => !m.metadata.navigationLocation).length} />
            <DiscoverabilityStat label="Missing Search Metadata" value={report.routeCoverage.detailed.filter((r) => !r.metadata.searchKeywords).length} />
            <DiscoverabilityStat label="Dark Assets (Orphan Routes)" value={report.manifestValidation.orphanRoutes} />
            <DiscoverabilityStat label="Missing Knowledge Pack" value={report.knowledgeCoverage.missing} />
          </div>
        </div>
      )}

      {/* Ask EXEC™ */}
      <MetadataCopilot report={report} />

      {/* Drawers */}
      {showScorecard && <GovernanceScorecard report={report} onClose={() => setShowScorecard(false)} />}
      {showMissing && <MissingEntriesDrawer report={report} onClose={() => setShowMissing(false)} />}
      {showOrphans && <OrphanRegistryDrawer report={report} onClose={() => setShowOrphans(false)} />}
      {showExplainability && <ExplainabilityDiagnostics report={report} onClose={() => setShowExplainability(false)} />}
      {showDiscoverability && <DiscoverabilityRegistry report={report} onClose={() => setShowDiscoverability(false)} />}
    </div>
  );
}

function MetricCard({ label, value, gap, sub, icon: Icon, color, isCount, onClick }) {
  const colorMap = {
    amber: { text: "text-amber-400", ring: "#f59e0b", bg: "bg-amber-500/5", border: "border-amber-500/10" },
    indigo: { text: "text-indigo-400", ring: "#818cf8", bg: "bg-indigo-500/5", border: "border-indigo-500/10" },
    cyan: { text: "text-cyan-400", ring: "#22d3ee", bg: "bg-cyan-500/5", border: "border-cyan-500/10" },
    red: { text: "text-red-400", ring: "#ef4444", bg: "bg-red-500/5", border: "border-red-500/10" },
  };
  const c = colorMap[color] || colorMap.indigo;
  const pct = isCount ? (value === 0 ? 100 : 0) : parseInt(value);
  return (
    <button onClick={onClick} className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-all group text-left`}>
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={pct === 100 ? "#10b981" : c.ring} strokeWidth="3" strokeDasharray={`${2 * Math.PI * 20 * (pct / 100)} ${2 * Math.PI * 20}`} strokeLinecap="round" transform="rotate(-90 24 24)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={14} className={c.text} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
        <div className={`text-lg font-bold ${c.text}`}>{value}{!isCount && "%"}</div>
        {sub && <div className="text-[9px] text-white/30 truncate">{sub}</div>}
      </div>
      <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
    </button>
  );
}

function DiscoverabilityStat({ label, value }) {
  return (
    <div className={`px-2 py-1.5 rounded-lg border text-center ${value > 0 ? "bg-cyan-500/5 border-cyan-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
      <div className={`text-base font-bold ${value > 0 ? "text-cyan-400" : "text-emerald-400"}`}>{value}</div>
      <div className="text-white/30 text-[9px]">{label}</div>
    </div>
  );
}