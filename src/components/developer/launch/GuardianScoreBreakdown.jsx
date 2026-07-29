import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Info, ChevronRight } from "lucide-react";

/**
 * Guardian™ Certification Score Breakdown
 * Renders the transparent, weighted-category calculation so every point
 * is traceable. Answers: why is the score X? which category is short?
 * why is Deployment Verification blocked?
 */
export default function GuardianScoreBreakdown({ phase }) {
  const { categories = [], shortCategories = [], deploymentBlocked, platformHealthExplanation } = phase;
  if (!categories.length) return null;

  const totalEarned = categories.reduce((s, c) => s + c.earnedPoints, 0);
  const totalMax = categories.reduce((s, c) => s + c.maxPoints, 0);
  const certified = deploymentBlocked && !deploymentBlocked.blocked;

  return (
    <div className="space-y-4">
      {/* ── Why does Platform Health differ from Guardian Certification? ── */}
      {platformHealthExplanation && (
        <div className="rounded-lg bg-indigo-500/[0.06] border border-indigo-500/15 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Info size={13} className="text-indigo-400 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
              Why Platform Health ({platformHealthExplanation.platformHealth}%) ≠ Guardian Certification ({phase.score})
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-white/60 leading-relaxed">
            <p><span className="text-white/80 font-medium">Platform Health</span> measures {platformHealthExplanation.platformHealthMeasures}</p>
            <p><span className="text-white/80 font-medium">Guardian Certification</span> measures {platformHealthExplanation.certificationMeasures}</p>
            <p className="text-amber-300/80">{platformHealthExplanation.whyDiverge}</p>
          </div>
        </div>
      )}

      {/* ── Category Breakdown Table ── */}
      <div className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/5">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Score Breakdown — How {phase.score}/100 is Calculated</span>
        </div>

        <div className="divide-y divide-white/5">
          {categories.map((cat) => {
            const isShort = cat.gap > 0;
            return (
              <div key={cat.id} className={`px-3.5 py-2.5 ${isShort ? "bg-amber-500/[0.04]" : ""}`}>
                {/* Category row */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium flex-1 ${isShort ? "text-amber-300" : "text-white/80"}`}>
                    {cat.label}
                  </span>
                  {/* mini progress bar */}
                  <div className="hidden sm:block w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isShort ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${(cat.earnedPoints / cat.maxPoints) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono font-semibold w-16 text-right ${isShort ? "text-amber-400" : "text-emerald-400"}`}>
                    {cat.earnedPoints}/{cat.maxPoints}
                  </span>
                  {isShort ? (
                    <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                  )}
                </div>

                {/* Sub-checks (only show for short categories or deployment) */}
                {(isShort || cat.id === "deployment") && (
                  <div className="mt-1.5 ml-1 space-y-1">
                    {cat.checks.map((chk) => (
                      <div key={chk.id} className="flex items-center gap-2 text-[10px]">
                        {chk.passed ? (
                          <CheckCircle2 size={10} className="text-emerald-400/70 flex-shrink-0" />
                        ) : (
                          <XCircle size={10} className="text-amber-400 flex-shrink-0" />
                        )}
                        <span className={`flex-1 ${chk.passed ? "text-white/50" : "text-white/70"}`}>
                          {chk.label}
                          <span className="text-white/30"> · {chk.weight} pts</span>
                        </span>
                        <span className="text-white/35 font-mono">{chk.detail}</span>
                      </div>
                    ))}
                    {cat.proportional && (
                      <div className="flex items-center gap-2 text-[10px] text-white/40 italic">
                        <span className="flex-1">
                          Proportional credit: {cat.proportional.source} {cat.proportional.current}/{cat.proportional.target}
                        </span>
                        <span className="font-mono">→ {cat.earnedPoints} pts</span>
                      </div>
                    )}
                    <div className="text-[9px] text-white/25 italic pl-4">{cat.formula}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total row */}
        <div className="flex items-center gap-2 px-3.5 py-3 bg-white/[0.03] border-t border-white/10">
          <span className="text-xs font-bold text-white flex-1">Total</span>
          <span className={`text-sm font-mono font-bold ${certified ? "text-emerald-400" : "text-amber-400"}`}>
            {totalEarned}/{totalMax}
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            = {phase.score}/100
          </span>
        </div>
      </div>

      {/* ── Missing points identification ── */}
      {shortCategories.length > 0 && (
        <div className="rounded-lg bg-amber-500/[0.06] border border-amber-500/15 p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle size={13} className="text-amber-400" />
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
              Missing {totalMax - totalEarned} point{totalMax - totalEarned !== 1 ? "s" : ""} — {shortCategories.length} categor{shortCategories.length === 1 ? "y" : "ies"} short
            </span>
          </div>
          <div className="space-y-1">
            {shortCategories.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-[11px]">
                <span className="text-amber-300 font-medium">{c.label}</span>
                <span className="text-white/30">—</span>
                <span className="text-white/60">earned {c.earnedPoints}/{c.maxPoints}</span>
                <span className="text-amber-400 font-mono">−{c.gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Deployment Verification block explanation ── */}
      {deploymentBlocked && deploymentBlocked.blocked && (
        <div className="rounded-lg bg-red-500/[0.05] border border-red-500/15 p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <XCircle size={13} className="text-red-400" />
            <span className="text-[11px] font-semibold text-red-300 uppercase tracking-wider">
              Why "Deployment Verification" is Blocked
            </span>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed mb-2">{deploymentBlocked.reason}</p>
          <div className="grid grid-cols-3 gap-2 text-center mb-2">
            <div className="bg-white/[0.03] rounded px-2 py-1.5">
              <div className="text-[9px] text-white/30 uppercase">Foundation Score</div>
              <div className="text-sm font-bold text-amber-400">{deploymentBlocked.foundationScore}%</div>
              <div className="text-[9px] text-white/30">/ {deploymentBlocked.threshold}% req.</div>
            </div>
            <div className="bg-white/[0.03] rounded px-2 py-1.5">
              <div className="text-[9px] text-white/30 uppercase">Critical Issues</div>
              <div className={`text-sm font-bold ${deploymentBlocked.criticalIssues > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {deploymentBlocked.criticalIssues}
              </div>
              <div className="text-[9px] text-white/30">must be 0</div>
            </div>
            <div className="bg-white/[0.03] rounded px-2 py-1.5">
              <div className="text-[9px] text-white/30 uppercase">Blocking Domains</div>
              <div className="text-sm font-bold text-amber-400">{deploymentBlocked.blockingDomains.length}</div>
              <div className="text-[9px] text-white/30 truncate">{deploymentBlocked.blockingDomains.join(", ") || "—"}</div>
            </div>
          </div>
          <Link
            to={deploymentBlocked.deepLink}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
          >
            Resolve Foundation Certification blockers <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}