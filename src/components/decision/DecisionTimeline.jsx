import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getDecisionTypeMeta, RISK_LEVEL_META } from '@/lib/decisionIntelligenceEngine';
import { Clock, TrendingUp, CheckCircle2, XCircle, Loader2, GitCompare, Calendar } from 'lucide-react';

export default function DecisionTimeline() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const records = await base44.entities.ExecutiveDecision.filter({}, '-created_date', 50);
      setDecisions(records || []);
    } catch (e) { /* error */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const updates = { status };
      if (status === 'accepted' || status === 'declined') {
        updates.decided_date = new Date().toISOString().split('T')[0];
      }
      if (status === 'completed') {
        updates.outcome_date = new Date().toISOString().split('T')[0];
      }
      await base44.entities.ExecutiveDecision.update(id, updates);
      await load();
    } catch (e) { /* error */ }
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-xl">
        <Clock size={32} className="text-white/10 mx-auto mb-3" />
        <p className="text-xs text-white/30">No saved decisions yet. Run a simulation and save it to start tracking your decision history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40">Track all your executive decisions over time and compare predicted vs actual outcomes.</p>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
        <div className="space-y-4">
          {decisions.map(decision => (
            <TimelineItem
              key={decision.id}
              decision={decision}
              updating={updating === decision.id}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
        <SummaryStat label="Total Decisions" value={decisions.length} icon={Clock} color="#3b82f6" />
        <SummaryStat label="Accepted" value={decisions.filter(d => d.status === 'accepted' || d.status === 'completed').length} icon={CheckCircle2} color="#10b981" />
        <SummaryStat label="Declined" value={decisions.filter(d => d.status === 'declined').length} icon={XCircle} color="#ef4444" />
        <SummaryStat label="Completed" value={decisions.filter(d => d.status === 'completed').length} icon={TrendingUp} color="#a855f7" />
      </div>
    </div>
  );
}

function TimelineItem({ decision, updating, onUpdateStatus }) {
  const [showActions, setShowActions] = useState(false);
  const typeMeta = getDecisionTypeMeta(decision.decision_type);
  const riskMeta = RISK_LEVEL_META[decision.predicted_risk_level];
  const statusColors = {
    evaluating: '#3b82f6',
    accepted: '#10b981',
    declined: '#ef4444',
    completed: '#a855f7',
    abandoned: '#64748b',
  };
  const hasActual = decision.actual_trust > 0 || decision.actual_readiness > 0;
  const accuracy = decision.prediction_accuracy || 0;

  return (
    <div className="relative pl-10">
      {/* Timeline Dot */}
      <div
        className="absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-[#0a0a0f]"
        style={{ backgroundColor: statusColors[decision.status] || '#64748b' }}
      />

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white">{decision.title}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${statusColors[decision.status]}20`, color: statusColors[decision.status] }}>
                {decision.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              <span>{typeMeta?.label}</span>
              {riskMeta && <span style={{ color: riskMeta.color }}>{riskMeta.label}</span>}
              {decision.decided_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={9} /> {new Date(decision.decided_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowActions(!showActions)}
            disabled={updating}
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
          >
            {updating ? <Loader2 size={12} className="animate-spin" /> : 'Update →'}
          </button>
        </div>

        {decision.description && (
          <p className="text-[11px] text-white/40 mb-2">{decision.description}</p>
        )}

        {/* Predicted vs Actual */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <PredictedActual label="Trust" predicted={decision.predicted_trust} actual={decision.actual_trust} hasActual={hasActual} />
          <PredictedActual label="Readiness" predicted={decision.predicted_readiness} actual={decision.actual_readiness} hasActual={hasActual} />
          <PredictedActual label="Confidence" predicted={decision.predicted_confidence} actual={null} hasActual={false} />
          {hasActual && accuracy > 0 && (
            <div className="bg-white/[0.02] rounded-lg p-2">
              <div className="text-[9px] uppercase tracking-wider text-white/30">Accuracy</div>
              <div className="text-sm font-bold" style={{ color: accuracy > 80 ? '#10b981' : accuracy > 50 ? '#f59e0b' : '#ef4444' }}>
                {accuracy}%
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
            <ActionButton label="Accept" color="#10b981" onClick={() => onUpdateStatus(decision.id, 'accepted')} />
            <ActionButton label="Decline" color="#ef4444" onClick={() => onUpdateStatus(decision.id, 'declined')} />
            <ActionButton label="Mark Completed" color="#a855f7" onClick={() => onUpdateStatus(decision.id, 'completed')} />
            <ActionButton label="Abandon" color="#64748b" onClick={() => onUpdateStatus(decision.id, 'abandoned')} />
          </div>
        )}
      </div>
    </div>
  );
}

function PredictedActual({ label, predicted, actual, hasActual }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-2">
      <div className="text-[9px] uppercase tracking-wider text-white/30">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold text-white">{predicted || 0}</span>
        {hasActual && actual !== null && (
          <span className="text-[10px] text-white/40">→ {actual}</span>
        )}
      </div>
    </div>
  );
}

function ActionButton({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {label}
    </button>
  );
}

function SummaryStat({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      </div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}