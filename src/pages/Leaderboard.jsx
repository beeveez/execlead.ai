import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Trophy, Users, BookOpen, Share2, TrendingUp, Gift, ArrowRight, Crown } from "lucide-react";
import { SHARE_PLATFORMS, getUserReferralCode, getShareUrl } from "@/lib/socialShare";
import ShareButton from "@/components/social/ShareButton";

const PLATFORM_ICONS = {
  linkedin: "💼", twitter: "𝕏", facebook: "👍", threads: "@", bluesky: "☁",
  whatsapp: "📱", telegram: "✈", messenger: "💬", reddit: "🟠", email: "✉", copy: "🔗", native: "📲",
};

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [shareEvents, setShareEvents] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [topLearners, setTopLearners] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [events, refs, learners, authed] = await Promise.all([
          base44.entities.ShareEvent.list("-created_date", 500).catch(() => []),
          base44.entities.Referral.list("-created_date", 500).catch(() => []),
          base44.entities.UserProfile.filter({ status: "active" }, "-xp_points", 100).catch(() => []),
          base44.auth.isAuthenticated().then(ok => ok ? base44.auth.me() : null).catch(() => null),
        ]);
        setShareEvents(events);
        setReferrals(refs);
        setTopLearners(learners);
        setUser(authed);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  // Compute top referrers
  const referrerMap = {};
  referrals.forEach(r => {
    if (!r.referrer_user_id) return;
    if (!referrerMap[r.referrer_user_id]) {
      referrerMap[r.referrer_user_id] = { name: r.referrer_name || "Anonymous", id: r.referrer_user_id, invites: 0, conversions: 0 };
    }
    referrerMap[r.referrer_user_id].invites++;
    if (r.status === "converted") referrerMap[r.referrer_user_id].conversions++;
  });
  const topReferrers = Object.values(referrerMap).sort((a, b) => b.conversions - a.conversions || b.invites - a.invites).slice(0, 10);

  // Compute share analytics
  const platformCounts = {};
  let totalShares = shareEvents.length;
  shareEvents.forEach(e => {
    platformCounts[e.platform] = (platformCounts[e.platform] || 0) + 1;
  });
  const topPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const typeCounts = {};
  shareEvents.forEach(e => {
    typeCounts[e.achievement_type] = (typeCounts[e.achievement_type] || 0) + 1;
  });
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const referralCode = user ? getUserReferralCode(user.id) : null;
  const referralLink = referralCode ? getShareUrl(referralCode) : "";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  }

  const podiumCls = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Trophy size={12} className="text-amber-400" /> Viral Growth Engine
        </div>
        <h1 className="text-2xl font-bold text-white">Leaderboard & Share Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Top referrers, executive learners, and marketplace contributors across the EXECLEAD.AI community.</p>
      </div>

      {/* Share CTA */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Share2 size={16} className="text-indigo-400" /> Share EXECLEAD.AI</h3>
          <p className="text-white/40 text-xs mt-1">Advance your executive career with EXECLEAD.AI — share with your network.</p>
        </div>
        <div className="flex items-center gap-3">
          {referralLink && (
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 max-w-xs">
              <input readOnly value={referralLink} className="flex-1 bg-transparent text-xs text-white/40 focus:outline-none truncate" />
            </div>
          )}
          <ShareButton shareType="referral" label="Share Referral Link" className="bg-indigo-500 hover:bg-indigo-600 text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Shares", value: totalShares, icon: Share2, color: "text-indigo-400" },
          { label: "Referrals Sent", value: referrals.length, icon: Users, color: "text-cyan-400" },
          { label: "Conversions", value: referrals.filter(r => r.status === "converted").length, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Active Learners", value: topLearners.length, icon: BookOpen, color: "text-violet-400" },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <s.icon size={16} className={s.color} />
            <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2"><Users size={14} className="text-cyan-400" /> Top Referrers</h3>
          {topReferrers.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No referrals yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {topReferrers.map((r, i) => (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-lg ${i < 3 ? "bg-amber-500/5 border border-amber-500/10" : "bg-white/[0.02]"}`}>
                  <span className="text-lg w-8 text-center">{podiumCls(i)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 font-medium truncate">{r.name}</div>
                    <div className="text-xs text-white/30">{r.invites} invites · {r.conversions} conversions</div>
                  </div>
                  {i < 3 && <Crown size={14} className="text-amber-400" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Learners */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2"><BookOpen size={14} className="text-violet-400" /> Top Executive Learners</h3>
          {topLearners.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No learners yet.</p>
          ) : (
            <div className="space-y-2">
              {topLearners.slice(0, 10).map((l, i) => (
                <div key={l.id} className={`flex items-center gap-3 p-3 rounded-lg ${i < 3 ? "bg-violet-500/5 border border-violet-500/10" : "bg-white/[0.02]"}`}>
                  <span className="text-lg w-8 text-center">{podiumCls(i)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 font-medium truncate">{l.full_name || l.preferred_name || l.first_name || "Executive Learner"}</div>
                    <div className="text-xs text-white/30">{l.sessions_completed || 0} sessions · {l.challenges_completed || 0} challenges</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-violet-400">{l.xp_points || 0}</div>
                    <div className="text-[10px] text-white/30">XP</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Platforms */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2"><Share2 size={14} className="text-indigo-400" /> Top Sharing Channels</h3>
          {topPlatforms.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No shares tracked yet.</p>
          ) : (
            <div className="space-y-3">
              {topPlatforms.map(([platform, count]) => {
                const pct = totalShares > 0 ? Math.round((count / totalShares) * 100) : 0;
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white/60 flex items-center gap-1.5">
                        <span>{PLATFORM_ICONS[platform] || "📤"}</span>
                        {SHARE_PLATFORMS[platform]?.label || platform}
                      </span>
                      <span className="text-white/40">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500/50 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Most Shared */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-400" /> Most Shared Content</h3>
          {topTypes.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <span className="text-sm text-white/60 capitalize">{type?.replace(/_/g, " ")}</span>
                  <span className="text-xs text-white/40">{count} shares</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rewards Link */}
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift size={20} className="text-amber-400" />
          <div>
            <h3 className="text-white font-semibold text-sm">Referral Rewards</h3>
            <p className="text-white/40 text-xs">Earn free months, plan upgrades, and exclusive rewards.</p>
          </div>
        </div>
        <Link to="/pricing" className="flex items-center gap-1.5 text-amber-400 text-sm hover:text-amber-300">
          View Rewards <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}