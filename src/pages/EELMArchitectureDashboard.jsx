import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Network, Activity, Shield, ShieldCheck, Lock, Eye, FileCheck,
  CheckCircle2, AlertTriangle, Code2, Database, GitBranch, Layers,
  Scale, Zap, TrendingUp, Users, Award, Sparkles, ChevronDown,
} from 'lucide-react';
import { computeEELMArchitecture } from '@/lib/eelmArchitectureEngine';

const STANDARD_ICONS = {
  telemetry: Activity,
  identity_graph: Network,
  context_window: Layers,
  evidence_engine: FileCheck,
  anti_gaming: ShieldCheck,
  behavioral_signals: Brain,
  longitudinal: TrendingUp,
  explainability: Eye,
  intelligence_api: Zap,
  bias_fairness: Scale,
  privacy: Lock,
  evidence_graph: GitBranch,
};

function StandardCard({ standard, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = STANDARD_ICONS[standard.id] || Brain;
  const scoreColor = standard.score >= 95 ? 'text-emerald-400' : standard.score >= 90 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = standard.score >= 95 ? 'bg-emerald-500/10 border-emerald-500/20' : standard.score >= 90 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

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
          <span className="text-white/20 text-xs font-mono">{String(standard.number).padStart(2, '0')}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-medium text-sm">{standard.label}</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-medium uppercase">Implemented</span>
          </div>
          <p className="text-white/40 text-xs leading-snug truncate">{standard.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xl font-bold ${scoreColor}`}>{standard.score}</span>
          <span className="text-white/20 text-xs">/100</span>
        </div>
        <ChevronDown size={14} className={`text-white/30 transition-transform ${expanded ? 'rotate-180' : ''} shrink-0`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          <p className="text-white/60 text-sm leading-relaxed mt-2">{standard.detail}</p>
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

export default function EELMArchitectureDashboard() {
  const arch = useMemo(() => computeEELMArchitecture(), []);
  const overallColor = arch.overallScore >= 95 ? 'text-emerald-400' : arch.overallScore >= 90 ? 'text-amber-400' : 'text-red-400';
  const overallBg = arch.overallScore >= 95 ? 'from-emerald-500/20 to-emerald-500/5' : arch.overallScore >= 90 ? 'from-amber-500/20 to-amber-500/5' : 'from-red-500/20 to-red-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={22} className="text-amber-400" />
            <h1 className="text-2xl font-bold">EELM™ Platform Architecture Standard</h1>
          </div>
          <p className="text-white/40 text-sm">
            v{arch.version} · {arch.stats.implementedStandards}/{arch.stats.totalStandards} standards implemented ·
            {arch.stats.behavioralSignals} behavioral signals · {arch.stats.antiGamingRules} anti-gaming rules ·
            {arch.stats.biasFairnessRules} bias prevention rules
          </p>
        </div>

        {/* Architecture Hero */}
        <div className={`bg-gradient-to-br ${overallBg} border border-white/10 rounded-2xl p-8 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Architecture Compliance Score</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-bold ${overallColor}`}>{arch.overallScore}</span>
                <span className="text-white/30 text-xl">/ 100</span>
              </div>
              <p className="text-white/40 text-sm mt-1">
                {arch.stats.implementedStandards} of {arch.stats.totalStandards} standards fully implemented
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {arch.fullyImplemented ? (
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <ShieldCheck size={24} className="text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-bold text-lg">SSOT ACTIVE</p>
                    <p className="text-white/40 text-xs">Single Source of Truth for leadership intelligence</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={24} className="text-amber-400" />
                  <div>
                    <p className="text-amber-400 font-bold text-lg">PARTIAL</p>
                    <p className="text-white/40 text-xs">Some standards require completion</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Architecture Principles */}
        <div className="bg-indigo-500/[0.04] border border-indigo-500/15 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-indigo-400 text-sm font-medium">Architecture Principles</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'EELM™ is not an AI prompt — it is a continuously learning platform intelligence service',
              'EELM™ is not a database — every score is derived from observable evidence',
              'Every module publishes observations using the same telemetry schema',
              'Every module consumes the same leadership intelligence — no duplicated scoring',
            ].map((principle, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                {principle}
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Graph Visualization */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={GitBranch} title="Executive Evidence Graph™" subtitle="Event-sourced behavioral ledger" />
          <p className="text-white/50 text-sm mb-4 leading-relaxed">
            {arch.evidenceGraph.principle}. Every observed behavior becomes an immutable evidence node. Recommendations are traceable to observed evidence — not opaque AI judgments.
          </p>
          <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-6 mb-4">
            {/* Graph flow visualization */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-medium">
                Executive Identity
              </div>
              <div className="text-white/20">↓</div>
              <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-xs font-medium">
                Executive Evidence Graph™
              </div>
              <div className="text-white/20">↓</div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['Coach', 'Debate', 'Simulator', 'Academy'].map((m) => (
                  <div key={m} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs">
                    {m}
                  </div>
                ))}
              </div>
              <div className="text-white/20">↓</div>
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-medium">
                Observed Behaviors
              </div>
              <div className="text-white/20">↓</div>
              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-medium">
                Evidence Engine™ → EELM™
              </div>
              <div className="text-white/20">↓</div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['Readiness™', 'Forecast™', 'Journey™', 'Passport™', 'Analytics™'].map((m) => (
                  <div key={m} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-2">Node Types</p>
              <div className="space-y-1.5">
                {arch.evidenceGraph.nodes.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 text-xs">
                    <Database size={11} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white/70 font-medium">{n.label}</span>
                      {n.immutable && <span className="text-emerald-400/60 ml-1">· immutable</span>}
                      <p className="text-white/30">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-2">Edge Types</p>
              <div className="space-y-1.5">
                {arch.evidenceGraph.edges.map((e) => (
                  <div key={e.id} className="flex items-start gap-2 text-xs">
                    <GitBranch size={11} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white/70 font-medium">{e.label}</span>
                      <p className="text-white/30">{e.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 12 Architecture Standards */}
        <div className="mb-6">
          <SectionHeader icon={Layers} title="Architecture Standards" subtitle={`${arch.stats.totalStandards} standards`} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {arch.standards.map((standard, i) => (
              <StandardCard key={standard.id} standard={standard} index={i} />
            ))}
          </div>
        </div>

        {/* Telemetry Schema */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Activity} title="Telemetry Standardization™" subtitle={`${arch.stats.telemetryEventTypes} event types`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {arch.telemetry.eventTypes.map((evt) => (
              <div key={evt.id} className="flex items-start gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                <Code2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <code className="text-white/70 text-xs font-mono">{evt.id}</code>
                  <p className="text-white/40 text-[10px] mt-0.5">{evt.description}</p>
                  <p className="text-white/20 text-[10px]">Source: {evt.module}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-2">Unified Schema Fields</p>
          <div className="flex flex-wrap gap-2">
            {arch.telemetry.schemaFields.map((f) => (
              <div key={f.field} className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.02] border border-white/5 rounded text-xs">
                <code className="text-white/60 font-mono">{f.field}</code>
                <span className="text-white/20 text-[10px]">{f.type}</span>
                {f.required && <span className="text-amber-400/60 text-[9px]">required</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Signals + Anti-Gaming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <SectionHeader icon={Brain} title="Behavioral Signal Engine™" subtitle={`${arch.stats.behavioralSignals} implicit signals`} />
            <div className="space-y-1.5">
              {arch.behavioralSignals.map((s) => (
                <div key={s.id} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white/70">{s.label}</span>
                    <p className="text-white/30 text-[10px]">{s.signal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <SectionHeader icon={ShieldCheck} title="Anti-Gaming Framework™" subtitle={`${arch.stats.antiGamingRules} rules`} />
            <div className="space-y-1.5">
              {arch.antiGamingRules.map((r) => (
                <div key={r.id} className="flex items-start gap-2 text-xs">
                  <Shield size={11} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white/70 font-medium">{r.label}</span>
                    <p className="text-white/30 text-[10px]">{r.rule}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bias/Fairness + Privacy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <SectionHeader icon={Scale} title="Bias & Fairness Framework™" subtitle={`${arch.stats.biasFairnessRules} prevention rules`} />
            <div className="space-y-1.5">
              {arch.biasFairnessRules.map((r) => (
                <div key={r.id} className="flex items-start gap-2 text-xs">
                  <Scale size={11} className="text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-white/70">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <SectionHeader icon={Lock} title="Privacy & Governance" subtitle={`${arch.stats.privacyImplemented}/${arch.stats.privacyControls} controls`} />
            <div className="space-y-1.5">
              {arch.privacyGovernance.map((p) => (
                <div key={p.id} className="flex items-start gap-2 text-xs">
                  {p.implemented
                    ? <CheckCircle2 size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                    : <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />}
                  <div>
                    <span className="text-white/70 font-medium">{p.label}</span>
                    <p className="text-white/30 text-[10px]">{p.control}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="bg-emerald-500/[0.04] border border-emerald-500/15 rounded-2xl p-6 mb-6">
          <SectionHeader icon={Award} title="Success Metrics" subtitle={`${arch.stats.successMetricsAchieved}/${arch.stats.successMetricsTotal} achieved`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {arch.successMetrics.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                {m.achieved
                  ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  : <AlertTriangle size={14} className="text-amber-400 shrink-0" />}
                <span className={m.achieved ? 'text-white/70' : 'text-white/50'}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consuming Modules */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-6">
          <SectionHeader icon={Users} title="Executive Intelligence API™" subtitle={`${arch.stats.consumingModules} consuming modules`} />
          <div className="flex flex-wrap gap-2">
            {arch.consumingModules.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium">
                <Zap size={12} />
                {m.label}
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-3">No duplicated scoring logic anywhere — all modules consume the same intelligence service.</p>
        </div>

        {/* Philosophy */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-2xl p-6 text-center">
          <Brain size={20} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
            Leadership cannot be measured by personality tests. Leadership cannot be inferred from confidence alone.
            Leadership is earned through consistent behavior, thoughtful decisions, meaningful communication, and measurable growth over time.
          </p>
          <p className="text-white/40 text-xs mt-3">
            EELM™ exists to make those patterns visible, explainable, and actionable.
          </p>
          <p className="text-amber-400/60 text-xs mt-2 font-medium">
            One Leadership Journey. One AI Platform. One Executive Leadership Intelligence Layer™.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          EELM™ Architecture Standard v{arch.version} · Computed {new Date(arch.computedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}