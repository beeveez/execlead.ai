import React, { useState, useMemo } from 'react';
import { Shield, Wrench, AlertTriangle, CheckCircle2, XCircle, FileText, Loader2, Zap, ArrowRight, Layers } from 'lucide-react';
import { getAllBlockers, getBlockerStats, generateAllPatches, canApplyAll, generatePatch } from '@/lib/remediationEngine';
import BlockingDomainDrawer from './BlockingDomainDrawer';
import BulkRemediationToolbar from './BulkRemediationToolbar';
import DependencyGraphView from './DependencyGraphView';
import ExecutiveRemediationReport from './ExecutiveRemediationReport';

export default function RemediationCenter() {
  const blockers = useMemo(() => getAllBlockers(), []);
  const stats = useMemo(() => getBlockerStats(), []);
  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [patches, setPatches] = useState({});
  const [showGraph, setShowGraph] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const allPatches = Object.values(patches);
  const canBulkApply = canApplyAll(allPatches);

  const handleGenerate = (blocker) => {
    const patch = generatePatch(blocker);
    setPatches((prev) => ({ ...prev, [blocker.ruleId]: { ...patch, blockerWeight: blocker.weight } }));
  };

  const handleBulkGenerate = () => {
    setBulkGenerating(true);
    setTimeout(() => {
      const generated = generateAllPatches(blockers);
      const map = {};
      generated.forEach((p, i) => { map[blockers[i].ruleId] = { ...p, blockerWeight: blockers[i].weight }; });
      setPatches(map);
      setBulkGenerating(false);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Header stats={stats} onBulkGenerate={handleBulkGenerate} bulkGenerating={bulkGenerating}
        onShowGraph={() => setShowGraph(true)} onShowReport={() => setShowReport(true)} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStat icon={AlertTriangle} label="Total Blockers" value={stats.total} color="#ef4444" />
        <KpiStat icon={XCircle} label="Critical" value={stats.critical} color="#dc2626" />
        <KpiStat icon={Zap} label="Resolvable" value={stats.resolvable} color="#10b981" />
        <KpiStat icon={CheckCircle2} label="Patches Generated" value={allPatches.length} color="#6366f1" />
      </div>

      {allPatches.length > 0 && (
        <BulkRemediationToolbar patches={allPatches} canApply={canBulkApply} onShowReport={() => setShowReport(true)} />
      )}

      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Shield size={14} className="text-emerald-400" /> Blocking Domains ({blockers.length})
        </h3>
        <div className="space-y-2">
          {blockers.map((b) => (
            <BlockerRow key={b.ruleId} blocker={b} patch={patches[b.ruleId]}
              onClick={() => setSelectedBlocker(b)} onGenerate={() => handleGenerate(b)} />
          ))}
        </div>
      </div>

      {selectedBlocker && (
        <BlockingDomainDrawer blocker={selectedBlocker} patch={patches[selectedBlocker.ruleId]}
          onClose={() => setSelectedBlocker(null)} onGenerate={() => handleGenerate(selectedBlocker)} />
      )}

      {showGraph && selectedBlocker && (
        <DependencyGraphView blocker={selectedBlocker} onClose={() => setShowGraph(false)} />
      )}

      {showReport && (
        <ExecutiveRemediationReport patches={allPatches} blockers={blockers} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

function Header({ stats, onBulkGenerate, bulkGenerating, onShowGraph, onShowReport }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Wrench size={12} className="text-emerald-400" /> Executive Auto-Remediation Platform™
        </div>
        <h1 className="text-2xl font-bold text-white">Remediation Center</h1>
        <p className="text-white/40 text-sm mt-1">Governed lifecycle: Detect → Explain → Patch → Apply → Validate → Certify</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onShowGraph} disabled={!stats.total} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/70 text-sm transition-colors">
          <Layers size={14} /> Dependency Graph
        </button>
        <button onClick={onShowReport} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
          <FileText size={14} /> Executive Report
        </button>
        <button onClick={onBulkGenerate} disabled={bulkGenerating} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
          {bulkGenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Generate All Patches
        </button>
      </div>
    </div>
  );
}

function KpiStat({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}

function BlockerRow({ blocker, patch, onClick, onGenerate }) {
  const sevColor = blocker.severity === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : blocker.severity === 'high' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onClick} className="flex-1 text-left cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold uppercase ${sevColor}`}>{blocker.severity}</span>
            <span className="text-xs text-white/30">{blocker.domainLabel}</span>
            {patch && <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">Patch Ready</span>}
          </div>
          <div className="text-sm text-white font-medium truncate">{blocker.name}</div>
          <div className="text-xs text-white/40 truncate">{blocker.description}</div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {patch ? (
            <button onClick={onClick} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-colors">
              View Patch <ArrowRight size={12} />
            </button>
          ) : (
            <button onClick={onGenerate} disabled={!blocker.resolvable} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-30 text-emerald-300 text-xs font-medium transition-colors">
              <Zap size={12} /> Generate Patch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}