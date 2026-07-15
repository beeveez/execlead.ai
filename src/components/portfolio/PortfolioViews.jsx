import React from 'react';
import { Eye, Briefcase, Building2, Crown } from 'lucide-react';
import { VIEW_MODES } from '@/lib/portfolioEngineV2';

const MODE_ICONS = { private: Eye, recruiter: Briefcase, enterprise: Building2, board: Crown };

export default function PortfolioViews({ mode, onChange }) {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Portfolio View</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {VIEW_MODES.map((vm) => {
          const Icon = MODE_ICONS[vm.id] || Eye;
          const isActive = mode === vm.id;
          return (
            <button key={vm.id} onClick={() => onChange(vm.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors
                ${isActive ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
              <Icon size={14} className={isActive ? 'text-indigo-400' : 'text-white/30'} />
              <div className="min-w-0">
                <div className="text-[11px] font-medium truncate">{vm.label}</div>
                <div className="text-[8px] text-white/20 truncate">{vm.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}