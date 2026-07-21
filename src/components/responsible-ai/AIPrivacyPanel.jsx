import React from 'react';
import { Lock, Database, Shield, CheckCircle2 } from 'lucide-react';

export default function AIPrivacyPanel({ privacy }) {
  const { score, controls, coverage, findings } = privacy;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Privacy & Data Governance™</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <MetricCard label="Privacy Score" value={`${score}%`} color={score >= 90 ? '#10b981' : '#f59e0b'} />
        <MetricCard label="Coverage" value={`${coverage}%`} color="#6366f1" />
        <MetricCard label="Findings" value={findings.length} color={findings.length > 0 ? '#f59e0b' : '#10b981'} />
      </div>

      <div className="space-y-1.5 mb-4">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Privacy Controls</h4>
        {controls.map((control) => (
          <div key={control.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
            {control.passed ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> : <Shield size={12} className="text-amber-400 shrink-0" />}
            <span className="text-[11px] text-white/70">{control.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Database size={12} className="text-cyan-400" />
            <span className="text-[11px] font-medium text-white">Context Sources</span>
          </div>
          <div className="space-y-1 text-[10px] text-white/40">
            <div>• User Profile & Preferences</div>
            <div>• Career History & Journey</div>
            <div>• Knowledge Pack (scoped)</div>
            <div>• Organization Context (org-scoped)</div>
            <div>• Session History (encrypted)</div>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={12} className="text-indigo-400" />
            <span className="text-[11px] font-medium text-white">Data Governance</span>
          </div>
          <div className="space-y-1 text-[10px] text-white/40">
            <div>• Data minimization enforced</div>
            <div>• Sensitive data encrypted at rest</div>
            <div>• Retention: 30 days (non-sensitive)</div>
            <div>• Consent tracked per interaction</div>
            <div>• Anonymization for analytics</div>
          </div>
        </div>
      </div>

      {findings.length > 0 && (
        <div className="mt-4 space-y-2">
          {findings.map((f, i) => (
            <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <p className="text-xs font-medium text-amber-300">{f.title}</p>
              <p className="text-[11px] text-white/50 mt-0.5">{f.description}</p>
              <p className="text-[11px] text-emerald-400/60 mt-1">→ {f.remediation}</p>
            </div>
          ))}
        </div>
      )}
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