import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Lock, Activity, Brain, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle2, XCircle, Target, Calendar, Zap, Award,
  FileCheck, GitBranch, Scale, Eye, ArrowRight, Clock, RefreshCw, Layers,
} from 'lucide-react';
import { computeRC2Confidence } from '@/lib/rc2ConfidenceEngine';
import { useIntelligenceDrillDown } from '@/lib/useIntelligenceDrillDown';

const METRIC_ICONS = {
  telemetry_completeness: Activity,
  explainability_coverage: Eye,
  evidence_confidence: FileCheck,
  calibration_stability: Scale,
  human_alignment: Award,
  drift_health: TrendingDown,
  benchmark_health: Target,
  overall_intelligence_confidence: Brain,
};

const TREND_ICONS = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
};

function MetricCard({ metric, index }) {
  const Icon = METRIC_ICONS[metric.id] || Activity;
  const TrendIcon = TREND_ICONS[metric.trend] || Minus;
  const openDrillDown = useIntelligenceDrillDown();
  const statusColor = metric.status === 'passing' ? 'text-emerald-400' : metric.status === 'attention' ? 'text-amber-400' : 'text-red-400';
  const statusBg = metric.status === 'passing' ? 'bg-emerald-500/10 border-emerald-500/20' : metric.status === 'attention' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';
  const scoreColor = metric.score >= metric.target ? 'text-emerald-400' : 'text-amber-400';
  const isClickable = metric.score < 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => isClickable && openDrillDown(metric)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDrillDown(metric); } }}
      className={`border ${statusBg} rounded-xl p-4 transition-all ${isClickable ? 'cursor-pointer hover:shadow-[0_0_20px_-4px_rgba(245,158,11,0.25)] hover:border-amber-500/30 group' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${statusBg} border flex items-center justify-center`}>
          <Icon size={16} className={statusColor} />
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon size={12} className={metric.trend === 'improving' ? 'text-emerald-400' : metric.trend === 'declining' ? 'text-red-400' : 'text-white/30'} />
          <span className="text-white/30 text-[10px] uppercase">{metric.trend}</span>
        </div>
      </div>
      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{metric.label}</p>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-bold ${scoreColor}`}>{metric.score}</span>
        <span className="text-white/30 text-sm">/ target {metric.target}</span>
      </div>
      <p className="text-white/50 text-xs leading-snug">{metric.details}</p>
      {isClickable && (
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-amber-400 text-[10px] font-medium">View Intelligence Analysis</span>
          <ArrowRight size={10} className="text-amber-400" />
        </div>
      )}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-amber-400" />
      <h2 className="text-white font-semibold text-sm">{title}</h2>
      {subtitle && <span className="text-white/20 text-xs">· {subtitle}</span>}
    </div>
  );
}

export default function RC2IntelligenceConfidence() {
  const h = useMemo(() => computeRC2Confidence(), []);
  const overallColor = h.overallConfidence >= 92 ? 'text-emerald-400' : 'text-amber-400';
  const overallBg = h.overallConfidence >= 92 ? 'from-emerald-500/20 to-emerald-500/5' : 'from-amber-500/20 to-amber-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={22} className="text-amber-400" />
            <h1 className="text-2xl font-bold">RC2 Intelligence Confidence Sprint™</h1>
          </div>
          <p className="text-white/40 text-sm">
            v{h.version} · {h.phase} · Architecture Frozen · {h.criteriaPassed}/{h.criteriaTotal} exit criteria passed
          </p>
        </div>

        {/* RC2 Status Hero */}
        <div className={`bg-gradient-to-br ${overallBg} border border-white/10 rounded-2xl p-8 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Overall Intelligence Confidence</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-bold ${overallColor}`}>{h.overallConfidence}</span>
                <span className="text-white/30 text-xl">/ 100</span>
              </div>
              <p className="text-white/40 text-sm mt-1">
                Target: 92 · {h.overallConfidence >= 92 ? 'Exceeds RC2 threshold' : 'Below RC2 threshold'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              {h.rc2Ready ? (
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <ShieldCheck size={24} className="text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-bold text-lg">RC2 READY</p>
                    <p className="text-white/40 text-xs">All exit criteria satisfied</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={24} className="text-amber-400" />
                  <div>
                    <p className="text-amber-400 font-bold text-lg">RC2 IN PROGRESS</p>
                    <p className="text-white/40 text-xs">{h.criteriaTotal - h.criteriaPassed} criteria remaining</p>
                  </div>
                </div>
              )}
              {/* Architecture Freeze Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Lock size={14} className="text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">Architecture Frozen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Freeze */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Lock} title="Architecture Freeze" subtitle={`Frozen ${h.architectureFreeze.frozenDate}`} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Allowed Changes</p>
              <div className="space-y-1.5">
                {h.architectureFreeze.allowedChanges.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-white/60">{c.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Blocked Changes</p>
              <div className="space-y-1.5">
                {h.architectureFreeze.blockedChanges.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-xs">
                    <XCircle size={12} className="text-red-400" />
                    <span className="text-white/60">{c.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Frozen Interfaces ({h.architectureFreeze.frozenInterfaces.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {h.architectureFreeze.frozenInterfaces.map((iface) => (
              <div key={iface.id} className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                <Lock size={11} className="text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-white/70 text-xs font-medium">{iface.description}</span>
                  <code className="text-amber-400 text-[10px] ml-2">v{iface.version}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Confidence Dashboard */}
        <div className="mb-6">
          <SectionHeader icon={Brain} title="Intelligence Confidence Dashboard™" subtitle={`${h.stats.passing}/${h.stats.totalMetrics} passing · ${h.stats.attention} need attention`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {h.confidenceMetrics.map((metric, i) => (
              <MetricCard key={metric.id} metric={metric} index={i} />
            ))}
          </div>
        </div>

        {/* Leadership Intervention Engine */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Zap} title="Leadership Intervention Engine™" subtitle={`${h.stats.activeInterventions} active interventions`} />
          <div className="space-y-3">
            {h.interventions.map((intv) => (
              <div key={intv.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <code className="text-amber-400 text-xs font-mono">{intv.id}</code>
                  <span className="text-white font-medium text-sm">{intv.affectedCompetency}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-medium ${
                    intv.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    intv.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>{intv.severity}</span>
                  <span className="text-white/30 text-xs ml-auto">{intv.trigger}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {intv.recommendations.map((rec) => (
                    <div key={rec.priority} className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-bold shrink-0">{rec.priority}</span>
                      <span className="text-white/30 uppercase text-[9px] w-16">{rec.type}</span>
                      <span className="text-white/70">{rec.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs pt-2 border-t border-white/5">
                  <Calendar size={11} className="text-blue-400" />
                  <span className="text-white/50">{intv.reassessmentSchedule}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drift Resolution Workflow */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={GitBranch} title="Drift Resolution Workflow" subtitle={`${h.stats.inProgressDriftResolutions} in progress · ${h.stats.pendingDriftResolutions} pending`} />
          <div className="space-y-3">
            {h.driftResolutions.map((dr) => (
              <div key={dr.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <code className="text-amber-400 text-xs font-mono">{dr.id}</code>
                  <span className="text-white font-medium text-sm">{dr.dimension}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">{dr.signal}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-medium ml-auto ${
                    dr.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-white/40 border border-white/10'
                  }`}>{dr.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-white/60 text-xs mb-3 leading-relaxed">{dr.rootCauseSummary}</p>
                <div className="mb-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5">Supporting Evidence</p>
                  <div className="space-y-1">
                    {dr.supportingEvidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/50">
                        <span className="text-amber-400 mt-0.5">•</span>
                        {ev}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                  <div><span className="text-white/30">Confidence:</span> <span className={dr.confidenceLevel === 'high' ? 'text-emerald-400' : 'text-amber-400'}>{dr.confidenceLevel}</span></div>
                  <div><span className="text-white/30">Intervention:</span> <span className="text-indigo-400">{dr.suggestedIntervention}</span></div>
                  <div><span className="text-white/30">Follow-up:</span> <span className="text-white/60">{dr.followUpReviewDate}</span></div>
                </div>
                {/* Improvement Tracking */}
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Improvement Tracking</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-white/30 text-[9px] uppercase">Baseline</p>
                      <p className="text-white/70 font-bold">{dr.improvementTracking.baselineScore}</p>
                    </div>
                    <ArrowRight size={12} className="text-white/20" />
                    <div className="text-center">
                      <p className="text-white/30 text-[9px] uppercase">Current</p>
                      <p className="text-amber-400 font-bold">{dr.improvementTracking.currentScore}</p>
                    </div>
                    <ArrowRight size={12} className="text-white/20" />
                    <div className="text-center">
                      <p className="text-white/30 text-[9px] uppercase">Target</p>
                      <p className="text-emerald-400 font-bold">{dr.improvementTracking.targetScore}</p>
                    </div>
                    {dr.improvementTracking.interventionStarted && (
                      <div className="ml-auto flex items-center gap-1 text-white/40">
                        <Clock size={10} />
                        <span>Started {dr.improvementTracking.interventionStarted}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation & Calibration */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={RefreshCw} title="Validation & Calibration" subtitle="Repeated scenario testing" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {h.validation.metrics.map((m) => (
              <div key={m.id} className={`border rounded-xl p-4 ${m.status === 'passing' ? 'bg-emerald-500/[0.04] border-emerald-500/15' : 'bg-amber-500/[0.04] border-amber-500/15'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-[10px] uppercase tracking-wider">{m.label}</span>
                  {m.status === 'passing' ? <CheckCircle2 size={12} className="text-emerald-400" /> : <AlertTriangle size={12} className="text-amber-400" />}
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className={`text-2xl font-bold ${m.value >= m.target ? 'text-emerald-400' : 'text-amber-400'}`}>{m.value}</span>
                  <span className="text-white/30 text-xs">/ {m.target}</span>
                </div>
                <p className="text-white/50 text-xs leading-snug">{m.methodology}</p>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Validation Runs</p>
          <div className="space-y-1.5">
            {h.validation.runs.map((run) => (
              <div key={run.runId} className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                <code className="text-amber-400 font-mono">{run.runId}</code>
                <span className="text-white/40">{run.date}</span>
                <span className="text-white/30">{run.scenarios} scenarios</span>
                <span className="text-white/30 ml-auto">Consistency:</span>
                <span className="text-emerald-400 font-bold">{run.consistency}%</span>
                <CheckCircle2 size={12} className="text-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace Status */}
        <div className="bg-blue-500/[0.04] border border-blue-500/15 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Layers size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-semibold text-sm">Marketplace Status</h2>
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded uppercase font-medium">{h.marketplace.status}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase font-medium">Excluded from RC2</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{h.marketplace.rationale}</p>
            </div>
          </div>
        </div>

        {/* RC2 Exit Criteria */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={ShieldCheck} title="RC2 Exit Criteria" subtitle={`${h.criteriaPassed}/${h.criteriaTotal} satisfied`} />
          <div className="space-y-2">
            {h.exitCriteria.map((c) => (
              <div key={c.id} className={`flex items-center gap-3 p-3 rounded-lg border ${c.status ? 'bg-emerald-500/[0.04] border-emerald-500/15' : 'bg-red-500/[0.04] border-red-500/15'}`}>
                {c.status ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <XCircle size={16} className="text-red-400 shrink-0" />}
                <div className="flex-1">
                  <span className="text-white/80 text-sm font-medium">{c.label}</span>
                  <p className="text-white/40 text-xs">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-2xl p-6 text-center">
          <ShieldCheck size={20} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
            EXECLEAD.AI is ready for RC2 when leadership intelligence is not only feature-complete, but demonstrably reliable,
            explainable, and capable of driving measurable leadership improvement through closed-loop interventions.
          </p>
          <p className="text-amber-400/60 text-xs mt-3 font-medium">
            One Leadership Journey. One AI Platform. One Trusted Leadership Intelligence Layer™.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          RC2 Intelligence Confidence Sprint v{h.version} · Computed {new Date(h.computedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}