import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLOR_MAP = {
  indigo: 'text-indigo-400 bg-indigo-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  rose: 'text-rose-400 bg-rose-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
  violet: 'text-violet-400 bg-violet-500/10',
};

export default function MetricCard({ icon: Icon, label, value, suffix, trend, description, color = 'indigo' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white/30';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${COLOR_MAP[color] || COLOR_MAP.indigo}`}>
          {Icon && <Icon size={18} />}
        </div>
        {trend && <TrendIcon size={14} className={trendColor} />}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}{suffix}</div>
      {description && <p className="text-xs text-white/40 mt-2 leading-relaxed">{description}</p>}
    </div>
  );
}