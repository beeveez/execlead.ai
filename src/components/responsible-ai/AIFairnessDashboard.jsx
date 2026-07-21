import React from 'react';
import { Scale, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AIFairnessDashboard({ fairness, dimensions }) {
  const { score, fairnessScore, biasFindings, openInvestigations, resolvedFindings, controls } = fairness;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Scale size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Fairness & Bias Monitoring™</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Fairness Score™" value={`${fairnessScore}%`} color={fairnessScore >= 90 ? '#10b981' : '#f59e0b'} />
        <MetricCard label="Bias Findings" value={biasFindings} color={biasFindings > 0 ? '#ef4444' : '#10b981'} />
        <MetricCard label="Open Investigations" value={openInvestigations} color={openInvestigations > 0 ? '#f59e0b' : '#10b981'} />
        <MetricCard label="Resolved" value={resolvedFindings} color="#10b981" />
      </div>

      <div className="space-y-1.5 mb-4">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Fairness Dimensions</h4>
        {dimensions.map((dim) => (
          <div key={dim.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span className="text-xs text-white/70 flex-1">{dim.label}</span>
            <span className="text-[10px] text-white/30">{dim.description}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Detection Systems</h4>
        {controls.map((control) => (
          <div key={control.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
            {control.passed ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
            <span className="text-[11px] text-white/70">{control.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
        <div className="flex items-center gap-2">
          <TrendingDown size={12} className="text-emerald-400" />
          <span className="text-[11px] text-emerald-300">No recommendation drift detected in the last 30 days</span>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}