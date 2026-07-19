import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Award, Rocket, TrendingUp, AlertTriangle, AlertCircle,
  CheckCircle2, XCircle, ChevronDown, Lock, Zap, Crown, Target,
  BarChart3, Eye, Sparkles, ArrowRight, FileCheck,
} from 'lucide-react';
import { computeCertification } from '@/lib/betaExperienceCertificationEngine';
import { base44 } from '@/api/base44Client';

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'PASS' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'WARNING' },
  fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'FAIL' },
};

const SCORE_ICONS = {
  trust: ShieldCheck,
  ux: Sparkles,
  performance: Zap,
  accessibility: Eye,
  content: FileCheck,
  conversion: Target,
  enterprise: BarChart3,
  commercial: TrendingUp,
};

function DomainCard({ domain, index }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[domain.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`border ${status.border} ${status.bg} rounded-xl overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`w-10 h-10 rounded-lg ${status.bg} ${status.border} border flex items-center justify-center shrink-0`}>
          <StatusIcon size={18} className={status.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-medium text-sm">{domain.label}</span>
            <span className={`text-[10px] font-bold uppercase ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-white/40 text-xs leading-snug truncate">{domain.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xl font-bold ${status.color}`}>{domain.score}</span>
          <span className="text-white/20 text-xs">/100</span>
        </div>
        <ChevronDown size={16} className={`text-white/30 transition-transform ${expanded ? 'rotate-180' : ''} shrink-0`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          <div className="space-y-2 mt-3">
            {domain.checks.map((check) => (
              <div key={check.id} className="flex items-start gap-2 text-xs">
                {check.passed ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={check.passed ? 'text-white/60' : 'text-white/80'}>{check.label}</span>
                  {check.detail && <p className="text-white/30 mt-0.5">{check.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ScoreTile({ label, score, icon: Icon }) {
  const color = score >= 95 ? 'text-emerald-400' : score >= 85 ? 'text-amber-400' : 'text-red-400';
  const bg = score >= 95 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 85 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className={`border ${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={14} className={color} />
        <span className="text-white/40 text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-white/20 text-sm">/100</span>
      </div>
    </div>
  );
}

export default function BetaExperienceCertification() {
  const certification = useMemo(() => computeCertification(), []);
  const [logging, setLogging] = useState(false);

  const handleLog = async () => {
    setLogging(true);
    try {
      await base44.entities.PlatformActivity.create({
        activity_id: `beta_certification_${Date.now()}`,
        category: 'platform',
        action: 'Private Beta Experience Certification™ generated',
        severity: certification.certified ? 'success' : 'warning',
        status: 'completed',
        module: 'developer',
        feature: 'beta_experience_certification',
        metadata_json: JSON.stringify({
          overallScore: certification.overallScore,
          certified: certification.certified,
          grade: certification.grade,
        }),
      }).catch(() => {});
    } finally {
      setTimeout(() => setLogging(false), 500);
    }
  };

  const overallColor = certification.certified ? 'text-emerald-400' : 'text-amber-400';
  const overallBg = certification.certified
    ? 'from-emerald-500/20 to-emerald-500/5'
    : 'from-amber-500/20 to-amber-500/5';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={22} className="text-amber-400" />
              <h1 className="text-2xl font-bold">Private Beta Experience Certification™</h1>
            </div>
            <p className="text-white/40 text-sm">
              Release Readiness Gate v1.0 · {certification.totalChecks} checks across {certification.domains.length} domains ·
              {certification.passedChecks} passed · {certification.totalChecks - certification.passedChecks} need attention
            </p>
          </div>
          <button
            onClick={handleLog}
            disabled={logging}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 font-medium transition-colors disabled:opacity-50"
          >
            <FileCheck size={14} className={logging ? 'animate-spin' : ''} />
            Log Certification
          </button>
        </div>

        {/* Certification Hero */}
        <div className={`bg-gradient-to-br ${overallBg} border border-white/10 rounded-2xl p-8 mb-6`}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Overall Experience Score</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-bold ${overallColor}`}>{certification.overallScore}</span>
                <span className="text-white/30 text-2xl">/ 100</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                  certification.certified
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                }`}>
                  Grade {certification.grade}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {certification.certified ? (
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <Award size={24} className="text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-bold text-lg">CERTIFIED</p>
                    <p className="text-white/40 text-xs">Platform eligible for next cohort</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Lock size={24} className="text-amber-400" />
                  <div>
                    <p className="text-amber-400 font-bold text-lg">NOT CERTIFIED</p>
                    <p className="text-white/40 text-xs">Score {certification.overallScore}/{certification.threshold} required · Expansion blocked</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Score Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(certification.scores).map(([key, score]) => {
            const Icon = SCORE_ICONS[key] || BarChart3;
            const labelMap = {
              trust: 'Trust Score',
              ux: 'UX Score',
              performance: 'Performance Score',
              accessibility: 'Accessibility Score',
              content: 'Content Score',
              conversion: 'Conversion Score',
              enterprise: 'Enterprise Score',
              commercial: 'Commercial Readiness',
            };
            return <ScoreTile key={key} label={labelMap[key] || key} score={score} icon={Icon} />;
          })}
        </div>

        {/* Founding Member Release Policy */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Founding Member Release Policy</h2>
            <span className="text-white/20 text-xs">· Expansion is earned through quality, not invitation count</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {certification.releasePolicy.stages.map((stage, i) => (
              <React.Fragment key={stage.stage}>
                <div className={`flex-shrink-0 px-4 py-3 rounded-xl border text-center min-w-[140px] ${
                  stage.current
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : stage.certified
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-white/[0.02] border-white/5'
                }`}>
                  <p className={`text-sm font-bold ${stage.current ? 'text-amber-400' : 'text-white/60'}`}>{stage.stage}</p>
                  <p className="text-white/30 text-[10px] mt-1">{stage.range}</p>
                  {stage.current && <p className="text-amber-400 text-[10px] mt-1 font-medium">CURRENT</p>}
                </div>
                {i < certification.releasePolicy.stages.length - 1 && (
                  <ArrowRight size={14} className="text-white/20 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Domain Cards */}
        <div className="mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Certification Domains</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {certification.domains.map((domain, i) => (
              <DomainCard key={domain.id} domain={domain} index={i} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {certification.recommendations.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-amber-400" />
              <h2 className="text-white font-semibold text-sm">Recommended Actions ({certification.recommendations.length})</h2>
            </div>
            <div className="space-y-2">
              {certification.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    rec.impact === 'blocking' ? 'bg-red-500/10' : 'bg-amber-500/10'
                  }`}>
                    {rec.impact === 'blocking'
                      ? <XCircle size={14} className="text-red-400" />
                      : <AlertTriangle size={14} className="text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white/80 text-sm font-medium">{rec.domain}</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        rec.impact === 'blocking' ? 'text-red-400' : 'text-amber-400'
                      }`}>{rec.impact}</span>
                    </div>
                    <p className="text-white/50 text-xs">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certification Principle */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-white/5 rounded-2xl p-6 text-center">
          <Rocket size={20} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">
            EXECLEAD.AI is not competing by having the most features.
            It competes by delivering the most trusted executive leadership experience.
          </p>
          <p className="text-white/40 text-xs mt-3">
            Build trust first. Build quality second. Scale with confidence.
          </p>
          <p className="text-amber-400/60 text-xs mt-2 font-medium">
            One Leadership Journey. One AI Platform. One Private Beta Experience Certification™.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          Certification Engine™ v{certification.version} · Computed {new Date(certification.computedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}