import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { orchestrateJourney } from "@/lib/journeyOrchestratorEngine";
import { Compass, LayoutDashboard, Code2 } from "lucide-react";
import OrchestratorSkeleton from "@/components/journey-orchestrator/OrchestratorSkeleton";
import JourneyStageHero from "@/components/journey-orchestrator/JourneyStageHero";
import NextBestAction from "@/components/journey-orchestrator/NextBestAction";
import MissionBoard from "@/components/journey-orchestrator/MissionBoard";
import MilestoneTracker from "@/components/journey-orchestrator/MilestoneTracker";
import JourneyTimeline from "@/components/journey-orchestrator/JourneyTimeline";
import AdaptiveLearningPath from "@/components/journey-orchestrator/AdaptiveLearningPath";
import CoachingFocus from "@/components/journey-orchestrator/CoachingFocus";
import EngagementMetrics from "@/components/journey-orchestrator/EngagementMetrics";
import PredictiveInsights from "@/components/journey-orchestrator/PredictiveInsights";
import DeveloperJourneyDashboard from "@/components/journey-orchestrator/DeveloperJourneyDashboard";

export default function ExecutiveJourneyOrchestrator() {
  const { user } = useAuth();
  const { developerMode } = useDeveloper();
  const [orchestration, setOrchestration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("executive");

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    orchestrateJourney(user)
      .then((result) => { if (!cancelled) setOrchestration(result); })
      .catch(() => { if (!cancelled) setOrchestration(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const showDevTab = developerMode || ["developer", "super_admin", "platform_admin", "admin"].includes(user?.role);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-1">
            <Compass size={12} /> Executive Journey Orchestrator™
          </div>
          <h1 className="text-2xl font-bold text-white -mt-1">Your Leadership Journey</h1>
          <p className="text-white/40 text-sm mt-1 max-w-3xl">
            One question drives every recommendation: <span className="text-white/60 italic">"What is the next best step on this leadership journey?"</span>
          </p>
        </div>
        {showDevTab && (
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setView("executive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "executive" ? "bg-indigo-500/20 text-indigo-300" : "text-white/40 hover:text-white/60"}`}
            >
              <LayoutDashboard size={12} /> Executive
            </button>
            <button
              onClick={() => setView("developer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "developer" ? "bg-emerald-500/20 text-emerald-300" : "text-white/40 hover:text-white/60"}`}
            >
              <Code2 size={12} /> Developer
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <OrchestratorSkeleton />
      ) : !orchestration ? (
        <div className="text-center py-16 text-white/40">
          <Compass size={32} className="mx-auto mb-3 text-white/20" />
          <p>Unable to load your journey orchestration. Please try again.</p>
        </div>
      ) : view === "developer" ? (
        <DeveloperJourneyDashboard />
      ) : (
        <>
          <JourneyStageHero data={orchestration} user={user} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <NextBestAction action={orchestration.nextBestAction} />
              <MissionBoard missions={orchestration.missions} />
              <JourneyTimeline timeline={orchestration.timeline} />
              <AdaptiveLearningPath path={orchestration.learningPath} />
            </div>
            <div className="space-y-6">
              <CoachingFocus focus={orchestration.coachingFocus} bottleneck={orchestration.bottleneck} />
              <EngagementMetrics metrics={orchestration.engagement} />
              <MilestoneTracker milestones={orchestration.milestones} />
              <PredictiveInsights predictions={orchestration.predictions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}