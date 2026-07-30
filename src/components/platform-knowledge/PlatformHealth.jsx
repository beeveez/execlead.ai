import React from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { computePlatformHealth } from '@/lib/platformIntelligenceEngine/index';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: Minus };
const TREND_COLOR = { up: '#10b981', down: '#ef4444', stable: '#64748b' };

function Sparkline({ data, color = '#6366f1' }) {
  if (!data || data.length < 2) return null;
  const w = 100, h = 28;
  const max = Math.max(...data.map((d) => d.value)), min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.value - min) / range) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DimCard({ label, d }) {
  const TIcon = TREND_ICON[d.trend];
  const tcolor = TREND_COLOR[d.trend];
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-white/50 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          <Sparkline data={d.history} color={tcolor} />
          <TIcon size={13} style={{ color: tcolor }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{d.current}<span className="text-sm text-white/30">/100</span></div>
      <p className="text-[11px] text-white/40 leading-snug mb-2">{d.reason}</p>
      <div className="space-y-1">
        {d.recommendations.slice(0, 2).map((r, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[10px] text-white/50">
            <span className="text-indigo-400 mt-0.5">→</span><span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlatformHealth() {
  const health = computePlatformHealth();
  const dims = [
    ['Architecture Score', health.architecture], ['Documentation Score', health.documentation],
    ['AI Quality Score', health.aiQuality], ['Security Score', health.security],
    ['Performance Score', health.performance], ['Maintainability Score', health.maintainability],
    ['Scalability Score', health.scalability], ['Developer Experience Score', health.developerExperience],
    ['Commercial Readiness', health.commercialReadiness], ['Enterprise Readiness', health.enterpriseReadiness],
    ['Executive Readiness Contribution', health.executiveReadinessContribution],
  ];
  const ph = health.platformHealth;
  const PIcon = TREND_ICON[ph.trend];
  return (
    <SectionShell title="Platform Health™" subtitle="Executive dashboard of 12 platform health dimensions with trends and recommendations" icon={Activity}>
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] text-indigo-300 uppercase tracking-wider mb-1">Platform Health Score</div>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold text-white">{ph.current}</div>
              <div className="text-white/40 text-sm mb-1">/100</div>
              <div className="flex items-center gap-1 mb-1.5 ml-2"><PIcon size={16} style={{ color: TREND_COLOR[ph.trend] }} /></div>
            </div>
            <p className="text-xs text-white/50 mt-1">{ph.reason}</p>
          </div>
          <div className="text-right">
            <Badge color={ph.current >= 80 ? '#10b981' : ph.current >= 65 ? '#f59e0b' : '#ef4444'}>
              {ph.current >= 80 ? 'Healthy' : ph.current >= 65 ? 'Developing' : 'At Risk'}
            </Badge>
            <div className="text-[10px] text-white/30 mt-2">{health.platformHealth.history.length} trend points</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dims.map(([label, d]) => <DimCard key={label} label={label} d={d} />)}
      </div>
    </SectionShell>
  );
}