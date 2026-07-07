import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Crown, Sparkles, CreditCard, Gift, Clock } from "lucide-react";
import ExecutiveIdentityCard from "@/components/brand/ExecutiveIdentityCard";
import AchievementGallery from "@/components/brand/AchievementGallery";
import DigitalBusinessCard from "@/components/brand/DigitalBusinessCard";
import ReferralDashboard from "@/components/brand/ReferralDashboard";
import ExecutiveTimeline from "@/components/brand/ExecutiveTimeline";

const TABS = [
  { id: "identity", label: "Identity", icon: Crown },
  { id: "achievements", label: "Achievements", icon: Sparkles },
  { id: "card", label: "Business Card", icon: CreditCard },
  { id: "referrals", label: "Referrals", icon: Gift },
  { id: "timeline", label: "Timeline", icon: Clock },
];

export default function ExecutiveBrandCenter() {
  const { profile, loading } = useSubscription();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("identity");
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile) return;
    const ms = [];
    if (profile.promotion_readiness > 0) ms.push({ title: `Reached ${profile.promotion_readiness}% Promotion Readiness`, badge: "📈", color: "#06b6d4", type: "promotion_readiness", date: profile.last_active_date });
    if (profile.sessions_completed > 0) ms.push({ title: `Completed ${profile.sessions_completed} coaching sessions`, badge: "💬", color: "#6366f1", type: "simulator_result" });
    if (profile.challenges_completed > 0) ms.push({ title: `Completed ${profile.challenges_completed} executive challenges`, badge: "⚔️", color: "#6366f1", type: "interview_score" });
    if (profile.streak_days > 0) ms.push({ title: `${profile.streak_days}-day learning streak`, badge: "🔥", color: "#f97316", type: "learning_streak" });
    if (profile.xp_points > 0) ms.push({ title: `Earned ${profile.xp_points} XP points`, badge: "⭐", color: "#f59e0b", type: "career_milestone" });
    setMilestones(ms);
  }, [profile]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Crown size={12} className="text-amber-400" /> Executive Brand Center™ 2.0
        </div>
        <h1 className="text-2xl font-bold text-white">Your Executive Identity</h1>
        <p className="text-white/40 text-sm mt-1">Build your professional brand, share achievements, and grow your network.</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "identity" && <ExecutiveIdentityCard profile={profile} />}
        {tab === "achievements" && <AchievementGallery profile={profile} user={user} />}
        {tab === "card" && <DigitalBusinessCard profile={profile} user={user} />}
        {tab === "referrals" && <ReferralDashboard user={user} />}
        {tab === "timeline" && <ExecutiveTimeline profile={profile} milestones={milestones} />}
      </div>
    </div>
  );
}