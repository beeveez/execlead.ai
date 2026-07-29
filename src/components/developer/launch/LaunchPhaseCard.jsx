import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, ChevronRight, AlertTriangle } from "lucide-react";
import { useIntelligenceDrillDown } from "@/lib/useIntelligenceDrillDown";
import GuardianScoreBreakdown from "./GuardianScoreBreakdown";

/**
 * Launch Phase Card — reusable card for one launch-readiness phase.
 * Renders requirements, domain scores (Phase 4), and blockers (Phase 3)
 * with clickable diagnostic deep links.
 */
export default function LaunchPhaseCard({ phase, icon: Icon, accent }) {
  const accentColor = accent || "#6366f1";
  const passed = phase.passed;
  const openDrillDown = useIntelligenceDrillDown();
  const isClickable = phase.score < 100;

  return (
    <div
      id={`phase-${phase.id}`}
      className={`bg-white/[0.02] border rounded-xl p-5 scroll-mt-4 transition-all ${isClickable ? 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_20px_-4px_rgba(245,158,11,0.25)]' : 'border-white/5'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
        >
          <Icon size={16} style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white">{phase.name}</h3>
          <div className="text-[10px] text-white/30">
            Target: {phase.target}
            {phase.id === "platform_iq" ? "+" : "%"}
          </div>
        </div>
        {/* Score Ring — clickable when below 100 */}
        <button
          onClick={(e) => { e.stopPropagation(); if (isClickable) openDrillDown(phase); }}
          disabled={!isClickable}
          className={`relative flex-shrink-0 ${isClickable ? 'cursor-pointer group/ring' : 'cursor-default'}`}
          title={isClickable ? 'View Intelligence Analysis' : 'Perfect'}
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke={passed ? "#10b981" : "#f59e0b"}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 20 * (phase.score / 100)} ${2 * Math.PI * 20}`}
              strokeLinecap="round" transform="rotate(-90 24 24)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">{phase.score}</span>
          </div>
          {isClickable && (
            <div className="absolute -inset-1 rounded-full opacity-0 group-hover/ring:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
              <span className="text-[8px] font-medium text-amber-400 bg-[#0d0d14] px-1 py-0.5 rounded">Investigate</span>
            </div>
          )}
        </button>
        <span
          className={`text-[9px] font-medium px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0 ${
            passed
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {passed ? "PASS" : "BLOCKED"}
        </span>
      </div>

      {/* Guardian phase — transparent weighted score breakdown */}
      {phase.categories && <div className="mb-3"><GuardianScoreBreakdown phase={phase} /></div>}

      {/* Requirements checklist (non-guardian phases) */}
      {phase.requirements && !phase.categories && (
        <div className="space-y-1.5 mb-3">
          {phase.requirements.map((req, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
            >
              {req.passed ? (
                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle size={13} className="text-amber-400 flex-shrink-0" />
              )}
              <span className={`text-xs flex-1 ${req.passed ? "text-white/70" : "text-white/50"}`}>
                {req.label}
              </span>
              <span className="text-[10px] text-white/30">{req.detail}</span>
              {req.deepLink && (
                <Link
                  to={req.deepLink}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 flex-shrink-0"
                >
                  View <ChevronRight size={10} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Domain scores (Phase 4 — Platform IQ) */}
      {phase.domains && (
        <div className="mb-3">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
            Intelligence Domains {phase.focusDomains && "— Launch Focus"}
          </div>
          <div className="space-y-1.5">
            {(phase.focusDomains || phase.domains).map((d) => (
              <div key={d.id} className="flex items-center gap-2">
                <span className="text-[11px] text-white/60 w-40 truncate flex-shrink-0">{d.label.replace("™", "")}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${d.score}%`, backgroundColor: d.color }}
                  />
                </div>
                <span className={`text-[11px] font-bold w-8 text-right ${d.score >= 85 ? "text-emerald-400" : d.score >= 70 ? "text-amber-400" : "text-red-400"}`}>
                  {d.score}
                </span>
              </div>
            ))}
          </div>
          {phase.estGain > 0 && (
            <div className="text-[10px] text-white/30 mt-2">
              Estimated intelligence gain available: +{phase.estGain} pts
            </div>
          )}
        </div>
      )}

      {/* Blockers (Phase 3 — Foundation Certification) */}
      {phase.blockers && phase.blockers.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">
              Blockers — {phase.totalBlockers} total · Est. {phase.estimatedCompletion}
            </span>
          </div>
          <div className="space-y-1.5">
            {phase.blockers.map((b, i) => (
              <Link
                key={i}
                to={b.deepLink}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 transition-colors"
              >
                <span className="text-xs text-white/70 flex-1">{b.category}</span>
                <span className="text-[10px] text-white/40">{b.count} issue(s)</span>
                {b.critical > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{b.critical} critical</span>
                )}
                {b.high > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">{b.high} high</span>
                )}
                <ChevronRight size={12} className="text-white/30" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Deep link footer */}
      <div className="pt-2 border-t border-white/5">
        <Link
          to={phase.deepLink}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
        >
          Open diagnostic view <ChevronRight size={11} />
        </Link>
      </div>
    </div>
  );
}