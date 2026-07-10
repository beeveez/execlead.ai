import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SectionNav from "@/components/intelligence/SectionNav";
import ProfileHeader from "@/components/intelligence/ProfileHeader";
import ReadinessHero from "@/components/intelligence/ReadinessHero";
import ExecutivePotential from "@/components/intelligence/ExecutivePotential";
import AIConfidence from "@/components/intelligence/AIConfidence";
import ExecutiveArchetype from "@/components/intelligence/ExecutiveArchetype";
import CompetencyRadar from "@/components/intelligence/CompetencyRadar";
import CareerReadiness from "@/components/intelligence/CareerReadiness";
import ReputationTrustCard from "@/components/intelligence/ReputationTrustCard";
import PlatformContribution from "@/components/intelligence/PlatformContribution";
import AIInsights from "@/components/intelligence/AIInsights";
import GrowthPlan from "@/components/intelligence/GrowthPlan";
import Benchmarking from "@/components/intelligence/Benchmarking";
import ProfileHistory from "@/components/intelligence/ProfileHistory";
import ExportProfile from "@/components/intelligence/ExportProfile";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import JourneyAchievements from "@/components/journey/JourneyAchievements";

export default function Journey() {
  const [journey, setJourney] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dna, setDna] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [learning, setLearning] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityError, setSecurityError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Get authenticated user — all data MUST resolve from this user's identity
        const user = await base44.auth.me();
        if (!user?.id) {
          setLoading(false);
          return;
        }

        // Batch 1: core intelligence data (backend filters by user.id)
        const [journeyRes, intelRes] = await Promise.all([
          base44.functions.invoke("manageJourney", { action: "compute" }),
          base44.functions.invoke("manageIntelligence", { action: "read" }),
        ]);
        setJourney(journeyRes.data);
        setIntelligence(intelRes.data);

        // Batch 2: supporting entity data — ALL filtered by authenticated user ID
        const [profiles, dnaList, repList, lessons] = await Promise.all([
          base44.entities.UserProfile.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
          base44.entities.LeadershipDNA.filter({ created_by_id: user.id }, "-created_date", 1).catch(() => []),
          base44.entities.ExecutiveReputation.filter({ user_id: user.id }, "-created_date", 1).catch(() => []),
          base44.entities.LessonProgress.filter({ created_by_id: user.id }, "-created_date", 100).catch(() => []),
        ]);

        // Defensive validation: ensure loaded profile belongs to the authenticated user
        const loadedProfile = profiles[0] || journeyRes.data?.profile || {};
        if (loadedProfile.created_by_id && loadedProfile.created_by_id !== user.id) {
          console.error("[SECURITY] Executive Intelligence Profile: profile owner mismatch", {
            authenticatedUserId: user.id,
            profileOwnerId: loadedProfile.created_by_id,
          });
          setSecurityError(true);
          setLoading(false);
          return;
        }

        setProfile(loadedProfile);
        setDna(dnaList[0]);
        setReputation(repList[0]);
        setLearning(lessons);

        // Derive impact from journey breakdown + reputation
        const breakdown = journeyRes.data?.breakdown || {};
        setImpact({
          letters: breakdown.letters?.count || repList[0]?.total_letters || 0,
          discussions: repList[0]?.total_comments || 0,
          mentorships: breakdown.mentorship?.count || 0,
          followers: 0,
          influence: repList[0]?.leadership_influence_pct || 0,
        });
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (securityError) {
    return (
      <div className="text-center py-20 text-white/30 text-sm">
        Unable to load your Executive Intelligence Profile. Please refresh or contact support.
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="text-center py-20 text-white/30 text-sm">
        Unable to load your Executive Intelligence Profile. Please try again later.
      </div>
    );
  }

  const readiness = intelligence?.readiness;
  const trust = intelligence?.trust;
  const forecast = intelligence?.forecast;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <TrendingUp size={12} className="text-indigo-400" />
          Executive Intelligence Profile™
        </div>
        <h1 className="text-2xl font-bold text-white">Your Living Executive Profile</h1>
        <p className="text-white/40 text-sm mt-1">The single source of truth for your executive journey — continuously evolving as you learn, practice, publish, and lead.</p>
      </div>

      <SectionNav />

      {/* Profile Header */}
      <section id="header">
        <ProfileHeader profile={profile} journey={journey} readiness={readiness} trust={trust} reputation={reputation} />
      </section>

      {/* Readiness Hero + Executive Potential */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section id="readiness" className="lg:col-span-2">
          <ReadinessHero readiness={readiness} />
        </section>
        <section id="potential">
          <ExecutivePotential forecast={forecast} readiness={readiness} />
        </section>
      </div>

      {/* AI Confidence */}
      <section id="confidence">
        <AIConfidence readiness={readiness} journey={journey} />
      </section>

      {/* Archetype + Competency Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section id="archetype">
          <ExecutiveArchetype dna={dna} />
        </section>
        <section id="competency">
          <CompetencyRadar dimensions={readiness?.dimensions} />
        </section>
      </div>

      {/* Career Readiness */}
      <section id="career">
        <CareerReadiness readiness={readiness} profile={profile} />
      </section>

      {/* Reputation + Trust */}
      <section id="reputation">
        <ReputationTrustCard reputation={reputation} trust={trust} />
      </section>

      {/* Learning + Impact */}
      <section id="impact">
        <PlatformContribution learning={learning} impact={impact} />
      </section>

      {/* AI Insights */}
      <section id="insights">
        <AIInsights journey={journey} intelligence={intelligence} />
      </section>

      {/* Growth Plan */}
      <section id="growth">
        <GrowthPlan recommendations={journey.recommendations} readiness={readiness} />
      </section>

      {/* Timeline + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section id="timeline" className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Executive Journey Timeline™</h3>
          <JourneyTimeline events={journey.timeline || []} />
        </section>
        <section id="achievements">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <JourneyAchievements achievements={journey.achievements} />
          </div>
        </section>
      </div>

      {/* Benchmarking + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section id="benchmarking">
          <Benchmarking readiness={readiness} />
        </section>
        <section id="history">
          <ProfileHistory journey={journey} intelligence={intelligence} />
        </section>
      </div>

      {/* Export */}
      <section id="export">
        <ExportProfile journey={journey} intelligence={intelligence} />
      </section>
    </div>
  );
}