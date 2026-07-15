import React from 'react';
import { TrendingUp, Target, TrendingDown, Minus, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const TREND_ICONS = { rising: TrendingUp, declining: TrendingDown, stable: Minus, growing: TrendingUp };
const TREND_COLORS = { rising: '#10b981', declining: '#ef4444', stable: '#64748b', growing: '#10b981' };

function ForecastCard({ label, value, suffix, icon: Icon, color, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}<span className="text-sm text-white/40 ml-1">{suffix}</span></div>
      {children}
    </div>
  );
}

export default function LeadershipForecast({ forecast, twin }) {
  const { scores } = twin;
  const TrendIcon = TREND_ICONS[forecast.trustTrend.label] || Minus;
  const trendColor = TREND_COLORS[forecast.trustTrend.label] || '#64748b';
  const EvidenceTrendIcon = TREND_ICONS[forecast.evidenceTrend.label] || Minus;
  const evidenceTrendColor = TREND_COLORS[forecast.evidenceTrend.label] || '#64748b';

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Target size={16} className="text-indigo-400" />
        <h2 className="text-lg font-bold text-white">Leadership Forecast™</h2>
        <span className="text-[10px] text-white/30 ml-auto">AI-predicted trajectory</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <ForecastCard label="Leadership Growth" value={forecast.leadershipGrowth} suffix="%" icon={TrendingUp} color="#6366f1" />
        <ForecastCard label="Promotion Probability" value={forecast.promotionProbability} suffix="%" icon={Target} color="#a855f7" />
        <ForecastCard label="Readiness (30d)" value={forecast.readiness30d} suffix="%" icon={ArrowRight} color="#10b981">
          <span className="text-[9px] text-white/30">now {forecast.readinessNow}%</span>
        </ForecastCard>
        <ForecastCard label="Trust Trend" value={forecast.trustTrend.value > 0 ? '+' : ''} icon={TrendIcon} color={trendColor}>
          <span className="text-[9px]" style={{ color: trendColor }}>{forecast.trustTrend.label}</span>
        </ForecastCard>
        <ForecastCard label="Evidence Trend" value={forecast.evidenceTrend.recent || 0} suffix={`/${forecast.evidenceTrend.total}`} icon={EvidenceTrendIcon} color={evidenceTrendColor}>
          <span className="text-[9px]" style={{ color: evidenceTrendColor }}>{forecast.evidenceTrend.label}</span>
        </ForecastCard>
        <ForecastCard label="Skill Gaps" value={forecast.skillGaps.length} suffix="open" icon={AlertCircle} color="#f59e0b" />
      </div>

      {/* 90-day Projection */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">90-Day Readiness Projection</div>
        <div className="flex items-end gap-1 h-20">
          {Array.from({ length: 12 }, (_, i) => {
            const week = i + 1;
            const projected = Math.min(100, Math.round(forecast.readinessNow + (forecast.readiness90d - forecast.readinessNow) * (week / 12)));
            const height = Math.max(4, projected * 0.7);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-gradient-to-t from-indigo-500/30 to-indigo-400/60" style={{ height: `${height}px` }} />
                <span className="text-[7px] text-white/20">{week}w</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px]">
          <span className="text-white/30">Current: {forecast.readinessNow}%</span>
          <span className="text-indigo-400 font-medium">90-day: {forecast.readiness90d}%</span>
        </div>
      </div>

      {/* Skill Gaps */}
      {forecast.skillGaps.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Identified Skill Gaps</div>
          <div className="space-y-2">
            {forecast.skillGaps.slice(0, 5).map((gap, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[11px] text-white/60 w-40 truncate">{gap.area}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400/60" style={{ width: `${Math.min(100, (gap.current / gap.target) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-white/40 w-20 text-right">{gap.current}/{gap.target}</span>
                <span className="text-[9px] text-white/30 w-28 truncate">{gap.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 flex items-start gap-2 text-[11px] text-white/50 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-lg p-3">
        <Sparkles size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <span>{forecast.summary}</span>
      </div>
    </div>
  );
}