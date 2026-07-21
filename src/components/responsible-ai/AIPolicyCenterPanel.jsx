import React from 'react';
import { Settings, CheckCircle2, Database } from 'lucide-react';

export default function AIPolicyCenterPanel({ policyCenter }) {
  const { policyCategories, subscriptionPolicies, workspacePolicies, riskThresholds, confidenceThreshold, biasThreshold, retentionPolicy, transparencyRules, reviewSchedules, optimizationRules, cacheCheckSteps } = policyCenter;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">AI Policy Center™</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <h4 className="text-[11px] font-medium text-white/60 uppercase tracking-wider mb-2">Policy Categories ({policyCategories.length})</h4>
          <div className="flex flex-wrap gap-1">
            {policyCategories.map((cat) => (
              <span key={cat} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 capitalize">{cat}</span>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <h4 className="text-[11px] font-medium text-white/60 uppercase tracking-wider mb-2">Subscription Tiers</h4>
          <div className="flex flex-wrap gap-1">
            {subscriptionPolicies.map((sub) => (
              <span key={sub} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 capitalize">{sub}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Thresholds & Rules</h4>
        <ThresholdRow label="Risk Thresholds" value={`Low ≤${riskThresholds.low} · Mod ≤${riskThresholds.moderate} · High ≤${riskThresholds.high} · Crit ≤${riskThresholds.critical}`} />
        <ThresholdRow label="Confidence Thresholds" value={`Very High ≥${confidenceThreshold.very_high} · High ≥${confidenceThreshold.high} · Med ≥${confidenceThreshold.medium} · Low ≥${confidenceThreshold.low}`} />
        <ThresholdRow label="Bias Threshold" value={`${biasThreshold}% variance triggers investigation`} />
        <ThresholdRow label="Retention Policy" value={retentionPolicy} />
        <ThresholdRow label="Transparency Rules" value={transparencyRules} />
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Review Schedules by Risk Level</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.values(reviewSchedules).map((risk) => (
            <div key={risk.label} className="p-2 rounded-lg text-center" style={{ background: `${risk.color}10`, border: `1px solid ${risk.color}20` }}>
              <div className="text-[10px] font-bold" style={{ color: risk.color }}>{risk.label}</div>
              <div className="text-[9px] text-white/40 mt-0.5">{risk.reviewFrequency}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThresholdRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
      <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
      <div>
        <span className="text-[11px] font-medium text-white/70">{label}:</span>
        <span className="text-[11px] text-white/50 ml-1">{value}</span>
      </div>
    </div>
  );
}