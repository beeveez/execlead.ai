import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { getTierById, getProgressToNext, getRatingFromScore, parseJSON } from "@/lib/reputationSystem";
import ReputationBadges from "@/components/legacy/ReputationBadges";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Minus, BookOpen, MessageCircle, Star, ThumbsUp, Award, AlertTriangle } from "lucide-react";

export default function ReputationScoreCard({ reputation, isSelf = false, onRecalculate, recalculating = false }) {
  const { toast } = useToast();
  if (!reputation) return <p className="text-white/40 text-sm text-center py-4">Reputation data unavailable.</p>;

  const score = reputation.reputation_score || 0;
  const tierConfig = getTierById(reputation.reputation_tier);
  const progress = getProgressToNext(score);
  const rating = getRatingFromScore((score / 1000) * 100);
  let badges = [];
  try { badges = JSON.parse(reputation.badges_json || '[]'); } catch (e) {}
  const recommendations = parseJSON(reputation.improvement_recommendations_json, []);
  const trend = reputation.reputation_trend || 'stable';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/30';

  const handleRecalculate = async () => {
    if (onRecalculate) onRecalculate();
  };

  const stats = [
    { label: 'Letters', value: reputation.total_letters || 0, icon: BookOpen, color: 'text-indigo-400' },
    { label: 'Comments', value: reputation.total_comments || 0, icon: MessageCircle, color: 'text-blue-400' },
    { label: 'Avg Quality', value: reputation.average_quality_score || 0, icon: Star, color: 'text-amber-400' },
    { label: 'Helpful', value: reputation.helpful_responses || 0, icon: ThumbsUp, color: 'text-emerald-400' },
    { label: 'Featured', value: reputation.featured_contributions || 0, icon: Award, color: 'text-purple-400' },
    { label: 'Warnings', value: reputation.warnings_count || 0, icon: AlertTriangle, color: 'text-red-400' },
  ];

  const dimSummary = [
    { label: 'Trust', value: reputation.community_trust_score || 0, color: 'text-emerald-400' },
    { label: 'Influence', value: reputation.leadership_influence_pct || 0, suffix: '%', color: 'text-blue-400' },
    { label: 'Conduct', value: reputation.professional_conduct_score || 0, color: 'text-amber-400' },
    { label: 'Credibility', value: reputation.executive_credibility_score || 0, color: 'text-cyan-400' },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      {/* Score Header */}
      <div className={`bg-gradient-to-br ${tierConfig.bg} p-5 border-b ${tierConfig.border}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Executive Reputation</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${tierConfig.color}`}>{score}</span>
              <span className="text-white/30 text-sm">/ 1000</span>
              <TrendIcon size={16} className={trendColor} />
              <span className={`text-lg font-bold ${rating.color} ml-1`}>{reputation.overall_executive_rating}</span>
            </div>
            <div className={`text-sm font-medium ${tierConfig.color} mt-1`}>{tierConfig.icon} {tierConfig.name}</div>
          </div>
          {isSelf && onRecalculate && (
            <button onClick={handleRecalculate} disabled={recalculating} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-indigo-400 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50">
              {recalculating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Refresh
            </button>
          )}
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${tierConfig.color.replace('text-', 'bg-')} transition-all duration-500`} style={{ width: `${progress.nextTier ? progress.progress : 100}%` }} />
        </div>
        {progress.nextTier ? (
          <div className="flex items-center justify-between text-[10px] mt-1.5">
            <span className="text-white/30">{tierConfig.name}</span>
            <span className="text-white/40">{progress.nextTier.minScore - score} pts to {progress.nextTier.name}</span>
          </div>
        ) : (
          <div className="text-[10px] mt-1.5 text-center text-white/30">Maximum tier achieved</div>
        )}
      </div>

      {/* Multi-dimensional summary */}
      <div className="grid grid-cols-4 gap-2 p-4 border-b border-white/5">
        {dimSummary.map((d) => (
          <div key={d.label} className="text-center">
            <div className={`text-sm font-bold ${d.color}`}>{d.value}{d.suffix || ''}</div>
            <div className="text-white/30 text-[9px]">{d.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="p-5 border-b border-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Earned Badges ({badges.length})</div>
        {badges.length > 0 ? (
          <ReputationBadges
            score={score}
            tier={reputation.reputation_tier}
            badges={badges}
            context={{ trustScore: reputation.community_trust_score, leadershipLevel: tierConfig.name }}
          />
        ) : (
          <p className="text-white/30 text-xs">No badges earned yet. Contribute to earn your first badge!</p>
        )}
      </div>

      {/* Stats */}
      <div className="p-5 border-b border-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Historical Performance</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <Icon size={14} className={`${s.color} mx-auto mb-1`} />
                <div className="text-white/80 text-sm font-semibold">{s.value}</div>
                <div className="text-white/30 text-[10px]">{s.label}</div>
              </div>
            );
          })}
        </div>
        {reputation.lifetime_score > score && (
          <div className="mt-3 text-center text-white/30 text-[10px]">
            Lifetime peak: <span className="text-amber-400 font-medium">{reputation.lifetime_score}</span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {isSelf && recommendations.length > 0 && (
        <div className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Improvement Recommendations</div>
          <ul className="space-y-1.5">
            {recommendations.slice(0, 4).map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-white/50 text-xs">
                <span className="text-white/20 flex-shrink-0">•</span> {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}