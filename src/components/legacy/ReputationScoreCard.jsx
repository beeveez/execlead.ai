import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getTierById, getProgressToNext } from "@/lib/reputationSystem";
import ReputationBadges from "@/components/legacy/ReputationBadges";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Minus, Award, BookOpen, MessageCircle, ThumbsUp, Star, AlertTriangle, Sparkles } from "lucide-react";

export default function ReputationScoreCard({ userId, showRecalculate = true }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "get_status", user_id: userId });
      const d = res.data || res;
      setData(d);
    } catch (e) {}
    setLoading(false);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "recalculate", user_id: userId });
      const d = res.data || res;
      if (d.success) {
        setData(prev => ({ ...prev, reputation: d.reputation, computed: d.computed }));
        if (d.new_badges?.length > 0) {
          toast({ title: `🎉 New badge${d.new_badges.length > 1 ? 's' : ''} earned!`, description: d.new_badges.join(', ') });
        } else {
          toast({ title: "Reputation updated" });
        }
      }
    } catch (e) {
      toast({ title: "Failed to recalculate", variant: "destructive" });
    }
    setRecalculating(false);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>;
  }

  const rep = data?.reputation;
  if (!rep) return <p className="text-white/40 text-sm text-center py-4">Reputation data unavailable.</p>;

  const score = rep.reputation_score || 0;
  const tierConfig = getTierById(rep.reputation_tier);
  const progress = getProgressToNext(score);
  let badges = [];
  try { badges = JSON.parse(rep.badges_json || '[]'); } catch (e) {}
  const recommendations = [];
  try { recommendations = JSON.parse(rep.improvement_recommendations_json || '[]'); } catch (e) {}
  const trend = rep.reputation_trend || 'stable';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/30';

  const stats = [
    { label: 'Letters', value: rep.total_letters || 0, icon: BookOpen, color: 'text-indigo-400' },
    { label: 'Comments', value: rep.total_comments || 0, icon: MessageCircle, color: 'text-blue-400' },
    { label: 'Avg Quality', value: rep.average_quality_score || 0, icon: Star, color: 'text-amber-400' },
    { label: 'Helpful', value: rep.helpful_responses || 0, icon: ThumbsUp, color: 'text-emerald-400' },
    { label: 'Featured', value: rep.featured_contributions || 0, icon: Award, color: 'text-purple-400' },
    { label: 'Warnings', value: rep.warnings_count || 0, icon: AlertTriangle, color: 'text-red-400' },
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
            </div>
            <div className={`text-sm font-medium ${tierConfig.color} mt-1`}>{tierConfig.icon} {tierConfig.name}</div>
          </div>
          {showRecalculate && data?.is_self && (
            <button onClick={handleRecalculate} disabled={recalculating} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-indigo-400 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
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

      {/* Badges */}
      <div className="p-5 border-b border-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Earned Badges ({badges.length})</div>
        {badges.length > 0 ? (
          <ReputationBadges score={score} tier={rep.reputation_tier} badges={badges} />
        ) : (
          <p className="text-white/30 text-xs">No badges earned yet. Contribute to earn your first badge!</p>
        )}
      </div>

      {/* Stats */}
      <div className="p-5 border-b border-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Historical Performance</div>
        <div className="grid grid-cols-3 gap-3">
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
        {rep.lifetime_score > score && (
          <div className="mt-3 text-center text-white/30 text-[10px]">
            Lifetime peak: <span className="text-amber-400 font-medium">{rep.lifetime_score}</span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && data?.is_self && (
        <div className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-purple-400" /> Improvement Recommendations
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
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