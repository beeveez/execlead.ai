import React, { useMemo } from 'react';
import { TrendingDown, Clock, Calendar } from 'lucide-react';
import { calculateDecayedConfidence, getConfidenceTrend, getDecayConfig, DECAY_CONFIGS } from '@/lib/evidenceIntelligenceEngine';
import { calculateConfidence } from '@/lib/evidenceVaultEngine';

export default function EvidenceConfidenceDecay({ evidence }) {
  const trend = useMemo(() => getConfidenceTrend(evidence), [evidence]);
  const decayedConfidence = useMemo(() => calculateDecayedConfidence(evidence), [evidence]);
  const baseConfidence = useMemo(() => calculateConfidence(evidence), [evidence]);
  const decayConfig = getDecayConfig(evidence?.expiration_type);

  if (!evidence) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={14} className="text-orange-400" />
          <span className="text-sm font-bold text-white">Evidence Confidence Decay™</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <TrendingDown size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">Select an evidence item to view confidence decay.</p>
        </div>
      </div>
    );
  }

  const decayAmount = baseConfidence - decayedConfidence;

  // Build SVG polyline points
  const maxPoints = trend.length;
  const chartWidth = 320;
  const chartHeight = 80;
  const padding = 10;
  const xStep = (chartWidth - padding * 2) / Math.max(maxPoints - 1, 1);

  const linePoints = trend.map((p, i) => {
    const x = padding + i * xStep;
    const y = chartHeight - padding - (p.confidence / 100) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${chartHeight - padding} ${linePoints} ${chartWidth - padding},${chartHeight - padding}`;
  const currentIdx = trend.findIndex(p => p.isCurrent);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown size={14} className="text-orange-400" />
        <span className="text-sm font-bold text-white">Evidence Confidence Decay™</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: decayConfig.color + '15', color: decayConfig.color }}>{decayConfig.label}</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        {/* Current vs Base */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/30">Current Confidence</div>
            <div className="text-2xl font-bold" style={{ color: decayedConfidence >= 70 ? '#10b981' : decayedConfidence >= 40 ? '#f59e0b' : '#ef4444' }}>{decayedConfidence}%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/30">Base Confidence</div>
            <div className="text-lg font-bold text-white/60">{baseConfidence}%</div>
          </div>
          {decayAmount > 0 && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-white/30">Decay</div>
              <div className="text-sm font-bold text-orange-400">-{decayAmount}</div>
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Confidence Trend (6 months past → future)</div>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ maxHeight: '90px' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(v => {
              const y = chartHeight - padding - (v / 100) * (chartHeight - padding * 2);
              return <line key={v} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />;
            })}
            {/* Area */}
            <polygon points={areaPoints} fill="rgba(249,115,22,0.06)" />
            {/* Line */}
            <polyline points={linePoints} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {/* Current point */}
            {currentIdx >= 0 && (() => {
              const x = padding + currentIdx * xStep;
              const y = chartHeight - padding - (trend[currentIdx].confidence / 100) * (chartHeight - padding * 2);
              return (
                <>
                  <circle cx={x} cy={y} r="3" fill="#f97316" />
                  <circle cx={x} cy={y} r="6" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3" />
                </>
              );
            })()}
          </svg>
          <div className="flex justify-between text-[8px] text-white/20 mt-1">
            {trend.filter((_, i) => i % 2 === 0).map(p => <span key={p.month}>{p.month}</span>)}
          </div>
        </div>

        {/* Decay config info */}
        <div className="flex items-center gap-2 text-[11px] text-white/40 bg-white/[0.02] rounded-lg px-3 py-2">
          <Clock size={11} className="text-white/30" />
          <span>
            {decayConfig.months
              ? `Confidence decays over ${decayConfig.months} months. At current rate, evidence reaches 10% confidence floor in ${Math.max(0, decayConfig.months - Math.round((Date.now() - new Date(evidence.date || evidence.created_date || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30.44)))} months.`
              : 'This evidence does not decay — confidence is maintained indefinitely.'}
          </span>
        </div>
      </div>
    </div>
  );
}