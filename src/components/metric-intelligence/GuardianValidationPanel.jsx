import React from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, MinusCircle,
  Shield, BarChart3, TrendingUp, TrendingDown, FileText, Clock,
} from 'lucide-react';

const STATUS_META = {
  PASS: { label: 'Pass', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  WARNING: { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
  FAIL: { label: 'Fail', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  SKIPPED: { label: 'Skipped', color: 'text-white/30', bg: 'bg-white/5', icon: MinusCircle },
  NOT_APPLICABLE: { label: 'N/A', color: 'text-white/30', bg: 'bg-white/5', icon: MinusCircle },
};

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
 * GuardianValidationPanel — renders Guardian-specific sections
 * inside the Metric Intelligence drawer.
 *
 * Displays validation rules, progress tracking, validation history,
 * and the executive validation report — all derived from the
 * Guardian Validation Engine.
 */
export default function GuardianValidationPanel({ metric }) {
  const { validationRules, scoreData, progressTracking, validationHistory, validationReport } = metric;

  return (
    <>
      {/* Validation Rules */}
      <Section icon={Shield} title="Validation Rules" iconColor="text-violet-400">
        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-2 text-[10px] text-white/30 uppercase tracking-wider px-2 py-1">
            <span className="col-span-4">Rule</span>
            <span className="col-span-3">Domain</span>
            <span className="col-span-2 text-center">Weight</span>
            <span className="col-span-3 text-center">Status</span>
          </div>
          {validationRules.map((rule) => {
            const meta = STATUS_META[rule.status] || STATUS_META.SKIPPED;
            return (
              <div key={rule.id} className="grid grid-cols-12 gap-2 items-center text-xs bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5">
                <span className="col-span-4 text-white/70 truncate">{rule.name}</span>
                <span className="col-span-3 text-white/40 truncate">{rule.domain.replace(/_/g, ' ')}</span>
                <span className="col-span-2 text-center text-white/50">{rule.weight}</span>
                <span className="col-span-3 flex justify-center">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.bg} ${meta.color}`}>
                    <meta.icon size={10} />
                    {meta.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Progress Tracking */}
      <Section icon={BarChart3} title="Progress Tracking" iconColor="text-blue-400">
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
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Regression Count</div>
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
        <div className="mt-2 text-xs text-white/40">
          Average recovery time: <span className="text-white/60">{validationHistory.averageRecoveryTime}</span>
        </div>
      </Section>

      {/* Validation Report */}
      <Section icon={FileText} title="Validation Report" iconColor="text-indigo-400">
        <div className="space-y-3">
          {/* Executive Summary */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Executive Summary</div>
            <p className="text-white/60 text-sm leading-relaxed">{validationReport.executiveSummary}</p>
          </div>

          {/* Validation Breakdown */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
              <div className="text-[9px] text-white/30 uppercase">Total</div>
              <div className="text-base font-bold text-white">{validationReport.validationBreakdown.total}</div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 text-center">
              <div className="text-[9px] text-emerald-400/60 uppercase">Passed</div>
              <div className="text-base font-bold text-emerald-400">{validationReport.validationBreakdown.passed}</div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 text-center">
              <div className="text-[9px] text-amber-400/60 uppercase">Warnings</div>
              <div className="text-base font-bold text-amber-400">{validationReport.validationBreakdown.warnings}</div>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2 text-center">
              <div className="text-[9px] text-red-400/60 uppercase">Failures</div>
              <div className="text-base font-bold text-red-400">{validationReport.validationBreakdown.failures}</div>
            </div>
          </div>

          {/* Deployment Readiness */}
          <div className={`rounded-lg p-3 border ${validationReport.deploymentReady ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
            <div className="flex items-center gap-2">
              {validationReport.deploymentReady
                ? <CheckCircle2 size={16} className="text-emerald-400" />
                : <XCircle size={16} className="text-red-400" />}
              <span className={`text-sm font-medium ${validationReport.deploymentReady ? 'text-emerald-400' : 'text-red-400'}`}>
                {validationReport.deploymentReadiness}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-1">
              Projected recovery: <span className="text-white/60">{validationReport.projectedRecovery}%</span>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}