import React from 'react';
import {
  CheckCircle2, Clock, BarChart3, TrendingUp, TrendingDown,
} from 'lucide-react';
import DomainBreakdown from './guardian/DomainBreakdown';
import InsightsAndReadiness from './guardian/InsightsAndReadiness';

function Section({ icon: Icon, title, iconColor, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={iconColor} />
        <h3 className="text-white/60 text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/**
 * GuardianValidationPanel v4.0 — renders all Guardian-specific sections
 * inside the Metric Intelligence drawer.
 *
 * Composes:
 *   • Structured AI Insights (executive summary, risk areas, priorities)
 *   • Categorized Business Impact (customer, executive, platform, operational, deployment)
 *   • Deployment Readiness Assessment (3 states, blockers, actions, time)
 *   • Full Validation Domain Breakdown (all 23 domains, clickable drill-down)
 *   • Progress Tracking (resolved/remaining rules, projected score)
 *   • Validation History (trend, new/resolved issues, duration)
 */
export default function GuardianValidationPanel({ metric }) {
  const { progressTracking, validationHistory } = metric;

  return (
    <>
      {/* Structured Insights + Categorized Impact + Deployment Readiness */}
      <InsightsAndReadiness metric={metric} />

      {/* Full Domain Breakdown with drill-down */}
      <DomainBreakdown metric={metric} />

      {/* Progress Tracking */}
      <Section icon={CheckCircle2} title="Progress Tracking" iconColor="text-blue-400">
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Resolved Rules</div>
              <div className="text-lg font-bold text-emerald-400">{progressTracking.resolvedRules}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Remaining Rules</div>
              <div className="text-lg font-bold text-amber-400">{progressTracking.remainingRules}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40">Overall Progress</span>
              <span className="text-white/60">{progressTracking.progressPercentage}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progressTracking.progressPercentage}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/40">Open Tasks</span>
              <span className="text-white/60">{progressTracking.openTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">Completed</span>
              <span className="text-white/60">{progressTracking.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">Resolvable</span>
              <span className="text-emerald-400">{progressTracking.resolvableRemaining}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">Non-resolvable</span>
              <span className="text-white/50">{progressTracking.nonResolvableRemaining}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm pt-1 border-t border-white/5">
            <span className="text-white/40">Projected Validation Score</span>
            <span className="text-emerald-400 font-medium">{progressTracking.projectedValidationScore}%</span>
          </div>
        </div>
      </Section>

      {/* Validation History */}
      <Section icon={Clock} title="Validation History" iconColor="text-cyan-400">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Previous Score</div>
            <div className="text-lg font-bold text-white/70">{validationHistory.previousScore}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Current Score</div>
            <div className="text-lg font-bold text-white">{validationHistory.currentScore}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Trend</div>
            <div className={`text-lg font-bold flex items-center gap-1 ${validationHistory.trend > 0 ? 'text-emerald-400' : validationHistory.trend < 0 ? 'text-red-400' : 'text-white/50'}`}>
              {validationHistory.trend > 0 ? <TrendingUp size={14} /> : validationHistory.trend < 0 ? <TrendingDown size={14} /> : null}
              {validationHistory.trend > 0 ? `+${validationHistory.trend}` : validationHistory.trend}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Regression Events</div>
            <div className="text-lg font-bold text-white/70">{validationHistory.regressionCount}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">New Issues</div>
            <div className="text-lg font-bold text-amber-400">{validationHistory.newIssues}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Resolved Issues</div>
            <div className="text-lg font-bold text-emerald-400">{validationHistory.resolvedIssues}</div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="text-white/40">
            Avg recovery: <span className="text-white/60">{validationHistory.averageRecoveryTime}</span>
          </div>
          <div className="text-white/40">
            Validation duration: <span className="text-white/60">{validationHistory.validationDuration}</span>
          </div>
        </div>
      </Section>
    </>
  );
}