import React, { useMemo } from "react";
import {
  ShieldCheck, Activity, Brain, Boxes, Rocket, Lock,
  Clock, AlertTriangle, TrendingUp, ChevronRight, Radar, Sparkles,
} from "lucide-react";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { useGovernancePipeline } from "@/lib/GovernancePipelineContext";
import { useGuardian } from "@/lib/GuardianContext";
import { computeReadinessLevel, READINESS_LEVELS, scoreToColor } from "@/lib/platformReadinessModel";
import { computePlatformIntelligence } from "@/lib/platformIntelligenceEngine";
import ArchitectureMap from "./ArchitectureMap";

const COLOR_MAP = {
  emerald: { card: "hover:border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500", tint: "bg-emerald-500/5" },
  amber: { card: "hover:border-amber-500/30", text: "text-amber-400", dot: "bg-amber-500", tint: "bg-amber-500/5" },
  orange: { card: "hover:border-orange-500/30", text: "text-orange-400", dot: "bg-orange-500", tint: "bg-orange-500/5" },
  red: { card: "hover:border-red-500/30", text: "text-red-400", dot: "bg-red-500", tint: "bg-red-500/5" },
  indigo: { card: "hover:border-indigo-500/30", text: "text-indigo-400", dot: "bg-indigo-500", tint: "bg-indigo-500/5" },
  cyan: { card: "hover:border-cyan-500/30", text: "text-cyan-400", dot: "bg-cyan-500", tint: "bg-cyan-500/5" },
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MissionControl({ onNavigate }) {
  const { health, coverage, errorCount, warningCount } = usePlatformState();
  const { certificate } = useGovernancePipeline();
  const guardian = useGuardian();

  const guardianPending = guardian?.pending?.length || 0;
  const readiness = useMemo(
    () => computeReadinessLevel(health, certificate?.certified, guardianPending),
    [health, certificate?.certified, guardianPending]
  );

  const pii = useMemo(() => computePlatformIntelligence(), []);

  const deploymentScore = certificate?.deployment_readiness ?? health?.overall ?? 0;
  const runtimeScore = health?.entityHealth ?? health?.overall ?? 0;
  const knowledgeScore = health?.knowledgeCoverage ?? 100;
  const manifestScore = certificate?.manifest_health ?? health?.manifestCoverage ?? 100;

  const kpis = [
    {
      label: "Platform Intelligence™",
      value: `${pii.piiScore}%`,
      sub: `${pii.maturity.short} — ${pii.maturity.name}`,
      icon: Sparkles,
      color: scoreToColor(pii.piiScore),
      workspace: "platform-intelligence",
    },
    {
      label: "Certification",
      value: certificate?.certified ? "Certified" : "Not Certified",
      sub: certificate ? `${certificate.overall_governance_score}% governance score` : "Awaiting pipeline",
      icon: ShieldCheck,
      color: certificate?.certified ? "emerald" : "red",
      workspace: "foundation-certification",
    },
    {
      label: "Readiness Level",
      value: `${readiness.short}`,
      sub: readiness.name,
      icon: TrendingUp,
      color: scoreToColor(readiness.score),
      workspace: "platform-governance",
    },
    {
      label: "Overall Health",
      value: `${health?.overall ?? 0}%`,
      sub: (health?.overall ?? 0) >= 90 ? "Healthy" : "Needs attention",
      icon: Activity,
      color: scoreToColor(health?.overall ?? 0),
      workspace: "runtime-intelligence",
    },
    {
      label: "Deployment Readiness",
      value: `${deploymentScore}%`,
      sub: deploymentScore >= 85 ? "Ready to deploy" : "Blocked",
      icon: Rocket,
      color: scoreToColor(deploymentScore),
      workspace: "deployment-center",
    },
    {
      label: "Runtime Health",
      value: `${runtimeScore}%`,
      sub: "Platform State Manager™",
      icon: Activity,
      color: scoreToColor(runtimeScore),
      workspace: "runtime-intelligence",
    },
    {
      label: "Knowledge Health",
      value: `${knowledgeScore}%`,
      sub: `${coverage?.knowledgePacks ?? 0} knowledge packs`,
      icon: Brain,
      color: scoreToColor(knowledgeScore),
      workspace: "knowledge-operations",
    },
    {
      label: "Manifest Health",
      value: `${manifestScore}%`,
      sub: `${coverage?.routeCoverage ?? 0}% route coverage`,
      icon: Boxes,
      color: scoreToColor(manifestScore),
      workspace: "platform-governance",
    },
    {
      label: "Guardian™",
      value: guardianPending > 0 ? `${guardianPending} Pending` : "Passed",
      sub: guardianPending > 0 ? "Items require review" : "No issues detected",
      icon: Lock,
      color: guardianPending > 0 ? "amber" : "emerald",
      workspace: "security-guardian",
    },
    {
      label: "Last Validation",
      value: formatRelativeTime(certificate?.created_date),
      sub: certificate?.trigger || "—",
      icon: Clock,
      color: "indigo",
      workspace: "audit-center",
    },
    {
      label: "Critical Issues",
      value: `${errorCount ?? 0}`,
      sub: `${warningCount ?? 0} warnings`,
      icon: AlertTriangle,
      color: (errorCount ?? 0) > 0 ? "red" : "emerald",
      workspace: "platform-governance",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Radar size={14} className="text-emerald-400" />
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Executive KPIs</h2>
          <span className="text-[10px] text-white/20 ml-auto">Click any card for detailed diagnostics</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const c = COLOR_MAP[kpi.color] || COLOR_MAP.indigo;
            return (
              <button
                key={kpi.label}
                onClick={() => onNavigate(kpi.workspace)}
                className={`group relative text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] ${c.card} transition-all hover:bg-white/[0.04]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${c.tint} flex items-center justify-center`}>
                    <Icon size={15} className={c.text} />
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{kpi.label}</div>
                <div className="text-lg font-bold text-white leading-tight">{kpi.value}</div>
                <div className="text-[10px] text-white/40 mt-1 truncate">{kpi.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Readiness Progression */}
      <ReadinessProgression readiness={readiness} />

      {/* Architecture Map */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Boxes size={14} className="text-indigo-400" />
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">Platform Architecture Map</h2>
          <span className="text-[10px] text-white/20 ml-auto">Click any service for its workspace</span>
        </div>
        <ArchitectureMap onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function ReadinessProgression({ readiness }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-emerald-400" />
        <h3 className="text-sm font-medium text-white/80">Platform Readiness Model™</h3>
        <span className="ml-auto text-xs text-white/40">
          Current: <span className="font-bold" style={{ color: readiness.color }}>{readiness.short} — {readiness.name}</span>
        </span>
      </div>

      {/* Level Bar */}
      <div className="flex items-center gap-1 mb-4">
        {READINESS_LEVELS.map((lvl, i) => {
          const isCurrent = i === readiness.level;
          const isPassed = i < readiness.level;
          return (
            <div key={lvl.level} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  isCurrent ? "ring-2 ring-offset-2 ring-offset-[#0a0a0f]" : ""
                }`}
                style={{
                  backgroundColor: isPassed || isCurrent ? lvl.color : "rgba(255,255,255,0.06)",
                  ...(isCurrent ? { boxShadow: `0 0 0 2px ${lvl.color}40` } : {}),
                }}
              />
              <div className="text-center mt-1.5">
                <div className={`text-[10px] font-bold ${isCurrent || isPassed ? "text-white/80" : "text-white/30"}`}>
                  {lvl.short}
                </div>
                <div className={`text-[9px] truncate ${isCurrent ? "text-white/60" : "text-white/20"}`}>
                  {lvl.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Target & Requirements */}
      {readiness.nextLevel && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Next Target</div>
            <div className="text-sm font-medium text-white">
              {readiness.nextLevel.short} — {readiness.nextLevel.name}
            </div>
            <div className="text-[11px] text-white/40 mt-0.5">{readiness.nextLevel.description}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Remaining Requirements</div>
            <ul className="space-y-1">
              {readiness.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-white/60">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}