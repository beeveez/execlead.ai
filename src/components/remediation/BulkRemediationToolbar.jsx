import React from 'react';
import { Zap, CheckCircle2, AlertTriangle, Play, FileText, Loader2 } from 'lucide-react';

export default function BulkRemediationToolbar({ patches, canApply, onShowReport }) {
  const generated = patches.length;
  const reviewed = patches.filter((p) => p.status === 'reviewed' || p.status === 'approved').length;
  const approved = patches.filter((p) => p.status === 'approved').length;
  const applied = patches.filter((p) => p.status === 'applied' || p.status === 'certified').length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={14} className="text-emerald-400" />
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Bulk Remediation</h4>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StepCard label="Generated" value={generated} total={patches.length} color="text-indigo-400" />
        <StepCard label="Reviewed" value={reviewed} total={patches.length} color="text-amber-400" />
        <StepCard label="Approved" value={approved} total={patches.length} color="text-emerald-400" />
        <StepCard label="Applied" value={applied} total={patches.length} color="text-emerald-400" />
      </div>

      {/* Can Apply All Status */}
      <div className={`rounded-lg p-3 mb-3 flex items-center gap-2 ${canApply.allowed ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-amber-500/5 border border-amber-500/10'}`}>
        {canApply.allowed ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={14} className="text-amber-400 shrink-0" />}
        <p className="text-xs text-white/60">{canApply.reason}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button disabled={!canApply.allowed} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-30 text-emerald-300 text-xs font-medium transition-colors">
          <Play size={12} /> Apply All Approved
        </button>
        <button disabled={generated === 0} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-30 text-indigo-300 text-xs font-medium transition-colors">
          <CheckCircle2 size={12} /> Review All
        </button>
        <button onClick={onShowReport} disabled={generated === 0} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/70 text-xs font-medium transition-colors ml-auto">
          <FileText size={12} /> Executive Report
        </button>
      </div>

      {/* Rules */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="text-[10px] uppercase font-semibold text-white/30 mb-2">Apply All Rules</div>
        <div className="space-y-1 text-[10px] text-white/40">
          <RuleRow label="All patches generated" passed={generated === patches.length && patches.length > 0} />
          <RuleRow label="No Critical blockers pending" passed={!patches.some((p) => p.riskLevel === 'critical' && p.status !== 'approved')} />
          <RuleRow label="No High-Risk patches awaiting approval" passed={!patches.some((p) => p.riskLevel === 'high' && p.status !== 'approved')} />
          <RuleRow label="Rollback available for all patches" passed={patches.every((p) => p.rollbackAvailable)} />
        </div>
      </div>
    </div>
  );
}

function StepCard({ label, value, total, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-[8px] text-white/20">/ {total}</div>
    </div>
  );
}

function RuleRow({ label, passed }) {
  return (
    <div className="flex items-center gap-1.5">
      {passed ? <CheckCircle2 size={8} className="text-emerald-400" /> : <AlertTriangle size={8} className="text-amber-400" />}
      <span className={passed ? 'text-white/40' : 'text-white/50'}>{label}</span>
    </div>
  );
}