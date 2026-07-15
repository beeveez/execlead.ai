import React from 'react';
import { Brain, Shield, Sparkles, Award, TrendingUp, Zap, Clock, ChevronRight } from 'lucide-react';

/**
 * Executive Snapshot™ — Instant lightweight view built from
 * pre-calculated platform metrics. No AI generation, no heavy
 * computation. Loads in a single tick from 3 minimal queries.
 */
function SnapshotRing({ score, label, color, icon: Icon }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <span className="text-lg font-bold text-white mt-1">{score}</span>
      <span className="text-[9px] text-white/40">{label}</span>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
      <Icon size={11} style={{ color }} />
      <span className="text-[10px] text-white/40">{label}</span>
      <span className="text-[11px] font-bold text-white">{value}</span>
    </div>
  );
}

export default function ExecutiveSnapshot({
  snapshot,
  user,
  cachedAt,
  hasCachedTwin,
  onGenerate,
  generating,
}) {
  const { trustScore, trustLevel, trustLevelName, identityConfidence, evidenceCount, credentialCount } = snapshot;

  return (
    <div className="space-y-4">
      {/* Snapshot Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/[0.03] to-transparent border border-indigo-500/15 rounded-2xl p-6">
        <div className="flex items-start gap-4 flex-wrap mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Brain size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest mb-0.5">
              <Zap size={9} className="text-emerald-400" />
              Instant Snapshot
            </div>
            <h2 className="text-xl font-bold text-white">{user?.full_name || 'Executive'}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium">
                {trustLevelName || `Trust Level ${trustLevel}`}
              </span>
              <span className="text-[10px] text-white/30">
                {evidenceCount} evidence · {credentialCount} credentials
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[9px] text-white/30 uppercase tracking-wider">Snapshot Status</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">Live</span>
            </div>
            {cachedAt && (
              <span className="text-[8px] text-white/20 mt-0.5">
                {new Date(cachedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Pre-calculated scores from IdentityVerification */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <SnapshotRing score={trustScore} label="Trust Score" color="#a855f7" icon={Shield} />
          <SnapshotRing score={identityConfidence} label="Confidence" color="#06b6d4" icon={Sparkles} />
          <SnapshotRing
            score={Math.min(100, Math.round(trustScore * 0.4 + identityConfidence * 0.4 + Math.min(credentialCount * 5, 20)))}
            label="Readiness Est."
            color="#6366f1"
            icon={TrendingUp}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <StatPill icon={Shield} label="Trust Lvl" value={trustLevel} color="#a855f7" />
          <StatPill icon={Award} label="Credentials" value={credentialCount} color="#10b981" />
          <StatPill icon={Sparkles} label="Evidence" value={evidenceCount} color="#f59e0b" />
          <StatPill icon={TrendingUp} label="Confidence" value={`${identityConfidence}%`} color="#06b6d4" />
        </div>
      </div>

      {/* Generate / Refresh CTA */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Brain size={18} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">
              {hasCachedTwin ? 'Executive Digital Twin™ Ready' : 'Generate Executive Digital Twin™'}
            </h3>
            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
              {hasCachedTwin
                ? 'A cached full analysis is available. Refresh to rebuild with the latest data — runs asynchronously in the background.'
                : 'Run the full AI analysis to unlock leadership forecast, career trajectory, twin intelligence, and prioritized recommendations. Runs asynchronously — this page stays fully usable.'}
            </p>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl py-2.5 px-4 transition-all"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Executive Digital Twin™...
            </>
          ) : (
            <>
              <Brain size={15} />
              {hasCachedTwin ? 'Refresh Executive Digital Twin™' : 'Generate Executive Digital Twin™'}
              <ChevronRight size={14} />
            </>
          )}
        </button>

        {generating && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
            <Clock size={10} className="text-indigo-400 animate-pulse" />
            Fetching 12 data sources, computing scores, forecasting growth, analyzing intelligence — you can continue using the page while this runs.
          </div>
        )}
      </div>
    </div>
  );
}