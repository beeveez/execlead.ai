import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight,
  CheckCircle2, AlertCircle, Target, Award, Sparkles, Activity,
  Lightbulb, ArrowUpRight, Users, MessageSquare, BarChart3,
} from 'lucide-react';
import { computeEELM } from '@/lib/eelmEngine';

const DOMAIN_ICONS = {
  behavioral: Brain,
  scenario: Target,
  communication: MessageSquare,
  growth: Activity,
};

const TREND_ICONS = {
  up: { icon: TrendingUp, color: 'text-emerald-400' },
  down: { icon: TrendingDown, color: 'text-red-400' },
  stable: { icon: Minus, color: 'text-white/40' },
};

function DomainSection({ domain, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const Icon = DOMAIN_ICONS[domain.id] || Brain;
  const scoreColor = domain.score >= 80 ? 'text-emerald-400' : domain.score >= 70 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = domain.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : domain.score >= 70 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border ${scoreBg} rounded-2xl overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Icon size={22} className={scoreColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold text-sm">{domain.label}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/40 text-xs font-medium">{domain.weight}% weight</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              domain.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
              domain.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
            }`}>{domain.confidence} confidence</span>
          </div>
          <p className="text-white/50 text-xs leading-snug">{domain.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-3xl font-bold ${scoreColor}`}>{domain.score}</span>
          <span className="text-white/20 text-sm">/100</span>
        </div>
        <div className="shrink-0">
          {expanded ? <ChevronDown size={18} className="text-white/30" /> : <ChevronRight size={18} className="text-white/30" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {domain.dimensions.map((dim) => (
            <DimensionCard key={dim.id} dimension={dim} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function DimensionCard({ dimension }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = dimension.score >= 80 ? 'text-emerald-400' : dimension.score >= 70 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <span className="text-white/80 text-sm font-medium">{dimension.label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                dimension.score >= 80 ? 'bg-emerald-400' : dimension.score >= 70 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${dimension.score}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${scoreColor} w-8 text-right`}>{dimension.score}</span>
          {expanded ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
          {/* Observed Behaviors */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5">Observed Behaviors</p>
            <ul className="space-y-1">
              {dimension.observedBehaviors.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                  <Activity size={11} className="text-blue-400 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Supporting Evidence */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5">Supporting Evidence</p>
            <ul className="space-y-1">
              {dimension.evidence.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                  <CheckCircle2 size={11} className="text-indigo-400 shrink-0 mt-0.5" />
                  <code className="font-mono">{e}</code>
                </li>
              ))}
            </ul>
          </div>

          {/* Positive Indicators */}
          {dimension.positiveIndicators.length > 0 && (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5">Positive Indicators</p>
              <ul className="space-y-1">
                {dimension.positiveIndicators.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-emerald-400/80">
                    <CheckCircle2 size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Opportunities */}
          {dimension.improvementOpportunities.length > 0 && (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5">Improvement Opportunities</p>
              <ul className="space-y-1">
                {dimension.improvementOpportunities.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
                    <AlertCircle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileMetric({ metric }) {
  const trend = TREND_ICONS[metric.trend];
  const TrendIcon = trend.icon;
  const scoreColor = metric.score >= 80 ? 'text-emerald-400' : metric.score >= 70 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/60 text-xs font-medium leading-tight">{metric.label}</span>
        <TrendIcon size={12} className={trend.color} />
      </div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className={`text-xl font-bold ${scoreColor}`}>{metric.score}</span>
        <span className="text-white/20 text-xs">/100</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${metric.score >= 80 ? 'bg-emerald-400' : metric.score >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
          style={{ width: `${metric.score}%` }}
        />
      </div>
    </div>
  );
}

export default function EELMDashboard() {
  const eelm = useMemo(() => computeEELM(), []);
  const overallColor = eelm.overallScore >= 80 ? 'text-emerald-400' : eelm.overallScore >= 70 ? 'text-amber-400' : 'text-red-400';
  const overallBg = eelm.overallScore >= 80 ? 'from-emerald-500/20 to-emerald-500/5' : eelm.overallScore >= 70 ? 'from-amber-500/20 to-amber-500/5' : 'from-red-500/20 to-red-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={22} className="text-amber-400" />
            <h1 className="text-2xl font-bold">Executive Emotional & Leadership Model™</h1>
          </div>
          <p className="text-white/40 text-sm">
            EELM™ v{eelm.version} · {eelm.evidenceCount} evidence points across {eelm.domains.length} domains ·
            Confidence: <span className="text-white/60">{eelm.confidence.label}</span>
          </p>
        </div>

        {/* Overall Score Hero */}
        <div className={`bg-gradient-to-br ${overallBg} border border-white/10 rounded-2xl p-8 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">EELM™ Leadership Score</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-bold ${overallColor}`}>{eelm.overallScore}</span>
                <span className="text-white/30 text-xl">/ 100</span>
              </div>
              <p className="text-white/40 text-sm mt-1">{eelm.confidence.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-white/70 text-sm font-medium">Evidence-Based</span>
              </div>
              <p className="text-white/30 text-xs">No personality tests · No self-assessments</p>
            </div>
          </div>
        </div>

        {/* Core Principle */}
        <div className="bg-indigo-500/[0.04] border border-indigo-500/15 rounded-xl p-4 mb-6">
          <p className="text-white/50 text-sm leading-relaxed">
            <span className="text-indigo-400 font-medium">Core Principle:</span> Leadership is demonstrated through consistent behavior over time.
            Never inferred from a single conversation. Never scored as personality. Every score is supported by observable evidence.
          </p>
        </div>

        {/* Executive Leadership Profile */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Executive Leadership Profile</h2>
            <span className="text-white/20 text-xs">· Evolves continuously as new evidence is collected</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {eelm.profile.map((metric) => (
              <ProfileMetric key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* Strengths & Development */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-500/[0.04] border border-emerald-500/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h3 className="text-emerald-400 font-semibold text-sm">Top Strengths</h3>
            </div>
            <div className="space-y-2">
              {eelm.topStrengths.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">{s.label}</span>
                  <span className="text-emerald-400 font-bold text-sm">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-amber-500/[0.04] border border-amber-500/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-amber-400" />
              <h3 className="text-amber-400 font-semibold text-sm">Development Areas</h3>
            </div>
            <div className="space-y-2">
              {eelm.developmentAreas.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">{s.label}</span>
                  <span className="text-amber-400 font-bold text-sm">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Intelligence Domains */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Intelligence Domains</h2>
          </div>
          <div className="space-y-3">
            {eelm.domains.map((domain, i) => (
              <DomainSection key={domain.id} domain={domain} index={i} />
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Recommended Actions</h2>
          </div>
          <div className="space-y-2">
            {eelm.recommendedActions.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  rec.priority === 'high' ? 'bg-amber-500/10' : 'bg-white/5'
                }`}>
                  <ArrowUpRight size={14} className={rec.priority === 'high' ? 'text-amber-400' : 'text-white/40'} />
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-sm">{rec.action}</p>
                  <p className="text-white/30 text-xs mt-0.5">{rec.domain} · {rec.priority} priority</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Integrations */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Platform Integration</h2>
            <span className="text-white/20 text-xs">· Every module contributes evidence to EELM™</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {eelm.integrations.map((integration) => (
              <div
                key={integration.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  integration.evidenceContributing
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                <CheckCircle2 size={12} />
                {integration.label}
                {integration.sessions && (
                  <span className="text-white/30 ml-1">({integration.sessions})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-2xl p-6 text-center">
          <Brain size={20} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
            EELM™ measures not only what you know, but how you lead, communicate, influence, and grow over time.
          </p>
          <p className="text-white/40 text-xs mt-3">
            Every leadership score is supported by explainable, evidence-based behavioral analytics.
          </p>
          <p className="text-amber-400/60 text-xs mt-2 font-medium">
            One Leadership Journey. One AI Platform. One Executive Leadership Intelligence Model™.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          EELM™ Engine v{eelm.version} · Computed {new Date(eelm.computedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}