import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/platform-knowledge/Sidebar';
import OverviewDashboard from '@/components/platform-knowledge/OverviewDashboard';
import PlatformCatalog from '@/components/platform-knowledge/PlatformCatalog';
import ArchitectureExplorer from '@/components/platform-knowledge/ArchitectureExplorer';
import EngineeringTimeline from '@/components/platform-knowledge/EngineeringTimeline';
import DependencyGraph from '@/components/platform-knowledge/DependencyGraph';
import AIEngineRegistry from '@/components/platform-knowledge/AIEngineRegistry';
import DatabaseExplorer from '@/components/platform-knowledge/DatabaseExplorer';
import RoutesExplorer from '@/components/platform-knowledge/RoutesExplorer';
import ArchitectureDecisionRecords from '@/components/platform-knowledge/ArchitectureDecisionRecords';
import ReleaseHistory from '@/components/platform-knowledge/ReleaseHistory';
import FeatureSearch from '@/components/platform-knowledge/FeatureSearch';
import PlatformAnalytics from '@/components/platform-knowledge/PlatformAnalytics';
import DocumentationCenter from '@/components/platform-knowledge/DocumentationCenter';
import ExportCenter from '@/components/platform-knowledge/ExportCenter';
import PKSettings from '@/components/platform-knowledge/PKSettings';
import ModuleDetailDrawer from '@/components/platform-knowledge/ModuleDetailDrawer';
// Platform Intelligence Engine™ v2 — the AI Chief Architect
import PlatformHealth from '@/components/platform-knowledge/PlatformHealth';
import CodeIntelligence from '@/components/platform-knowledge/CodeIntelligence';
import TechnicalDebt from '@/components/platform-knowledge/TechnicalDebt';
import DuplicateIntelligence from '@/components/platform-knowledge/DuplicateIntelligence';
import CoverageCenter from '@/components/platform-knowledge/CoverageCenter';
import ArchitectureEvolution from '@/components/platform-knowledge/ArchitectureEvolution';
import ProductGenome from '@/components/platform-knowledge/ProductGenome';
import DependencyRisk from '@/components/platform-knowledge/DependencyRisk';
import AIQuality from '@/components/platform-knowledge/AIQuality';
import ImprovementCenter from '@/components/platform-knowledge/ImprovementCenter';
import SmartFounderMemory from '@/components/platform-knowledge/SmartFounderMemory';
import ExecutiveArchitectureAdvisor from '@/components/platform-knowledge/ExecutiveArchitectureAdvisor';
import { loadSnapshot, refreshIntelligence, PIE_VERSION } from '@/lib/platformIntelligenceEngine/index';
import { Boxes, RefreshCw, Loader2, Sparkles } from 'lucide-react';

export default function PlatformKnowledgeCenter() {
  const [section, setSection] = useState('overview');
  const [drawerModule, setDrawerModule] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setSnapshot(loadSnapshot()); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Continuous Intelligence — recompute the full snapshot from the live registry.
    setTimeout(() => {
      setSnapshot(refreshIntelligence());
      setRefreshing(false);
    }, 300);
  };

  const render = () => {
    const onSelect = (id) => setDrawerModule(id);
    switch (section) {
      case 'overview': return <OverviewDashboard onSelect={setSection} />;
      case 'health': return <PlatformHealth />;
      case 'code-intel': return <CodeIntelligence />;
      case 'duplicates': return <DuplicateIntelligence />;
      case 'tech-debt': return <TechnicalDebt />;
      case 'coverage': return <CoverageCenter />;
      case 'evolution': return <ArchitectureEvolution onSelectModule={onSelect} />;
      case 'genome': return <ProductGenome onSelectModule={onSelect} />;
      case 'dep-risk': return <DependencyRisk />;
      case 'ai-quality': return <AIQuality />;
      case 'improvement': return <ImprovementCenter />;
      case 'advisor': return <ExecutiveArchitectureAdvisor onSelectModule={onSelect} />;
      case 'founder-memory': return <SmartFounderMemory />;
      case 'catalog': return <PlatformCatalog onSelectModule={onSelect} />;
      case 'architecture': return <ArchitectureExplorer onSelectModule={onSelect} />;
      case 'timeline': return <EngineeringTimeline onSelectModule={onSelect} />;
      case 'dependencies': return <DependencyGraph onSelectModule={onSelect} />;
      case 'engines': return <AIEngineRegistry />;
      case 'database': return <DatabaseExplorer />;
      case 'routes': return <RoutesExplorer />;
      case 'adrs': return <ArchitectureDecisionRecords />;
      case 'releases': return <ReleaseHistory />;
      case 'search': return <FeatureSearch onSelectModule={onSelect} />;
      case 'analytics': return <PlatformAnalytics />;
      case 'docs': return <DocumentationCenter />;
      case 'export': return <ExportCenter />;
      case 'settings': return <PKSettings />;
      default: return <OverviewDashboard onSelect={setSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64 lg:min-h-screen lg:border-r border-white/5 p-3 lg:p-4 lg:sticky lg:top-0 lg:self-start">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Boxes size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">Intelligence Engine</div>
              <div className="text-[9px] text-white/30">AI Chief Architect · v{PIE_VERSION}</div>
            </div>
          </div>
          <Sidebar active={section} onSelect={setSection} />
        </aside>
        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          {/* Continuous Intelligence control */}
          <div className="flex items-center justify-between mb-4 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-[11px] text-white/50">
                {snapshot ? `Continuous intelligence · ${snapshot.counts.modules} modules · ${snapshot.counts.debtItems} debt items · ${snapshot.counts.duplicates} duplicates · computed ${snapshot.computedAt}` : 'Computing...'}
              </span>
            </div>
            <button onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-white/60 hover:text-white transition-colors disabled:opacity-40">
              {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Recompute
            </button>
          </div>
          {render()}
        </main>
      </div>
      <ModuleDetailDrawer moduleId={drawerModule} onClose={() => setDrawerModule(null)} onSelectModule={(id) => setDrawerModule(id)} />
    </div>
  );
}