import React, { useMemo, useState } from "react";
import {
  Award, CheckCircle2, XCircle, Shield, Calendar, Cpu, Boxes,
  Brain, Settings, Activity, ChevronRight, RotateCcw, Target, TrendingUp,
  Clock, AlertTriangle, Layers, FileText, GitMerge,
} from "lucide-react";
import { computeFoundationCertification } from "@/lib/foundationCertificationEngine";
import { computeReleaseStage } from "@/lib/releaseStageEngine";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";
import CategorizedArchitecturalGate from "./CategorizedArchitecturalGate";
import FoundationCertificationReport from "./FoundationCertificationReport";
import FoundationMetricDiagnostics from "./FoundationMetricDiagnostics";
import ExecutionStreamStatus from "./ExecutionStreamStatus";
import BlockerDrillDown from "./BlockerDrillDown";

export default function FoundationCertificationDashboard() {
  const [recomputeKey, setRecomputeKey] = useState(0);
  const [activeMetric, setActiveMetric] = useState(null);
  const [activeBlocker, setActiveBlocker] = useState(null);

  const cert = useMemo(() => computeFoundationCertification(), [recomputeKey]);
  const stage = useMemo(() => computeReleaseStage(), [recomputeKey]);

  const score = cert.foundationScore;
  const ringColor = score >= 95 ? "#10b981" : score >= 85 ? "#f59e0b" : score >= 70 ? "#f97316" : "#ef4444";

  const versionItems = [
    { label: "Platform", value: cert.versions.platform, icon: Cpu },
    { label: "Manifest", value: cert.versions.manifest, icon: Boxes },
    { label: "Knowledge", value: cert.versions.knowledge, icon: Brain },
    { label: "Configuration", value: cert.versions.config, icon: Settings },
    { label: "Platform State", value: cert.versions.platformState, icon: Activity },
    { label: "Framework", value: cert.versions.framework, icon: Shield },
  ];

  const handleRecompute = () => setRecomputeKey((k) => k + 1);

  // Extra clickable metrics (beyond the 7 certification metrics)
  const extraMetrics = [
    { key: "certificationScore", label: "Certification Score™", value: `${score}`, sub: `/${cert.requiredThreshold} required`, icon: Award, color: "indigo", passed: score >= cert.requiredThreshold },
    { key: "remainingTasks", label: "Remaining Tasks™", value: cert.remainingTasks, sub: "unresolved issues", icon: AlertTriangle, color: "amber", passed: cert.remainingTasks === 0 },
    { key: "estimatedCompletion", label: "Estimated Completion™", value: cert.estimatedCompletion, sub: "to target", icon: Clock, color: "cyan", passed: cert.certified },
    { key: "blockingDomains", label: "Blocking Domains™", value: cert.blockingDomains.length, sub: "domains blocking", icon: Layers, color: "red", passed: cert.blockingDomains.length === 0 },
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix="Foundation-Certification" supportCSV={true} />
        <button onClick={handleRecompute} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg px-3 py-1.5 text-xs transition-colors">
          <RotateCcw size={12} /> Recompute
        </button>
      </div>

      {/* ── Certification Hero — clickable ── */}
      <button
        onClick={() => setActiveMetric("foundationScore")}
        className={`w-full rounded-xl border p-6 text-left transition-colors hover:bg-white/[0.02] ${cert.certified ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle cx="70" cy="70" r="60" fill="none" stroke={ringColor} strokeWidth="8" strokeDasharray={`${2 * Math.PI * 60 * (score / 100)} ${2 * Math.PI * 60}`} strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 1s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{score}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">/100</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Award size={20} className={cert.certified ? "text-emerald-400" : "text-amber-400"} />
              <h2 className="text-lg font-bold text-white">Foundation Certification™</h2>
              <ChevronRight size={14} className="text-white/30" />
            </div>
            <div className={`text-2xl font-bold mb-1 ${cert.certified ? "text-emerald-400" : "text-amber-400"}`}>
              {cert.certified ? "CERTIFIED" : "NOT CERTIFIED"}
            </div>
            <p className="text-sm text-white/50">
              {cert.certified
                ? `Certified on ${new Date(cert.certificationDate).toLocaleDateString()} by ${cert.certificationAuthority}`
                : `Score ${score}/${cert.requiredThreshold} required — ${cert.remainingTasks} blocker(s) remaining. Click to open diagnostics.`}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-white/40">Stage: {stage.currentStage}</span>
              <span className="text-[10px] text-white/40">·</span>
              <span className="text-[10px] text-white/40">Next: {stage.nextMilestone}</span>
              <span className="text-[10px] text-white/40">·</span>
              <span className="text-[10px] text-white/40">Progress: {stage.pipelineProgress}</span>
            </div>
          </div>
        </div>
      </button>

      {/* ── Certification Metrics — each clickable ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={12} className="text-white/40" />
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">Certification Metrics — Click any metric for diagnostics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {cert.metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`rounded-lg p-3 border text-left transition-all hover:bg-white/[0.04] hover:scale-[1.02] ${m.passed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
                {m.passed ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${m.passed ? "text-emerald-400" : "text-red-400"}`}>{m.value}%</span>
                <span className="text-[10px] text-white/30">/ {m.threshold}%{m.exact ? " =" : " ≥"}</span>
              </div>
              {!m.passed && <div className="text-[9px] text-red-400/60 mt-0.5">+{m.delta}% needed · Click to open</div>}
              {m.passed && <div className="text-[9px] text-emerald-400/40 mt-0.5">✓ At target · Click for diagnostics</div>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Extra Metrics — Certification Score, Remaining Tasks, Estimated Completion, Blocking Domains ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {extraMetrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`rounded-lg p-3 border text-left transition-all hover:bg-white/[0.04] hover:scale-[1.02] ${m.passed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
              <ChevronRight size={10} className="text-white/20" />
            </div>
            <div className={`text-xl font-bold ${m.passed ? "text-emerald-400" : "text-amber-400"}`}>{m.value}</div>
            <div className="text-[9px] text-white/30 mt-0.5">{m.sub}</div>
          </button>
        ))}
      </div>

      {/* ── Execution Stream Status™ (replaces Sprint 2 BLOCKED banner) ── */}
      <ExecutionStreamStatus cert={cert} onOpenDiagnostics={() => setActiveMetric("foundationScore")} />

      {/* ── Categorized Architectural Gate — with clickable blockers ── */}
      <CategorizedArchitecturalGate cert={cert} onIssueClick={(issue) => setActiveBlocker(issue)} />

      {/* ── Certification Metadata — dynamic stage, no hardcoded sprints ── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Certification Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {versionItems.map((v) => (
            <div key={v.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <v.icon size={12} className="text-white/40" />
              <div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider">{v.label}</div>
                <div className="text-xs text-white/80 font-medium">{v.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1"><Shield size={12} /> {cert.certificationAuthority}</div>
          {cert.certificationDate && <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(cert.certificationDate).toLocaleString()}</div>}
          <div className="flex items-center gap-1"><TrendingUp size={12} /> Stage: {stage.currentStage}</div>
          <div className="flex items-center gap-1"><Clock size={12} /> Next: {stage.nextMilestone}</div>
          <div className="ml-auto flex items-center gap-1"><GitMerge size={12} /> Pipeline: {stage.pipelineProgress}</div>
        </div>
      </div>

      {/* ── Report ── */}
      <FoundationCertificationReport cert={cert} />

      {/* Drawers */}
      {activeMetric && <FoundationMetricDiagnostics cert={cert} metricKey={activeMetric} onClose={() => setActiveMetric(null)} />}
      {activeBlocker && <BlockerDrillDown issue={activeBlocker} onClose={() => setActiveBlocker(null)} />}
    </div>
  );
}