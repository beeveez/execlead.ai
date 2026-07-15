import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { getActionableRecommendations } from '@/lib/portfolioEngineV2';
import RecommendationCard from './RecommendationCard';

export default function RecommendationPanel({ data, completeness }) {
  const recs = getActionableRecommendations(data, completeness);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/15 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Actionable Recommendations™</span>
          {recs.length === 0 && <CheckCircle2 size={14} className="text-emerald-400" />}
          {recs.length > 0 && <span className="text-[10px] text-white/30 ml-auto">{recs.length} pending</span>}
        </div>
        {recs.length > 0 ? (
          <div className="space-y-2">
            {recs.slice(0, 5).map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 size={24} className="text-emerald-400/50 mx-auto mb-2" />
            <p className="text-xs text-white/40">All recommendations completed. Your portfolio is in excellent shape!</p>
          </div>
        )}
      </div>
    </div>
  );
}