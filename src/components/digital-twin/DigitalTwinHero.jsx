import React from 'react';
import { Brain, Shield, Award, Dna, BookOpen, TrendingUp, Sparkles, Zap } from 'lucide-react';

const SCORE_CARDS = [
  { key: 'readiness', label: 'Executive Readiness', icon: TrendingUp, color: '#6366f1', weight: 'Readiness Score™' },
  { key: 'trust', label: 'Executive Trust', icon: Shield, color: '#a855f7', weight: 'Trust Score™' },
  { key: 'evidenceScore', label: 'Evidence Strength', icon: Award, color: '#10b981', weight: 'Evidence Score™' },
  { key: 'leadershipScore', label: 'Leadership DNA', icon: Dna, color: '#f59e0b', weight: 'Leadership Maturity' },
  { key: 'identityConfidence', label: 'Identity Confidence', icon: Sparkles, color: '#06b6d4', weight: 'Confidence™' },
  { key: 'evidenceCoverage', label: 'Evidence Coverage', icon: BookOpen, color: '#3b82f6', weight: 'Coverage Score™' },
];

function MiniScoreRing({ score, color, label, sublabel }) {
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <circle
            cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-[11px] text-white/60 mt-1.5 font-medium">{label}</span>
      {sublabel && <span className="text-[9px] text-white/30">{sublabel}</span>}
    </div>
  );
}

export default function DigitalTwinHero({ twin }) {
  const { scores, user, profile, earnedCredentials, evidence, simulations, completedLessons } = twin;

  return (
    <div className="bg-gradient-to-br from-violet-500/10 via-indigo-500/[0.03] to-transparent border border-violet-500/15 rounded-2xl p-6">
      <div className="flex items-start gap-6 flex-wrap mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center">
            <Brain size={28} className="text-violet-400" />
          </div>
          <Sparkles size={14} className="text-violet-300 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-xl font-bold text-white">{user?.full_name || 'Executive'}</h2>
          <p className="text-white/40 text-sm">{profile?.current_title || profile?.job_title || 'Executive Leader'}</p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium">
              {scores.trustLevelName}
            </span>
            <span className="text-white/30">
              {earnedCredentials.length} credentials · {evidence.length} evidence · {simulations.length} simulations · {completedLessons} lessons
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Digital Twin Status</div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-emerald-400">Live</span>
          </div>
          <span className="text-[9px] text-white/20 mt-0.5">Synced {new Date(twin.computedAt).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SCORE_CARDS.map(card => (
          <MiniScoreRing
            key={card.key}
            score={scores[card.key] || 0}
            color={card.color}
            label={card.label}
            sublabel={card.weight}
          />
        ))}
      </div>

      {scores.credentialEligible > 0 && (
        <div className="mt-4 flex items-center gap-2 text-[11px] text-white/40 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
          <Zap size={12} className="text-amber-400" />
          <span>{scores.credentialEligible} executive credentials within reach — see recommendations below.</span>
        </div>
      )}
    </div>
  );
}