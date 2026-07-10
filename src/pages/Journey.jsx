import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import JourneyAchievements from "@/components/journey/JourneyAchievements";
import JourneyStreaks from "@/components/journey/JourneyStreaks";
import JourneyRecommendations from "@/components/journey/JourneyRecommendations";
import WeeklyDigest from "@/components/journey/WeeklyDigest";
import CareerImpact from "@/components/journey/CareerImpact";
import EnterpriseJourneyView from "@/components/journey/EnterpriseJourneyView";

const BREAKDOWN_LABELS = {
  leadership_dna: { label: "Leadership DNA™", icon: "🧬" },
  letters: { label: "Leadership Letters", icon: "✍️" },
  simulations: { label: "Executive Simulations", icon: "🎯" },
  academy: { label: "Academy Modules", icon: "📚" },
  challenges: { label: "Executive Challenges", icon: "⚔️" },
  identity_verified: { label: "Identity Verified", icon: "✅" },
  professional_verification: { label: "Professional Verification", icon: "🏅" },
  reputation: { label: "Reputation Milestones", icon: "⭐" },
  mentorship: { label: "Mentorship", icon: "🤝" },
  resume: { label: "Resume Completed", icon: "📄" },
  weekly_streak: { label: "Weekly Streaks", icon: "🔥" },
  community_recognition: { label: "Community Recognition", icon: "🏆" },
};

export default function Journey() {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("timeline");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke("manageJourney", { action: "compute" });
        setJourney(res.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (!journey) {
    return <div className="text-center py-20 text-white/30 text-sm">Unable to load your Executive Journey. Please try again later.</div>;
  }

  const { level, totalPoints, breakdown, timeline, achievements, recommendations, estimatedDays, streaks, digest } = journey;
  const activeBreakdown = Object.entries(breakdown).filter(([, v]) => v.count > 0);

  const tabs = [
    { id: "timeline", label: "Timeline" },
    { id: "achievements", label: "Achievements" },
    { id: "streaks", label: "Streaks" },
    { id: "digest", label: "Weekly Digest" },
    { id: "career", label: "Career Impact" },
    { id: "enterprise", label: "Enterprise" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <TrendingUp size={12} className="text-indigo-400" />
          Executive Journey Engine™
        </div>
        <h1 className="text-2xl font-bold text-white">Your Executive Journey</h1>
        <p className="text-white/40 text-sm mt-1">One Leadership Journey. One AI Platform. Every action contributes to your growth.</p>
      </div>

      {/* Journey Overview */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Current Level</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{level.current.icon}</span>
              <div>
                <div className="text-white font-bold text-xl">{level.current.title}</div>
                <div className="text-white/40 text-xs">{totalPoints.toLocaleString()} Journey Points · {level.journeyPercent}% of journey</div>
              </div>
            </div>
          </div>
          {level.next && (
            <div className="text-right">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Next Milestone</div>
              <div className="text-white/60 text-sm font-medium flex items-center gap-1 justify-end">
                <span className="text-lg">{level.next.icon}</span> {level.next.title}
              </div>
              <div className="text-white/30 text-xs">{level.pointsToNext.toLocaleString()} points to go</div>
              {estimatedDays != null && (
                <div className="flex items-center gap-1 justify-end mt-1 text-cyan-400 text-xs">
                  <Clock size={10} /> ~{estimatedDays} days estimated
                </div>
              )}
            </div>
          )}
        </div>

        {/* Journey progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
            <span>Journey Progress</span>
            <span>{level.journeyPercent}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${level.journeyPercent}%` }} />
          </div>
        </div>

        {/* Level progress */}
        {level.next && (
          <div>
            <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
              <span>Level Progress</span>
              <span>{level.progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${level.progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Points Breakdown */}
      {activeBreakdown.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Journey Points Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeBreakdown.map(([key, data]) => {
              const meta = BREAKDOWN_LABELS[key] || { label: key, icon: "⭐" };
              return (
                <div key={key} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="text-white/60 text-xs font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">×{data.count}</span>
                    <span className="text-emerald-400 text-sm font-bold">+{data.points}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <JourneyRecommendations recommendations={recommendations} level={level} estimatedDays={estimatedDays} />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? "text-white border-indigo-500" : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {tab === "timeline" && <JourneyTimeline events={timeline || []} />}
        {tab === "achievements" && <JourneyAchievements achievements={achievements} />}
        {tab === "streaks" && <JourneyStreaks streaks={streaks} />}
        {tab === "digest" && <WeeklyDigest digest={digest} />}
        {tab === "career" && <CareerImpact journey={journey} />}
        {tab === "enterprise" && <EnterpriseJourneyView />}
      </div>
    </div>
  );
}