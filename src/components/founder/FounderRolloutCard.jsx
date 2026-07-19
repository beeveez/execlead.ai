import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getReadinessSnapshot } from '@/lib/rolloutReadinessEngine';
import {
  Shield, Users, ChevronRight, CheckCircle2, AlertTriangle,
  Pause, ArrowRight, Rocket,
} from 'lucide-react';

const STATE_STYLES = {
  ready: { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', bar: 'bg-emerald-500', label: 'Ready to Expand' },
  nearly_ready: { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', bar: 'bg-amber-500', label: 'Nearly Ready' },
  blocked: { text: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20', bar: 'bg-orange-500', label: 'Expansion Blocked' },
  critical: { text: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', bar: 'bg-red-500', label: 'Critical' },
};

export default function FounderRolloutCard() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const snap = await getReadinessSnapshot(base44);
      setSnapshot(snap);
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !snapshot) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const { readiness, currentPhase, nextPhase, recommendations, gate } = snapshot;
  const style = STATE_STYLES[readiness.state.id] || STATE_STYLES.critical;
  const limit = currentPhase.invitationLimit;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-6`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Rocket size={16} className={style.text} />
        <h2 className="text-sm font-semibold text-white">Founding Member Rollout™</h2>
        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text} ${style.border} border`}>
          {style.label}
        </span>
      </div>

      {/* Score + Phase */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
          <div className={`text-3xl font-bold ${style.text}`}>{readiness.score}</div>
          <div className="text-white/20 text-xs">/ 100 Readiness</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
          <div className="text-sm font-bold text-white">{currentPhase.shortName}</div>
          <div className="text-white/30 text-xs mt-0.5">→ {nextPhase?.shortName || 'GA'}</div>
        </div>
      </div>

      {/* Capacity */}
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/40 flex items-center gap-1">
            <Users size={12} /> Founding Members
          </span>
          <span className="text-white/60">
            {snapshot.slotsUsed} / {limit?.max || '∞'}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${style.bar} rounded-full transition-all`}
            style={{ width: `${limit ? Math.min(100, (snapshot.slotsUsed / limit.max) * 100) : 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-white/30">Active: {snapshot.metrics.activeMembers}</span>
          <span className={style.text}>Remaining: {snapshot.slotsRemaining ?? '∞'}</span>
        </div>
      </div>

      {/* Expansion Status */}
      <div className={`rounded-lg p-3 border mb-4 ${snapshot.canExpand ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-amber-500/5 border-amber-500/15'}`}>
        <div className="flex items-center gap-2">
          {snapshot.canExpand ? (
            <><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-emerald-400 text-xs font-medium">Expansion available — platform ready for next phase</span></>
          ) : (
            <><Pause size={14} className="text-amber-400" /><span className="text-amber-400 text-xs font-medium">Expansion paused — {gate.blockers.length} blocking issue(s)</span></>
          )}
        </div>
        <div className="text-white/30 text-xs mt-1">Projected: {snapshot.projectedExpansion}</div>
      </div>

      {/* Recommended Actions */}
      {recommendations.length > 0 && (
        <div className="mb-4">
          <div className="text-white/40 text-xs font-medium mb-2">Recommended Actions</div>
          <div className="space-y-1.5">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/50">{rec.action}</span>
                <span className="text-emerald-400 font-medium">{rec.expectedImprovement}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link to Operations */}
      <Link
        to="/operations"
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
      >
        View Full Rollout Dashboard <ArrowRight size={12} />
      </Link>
    </div>
  );
}