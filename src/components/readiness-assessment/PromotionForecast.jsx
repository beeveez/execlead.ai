import React from 'react';
import { TrendingUp, Clock, ShieldQuestion, Sparkles } from 'lucide-react';

export default function PromotionForecast({ forecast }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-indigo-400" /><h3 className="text-sm font-semibold text-white">Promotion Forecast™</h3></div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Current Readiness</div>
          <div className="text-sm font-semibold text-white">{forecast.currentLevel}</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{forecast.currentScore}%</div>
        </div>
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/40 mb-1"><Clock size={10} /> Estimated Readiness</div>
          <div className="text-sm font-semibold text-white">{forecast.targetLevel}</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{forecast.estimatedMonths}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[10px] text-white/40">Confidence:</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${forecast.confidence === 'High' ? 'bg-emerald-500/15 text-emerald-400' : forecast.confidence === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-white/50'}`}>{forecast.confidence}</span>
      </div>
      <div className="flex items-start gap-2 bg-white/[0.03] border border-white/8 rounded-xl p-3">
        <ShieldQuestion size={14} className="text-indigo-400 mt-0.5 shrink-0" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1"><Sparkles size={10} /> AI Explanation</div>
          <div className="text-[11px] text-white/65 leading-relaxed">{forecast.explanation}</div>
        </div>
      </div>
    </div>
  );
}