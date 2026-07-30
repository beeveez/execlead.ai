import React, { useState } from 'react';
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
import FounderMemory from '@/components/platform-knowledge/FounderMemory';
import DocumentationCenter from '@/components/platform-knowledge/DocumentationCenter';
import ExportCenter from '@/components/platform-knowledge/ExportCenter';
import PKSettings from '@/components/platform-knowledge/PKSettings';
import ModuleDetailDrawer from '@/components/platform-knowledge/ModuleDetailDrawer';
import { Boxes } from 'lucide-react';

export default function PlatformKnowledgeCenter() {
  const [section, setSection] = useState('overview');
  const [drawerModule, setDrawerModule] = useState(null);

  const render = () => {
    const onSelect = (id) => setDrawerModule(id);
    switch (section) {
      case 'overview': return <OverviewDashboard onSelect={setSection} />;
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
      case 'founder-memory': return <FounderMemory />;
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
            <div>
              <div className="text-sm font-bold text-white">Knowledge Center</div>
              <div className="text-[9px] text-white/30">Living platform encyclopedia</div>
            </div>
          </div>
          <Sidebar active={section} onSelect={setSection} />
        </aside>
        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          {render()}
        </main>
      </div>
      <ModuleDetailDrawer moduleId={drawerModule} onClose={() => setDrawerModule(null)} onSelectModule={(id) => setDrawerModule(id)} />
    </div>
  );
}