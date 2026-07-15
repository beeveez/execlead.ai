import React from 'react';
import { Lightbulb, ArrowRight, Clock, Zap, ShieldCheck, FolderPlus, Dna, Brain, BookOpen, Award, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const IMPACT_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#64748b' };
const EFFORT_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

const CATEGORY_ICONS = {
  Verification: ShieldCheck,
  Evidence: FolderPlus,
  Leadership: Dna,
  Development: Brain,
  Learning: BookOpen,
  Credentials: Award,
  Resume: FileText,
};



function PriorityBar({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 50 ? '#f59e0b' : '#64748b';
  return (
    <div className="flex items-center gap-1">
      <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function RecommendationEngine({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-amber-400" />
          <h2 className="text-lg font-bold text-white">Executive Recommendation Engine™</h2>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <CheckCircle2 size={24} className="text-emerald-400/50 mx-auto mb-2" />
          <p className="text-sm text-white/40">No recommendations at this time — your executive profile is well-optimized.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-amber-400" />
        <h2 className="text-lg font-bold text-white">Executive Recommendation Engine™</h2>
        <span className="text-[10px] text-white/30 ml-auto">{recommendations.length} ranked actions</span>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec) => {
          const CatIcon = CATEGORY_ICONS[rec.category] || Lightbulb;
          return (
            <Link
              key={rec.rank}
              to={rec.path}
              className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
            >
              {/* Rank */}
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-amber-400">{rec.rank}</span>
              </div>

              {/* Action */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CatIcon size={12} className="text-white/40" />
                  <span className="text-sm font-medium text-white/80">{rec.action}</span>
                </div>
                <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{rec.reason}</p>
              </div>

              {/* Impact / Effort */}
              <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <div className="text-[8px] uppercase tracking-wider text-white/30">Impact</div>
                  <div className="text-xs font-bold" style={{ color: IMPACT_COLORS[rec.impact] }}>{rec.impactScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-[8px] uppercase tracking-wider text-white/30">Effort</div>
                  <div className="text-xs font-bold" style={{ color: EFFORT_COLORS[rec.effort] }}>{rec.effortLabel}</div>
                </div>
                <PriorityBar score={rec.priorityScore} />
              </div>

              {/* Arrow */}
              <ArrowRight size={14} className="text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-start gap-2 text-[11px] text-white/50 bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-3">
        <Zap size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          Completing the top 3 recommendations would increase your Executive Readiness™ by approximately{' '}
          <strong className="text-amber-400">
            {recommendations.slice(0, 3).reduce((s, r) => s + r.impactScore, 0)} points
          </strong>.
        </span>
      </div>
    </div>
  );
}