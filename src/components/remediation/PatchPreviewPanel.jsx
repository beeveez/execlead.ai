import React from 'react';
import { FileText, ArrowDown, CheckCircle2, XCircle, GitBranch, AlertTriangle, RotateCcw } from 'lucide-react';

export default function PatchPreviewPanel({ preview, blocker }) {
  if (!preview) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <FileText className="mx-auto text-white/20 mb-3" size={32} />
        <p className="text-white/40 text-sm">Generate a patch to view the Patch Preview™.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current → Proposed State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StateCard title="Current State" state={preview.currentState} isCurrent />
        <StateCard title="Proposed State" state={preview.proposedState} />
      </div>

      <div className="flex items-center justify-center -my-2">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ArrowDown className="text-emerald-400" size={14} />
        </div>
      </div>

      {/* Diff Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch size={14} className="text-white/40" />
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Diff Summary</h4>
        </div>
        <div className="space-y-3">
          <DiffList label="Files Changed" items={preview.diffSummary.filesChanged} color="text-amber-400" />
          <DiffList label="Components Changed" items={preview.diffSummary.componentsChanged} color="text-indigo-400" />
          <DiffList label="Capability Changes" items={preview.diffSummary.capabilityChanges} color="text-emerald-400" />
          <DiffList label="Dependencies Updated" items={preview.diffSummary.dependenciesUpdated} color="text-purple-400" />
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase font-semibold text-white/40">Rule Status:</span>
            <span className="text-xs font-bold text-emerald-400">{preview.diffSummary.ruleStatusChange}</span>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-white/40" />
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Risk Assessment</h4>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <RiskBadge level={preview.riskAssessment.level} />
          {preview.riskAssessment.requiresManualConfirmation && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">Manual Confirmation Required</span>
          )}
          {preview.riskAssessment.rollbackAvailable && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">Rollback Available</span>
          )}
        </div>
        <p className="text-xs text-white/50">{preview.riskAssessment.notes}</p>
      </div>

      {/* Rollback Strategy */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <RotateCcw size={14} className="text-white/40" />
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Rollback Strategy</h4>
        </div>
        <p className="text-xs text-white/50 mb-2">{preview.rollbackStrategy.description}</p>
        <div className="space-y-1">
          {preview.rollbackStrategy.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[9px] text-white/30">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StateCard({ title, state, isCurrent }) {
  const Icon = isCurrent ? XCircle : CheckCircle2;
  const color = isCurrent ? 'text-red-400' : 'text-emerald-400';
  const border = isCurrent ? 'border-red-500/10' : 'border-emerald-500/10';
  return (
    <div className={`bg-white/[0.02] border ${border} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase text-white/30">Status:</span>
        <span className={`text-xs font-bold ${color}`}>{state.status}</span>
        <span className="text-xs text-white/30">| Score: {state.score}</span>
      </div>
      <p className="text-xs text-white/50">{state.description}</p>
      {state.technicalImpact && <p className="text-[10px] text-white/30 mt-1">{state.technicalImpact}</p>}
    </div>
  );
}

function DiffList({ label, items, color }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-semibold text-white/40 mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items?.map((item, i) => (
          <span key={i} className={`text-[10px] ${color} bg-current/5 px-2 py-0.5 rounded border border-current/10`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const colors = { critical: 'text-red-400 bg-red-500/10 border-red-500/20', high: 'text-amber-400 bg-amber-500/10 border-amber-500/20', medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  return <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${colors[level] || colors.medium}`}>{level} Risk</span>;
}