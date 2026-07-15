import React from 'react';
import { Link } from 'react-router-dom';
import { SCOREBOARD_ITEMS, getScoreboardScores } from '@/lib/portfolioEngine';
import { SCOREBOARD_ROUTES } from '@/lib/portfolioEngineV2';

export default function PortfolioScoreboard({ data, completeness }) {
  const scores = getScoreboardScores(data, completeness);
  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Executive Scoreboard</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
        {SCOREBOARD_ITEMS.map((item) => {
          const score = scores[item.id] || 0;
          const Icon = item.icon;
          const route = SCOREBOARD_ROUTES[item.id] || '/executive-portfolio';
          return (
            <Link key={item.id} to={route}
              title={`View ${item.label}`}
              className="group bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-center hover:bg-white/[0.04] hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              <div className="w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1.5" style={{ backgroundColor: `${item.color}15` }}>
                <Icon size={13} style={{ color: item.color }} />
              </div>
              <div className="text-lg font-bold" style={{ color: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444' }}>
                {score}
              </div>
              <div className="text-[7px] text-white/30 leading-tight mt-0.5 group-hover:text-white/50 transition-colors">{item.label.replace('™', '')}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}