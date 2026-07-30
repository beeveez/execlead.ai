import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { safeParse } from '@/lib/executiveSuccessStoryEngine';

export default function SuccessStoryCard({ story, ownerLink }) {
  if (!story) return null;
  const metrics = safeParse(story.metrics_snapshot_json, { counts: {} });
  const to = ownerLink ? `/executive-success-stories/${story.id}` : `/success-stories/${story.story_id}`;
  const name = story.visibility === 'anonymous' ? 'Anonymous Executive' : (story.user_name || 'Executive Member');

  return (
    <Link
      to={to}
      className="group block bg-white/[0.02] border border-white/8 rounded-2xl p-5 hover:border-accent-orange/30 hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {story.featured && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded-full text-[9px] text-amber-400 font-semibold uppercase">
            <Trophy size={10} /> Featured
          </span>
        )}
        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] text-emerald-400">
          {story.visibility === 'anonymous' ? 'Anonymous' : 'Named'}
        </span>
        {story.industry && <span className="text-[10px] text-white/40">{story.industry}</span>}
      </div>

      <h3 className="text-base font-semibold text-white leading-snug mb-2 group-hover:text-accent-orange transition-colors">{story.title}</h3>
      <p className="text-xs text-white/50 leading-relaxed line-clamp-3 mb-4">{story.summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <TrendingUp size={12} /> +{metrics.improvement || 0} Readiness
          </span>
          <span className="text-white/30">{name}</span>
        </div>
        <ArrowRight size={14} className="text-white/30 group-hover:text-accent-orange group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}