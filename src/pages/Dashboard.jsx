import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Brain, MessageSquare, GraduationCap, Scale, PenLine, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { buildCommandCenter } from "@/lib/executiveReadinessEngine";
import ExecutiveStatusBar from "@/components/shared/ExecutiveStatusBar";
import ReadinessCommandHero from "@/components/dashboard/command-center/ReadinessCommandHero";
import TodaysExecutiveMission from "@/components/dashboard/command-center/TodaysExecutiveMission";
import MissionFirstHero from "@/components/dashboard/MissionFirstHero";
import LeadershipJourneyCard from "@/components/dashboard/command-center/LeadershipJourneyCard";
import GrowthTimelineCard from "@/components/dashboard/command-center/GrowthTimelineCard";
import ReadinessLoop from "@/components/dashboard/command-center/ReadinessLoop";
import ModuleEvidenceMap from "@/components/dashboard/command-center/ModuleEvidenceMap";
import EngagementBreadthCard from "@/components/dashboard/command-center/EngagementBreadthCard";
import { useReadinessEvidence } from "@/hooks/useReadinessEvidence";
import EvidenceDashboardSummary from "@/components/readiness-evidence/EvidenceDashboardSummary";
import EvidenceCompositionPanel from "@/components/readiness-evidence/EvidenceCompositionPanel";
import ExecutiveInsightPanel from "@/components/readiness-evidence/ExecutiveInsightPanel";
import ReadinessEvidenceTimeline from "@/components/readiness-evidence/ReadinessEvidenceTimeline";
import ExplainMyScorePanel from "@/components/readiness-evidence/ExplainMyScorePanel";
import EvidenceQualityDashboard from "@/components/readiness-evidence/EvidenceQualityDashboard";
import CompetencyReliabilityPanel from "@/components/readiness-evidence/CompetencyReliabilityPanel";
import EvidenceGapDashboard from "@/components/readiness-evidence/EvidenceGapDashboard";
import CompetencyCoveragePanel from "@/components/readiness-evidence/CompetencyCoveragePanel";
import OutcomeIntelligenceSummary from "@/components/outcome-intelligence/OutcomeIntelligenceSummary";
import ReadinessAssessmentCTA from "@/components/readiness-assessment/ReadinessAssessmentCTA";

/**
 * Dashboard — Executive Command Center.
 *
 * The first screen every user sees answers the four questions:
 *   1. Where am I today?         → ReadinessCommandHero
 *   2. What should I do next?    → TodaysExecutiveMission
 *   3. How much have I improved? → GrowthTimelineCard + readiness deltas
 *   4. What should I focus on?   → LeadershipJourneyCard + ReadinessLoop
 *
 * The entire platform revolves around one outcome: Become Executive Ready.
 */
const QUICK_ACTIONS = [
  { path: "/challenge", label: "Challenge", desc: "Test readiness", icon: Swords, color: "from-indigo-600 to-violet-600" },
  { path: "/simulator", label: "Simulator", desc: "Run a scenario", icon: Brain, color: "from-cyan-600 to-blue-600" },
  { path: "/debate", label: "Debate", desc: "Defend a position", icon: Scale, color: "from-red-600 to-orange-600" },
  { path: "/coach", label: "AI Coach", desc: "Get coached 24/7", icon: MessageSquare, color: "from-emerald-600 to-teal-600" },
  { path: "/academy", label: "Academy", desc: "Daily lessons", icon: GraduationCap, color: "from-amber-600 to-orange-600" },
  { path: "/journal", label: "Journal", desc: "Reflect & track", icon: PenLine, color: "from-pink-600 to-rose-600" },
];

export default function Dashboard() {
  const { profile, loading: loadingProfile } = useSubscription();
  const [intelligence, setIntelligence] = useState(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(true);
  const { readiness, insights, timeline, summary } = useReadinessEvidence();

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("manageIntelligence", { action: "compute" });
        setIntelligence(res.data);
      } catch (e) {
        console.error("[Dashboard] intelligence load failed:", e.message);
      }
      setLoadingIntelligence(false);
    })();
  }, []);

  if (loadingProfile || !profile || loadingIntelligence) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-white/40 text-sm">Loading your Executive Command Center…</span>
      </div>
    );
  }

  const command = buildCommandCenter(intelligence || {}, profile);
  const activeLoop = 0;

  return (
    <div className="space-y-6">
      <MissionFirstHero mission={command.mission} />
      <ExecutiveStatusBar />

      <ReadinessAssessmentCTA />

      {/* Phase 2 — Evidence-based readiness summary */}
      {summary && <EvidenceDashboardSummary summary={summary} />}

      {/* 1. Where am I today? + How much have I improved? */}
      <ReadinessCommandHero command={command} />

      {/* 2. What should I do next? + 4. What should I focus on? */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysExecutiveMission mission={command.mission} />
        <LeadershipJourneyCard journey={command.journey} />
      </div>

      {/* Executive Readiness Loop™ — the operating rhythm */}
      <ReadinessLoop activeIndex={activeLoop} />

      {/* 3. How much have I improved? — recent growth signals */}
      <GrowthTimelineCard />

      {/* Module Evidence Map — every module builds readiness */}
      <ModuleEvidenceMap evidenceMap={command.evidenceMap} />

      {/* Engagement breadth — proves every module feeds the engine */}
      <EngagementBreadthCard engagement={command.engagement} loopLength={command.loop?.length} />

      {/* Phase 2 — Evidence composition + insight engine + timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvidenceCompositionPanel readiness={readiness} />
        <ExecutiveInsightPanel insights={insights} />
      </div>
      <ReadinessEvidenceTimeline timeline={timeline} compact />

      {/* Phase 2 — Evidence Provenance Standard™: Explain My Score */}
      <ExplainMyScorePanel />

      {/* ERI — Evidence Quality Dashboard™ */}
      <EvidenceQualityDashboard />

      {/* ERI — Competency Reliability™ */}
      {readiness?.competencyBreakdown?.length > 0 && (
        <CompetencyReliabilityPanel competencies={readiness.competencyBreakdown.map((c) => c.competency)} />
      )}

      {/* Evidence Gap Analysis™ — proactive readiness development */}
      <EvidenceGapDashboard />

      {/* Competency Coverage™ — per-competency gap detail */}
      <CompetencyCoveragePanel />

      {/* Phase 4 — Executive Outcome Intelligence™: from evidence to outcomes */}
      <OutcomeIntelligenceSummary />

      {/* Focus areas — what to improve next */}
      {command.focusAreas.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold text-sm">Focus Areas to Accelerate Readiness</h3>
            <span className="text-[10px] text-white/30">Lowest-scoring dimensions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {command.focusAreas.map((dim) => (
              <div key={dim.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-xs font-medium">{dim.label}</span>
                  <span className="text-rose-400 text-sm font-bold">{dim.score}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: `${dim.score}%` }} />
                </div>
                <p className="text-white/40 text-[11px] leading-snug">{dim.recommendation || `Close the ${dim.gap}-point gap to reach benchmark.`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions — module entry points */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Continue Your Journey</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div key={action.path} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={action.path} className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon size={16} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-0.5 group-hover:text-indigo-400 transition-colors">{action.label}</h3>
                <p className="text-white/30 text-xs">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}