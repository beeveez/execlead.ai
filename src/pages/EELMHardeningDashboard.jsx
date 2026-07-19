import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, ShieldCheck, TrendingUp, TrendingDown, Minus, Activity, Clock,
  GitBranch, Scale, Database, Layers, Award, CheckCircle2, AlertTriangle,
  ChevronDown, Zap, Target, FileCheck, Boxes, ArrowUpRight, AlertCircle, Eye,
} from 'lucide-react';
import { computeEELMHardening } from '@/lib/eelmHardeningEngine';

const CAPABILITY_ICONS = {
  intelligence_registry: Database,
  evidence_confidence: FileCheck,
  drift_detection: Activity,
  confidence_decay: Clock,
  contradiction_detection: AlertCircle,
  explainability: Eye,
  intelligence_timeline: TrendingUp,
  version_management: GitBranch,
  benchmark_calibration: Scale,
  marketplace: Layers,
};

const DRIFT_COLORS = {
  improvement: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  regression: 'text-red-400 bg-red-500/10 border-red-500/20',
  plateau: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  volatility: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  behavior_drift: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const DRIFT_ICONS = {
  improvement: TrendingUp,
  regression: TrendingDown,
  plateau: Minus,
  volatility: Activity,
  behavior_drift: GitBranch,
};

function CapabilityCard({ capability, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CAPABILITY_ICONS[capability.id] || Brain;
  const scoreColor = capability.score >= 98 ? 'text-emerald-400' : capability.score >= 95 ? 'text-amber-400' : 'text-orange-400';
  const scoreBg = capability.score >= 98 ? 'bg-emerald-500/10 border-emerald-500/20' : capability.score >= 95 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-orange-500/10 border-orange-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`border ${scoreBg} rounded-xl overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className={`w-10 h-10 rounded-lg ${scoreBg} border flex items-center justify-center`}>
            <Icon size={18} className={scoreColor} />
          </div>
          <span className="text-white/20 text-xs font-mono">{String(capability.number).padStart(2, '0')}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-medium text-sm">{capability.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase ${
              capability.status === 'implemented'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>{capability.status}</span>
          </div>
          <p className="text-white/40 text-xs leading-snug truncate">{capability.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xl font-bold ${scoreColor}`}>{capability.score}</span>
          <span className="text-white/20 text-xs">/100</span>
        </div>
        <ChevronDown size={14} className={`text-white/30 transition-transform ${expanded ? 'rotate-180' : ''} shrink-0`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          <p className="text-white/60 text-sm leading-relaxed mt-2">{capability.detail}</p>
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

export default function EELMHardeningDashboard() {
  const h = useMemo(() => computeEELMHardening(), []);
  const maturityColor = h.currentMaturity >= 99 ? 'text-emerald-400' : h.currentMaturity >= 95 ? 'text-amber-400' : 'text-orange-400';
  const maturityBg = h.currentMaturity >= 99 ? 'from-emerald-500/20 to-emerald-500/5' : h.currentMaturity >= 95 ? 'from-amber-500/20 to-amber-500/5' : 'from-orange-500/20 to-orange-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={22} className="text-amber-400" />
            <h1 className="text-2xl font-bold">EELM™ Architecture Hardening Sprint</h1>
          </div>
          <p className="text-white/40 text-sm">
            v{h.version} · RC2 Prerequisite · {h.stats.implemented} implemented · {h.stats.architected} architected ·
            Baseline {h.baselineMaturity}% → Target {h.targetMaturity}%
          </p>
        </div>

        {/* Maturity Hero */}
        <div className={`bg-gradient-to-br ${maturityBg} border border-white/10 rounded-2xl p-8 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Architectural Maturity</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-bold ${maturityColor}`}>{h.currentMaturity}%</span>
                <span className="text-white/30 text-xl">/ {h.targetMaturity}%</span>
              </div>
              <p className="text-white/40 text-sm mt-1">
                +{h.maturityGain} points from baseline · {h.remainingGap > 0 ? `${h.remainingGap} points to RC2 readiness` : 'RC2 ready'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {h.rc2Ready ? (
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <ShieldCheck size={24} className="text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-bold text-lg">RC2 READY</p>
                    <p className="text-white/40 text-xs">Prerequisite satisfied</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={24} className="text-amber-400" />
                  <div>
                    <p className="text-amber-400 font-bold text-lg">RC2 BLOCKED</p>
                    <p className="text-white/40 text-xs">{h.remainingGap} points remaining</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
              <span>Baseline {h.baselineMaturity}%</span>
              <span>Current {h.currentMaturity}%</span>
              <span>Target {h.targetMaturity}%</span>
            </div>
            <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="absolute h-full bg-amber-400/30 rounded-full" style={{ width: `${h.baselineMaturity}%` }} />
              <div className="absolute h-full bg-emerald-400 rounded-full" style={{ width: `${h.currentMaturity}%` }} />
              <div className="absolute h-full border-r-2 border-red-400" style={{ width: `${h.targetMaturity}%` }} />
            </div>
          </div>
        </div>

        {/* Intelligence Registry */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Database} title="Executive Intelligence Registry™" subtitle={`${h.intelligenceRegistry.length} registered metrics`} />
          <div className="space-y-2">
            {h.intelligenceRegistry.map((entry) => (
              <div key={entry.intelligenceId} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-amber-400 text-xs font-mono">{entry.intelligenceId}</code>
                  <span className="text-white font-medium text-sm">{entry.dimension}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded uppercase">{entry.status}</span>
                  <span className="text-white/30 text-xs ml-auto">v{entry.version}</span>
                </div>
                <p className="text-white/50 text-xs mb-2">{entry.definition}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div><span className="text-white/30">Owner:</span> <span className="text-white/60">{entry.owner}</span></div>
                  <div><span className="text-white/30">Confidence:</span> <span className="text-white/60">{entry.confidenceModel}</span></div>
                  <div><span className="text-white/30">Sources:</span> <span className="text-white/60">{entry.evidenceSources.join(', ')}</span></div>
                  <div><span className="text-white/30">Consumers:</span> <span className="text-white/60">{entry.consumers.join(', ')}</span></div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <span className="text-white/30 text-xs">Formula: </span>
                  <code className="text-indigo-400/80 text-xs font-mono">{entry.scoringFormula}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Confidence + Confidence Decay */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Evidence Confidence */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <SectionHeader icon={FileCheck} title="Executive Evidence Confidence™" />
            <div className="space-y-1.5 mb-4">
              {h.evidenceConfidence.components.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white/70 font-medium">{c.label}</span>
                    <p className="text-white/30 text-[10px]">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Sample: {h.evidenceConfidence.sample.dimension}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-white/30">Confidence:</span> <span className="text-emerald-400 font-bold">{h.evidenceConfidence.sample.confidencePercentage}%</span></div>
                <div><span className="text-white/30">Evidence:</span> <span className="text-white/60">{h.evidenceConfidence.sample.evidenceCount} points</span></div>
                <div><span className="text-white/30">Diversity:</span> <span className="text-white/60">{h.evidenceConfidence.sample.observationDiversity} scenarios</span></div>
                <div><span className="text-white/30">Coverage:</span> <span className="text-white/60">{h.evidenceConfidence.sample.moduleCoverage}%</span></div>
              </div>
            </div>
          </div>

          {/* Confidence Decay */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <SectionHeader icon={Clock} title="Confidence Decay Engine™" />
            <p className="text-white/50 text-xs mb-3">{h.confidenceDecay.principle}</p>
            <div className="space-y-1 mb-4">
              {h.confidenceDecay.decayCurve.map((point) => (
                <div key={point.ageDays} className="flex items-center gap-2 text-xs">
                  <span className="text-white/40 w-16">{point.label}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${point.weight * 100}%` }} />
                  </div>
                  <span className="text-white/60 w-10 text-right">{Math.round(point.weight * 100)}%</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {h.confidenceDecay.configurablePolicies.map((p) => (
                <div key={p.id} className="px-2 py-1 bg-white/[0.02] border border-white/5 rounded text-xs">
                  <span className="text-white/70">{p.label}</span>
                  <span className="text-white/30 ml-1">{p.halfLifeDays}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drift Detection */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Activity} title="Leadership Drift Detection™" subtitle="5 signal types across 4 time windows" />
          <div className="flex flex-wrap gap-2 mb-4">
            {h.driftDetection.signalTypes.map((s) => {
              const DriftIcon = DRIFT_ICONS[s.id];
              return (
                <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium ${DRIFT_COLORS[s.id]}`}>
                  <DriftIcon size={12} />
                  {s.label}
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            {h.driftDetection.sampleSignals.map((sig, i) => {
              const DriftIcon = DRIFT_ICONS[sig.signal];
              const colorClass = DRIFT_COLORS[sig.signal];
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${colorClass}`}>
                    <DriftIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white/80 text-sm font-medium">{sig.dimension}</span>
                    <span className={`text-xs ml-2 ${colorClass.split(' ')[0]}`}>{sig.signal}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-center">
                      <p className="text-white/30 text-[9px] uppercase">Weekly</p>
                      <p className={sig.weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>{sig.weeklyChange > 0 ? '+' : ''}{sig.weeklyChange}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/30 text-[9px] uppercase">Monthly</p>
                      <p className={sig.monthlyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>{sig.monthlyChange > 0 ? '+' : ''}{sig.monthlyChange}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/30 text-[9px] uppercase">Quarterly</p>
                      <p className={sig.quarterlyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>{sig.quarterlyChange > 0 ? '+' : ''}{sig.quarterlyChange}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contradiction Detection */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={AlertCircle} title="Contradiction Detection Engine™" subtitle={`${h.contradictionDetection.sampleContradictions.length} active contradictions`} />
          <div className="space-y-3">
            {h.contradictionDetection.sampleContradictions.map((c) => (
              <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-amber-400 text-xs font-mono">{c.id}</code>
                  <span className="text-white font-medium text-sm">{c.dimension}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-medium ${
                    c.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>{c.severity}</span>
                </div>
                <p className="text-white/60 text-xs mb-3">{c.conflict}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div className="bg-emerald-500/[0.04] border border-emerald-500/15 rounded-lg p-2">
                    <p className="text-emerald-400 text-[10px] font-medium uppercase mb-1">{c.moduleA.module}</p>
                    <p className="text-white/60 text-xs">{c.moduleA.observation}</p>
                    <p className="text-emerald-400 text-sm font-bold mt-1">{c.moduleA.score}/100</p>
                  </div>
                  <div className="bg-red-500/[0.04] border border-red-500/15 rounded-lg p-2">
                    <p className="text-red-400 text-[10px] font-medium uppercase mb-1">{c.moduleB.module}</p>
                    <p className="text-white/60 text-xs">{c.moduleB.observation}</p>
                    <p className="text-red-400 text-sm font-bold mt-1">{c.moduleB.score}/100</p>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <p><span className="text-white/30">Confidence Impact:</span> <span className="text-amber-400">{c.confidenceImpact}</span></p>
                  <p><span className="text-white/30">Intervention:</span> <span className="text-white/60">{c.recommendedIntervention}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version Management */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={GitBranch} title="Intelligence Version Management™" subtitle="Historical scores remain reproducible" />
          <div className="space-y-2">
            {h.versionManagement.versions.map((v) => (
              <div key={v.component} className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="flex-1">
                  <span className="text-white/70 text-sm font-medium">{v.component}</span>
                  <p className="text-white/30 text-xs">{v.compatibility}</p>
                </div>
                <code className="text-amber-400 text-xs font-mono">v{v.currentVersion}</code>
                <span className="text-white/30 text-xs">{v.effectiveDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benchmark Calibration */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Scale} title="Executive Benchmark & Calibration™" subtitle={`${h.benchmarks.levels.length} levels · ${h.benchmarks.cohorts.length} industry cohorts`} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Leadership Level Benchmarks</p>
              <div className="flex flex-wrap gap-2">
                {h.benchmarks.levels.map((b) => (
                  <div key={b.id} className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                    <span className="text-white/70">{b.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2 mt-4">Industry Cohorts</p>
              <div className="flex flex-wrap gap-2">
                {h.benchmarks.cohorts.map((c) => (
                  <div key={c} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">{c}</div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-3">Sample Calibration</p>
              <p className="text-white/70 text-sm mb-1">{h.benchmarks.sample.userDimension}</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-emerald-400">{h.benchmarks.sample.userScore}</span>
                <span className="text-white/30 text-sm">vs {h.benchmarks.sample.benchmarkScore} benchmark</span>
                <span className="text-emerald-400 text-sm font-medium">(+{h.benchmarks.sample.delta})</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 mb-2">
                <p className="text-emerald-400 text-sm font-bold">{h.benchmarks.sample.percentileRank}th percentile</p>
                <p className="text-white/40 text-xs">{h.benchmarks.sample.benchmarkContext}</p>
              </div>
              <p className="text-white/30 text-xs">Target: {h.benchmarks.sample.targetBenchmark} benchmark</p>
            </div>
          </div>
        </div>

        {/* Marketplace Architecture */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Layers} title="Future Intelligence Marketplace™" subtitle="Extensible — preserves EELM™ core" />
          <div className="space-y-2 mb-4">
            {h.marketplace.structure.map((layer, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <span className="text-indigo-400 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <span className="text-white/70 text-sm font-medium">{layer.layer}</span>
                  <p className="text-white/40 text-xs">{layer.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {h.marketplace.designRules.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                <CheckCircle2 size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                {rule}
              </div>
            ))}
          </div>
        </div>

        {/* 10 Hardening Capabilities */}
        <div className="mb-6">
          <SectionHeader icon={Target} title="Hardening Capabilities" subtitle={`${h.stats.implemented} implemented · ${h.stats.architected} architected`} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {h.capabilities.map((cap, i) => (
              <CapabilityCard key={cap.id} capability={cap} index={i} />
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-2xl p-6 text-center">
          <ShieldCheck size={20} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
            EELM™ becomes a governed, explainable, evidence-based leadership intelligence platform where every recommendation
            is transparent, every score is traceable, every trend is measurable, and every behavioral insight can be audited and reproduced.
          </p>
          <p className="text-amber-400/60 text-xs mt-3 font-medium">
            One Leadership Journey. One AI Platform. One Executive Leadership Intelligence Layer™.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          EELM™ Hardening Sprint v{h.version} · Computed {new Date(h.computedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}