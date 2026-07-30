import React from 'react';
import { Boxes, Map, FlaskConical, GitFork, TrendingUp, Network, AlertTriangle, Sparkles, Brain, LineChart, Wallet, FileText, Lightbulb } from 'lucide-react';

const SECTIONS = [
  { id: 'dashboard', label: 'Digital Twin™', icon: Boxes },
  { id: 'capabilities', label: 'Business Capability Map™', icon: Map },
  { id: 'simulation', label: 'Architecture Simulation™', icon: FlaskConical },
  { id: 'impact', label: 'Impact Analysis™', icon: GitFork },
  { id: 'value-stream', label: 'Value Stream™', icon: TrendingUp },
  { id: 'graph', label: 'Executive Intelligence Graph™', icon: Network },
  { id: 'risk', label: 'Risk Simulation™', icon: AlertTriangle },
  { id: 'evolution', label: 'Platform Evolution™', icon: Sparkles },
  { id: 'innovation', label: 'Innovation Lab™', icon: Lightbulb },
  { id: 'forecast', label: 'Architecture Forecast™', icon: LineChart },
  { id: 'investment', label: 'Platform Investment Analyzer™', icon: Wallet },
  { id: 'report', label: 'Executive Evolution Report™', icon: FileText },
  { id: 'copilot', label: 'Strategic Copilot™', icon: Brain },
];

export default function TwinSidebar({ active, onSelect }) {
  return (
    <nav className="w-60 flex-shrink-0 border-r border-white/5 bg-white/[0.01] h-full overflow-y-auto">
      <div className="p-3">
        <div className="flex items-center gap-2 px-2 py-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><Boxes size={16} className="text-white" /></div>
          <div><div className="text-xs font-bold text-white">Platform Digital Twin™</div><div className="text-[10px] text-white/30">Chief Architect OS</div></div>
        </div>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => onSelect(s.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${active === s.id ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}>
              <Icon size={14} /> {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}