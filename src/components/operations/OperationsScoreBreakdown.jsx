import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { computeMetricScores } from '@/lib/metricIntelligenceEngine';
import InteractiveKpiCard from '@/components/shared/InteractiveKpiCard';
import { Sparkles } from 'lucide-react';

const OPS_METRICS = [
  { id: 'guardian_validation', label: 'Guardian™ Validation', icon: 'shield', color: '#10b981' },
  { id: 'platform_health', label: 'Platform Health™', icon: 'heart', color: '#6366f1' },
  { id: 'critical_incident_status', label: 'Critical Incident Status', icon: 'alert', color: '#ef4444' },
  { id: 'knowledge_synchronization', label: 'Knowledge Synchronization™', icon: 'sync', color: '#06b6d4' },
  { id: 'ai_capacity', label: 'AI Capacity', icon: 'cpu', color: '#8b5cf6' },
  { id: 'error_rate', label: 'Error Rate', icon: 'bug', color: '#f59e0b' },
  { id: 'avg_response_time', label: 'Average Response Time', icon: 'clock', color: '#3b82f6' },
  { id: 'active_user_stability', label: 'Active User Stability', icon: 'users', color: '#14b8a6' },
];

function MetricScoreCard({ label, score, color }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 w-full">
      <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1 truncate">{label}</div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-white">{Math.round(pct)}</span>
        <span className="text-xs text-white/20">/ 100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function OperationsScoreBreakdown() {
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const computed = await computeMetricScores(base44);
        if (active) setScores(computed);
      } catch { /* non-fatal */ }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-indigo-400" />
        <div>
          <h2 className="text-sm font-semibold text-white">Score Breakdown — Explainability™</h2>
          <p className="text-xs text-white/40 mt-0.5">Every score is interactive — click any card for root cause, evidence, and remediation in the Metric Intelligence Drawer™</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {OPS_METRICS.map((m) => {
            const data = scores[m.id];
            const score = data?.score ?? 0;
            return (
              <InteractiveKpiCard
                key={m.id}
                metricId={m.id}
                score={score}
                previous={data?.previous ?? null}
                label={m.label}
              >
                <MetricScoreCard label={m.label} score={score} color={m.color} />
              </InteractiveKpiCard>
            );
          })}
        </div>
      )}
    </div>
  );
}