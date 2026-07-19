import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  getReadinessSnapshot, getReadinessAnalytics, checkAndLogReadinessChanges,
  logReadinessEvent, RELATED_METRICS,
} from '@/lib/rolloutReadinessEngine';
import {
  Shield, TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle2,
  ChevronRight, Sparkles, RefreshCw, ArrowRight, Lightbulb, Wrench,
  Clock, Activity, Cpu, Database, Zap,
} from 'lucide-react';

const STATE_STYLES = {
  ready: { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
  nearly_ready: { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', bar: 'bg-amber-500' },
  blocked: { text: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20', bar: 'bg-orange-500' },
  critical: { text: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', bar: 'bg-red-500' },
};

function ScoreRing({ score, state }) {
  const style = STATE_STYLES[state.id] || STATE_STYLES.critical;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
        <circle
          cx="64" cy="64" r={radius}
          stroke="currentColor" strokeWidth="8" fill="none"
          className={style.text}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="text-center">
        <div className={`text-3xl font-bold ${style.text}`}>{score}</div>
        <div className="text-white/20 text-xs">/ 100</div>
      </div>
    </div>
  );
}

function SignalRow({ signal }) {
  const statusIcon = signal.status === 'met'
    ? <CheckCircle2 size={12} className="text-emerald-400" />
    : signal.status === 'warning'
      ? <AlertTriangle size={12} className="text-amber-400" />
      : <AlertTriangle size={12} className="text-red-400" />;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="text-white/70 text-sm font-medium">{signal.name}</span>
        </div>
        <span className="text-white/30 text-[10px] font-mono">{signal.weight}% weight</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-white/30">Current: </span>
          <span className={signal.status === 'met' ? 'text-emerald-400' : 'text-amber-400'}>{signal.displayValue}</span>
        </div>
        <div>
          <span className="text-white/30">Target: </span>
          <span className="text-white/50">{signal.targetValue}</span>
        </div>
        <div>
          <span className="text-white/30">Contribution: </span>
          <span className="text-white/60">{signal.contribution}/{signal.weight}</span>
        </div>
      </div>
      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            signal.status === 'met' ? 'bg-emerald-500' : signal.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${signal.ratio}%` }}
        />
      </div>
      <p className="text-white/30 text-[10px] mt-1.5 italic">{signal.evidence}</p>
    </div>
  );
}

function RecommendationCard({ rec }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-white/70 text-sm font-medium">{rec.action}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          rec.priority === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
        }`}>
          {rec.priority}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span>Owner: {rec.owner}</span>
        <span>· Effort: {rec.effort}</span>
        <span className="text-emerald-400 font-medium">{rec.expectedImprovement}</span>
      </div>
      {rec.dependencies.length > 0 && (
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-white/30 text-[10px]">Dependencies:</span>
          {rec.dependencies.map((dep, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">{dep}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RolloutReadinessPanel() {
  const [snapshot, setSnapshot] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const prevRef = useRef(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const snap = await getReadinessSnapshot(base44);
      setSnapshot(snap);

      // Log changes to Platform Activity Center
      await checkAndLogReadinessChanges(snap, prevRef.current);
      prevRef.current = snap;

      // Load analytics
      const an = await getReadinessAnalytics(base44);
      setAnalytics(an);
    } catch {
      // graceful
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !snapshot) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Rollout Readiness Score™</h2>
        </div>
        <div className="h-40 flex items-center justify-center">
          <RefreshCw size={20} className="text-white/20 animate-spin" />
        </div>
      </div>
    );
  }

  const { readiness, currentPhase, nextPhase, gate, recommendations, insight } = snapshot;
  const style = STATE_STYLES[readiness.state.id] || STATE_STYLES.critical;

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <div className={`${style.bg} ${style.border} border rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className={style.text} />
            <h2 className="text-sm font-semibold text-white">Rollout Readiness Score™</h2>
          </div>
          <button onClick={load} disabled={refreshing} className="text-white/30 hover:text-white/60 transition-colors">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Score Ring */}
          <div className="flex flex-col items-center">
            <ScoreRing score={readiness.score} state={readiness.state} />
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} ${style.border} border`}>
              {readiness.state.label}
            </div>
            <div className="text-white/30 text-xs mt-1">Confidence: {readiness.confidence}</div>
          </div>

          {/* Status Grid */}
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <span className="text-white/30 block mb-0.5">Current Phase</span>
                <span className="text-white/70 font-medium">{currentPhase.shortName}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <span className="text-white/30 block mb-0.5">Next Phase</span>
                <span className="text-white/70 font-medium">{nextPhase?.shortName || '—'}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <span className="text-white/30 block mb-0.5">Blocking Issues</span>
                <span className={gate.blockers.length > 0 ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {gate.blockers.length > 0 ? `${gate.blockers.length} blocking` : 'None'}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <span className="text-white/30 block mb-0.5">Estimated Expansion</span>
                <span className={snapshot.canExpand ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {snapshot.projectedExpansion}
                </span>
              </div>
            </div>

            {/* Invitation Capacity */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-white/30 text-[10px] mb-0.5">Members Invited</div>
                <div className="text-white/70 font-bold text-lg">{snapshot.slotsUsed}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-white/30 text-[10px] mb-0.5">Members Active</div>
                <div className="text-white/70 font-bold text-lg">{snapshot.metrics.activeMembers}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-white/30 text-[10px] mb-0.5">Remaining</div>
                <div className="text-amber-400 font-bold text-lg">{snapshot.slotsRemaining ?? '∞'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-indigo-500/[0.03] border border-indigo-500/15 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">AI Insight™</h3>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">{insight}</p>
      </div>

      {/* Score Breakdown / Explainability */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Score Breakdown — Explainability</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {readiness.signals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Recommended Actions</h3>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Historical Analytics */}
      {analytics && analytics.totalEvents > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Historical Analytics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] mb-0.5">Highest Score</div>
              <div className="text-emerald-400 font-bold">{analytics.highest}/100</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] mb-0.5">Lowest Score</div>
              <div className="text-red-400 font-bold">{analytics.lowest}/100</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] mb-0.5">Average Score</div>
              <div className="text-white/60 font-bold">{analytics.average}/100</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] mb-0.5">Total Readings</div>
              <div className="text-white/60 font-bold">{analytics.totalEvents}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] mb-0.5">Time Ready</div>
              <div className="text-emerald-400 font-medium">{analytics.timeReady}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] mb-0.5">Time Blocked</div>
              <div className="text-red-400 font-medium">{analytics.timeBlocked}</div>
            </div>
          </div>
        </div>
      )}

      {/* Related Metrics */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight size={16} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Related Metrics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {RELATED_METRICS.map((m) => (
            <Link
              key={m.id}
              to={m.path}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
            >
              {m.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}