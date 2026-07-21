import React, { useState, useMemo } from 'react';
import { Brain, LayoutGrid, ShieldCheck, Scale, Lock, Eye, Award, ShieldAlert, History, Cpu, Settings, Download } from 'lucide-react';
import { getResponsibleAISnapshot } from '@/lib/responsibleAIEngine';
import ResponsibleAIHero from '@/components/responsible-ai/ResponsibleAIHero';
import AIPillarGrid from '@/components/responsible-ai/AIPillarGrid';
import AIInventoryTable from '@/components/responsible-ai/AIInventoryTable';
import AICertificationPanel from '@/components/responsible-ai/AICertificationPanel';
import AIGuardianIntegration from '@/components/responsible-ai/AIGuardianIntegration';
import AIFairnessDashboard from '@/components/responsible-ai/AIFairnessDashboard';
import AIPrivacyPanel from '@/components/responsible-ai/AIPrivacyPanel';
import AIQualityPanel from '@/components/responsible-ai/AIQualityPanel';
import AITransparencyPanel from '@/components/responsible-ai/AITransparencyPanel';
import AIGovernanceTimeline from '@/components/responsible-ai/AIGovernanceTimeline';
import AIModelRegistryPanel from '@/components/responsible-ai/AIModelRegistryPanel';
import AIPolicyCenterPanel from '@/components/responsible-ai/AIPolicyCenterPanel';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'inventory', label: 'AI Inventory', icon: Brain },
  { id: 'transparency', label: 'Transparency', icon: Eye },
  { id: 'fairness', label: 'Fairness', icon: Scale },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'quality', label: 'Quality', icon: ShieldCheck },
  { id: 'certification', label: 'Certification', icon: Award },
  { id: 'guardian', label: 'Guardian™', icon: ShieldAlert },
  { id: 'models', label: 'Model Registry', icon: Cpu },
  { id: 'policy', label: 'Policy Center', icon: Settings },
  { id: 'audit', label: 'Audit History', icon: History },
];

export default function ResponsibleAIDashboard() {
  const [tab, setTab] = useState('overview');
  const snapshot = useMemo(() => getResponsibleAISnapshot(), []);

  function handleExport() {
    const data = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responsible-ai-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Brain size={12} className="text-indigo-400" /> Responsible AI Framework™ · v1.0
          </div>
          <h1 className="text-2xl font-bold text-white">Enterprise AI Governance & Trust</h1>
          <p className="text-white/40 text-sm mt-1">Transparent · Explainable · Privacy-preserving · Fair · Governed · Auditable</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors border border-white/10">
          <Download size={14} /> Export Report
        </button>
      </div>

      <ResponsibleAIHero snapshot={snapshot} />

      <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab === tb.id ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-white/40 hover:text-white/70'}`}>
            <tb.icon size={14} /> {tb.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <AIPillarGrid pillars={snapshot.pillars} onPillarClick={() => {}} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AICertificationPanel certification={snapshot.certification} />
            <AIGuardianIntegration guardian={snapshot.guardian} releaseIntegrity={snapshot.releaseIntegrity} />
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <AIInventoryTable inventory={snapshot.inventory} inventoryStats={snapshot.inventoryStats} />
      )}

      {tab === 'transparency' && (
        <AITransparencyPanel transparency={snapshot.pillarResults.transparency} confidenceLevels={snapshot.confidenceLevels} confidenceFactors={snapshot.confidenceFactors} />
      )}

      {tab === 'fairness' && (
        <AIFairnessDashboard fairness={snapshot.pillarResults.fairness} dimensions={snapshot.fairnessDimensions} />
      )}

      {tab === 'privacy' && (
        <AIPrivacyPanel privacy={snapshot.pillarResults.privacy} />
      )}

      {tab === 'quality' && (
        <AIQualityPanel quality={snapshot.aiQuality} improvement={snapshot.pillarResults.continuous_improvement} />
      )}

      {tab === 'certification' && (
        <div className="space-y-4">
          <AICertificationPanel certification={snapshot.certification} />
          <AIQualityPanel quality={snapshot.aiQuality} improvement={snapshot.pillarResults.continuous_improvement} />
        </div>
      )}

      {tab === 'guardian' && (
        <AIGuardianIntegration guardian={snapshot.guardian} releaseIntegrity={snapshot.releaseIntegrity} />
      )}

      {tab === 'models' && (
        <AIModelRegistryPanel modelRegistry={snapshot.modelRegistry} />
      )}

      {tab === 'policy' && (
        <AIPolicyCenterPanel policyCenter={snapshot.policyCenter} />
      )}

      {tab === 'audit' && (
        <AIGovernanceTimeline timeline={snapshot.timeline} />
      )}
    </div>
  );
}