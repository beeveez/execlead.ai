import React from 'react';
import { Gauge, TrendingUp } from 'lucide-react';

export default function AILocalizationConfidence({ confidence }) {
  const { factors, overallScore, grade, trend } = confidence;
  const scoreColor = overallScore >= 95 ? '#10b981' : overallScore >= 85 ? '#6366f1' : overallScore >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">AI Localization Confidence™</h3>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: scoreColor }}>{overallScore}%</div>
            <div className="text-[9px] text-white/30">Overall Confidence</div>
          </div>
          <div className="text-xl font-bold text-white">{grade}</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400"><TrendingUp size={10} /> {trend}</div>
        </div>
      </div>

      <div className="space-y-2">
        {factors.map((f) => {
          const color = f.score >= 95 ? '#10b981' : f.score >= 85 ? '#6366f1' : f.score >= 70 ? '#f59e0b' : '#ef4444';
          return (
            <div key={f.id} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white font-medium">{f.label}</span>
                  <span className="text-[9px] text-white/30">Weight: {f.weight}%</span>
                </div>
                <span className="text-sm font-bold" style={{ color }}>{f.score}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${f.score}%`, backgroundColor: color }} />
              </div>
              <div className="text-[9px] text-white/30 mt-1">{f.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}