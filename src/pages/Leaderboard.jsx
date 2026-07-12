import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy, Users, Building2, Briefcase, Zap, Star,
  Award, TrendingUp, ArrowRight, Sparkles,
} from "lucide-react";
import { usePublicLeaderboardData } from "@/hooks/usePublicLeaderboardData";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import RankList from "@/components/leaderboard/RankList";
import ShareButton from "@/components/social/ShareButton";

export default function Leaderboard() {
  const { learners, organizations, companies, featuredExecutives, shareEvents } = usePublicLeaderboardData();

  const topLearners = (learners || []).slice(0, 10);
  const topOrgs = (organizations || []).slice(0, 10);
  const topCompanies = (companies || []).slice(0, 10);
  const featured = (featuredExecutives || []).slice(0, 6);

  // Success stories — recent shared achievements that have a title
  const successStories = (shareEvents || []).filter((e) => e.achievement_title).slice(0, 6);

  // Achievement highlights — most frequent achievement types shared
  const typeCounts = {};
  (shareEvents || []).forEach((e) => {
    if (e.achievement_type) typeCounts[e.achievement_type] = (typeCounts[e.achievement_type] || 0) + 1;
  });
  const achievementHighlights = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-20 space-y-10">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest mb-3">
          <Trophy size={14} /> Community Leaderboard
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Top Executives. Top Organizations.</h1>
        <p className="text-white/40 text-base mt-3 max-w-2xl mx-auto">
          Celebrating the leaders, learners, and companies driving executive excellence on EXECLEAD.AI.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Climb the rankings</h3>
          <p className="text-white/40 text-xs mt-1">Complete challenges, earn XP, and build your executive brand.</p>
        </div>
        <div className="flex items-center gap-3">
          <ShareButton shareType="landing" label="Share" className="bg-white/5 hover:bg-white/10 text-white/80" />
          <Link to="/register?redirect=/dashboard" className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Join Free <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Top Executive Learners + Weekly XP Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardSection icon={Users} iconColor="text-violet-400" title="Top Executive Learners" loading={learners === null} empty="No public learners yet.">
          <RankList
            items={topLearners}
            accent="violet"
            renderName={(l) => l.full_name || l.preferred_name || l.first_name || "Executive Learner"}
            renderMeta={(l) => `${l.sessions_completed || 0} sessions · ${l.challenges_completed || 0} challenges`}
            renderRight={(l) => <Metric value={l.xp_points || 0} label="XP" color="text-violet-400" />}
          />
        </LeaderboardSection>
        <LeaderboardSection icon={Zap} iconColor="text-amber-400" title="Weekly XP Rankings" loading={learners === null} empty="No XP data yet.">
          <RankList
            items={topLearners}
            accent="amber"
            renderName={(l) => l.full_name || l.preferred_name || l.first_name || "Executive Learner"}
            renderMeta={(l) => l.professional_headline || l.current_role || "Executive"}
            renderRight={(l) => <Metric value={l.xp_points || 0} label="XP" color="text-amber-400" />}
          />
        </LeaderboardSection>
      </div>

      {/* Top Organizations + Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardSection icon={Building2} iconColor="text-cyan-400" title="Top Organizations" loading={organizations === null} empty="No organizations yet.">
          <RankList
            items={topOrgs}
            accent="cyan"
            renderMeta={(o) => `${o.industry || "Enterprise"}${o.plan ? ` · ${o.plan} plan` : ""}`}
            renderRight={(o) => <Metric value={o.seats_used || 0} label="seats" color="text-cyan-400" />}
          />
        </LeaderboardSection>
        <LeaderboardSection icon={Briefcase} iconColor="text-indigo-400" title="Top Companies" loading={companies === null} empty="No companies yet.">
          <RankList
            items={topCompanies}
            accent="indigo"
            renderMeta={(c) => `${c.industry || "Corporate"}${c.headquarters || c.country ? ` · ${c.headquarters || c.country}` : ""}`}
            renderRight={(c) => <Metric value={c.employee_count || 0} label="employees" color="text-indigo-400" />}
          />
        </LeaderboardSection>
      </div>

      {/* Featured Executives */}
      <LeaderboardSection icon={Star} iconColor="text-amber-400" title="Featured Executives" loading={featuredExecutives === null} empty="No featured executives yet.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featured.map((ex) => (
            <div key={ex.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                {(ex.full_name || ex.first_name || "E").charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white/80 font-medium truncate flex items-center gap-1">
                  {ex.full_name || ex.preferred_name || "Executive"}
                  {ex.verified_executive && <Sparkles size={11} className="text-amber-400 shrink-0" />}
                </div>
                <div className="text-xs text-white/30 truncate">{ex.professional_headline || ex.current_role || "Executive Leader"}</div>
              </div>
            </div>
          ))}
        </div>
      </LeaderboardSection>

      {/* Success Stories + Achievement Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardSection icon={TrendingUp} iconColor="text-emerald-400" title="Success Stories" loading={shareEvents === null} empty="No stories shared yet.">
          <div className="space-y-2">
            {successStories.map((s, i) => (
              <div key={s.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                <Award size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-white/80 font-medium truncate">{s.achievement_title}</div>
                  <div className="text-xs text-white/30">{s.platform ? `Shared via ${s.platform}` : "Shared achievement"}</div>
                </div>
              </div>
            ))}
          </div>
        </LeaderboardSection>
        <LeaderboardSection icon={Award} iconColor="text-indigo-400" title="Achievement Highlights" loading={shareEvents === null} empty="No achievements yet.">
          <div className="flex flex-wrap gap-2">
            {achievementHighlights.map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-sm text-white/70 capitalize">{type?.replace(/_/g, " ")}</span>
                <span className="text-xs text-white/30">{count}</span>
              </div>
            ))}
          </div>
        </LeaderboardSection>
      </div>
    </div>
  );
}

function Metric({ value, label, color }) {
  return (
    <div className="text-right">
      <div className={`text-sm font-bold ${color}`}>{value.toLocaleString()}</div>
      <div className="text-[10px] text-white/30">{label}</div>
    </div>
  );
}