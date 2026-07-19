import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { openIntelligenceAnalysis } from '@/lib/intelligenceAnalysisStore';

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, stable: Minus };

export function TrendBadge({ trend, change, unit }) {
  if (trend === 'stable' || change === 0) {
    return <span className="text-white/30 text-xs">—</span>;
  }
  const positive = trend === 'up';
  return (
    <span className={`text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? '↑' : '↓'} {Math.abs(change)}{unit || ''}
    </span>
  );
}

export function ConfidenceDot({ level }) {
  const color = level === 'high' ? 'bg-emerald-400' : level === 'medium' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}

export default function ExecutiveScoreboard({ metrics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m, i) => {
        const isPerfect = m.value >= (m.target || 100);
        const TrendIcon = TREND_ICONS[m.trend] || Minus;
        // v2.0: ALL cards are clickable — perfect scores open Healthy Status panel
        const card = (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`relative bg-white/[0.02] border rounded-xl p-4 transition-all cursor-pointer group hover:bg-white/[0.04] hover:shadow-[0_0_20px_-4px_rgba(245,158,11,0.25)] ${
              isPerfect ? 'border-emerald-500/15 hover:border-emerald-500/30' : 'border-white/10 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-[10px] uppercase tracking-wider">{m.label}</span>
              {isPerfect ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
              ) : (
                <ConfidenceDot level={m.confidence} />
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={`text-2xl font-bold ${isPerfect ? 'text-emerald-400' : 'text-amber-400'}`}>{m.value}{m.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-[10px]">{isPerfect ? 'Perfect · Healthy' : `Target ${m.target}${m.unit}`}</span>
              {!isPerfect && <TrendBadge trend={m.trend} change={m.change} unit={m.unit} />}
              {isPerfect && <span className="text-white/20 text-[10px]">View History</span>}
            </div>
            <p className="text-white/20 text-[9px] mt-1.5">Updated {m.lastUpdated}</p>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className={`text-[9px] font-medium ${isPerfect ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPerfect ? 'View Healthy Status →' : 'View Intelligence Analysis →'}
              </span>
            </div>
          </motion.div>
        );
        return (
          <div key={m.id}
            onClick={() => openIntelligenceAnalysis({ metricId: m.id })}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIntelligenceAnalysis({ metricId: m.id }); } }}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}