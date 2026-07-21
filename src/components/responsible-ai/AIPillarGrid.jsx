import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import {
  Users, Eye, Lock, Scale, Shield, TrendingUp,
} from 'lucide-react';

const ICON_MAP = { Users, Eye, Lock, Scale, Shield, TrendingUp };

export default function AIPillarGrid({ pillars, onPillarClick }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Governance Pillars ({pillars.length})</h3>
        <span className="text-xs text-white/40">Weighted score · click for details</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pillars.map((pillar) => {
          const Icon = ICON_MAP[pillar.icon] || Shield;
          const statusColor = pillar.status === 'pass' ? '#10b981' : pillar.status === 'warning' ? '#f59e0b' : '#ef4444';
          const StatusIcon = pillar.status === 'pass' ? CheckCircle2 : pillar.status === 'warning' ? AlertTriangle : XCircle;
          return (
            <button key={pillar.id} onClick={() => onPillarClick(pillar.id)}
              className="flex flex-col gap-2 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all text-left group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${statusColor}15` }}>
                    <Icon size={14} style={{ color: statusColor }} />
                  </div>
                  <span className="text-xs font-medium text-white">{pillar.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-white/30">{pillar.weight}%</span>
                  <StatusIcon size={14} style={{ color: statusColor }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pillar.score}%`, background: statusColor }} />
                </div>
                <span className="text-xs font-bold" style={{ color: statusColor }}>{pillar.score}%</span>
              </div>
              <p className="text-[10px] text-white/30 leading-tight line-clamp-2">{pillar.description}</p>
              <span className="flex items-center gap-0.5 text-[10px] text-white/30 group-hover:text-white/60 transition-colors">Details <ChevronRight size={10} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}