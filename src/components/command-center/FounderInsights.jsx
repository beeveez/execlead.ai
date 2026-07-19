import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const HIGHLIGHT_ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const HIGHLIGHT_COLORS = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

export default function FounderInsights({ data }) {
  return (
    <div>
      <div className="bg-gradient-to-br from-indigo-500/[0.06] to-transparent border border-indigo-500/15 rounded-xl p-4 mb-3">
        <div className="flex items-start gap-3">
          <Sparkles size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-white/70 text-sm leading-relaxed">{data.narrative}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {data.highlights.map((h, i) => {
          const Icon = HIGHLIGHT_ICONS[h.type] || Info;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Icon size={12} className={HIGHLIGHT_COLORS[h.type]} />
              <span className="text-white/60">{h.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}