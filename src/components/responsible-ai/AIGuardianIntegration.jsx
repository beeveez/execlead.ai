import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Brain } from 'lucide-react';

export default function AIGuardianIntegration({ guardian, releaseIntegrity }) {
  const { issues, pillarsMonitored, aiCapabilitiesMonitored } = guardian;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Guardian™ AI Integration</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Pillars Monitored" value={pillarsMonitored} color="#6366f1" />
        <MetricCard label="AI Capabilities" value={aiCapabilitiesMonitored} color="#06b6d4" />
        <MetricCard label="Open Issues" value={issues.length} color={issues.length > 0 ? '#f59e0b' : '#10b981'} />
        <MetricCard label="Release Gates" value={`${releaseIntegrity.passedGates}/${releaseIntegrity.totalGates}`} color={releaseIntegrity.blocked ? '#ef4444' : '#10b981'} />
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Guardian™ Monitors</h4>
        {[
          { label: 'Uncertified AI', passed: true },
          { label: 'Missing Explainability', passed: true },
          { label: 'Missing Confidence Display', passed: true },
          { label: 'Prompt Injection Detection', passed: true },
          { label: 'Bias Findings', passed: true },
          { label: 'Security Findings', passed: true },
          { label: 'Privacy Violations', passed: true },
          { label: 'AI Drift Detection', passed: true },
          { label: 'Model Drift Detection', passed: true },
          { label: 'Policy Violations', passed: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
            {item.passed ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
            <span className="text-[11px] text-white/70">{item.label}</span>
          </div>
        ))}
      </div>

      {issues.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Active Issues ({issues.length})</h4>
          {issues.map((issue, i) => {
            const Icon = issue.severity === 'critical' ? XCircle : AlertTriangle;
            const color = issue.severity === 'critical' ? '#ef4444' : '#f59e0b';
            return (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs font-medium text-white">{issue.title}</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ml-auto" style={{ background: `${color}20`, color }}>{issue.severity}</span>
                </div>
                <p className="text-[11px] text-white/50 ml-5">{issue.description}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-300">All AI governance pillars passing — no Guardian™ issues.</span>
        </div>
      )}

      <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={12} className="text-indigo-400" />
          <span className="text-[11px] font-medium text-indigo-300">AI Response Audit™</span>
        </div>
        <p className="text-[11px] text-white/50">Every AI interaction is logged with timestamp, user, workspace, persona, capability, model, confidence, risk level, and Guardian™ status. No sensitive prompts stored unless required by platform policy.</p>
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