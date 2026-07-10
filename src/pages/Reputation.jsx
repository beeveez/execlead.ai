import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { parseJSON } from "@/lib/reputationConfig";

import ReputationHero from "@/components/reputation/ReputationHero";
import LegacyScoreCard from "@/components/reputation/LegacyScoreCard";
import ScoreBreakdown from "@/components/reputation/ScoreBreakdown";
import BadgesShowcase from "@/components/reputation/BadgesShowcase";
import AICoach from "@/components/reputation/AICoach";
import ReputationUnlocks from "@/components/reputation/ReputationUnlocks";
import ExecutiveInsights from "@/components/reputation/ExecutiveInsights";
import Benchmarking from "@/components/reputation/Benchmarking";
import AuditHistory from "@/components/reputation/AuditHistory";
import ReputationHistory from "@/components/reputation/ReputationHistory";
import CommunityTrust from "@/components/reputation/CommunityTrust";
import ExecutiveInfluence from "@/components/reputation/ExecutiveInfluence";
import ExecutivePhilosophy from "@/components/reputation/ExecutivePhilosophy";

import CompetencyRadar from "@/components/legacy/CompetencyRadar";
import ReputationTimeline from "@/components/legacy/ReputationTimeline";
import AchievementsMilestones from "@/components/legacy/AchievementsMilestones";
import ReputationRecruiterView from "@/components/legacy/ReputationRecruiterView";

import { ArrowLeft, Loader2, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import LockedFeatureSection from "@/components/common/LockedFeatureSection";
import { usePlanTier } from "@/hooks/usePlanTier";

export default function Reputation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [rank, setRank] = useState(null);
  const { hasPro, hasExec } = usePlanTier();

  useEffect(() => {
    if (!user?.id) return;
    loadStatus();
  }, [user?.id]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "get_status", user_id: user.id });
      setData(res.data || res);
    } catch (e) {}
    setLoading(false);
    try {
      const rankRes = await base44.functions.invoke("manageReputation", { action: "get_community_rank", user_id: user.id });
      setRank((rankRes.data || rankRes));
    } catch (e) {}
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "recalculate", user_id: user.id });
      const d = res.data || res;
      if (d.success) {
        setData(prev => ({ ...prev, reputation: d.reputation }));
        const newItems = [...(d.new_badges || []), ...(d.new_achievements || []), ...(d.new_milestones || [])];
        if (newItems.length > 0) {
          toast({ title: `🎉 ${newItems.length} new unlock${newItems.length > 1 ? 's' : ''}!`, description: newItems.join(', ') });
        } else {
          toast({ title: "Reputation recalculated" });
        }
      }
    } catch (e) {
      toast({ title: "Failed to recalculate", variant: "destructive" });
    }
    setRecalculating(false);
  };

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const res = await base44.functions.invoke("manageReputation", { action: "generate_insights", user_id: user.id });
      const d = res.data || res;
      if (d.success) {
        setData(prev => ({ ...prev, reputation: { ...prev?.reputation, ai_executive_insights_json: JSON.stringify(d.insights), ai_insights_generated_at: new Date().toISOString() } }));
        toast({ title: "Executive insights generated" });
      }
    } catch (e) {
      toast({ title: "Failed to generate insights", variant: "destructive" });
    }
    setGeneratingInsights(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const rep = data?.reputation;
  const profile = data?.profile;
  const history = data?.history || [];
  const isAdmin = user?.role === 'admin';

  // Empty state — no reputation record yet
  if (!rep || rep.reputation_score === undefined) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Sparkles size={32} className="text-indigo-400 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-white/90 mb-2">Your Executive Reputation Awaits</h1>
        <p className="text-white/40 text-sm mb-6">Calculate your multi-dimensional reputation score to unlock badges, achievements, benchmarks, and AI insights.</p>
        <button onClick={handleRecalculate} disabled={recalculating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
          {recalculating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Calculate My Reputation
        </button>
      </div>
    );
  }

  const breakdown = parseJSON(rep.weighted_breakdown_json, []);
  const badges = parseJSON(rep.badges_json, []);
  const recommendations = parseJSON(rep.improvement_recommendations_json, []);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-white/40 hover:text-white/70">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white/90">Executive Reputation™</h1>
          <p className="text-white/40 text-xs mt-0.5">Your Professional Credit Score for Leadership</p>
        </div>
      </div>

      {rep.reputation_suspended && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          <AlertCircle size={14} /> Your reputation is suspended. Contact support to resolve.
        </div>
      )}

      <div className="space-y-6">
        <ReputationHero rep={rep} profile={profile} rank={rank} onRecalculate={handleRecalculate} recalculating={recalculating} />
        <LegacyScoreCard rep={rep} />
        <ScoreBreakdown breakdown={breakdown} score={rep.reputation_score} />
        <CompetencyRadar reputation={rep} />
        <ReputationTimeline reputation={rep} history={history} />
        {hasPro ? (
          <AICoach rep={rep} recommendations={recommendations} />
        ) : (
          <LockedFeatureSection
            title="AI Reputation Coach"
            description="Receive personalized recommendations to improve your Executive Reputation with AI-powered coaching."
            benefits={["Personalized coaching", "Reputation improvement roadmap", "Benchmark against executives", "Historical trend analysis"]}
            requiredPlan="professional"
          />
        )}
        <AchievementsMilestones reputation={rep} />
        <BadgesShowcase badges={badges} />
        <CommunityTrust rep={rep} />
        <ExecutiveInfluence rep={rep} />
        <ReputationUnlocks rep={rep} badges={badges} isAdmin={isAdmin} profile={profile} />
        {hasExec ? (
          <ExecutiveInsights rep={rep} onGenerate={handleGenerateInsights} generating={generatingInsights} />
        ) : (
          <LockedFeatureSection
            title="Executive Insights"
            description="AI-generated qualitative analysis of your executive strengths, growth areas, and learning recommendations."
            benefits={["AI strengths analysis", "Growth area identification", "Personalized learning recommendations", "Mentoring suggestions"]}
            requiredPlan="executive"
          />
        )}
        {hasPro ? (
          <Benchmarking rep={rep} rank={rank} />
        ) : (
          <LockedFeatureSection
            title="Reputation Benchmarking"
            description="Compare your reputation scores against community averages and track your percentile ranking."
            benefits={["Community percentile ranking", "Peer comparison", "Performance gap analysis"]}
            requiredPlan="professional"
          />
        )}
        {hasExec ? (
          <ReputationRecruiterView userId={user.id} />
        ) : (
          <LockedFeatureSection
            title="Recruiter Visibility"
            description="Make your executive reputation visible to recruiters and hiring managers with a professional summary view."
            benefits={["Recruiter-ready profile", "Executive credibility score", "Leadership strengths summary", "Professional verification"]}
            requiredPlan="executive"
          />
        )}
        {hasPro ? (
          <ReputationHistory rep={rep} history={history} />
        ) : (
          <LockedFeatureSection
            title="Reputation History"
            description="Track your leadership growth over time and identify improvement opportunities with historical trend analysis."
            benefits={["Historical score tracking", "Growth trend visualization", "Milestone markers", "Performance statistics"]}
            requiredPlan="professional"
          />
        )}
        <AuditHistory history={history} />
        <ExecutivePhilosophy rep={rep} />
      </div>
    </div>
  );
}