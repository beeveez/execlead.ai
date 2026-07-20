import React from 'react';
import { Zap, Sparkles, FileText, GitBranch, ShieldCheck, Award, Download, Check, AlertTriangle, Play, Loader2 } from 'lucide-react';

export default function RemediationActionCenter({ blocker, patch, onExecute, onGenerateAI, onGenerate }) {
  if (!patch) {
    return (
      <div className="space-y-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Zap className="mx-auto text-white/20 mb-3" size={32} />
          <p className="text-white/40 text-sm mb-4">Generate a remediation patch to access the Action Center.</p>
          <button onClick={onGenerate} disabled={!blocker.resolvable} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white text-sm font-medium transition-colors">
            <Zap size={14} /> Generate Patch
          </button>
        </div>
      </div>
    );
  }

  const isHighRisk = patch.riskLevel === 'high' || patch.riskLevel === 'critical';

  const actions = [
    { id: 'generate_patch', label: 'Generate Patch', icon: Zap, done: true, desc: 'Patch generated successfully' },
    { id: 'ai_explanation', label: 'AI Explanation', icon: Sparkles, onClick: onGenerateAI, desc: 'Generate deterministic explanation' },
    { id: 'view_files', label: 'View Files', icon: FileText, desc: `${patch.affectedFiles?.length || 0} files affected` },
    { id: 'view_deps', label: 'View Dependencies', icon: GitBranch, desc: `${patch.dependencies?.length || 0} dependencies` },
    { id: 'view_audit', label: 'View Audit', icon: ShieldCheck, desc: 'Audit trail available' },
    { id: 'view_cert', label: 'View Certification', icon: Award, desc: 'Auto-certification after apply' },
    { id: 'export', label: 'Export Report', icon: Download, desc: 'Download patch report' },
  ];

  return (
    <div className="space-y-4">
      {/* Patch Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Check size={14} className="text-emerald-400" />
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Patch Generated</h4>
        </div>
        <div className="space-y-1.5 text-xs">
          <SummaryRow label="Patch ID" value={patch.patchId} mono />
          <SummaryRow label="Complexity" value={patch.complexity} />
          <SummaryRow label="Risk Level" value={patch.riskLevel} />
          <SummaryRow label="Estimated Time" value={patch.estimatedTime} />
          <SummaryRow label="Rollback" value={patch.rollbackAvailable ? 'Available' : 'Not Available'} />
        </div>
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-[10px] uppercase font-semibold text-white/40 mb-1">Expected Outcome</div>
          <p className="text-xs text-white/60">{patch.expectedOutcome}</p>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.id} onClick={a.onClick} disabled={a.done && !a.onClick}
            className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 disabled:opacity-50 text-left transition-colors">
            <a.icon size={14} className={a.done ? 'text-emerald-400 mt-0.5' : 'text-white/40 mt-0.5'} />
            <div>
              <div className="text-xs text-white/70 font-medium">{a.label}</div>
              <div className="text-[10px] text-white/30">{a.desc}</div>
            </div>
            {a.done && <Check size={10} className="ml-auto text-emerald-400/50" />}
          </button>
        ))}
      </div>

      {/* Apply Patch */}
      {isHighRisk && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300">High risk — manual confirmation required before execution.</p>
        </div>
      )}
      <button onClick={onExecute} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        isHighRisk ? 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
      }`}>
        <Play size={14} /> {isHighRisk ? 'Apply Patch (Manual Confirmation)' : 'Apply Patch'}
      </button>
    </div>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase font-semibold text-white/40 w-24 shrink-0">{label}</span>
      <span className={`text-white/60 ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
    </div>
  );
}