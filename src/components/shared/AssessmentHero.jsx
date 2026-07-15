import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Rocket, Gauge, TrendingUp, AlertTriangle, Ban, CheckCircle2, AlertCircle } from "lucide-react";
import { usePlatformReadiness } from "@/lib/PlatformReadinessContext";
import {
  CERTIFICATION_STATUS,
  LAUNCH_STATUS,
  DISPLAY_MODES,
} from "@/lib/platformReadinessEngine";

/**
 * AssessmentHero™ — Shared Readiness Display
 * ===========================================
 * The single shared component every page uses to display readiness.
 *
 * Display modes:
 *   • certification — Platform Certification™ ("Is the platform certified?")
 *   • launch        — Deployment Decision™ ("Should this build be released?")
 *   • performance   — Performance Health™ (contribution only)
 *   • scalability   — Scalability Health™ (contribution only)
 *   • overall       — Overall Readiness™ with full breakdown
 *
 * No page creates its own readiness hero. Everyone uses this.
 */
export default function AssessmentHero({ displayMode = "overall", title, subtitle, className = "" }) {
  const readiness = usePlatformReadiness();
  const mode = DISPLAY_MODES[displayMode] || DISPLAY_MODES.overall;

  // ── Score Ring ──
  const score = useMemo(() => {
    if (displayMode === "performance") {
      return readiness.inputs?.find((i) => i.id === "performance")?.score ?? 0;
    }
    if (displayMode === "scalability") {
      return readiness.inputs?.find((i) => i.id === "scalability")?.score ?? 0;
    }
    if (displayMode === "certification" || displayMode === "launch") {
      return readiness.overallReadiness;
    }
    return readiness.overallReadiness;
  }, [displayMode, readiness]);

  // ── Status for certification/launch modes ──
  const statusValue = useMemo(() => {
    if (displayMode === "certification") return readiness.platformCertification;
    if (displayMode === "launch") return readiness.launchReadiness;
    return null;
  }, [displayMode, readiness]);

  const statusMap = displayMode === "certification" ? CERTIFICATION_STATUS : LAUNCH_STATUS;
  const status = statusValue ? statusMap[statusValue] : null;

  // ── Contribution-only banner for performance/scalability ──
  const isContributionOnly = mode.contributionOnly;

  // ── Ring color based on score ──
  const ringColor = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">{title || mode.label}</h2>
          <p className="text-xs text-white/40 mt-0.5">{subtitle || mode.question}</p>
        </div>
        {status && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bgColor} ${status.borderColor} border`}>
            {statusValue === "certified" || statusValue === "go" ? (
              <CheckCircle2 size={14} className={status.textColor} />
            ) : statusValue === "conditional" ? (
              <AlertCircle size={14} className={status.textColor} />
            ) : (
              <Ban size={14} className={status.textColor} />
            )}
            <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
          </div>
        )}
      </div>

      {/* Contribution-only notice */}
      {isContributionOnly && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <AlertTriangle size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs text-blue-300/80">
            Contribution only — this metric feeds the Platform Readiness Engine™ and does not own readiness.
          </span>
        </div>
      )}

      {/* Score Ring + Key Metrics */}
      <div className="flex items-center gap-6">
        {/* Score Ring */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{score}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wide">Score</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {displayMode === "overall" || displayMode === "certification" ? (
            <>
              <MetricPill icon={ShieldCheck} label="Certification" value={readiness.platformCertification} statusMap={CERTIFICATION_STATUS} />
              <MetricPill icon={Gauge} label="Overall" value={`${readiness.overallReadiness}%`} />
              <MetricPill icon={Rocket} label="Launch" value={readiness.launchReadiness} statusMap={LAUNCH_STATUS} />
              <MetricPill icon={TrendingUp} label="Confidence" value={`${readiness.confidence}%`} />
            </>
          ) : displayMode === "launch" ? (
            <>
              <MetricPill icon={Gauge} label="Deployment" value={`${readiness.deploymentReadiness}%`} />
              <MetricPill icon={ShieldCheck} label="Certification" value={readiness.platformCertification} statusMap={CERTIFICATION_STATUS} />
              <MetricPill icon={TrendingUp} label="Confidence" value={`${readiness.confidence}%`} />
              <MetricPill icon={Ban} label="Production" value={readiness.productionDecision} />
            </>
          ) : (
            <>
              <MetricPill icon={Gauge} label="Overall Readiness" value={`${readiness.overallReadiness}%`} />
              <MetricPill icon={ShieldCheck} label="Certification" value={readiness.platformCertification} statusMap={CERTIFICATION_STATUS} />
              <MetricPill icon={TrendingUp} label="Contribution Weight" value={`${Math.round((mode === DISPLAY_MODES.performance ? 0.08 : 0.08) * 100)}%`} />
              <MetricPill icon={Rocket} label="Launch Decision" value={readiness.launchReadiness} statusMap={LAUNCH_STATUS} />
            </>
          )}
        </div>
      </div>

      {/* Blocking Issues & Warnings */}
      {(readiness.blockingIssues.length > 0 || readiness.warnings.length > 0) && (
        <div className="mt-5 space-y-2">
          {readiness.blockingIssues.slice(0, 3).map((issue, idx) => (
            <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
              <Ban size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-red-300">{issue.sourceName}</span>
                <p className="text-xs text-white/50 mt-0.5">{issue.message}</p>
              </div>
            </div>
          ))}
          {readiness.warnings.slice(0, 2).map((warning, idx) => (
            <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-amber-300">{warning.sourceName}</span>
                <p className="text-xs text-white/50 mt-0.5">{warning.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Engine Attribution */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-white/30 uppercase tracking-wide">
          Powered by Platform Readiness Engine™
        </span>
        {readiness.timestamp && (
          <span className="text-[10px] text-white/30">
            Updated {new Date(readiness.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Helper: Metric Pill ──
function MetricPill({ icon: Icon, label, value, statusMap }) {
  const status = statusMap && statusMap[value];
  const textColor = status ? status.textColor : "text-white";

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
      <Icon size={14} className="text-white/40 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] text-white/40 uppercase tracking-wide">{label}</div>
        <div className={`text-xs font-medium ${textColor} capitalize truncate`}>
          {typeof value === "string" && value.length > 15 ? value.substring(0, 15) + "…" : value}
        </div>
      </div>
    </div>
  );
}