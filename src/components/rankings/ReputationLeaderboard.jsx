import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Trophy, Crown, TrendingUp, Globe, MapPin, Briefcase, Building2, Sparkles, History } from "lucide-react";
import LockedFeatureSection from "@/components/common/LockedFeatureSection";
import { usePlanTier } from "@/hooks/usePlanTier";

/**
 * ReputationLeaderboard — Executive Rankings reputation section.
 *
 * Free: Global Leaderboard (top 10), personal ranking.
 * Professional (locked): Industry, Country, Functional, Historical rankings.
 * Executive (locked): Enterprise Rankings, AI Ranking Insights.
 */
export default function ReputationLeaderboard() {
  const { user } = useAuth();
  const { hasPro, hasExec } = usePlanTier();
  const [leaderboard, setLeaderboard] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    Promise.all([
      base44.functions.invoke("manageReputation", { action: "get_leaderboard", category: "leadership_quality" }).catch(() => null),
      base44.functions.invoke("manageReputation", { action: "get_community_rank", user_id: user.id }).catch(() => null),
    ]).then(([lbRes, rankRes]) => {
      if (!active) return;
      const lb = lbRes?.data || lbRes;
      const r = rankRes?.data || rankRes;
      if (lb?.leaderboard) setLeaderboard(lb.leaderboard);
      if (r) setRank(r);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>;
  }

  const top10 = (leaderboard || []).slice(0, 10);
  const podiumCls = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  return (
    <div className="space-y-6">
      {/* Your Ranking — Free */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Your Global Ranking</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">#{rank?.rank || "—"}</span>
              <span className="text-white/30 text-sm">of {rank?.total || 0} executives</span>
            </div>
          </div>
          <Trophy size={32} className="text-amber-400/50" />
        </div>
      </div>

      {/* Global Leaderboard — Free */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Crown size={14} className="text-amber-400" /> Global Leaderboard · Top 10
        </h3>
        {top10.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No rankings yet. Be the first to appear here!</p>
        ) : (
          <div className="space-y-2">
            {top10.map((entry, i) => (
              <div key={entry.user_id || i} className={`flex items-center gap-3 p-3 rounded-lg ${i < 3 ? "bg-amber-500/5 border border-amber-500/10" : "bg-white/[0.02]"}`}>
                <span className="text-lg w-8 text-center">{podiumCls(i)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 font-medium truncate">{entry.name}</div>
                  <div className="text-xs text-white/30 truncate">{entry.headline}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-400">{entry.score}</div>
                  <div className="text-[10px] text-white/30">{entry.tier?.replace(/_/g, ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked Premium Rankings */}
      {!hasPro && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LockedFeatureSection
            title="Industry Rankings"
            description="See how you rank against executives in your industry. Compare with peers in technology, finance, healthcare, and more."
            benefits={["Filter leaderboard by industry", "Compare with industry peers", "Identify industry-specific gaps"]}
            requiredPlan="professional"
            icon={Briefcase}
          />
          <LockedFeatureSection
            title="Country Rankings"
            description="Discover your ranking among executives in your country. Regional leaderboards show top leaders by geography."
            benefits={["Country-filtered leaderboards", "Regional comparison", "Local executive networks"]}
            requiredPlan="professional"
            icon={MapPin}
          />
          <LockedFeatureSection
            title="Functional Rankings"
            description="Rank yourself against executives with the same functional expertise — CIO, CFO, COO, and more."
            benefits={["Function-based rankings", "Role-specific benchmarks", "Peer group comparison"]}
            requiredPlan="professional"
            icon={TrendingUp}
          />
          <LockedFeatureSection
            title="Historical Rankings"
            description="Track your ranking progression over time. See how your reputation has grown month over month."
            benefits={["Historical rank tracking", "Trend visualization", "Progress milestones"]}
            requiredPlan="professional"
            icon={History}
          />
        </div>
      )}

      {/* Executive-tier locked rankings — only show if user has Pro but not Exec */}
      {hasPro && !hasExec && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LockedFeatureSection
            title="Enterprise Rankings"
            description="Organization-wide reputation rankings for enterprise teams. Compare leaders across your entire company."
            benefits={["Organization-wide rankings", "Team leaderboards", "Cross-department comparison"]}
            requiredPlan="executive"
            icon={Building2}
          />
          <LockedFeatureSection
            title="AI Ranking Insights"
            description="AI-powered analysis of your ranking trajectory, competitive position, and growth opportunities."
            benefits={["AI ranking analysis", "Competitive positioning", "Growth trajectory insights"]}
            requiredPlan="executive"
            icon={Sparkles}
          />
        </div>
      )}
    </div>
  );
}