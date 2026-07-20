import React, { useState } from 'react';
import { X, Zap, FileText, GitBranch, ShieldCheck, Award, Eye, Download, Sparkles, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { generatePatchPreview, generateImpactAnalysis, generateAIExplanation, runPostPatchValidation, runAutoCertification, createRollbackSnapshot } from '@/lib/remediationEngine';
import PatchPreviewPanel from './PatchPreviewPanel';
import ImpactAnalysisPanel from './ImpactAnalysisPanel';
import PatchExecutionProgress from './PatchExecutionProgress';
import RollbackPanel from './RollbackPanel';
import RemediationActionCenter from './RemediationActionCenter';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'preview', label: 'Patch Preview', icon: FileText },
  { id: 'impact', label: 'Impact Analysis', icon: AlertTriangle },
  { id: 'actions', label: 'Action Center', icon: Zap },
  { id: 'execution', label: 'Execution', icon: Clock },
  { id: 'rollback', label: 'Rollback', icon: GitBranch },
];

export default function BlockingDomainDrawer({ blocker, patch, onClose, onGenerate }) {
  const [tab, setTab] = useState('overview');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [rollbackSnapshot, setRollbackSnapshot] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);

  const preview = patch ? generatePatchPreview(blocker, patch) : null;
  const impact = patch ? generateImpactAnalysis(blocker) : null;

  const handleGenerateAI = () => {
    setAiExplanation(generateAIExplanation(blocker, impact));
  };

  const handleExecute = () => {
    setExecuting(true);
    setExecutionResult(null);
    const snapshot = createRollbackSnapshot(blocker, patch);
    setRollbackSnapshot(snapshot);
    setTimeout(() => {
      const validation = runPostPatchValidation(blocker);
      const certification = runAutoCertification(blocker, validation);
      setExecutionResult({ validation, certification });
      setExecuting(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-[#0d0d14] border-l border-white/10 overflow-y-auto">
        <DrawerHeader blocker={blocker} patch={patch} onClose={onClose} />
        <div className="flex items-center gap-1 px-4 border-b border-white/5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'text-emerald-400 border-emerald-500' : 'text-white/40 border-transparent hover:text-white/60'}`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'overview' && <OverviewTab blocker={blocker} patch={patch} aiExplanation={aiExplanation} onGenerateAI={handleGenerateAI} onGenerate={onGenerate} />}
          {tab === 'preview' && <PatchPreviewPanel preview={preview} blocker={blocker} />}
          {tab === 'impact' && <ImpactAnalysisPanel impact={impact} blocker={blocker} />}
          {tab === 'actions' && <RemediationActionCenter blocker={blocker} patch={patch} onExecute={handleExecute} onGenerateAI={handleGenerateAI} onGenerate={onGenerate} />}
          {tab === 'execution' && <PatchExecutionProgress executing={executing} result={executionResult} blocker={blocker} />}
          {tab === 'rollback' && <RollbackPanel snapshot={rollbackSnapshot} blocker={blocker} />}
        </div>
      </div>
    </div>
  );
}

function DrawerHeader({ blocker, patch, onClose }) {
  const sevClass = blocker.severity === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : blocker.severity === 'high' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold uppercase ${sevClass}`}>{blocker.severity}</span>
          <span className="text-xs text-white/30">{blocker.domainLabel}</span>
        </div>
        <h2 className="text-lg font-bold text-white">{blocker.name}</h2>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
        <X size={18} />
      </button>
    </div>
  );
}

function OverviewTab({ blocker, patch, aiExplanation, onGenerateAI, onGenerate }) {
  const bic = blocker.businessImpactCategories || {};
  return (
    <div className="space-y-4">
      <Section title="Executive Summary" icon={Eye}>
        <p className="text-sm text-white/60">{blocker.description}</p>
        <p className="text-xs text-white/40 mt-2">Weight: {blocker.weight} | Status: {blocker.status} | Owner: {blocker.owner}</p>
      </Section>

      <Section title="Root Cause" icon={AlertTriangle}>
        <p className="text-sm text-white/60">{blocker.technicalImpact || blocker.recommendationReason || blocker.description}</p>
      </Section>

      <Section title="Business Impact" icon={ShieldCheck}>
        <ImpactGrid bic={bic} />
      </Section>

      {patch ? (
        <Section title="Recommended Fix" icon={CheckCircle2}>
          <p className="text-sm text-emerald-300">{blocker.recommendation || 'Review and resolve.'}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
            <Clock size={12} /> Estimated time: {patch.estimatedTime} | Complexity: {patch.complexity} | Risk: {patch.riskLevel}
          </div>
        </Section>
      ) : (
        <button onClick={onGenerate} disabled={!blocker.resolvable} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white text-sm font-medium transition-colors">
          <Zap size={14} /> Generate Remediation Patch
        </button>
      )}

      <Section title="AI Explanation" icon={Sparkles}>
        {aiExplanation ? (
          <div className="space-y-2 text-sm">
            <ExpRow label="Why this exists" value={aiExplanation.whyExists} />
            <ExpRow label="Why it blocks certification" value={aiExplanation.whyBlocksCertification} />
            <ExpRow label="Business impact" value={aiExplanation.businessImpact} />
            <ExpRow label="Platform impact" value={aiExplanation.platformImpact} />
            <ExpRow label="Recommended fix" value={aiExplanation.recommendedFix} />
            <ExpRow label="Expected improvement" value={aiExplanation.expectedImprovement} />
          </div>
        ) : (
          <button onClick={onGenerateAI} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm font-medium transition-colors">
            <Sparkles size={14} /> Generate AI Explanation
          </button>
        )}
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-white/40" />
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function ImpactGrid({ bic }) {
  const entries = Object.entries(bic).filter(([, v]) => v);
  if (entries.length === 0) return <p className="text-sm text-white/40">No categorized business impact data.</p>;
  return (
    <div className="grid grid-cols-1 gap-2">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-start gap-2">
          <span className="text-[10px] uppercase font-semibold text-white/40 mt-0.5 w-20 shrink-0">{key}</span>
          <span className="text-xs text-white/60">{val}</span>
        </div>
      ))}
    </div>
  );
}

function ExpRow({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-semibold text-indigo-400/60 mb-0.5">{label}</div>
      <div className="text-white/60 text-xs">{value}</div>
    </div>
  );
}