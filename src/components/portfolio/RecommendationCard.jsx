import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, ChevronRight } from 'lucide-react';

export default function RecommendationCard({ rec }) {
  const navigate = useNavigate();

  const handleActivate = () => navigate(rec.route);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      title="Complete this recommendation"
      aria-label={`Complete this recommendation: ${rec.title}`}
      className="group cursor-pointer bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] hover:border-indigo-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{rec.title}</div>
          <div className="text-[10px] text-white/30 mt-0.5">{rec.description}</div>
        </div>
        <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors" />
      </div>
      <div className="flex items-center gap-2.5 mt-2.5">
        <span className="flex items-center gap-1 text-[9px] text-white/30"><Clock size={9} /> {rec.estimatedTime}</span>
        <span className="flex items-center gap-1 text-[9px] text-emerald-400/70"><TrendingUp size={9} /> +{rec.expectedImprovement}%</span>
        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500/50 transition-all duration-300" style={{ width: `${rec.completion}%` }} />
        </div>
        <span className="text-[9px] text-white/30 font-medium">{rec.completion}%</span>
      </div>
    </div>
  );
}