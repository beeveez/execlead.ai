import React from 'react';
import { Activity } from 'lucide-react';
import { computeHealthScore } from '@/lib/portfolioEngineV2';
import PortfolioSection from './PortfolioSection';

export default function PortfolioHealth({ data }) {
  const health = computeHealthScore(data);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: health.statusColor }} />
            <span className="text-sm font-bold text-white">Portfolio Health™</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: health.statusColor }}>{health.overall}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${health.statusColor}15`, color: health.statusColor }}>{health.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {health.dimensions.map((d) => (
            <div key={d.id} className="bg-white/[0.02] rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-white/30 uppercase truncate">{d.label}</span>
                <span className="text-[10px] font-bold" style={{ color: d.score >= 70 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#ef4444' }}>{d.score}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all" style={{ width: `${d.score}%`, backgroundColor: d.score >= 70 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}