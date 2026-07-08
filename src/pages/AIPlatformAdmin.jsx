import React, { useState } from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import {
  Shield, Cloud, Cpu, Bot, FileText, Database, Brain, Activity,
  DollarSign, ShieldCheck, ToggleLeft, PlayCircle,
} from "lucide-react";
import AIProviders from "@/components/ai-admin/AIProviders";
import ModelManagement from "@/components/ai-admin/ModelManagement";
import AgentRegistry from "@/components/ai-admin/AgentRegistry";
import PromptLibrary from "@/components/ai-admin/PromptLibrary";
import KnowledgeSources from "@/components/ai-admin/KnowledgeSources";
import MemoryStores from "@/components/ai-admin/MemoryStores";
import MonitoringPanel from "@/components/ai-admin/MonitoringPanel";
import CostPanel from "@/components/ai-admin/CostPanel";
import AISecurity from "@/components/ai-admin/AISecurity";
import FeatureFlagsPanel from "@/components/ai-admin/FeatureFlagsPanel";
import PreviewTools from "@/components/ai-admin/PreviewTools";

const SECTIONS = [
  { id: 'providers', label: 'AI Providers', icon: Cloud },
  { id: 'models', label: 'Model Management', icon: Cpu },
  { id: 'agents', label: 'Agent Registry', icon: Bot },
  { id: 'prompts', label: 'Prompt Library', icon: FileText },
  { id: 'knowledge', label: 'Knowledge Sources', icon: Database },
  { id: 'memory', label: 'Memory Stores', icon: Brain },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'costs', label: 'Cost Dashboard', icon: DollarSign },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'flags', label: 'Feature Flags', icon: ToggleLeft },
  { id: 'preview', label: 'Preview Tools', icon: PlayCircle },
];

export default function AIPlatformAdmin() {
  const { canAccessDeveloper } = useDeveloper();
  const [section, setSection] = useState('providers');

  if (!canAccessDeveloper) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Developer Access Required</h2>
          <p className="text-white/30 text-sm">AI Platform Administration is restricted to Developer and Super Admin roles.</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'providers': return <AIProviders />;
      case 'models': return <ModelManagement />;
      case 'agents': return <AgentRegistry />;
      case 'prompts': return <PromptLibrary />;
      case 'knowledge': return <KnowledgeSources />;
      case 'memory': return <MemoryStores />;
      case 'monitoring': return <MonitoringPanel />;
      case 'costs': return <CostPanel />;
      case 'security': return <AISecurity />;
      case 'flags': return <FeatureFlagsPanel />;
      case 'preview': return <PreviewTools />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-emerald-400" />
          AI Platform Administration
        </div>
        <h1 className="text-2xl font-bold text-white">AI Platform Administration</h1>
        <p className="text-white/40 text-sm mt-1">
          Control plane for the EXECLEAD.AI AI platform — providers, models, agents, prompts, knowledge, memory, monitoring, costs, and security.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    section === s.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={section === s.id ? 'text-emerald-400' : 'text-white/30'} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}