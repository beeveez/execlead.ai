import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useIntelligenceDrillDown } from '@/lib/useIntelligenceDrillDown';

/**
 * IntelligenceCard™ — Shared Platform Standard
 * ----------------------------------------------------------------
 * ONE reusable score card for every intelligence dashboard in EXECLEAD.AI.
 *
 * Props:
 *   metric   — { id, label, score, target, trend?, change?, unit?, lastUpdated?, confidence? }
 *   onClick  — optional override (defaults to openIntelligenceAnalysis)
 *   index    — stagger animation index
 *   children — optional extra content rendered inside the card
 *
 * Behavior:
 *   score < 100  → entire card is clickable, opens Intelligence Drill-Down™
 *   score == 100 → clickable, opens Healthy Status panel
 *
 * Usage:
 *   <IntelligenceCard metric={metric} onClick={() => openMetric(metric.id)} />
 */
export default function IntelligenceCard({ metric, onClick, index = 0, children }) {
  const openDrillDown = useIntelligenceDrillDown();
  const handle = onClick || (() => openDrillDown(metric));
  const isPerfect = metric.score >= (metric.target || 100);
  const TrendIcon = metric.trend === 'up' || metric.trend === 'improving' ? TrendingUp
    : metric.trend === 'down' || metric.trend === 'declining' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={handle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); } }}
      className={`relative bg-white/[0.02] border rounded-xl p-4 transition-all cursor-pointer group hover:bg-white/[0.04] hover:shadow-[0_0_20px_-4px_rgba(245,158,11,0.25)] ${
        isPerfect ? 'border-emerald-500/15 hover:border-emerald-500/30' : 'border-white/10 hover:border-amber-500/30'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-[10px] uppercase tracking-wider truncate">{metric.label}</span>
        {isPerfect ? (
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        ) : (
          <TrendIcon size={12} className={
            metric.trend === 'up' || metric.trend === 'improving' ? 'text-emerald-400'
            : metric.trend === 'down' || metric.trend === 'declining' ? 'text-red-400'
            : 'text-white/30'
          } />
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold text-foreground">
          {metric.score}{metric.unit || ''}
        </span>
        {metric.target != null && (
          <span className="text-muted-foreground text-xs">/ {metric.target}{metric.unit || ''}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-[10px]">
          {isPerfect ? 'Perfect · Healthy' : `${metric.target - metric.score}${metric.unit || ''} to target`}
        </span>
        {metric.lastUpdated && <span className="text-white/20 text-[9px]">{metric.lastUpdated}</span>}
      </div>
      {children}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className={`text-[9px] font-medium flex items-center gap-1 ${isPerfect ? 'text-emerald-400' : 'text-amber-400'}`}>
          {isPerfect ? 'View Healthy Status' : 'View Intelligence Analysis'}
          <ArrowRight size={9} />
        </span>
      </div>
    </motion.div>
  );
}