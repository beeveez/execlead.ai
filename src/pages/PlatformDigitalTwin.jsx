import React, { useState, useMemo } from 'react';
import { computeTwinSnapshot, refreshTwin } from '@/lib/platformDigitalTwin';
import TwinSidebar from '@/components/platform-digital-twin/TwinSidebar';
import TwinDashboard from '@/components/platform-digital-twin/TwinDashboard';
import BusinessCapabilityMap from '@/components/platform-digital-twin/BusinessCapabilityMap';
import ArchitectureSimulation from '@/components/platform-digital-twin/ArchitectureSimulation';
import ImpactAnalysis from '@/components/platform-digital-twin/ImpactAnalysis';
import ValueStream from '@/components/platform-digital-twin/ValueStream';
import ExecutiveIntelligenceGraph from '@/components/platform-digital-twin/ExecutiveIntelligenceGraph';
import RiskSimulation from '@/components/platform-digital-twin/RiskSimulation';
import PlatformEvolution from '@/components/platform-digital-twin/PlatformEvolution';
import InnovationLab from '@/components/platform-digital-twin/InnovationLab';
import ArchitectureForecast from '@/components/platform-digital-twin/ArchitectureForecast';
import InvestmentAnalyzer from '@/components/platform-digital-twin/InvestmentAnalyzer';
import EvolutionReport from '@/components/platform-digital-twin/EvolutionReport';
import StrategicCopilot from '@/components/platform-digital-twin/StrategicCopilot';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function PlatformDigitalTwin() {
  const [active, setActive] = useState('dashboard');
  const [version, setVersion] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  // recompute on version change (re-render children reading the twin)
  const twin = useMemo(() => { version; return computeTwinSnapshot(); }, [version]);

  const recompute = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 400));
    refreshTwin();
    setVersion((v) => v + 1);
    setRefreshing(false);
  };

  const render = () => {
    switch (active) {
      case 'dashboard': return <TwinDashboard twin={twin} />;
      case 'capabilities': return <BusinessCapabilityMap />;
      case 'simulation': return <ArchitectureSimulation />;
      case 'impact': return <ImpactAnalysis />;
      case 'value-stream': return <ValueStream />;
      case 'graph': return <ExecutiveIntelligenceGraph />;
      case 'risk': return <RiskSimulation />;
      case 'evolution': return <PlatformEvolution />;
      case 'innovation': return <InnovationLab />;
      case 'forecast': return <ArchitectureForecast />;
      case 'investment': return <InvestmentAnalyzer />;
      case 'report': return <EvolutionReport />;
      case 'copilot': return <StrategicCopilot />;
      default: return <TwinDashboard twin={twin} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <TwinSidebar active={active} onSelect={setActive} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex justify-end mb-3">
            <button onClick={recompute} disabled={refreshing} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60">
              {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Recompute Twin
            </button>
          </div>
          <div key={version}>{render()}</div>
        </div>
      </div>
    </div>
  );
}