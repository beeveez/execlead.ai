import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { orchestrateJourney } from "@/lib/journeyOrchestratorEngine";
import { Compass, LayoutDashboard, Code2 } from "lucide-react";
import OrchestratorSkeleton from "@/components/journey-orchestrator/OrchestratorSkeleton";
import JourneyStageHero from "@/components/journey-orchestrator/JourneyStageHero";
import MissionBoard from "@/components/journey-orchestrator/MissionBoard";
import MilestoneTracker from "@/components/journey-orchestrator/MilestoneTracker";
import JourneyTimeline from "@/components/journey-orchestrator/JourneyTimeline";
import AdaptiveLearningPath from "@/components/journey-orchestrator/AdaptiveLearningPath";
import CoachingFocus from "@/components/journey-orchestrator/CoachingFocus";
import CareerGoalCard from "@/components/journey-orchestrator/CareerGoalCard";
import CurrentObjectiveCard from "@/components/journey-orchestrator/CurrentObjectiveCard";
import FutureVisionCard from "@/components/journey-orchestrator/FutureVisionCard";
import CareerDestinationCard from "@/components/journey-orchestrator/CareerDestinationCard";
import JourneyHistoryCard from "@/components/journey-orchestrator/JourneyHistoryCard";
import ExecutiveStatusBar from "@/components/shared/ExecutiveStatusBar";
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-1">
            <Compass size={12} /> Executive Journey Orchestrator™
          </div>
          <h1 className="text-2xl font-bold text-white -mt-1">Your Leadership Journey</h1>
          <p className="text-white/40 text-sm mt-1 max-w-3xl">
            Where is my leadership journey going, and what major milestone comes next?
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
          <ExecutiveStatusBar />
          <JourneyStageHero data={orchestration} user={user} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CareerGoalCard goal={orchestration.careerGoal} readiness={orchestration.readiness} />
            <CurrentObjectiveCard coachingFocus={orchestration.coachingFocus} bottleneck={orchestration.bottleneck} />
          </div>

          <JourneyTimeline timeline={orchestration.timeline} />
          <MilestoneTracker milestones={orchestration.milestones} />
          <MissionBoard missions={orchestration.missions} />
          <AdaptiveLearningPath path={orchestration.learningPath} />
          <CoachingFocus focus={orchestration.coachingFocus} bottleneck={orchestration.bottleneck} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FutureVisionCard predictions={orchestration.predictions} stage={orchestration.stage} />
            <CareerDestinationCard goal={orchestration.careerGoal} readiness={orchestration.readiness} milestones={orchestration.milestones} />
          </div>

          <JourneyHistoryCard milestones={orchestration.milestones} />
        </>
      )}
    </div>
  );
}