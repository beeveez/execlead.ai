import React, { useMemo, useState } from "react";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { useGuardian } from "@/lib/GuardianContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { useAuth } from "@/lib/AuthContext";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import { computeFounderSnapshot } from "@/lib/founderMissionControl";
import ScoreRing from "@/components/founder-mc/ScoreRing";
import PlatformOverview from "@/components/founder-mc/PlatformOverview";
import StreamProgress from "@/components/founder-mc/StreamProgress";
import EngineeringHealth from "@/components/founder-mc/EngineeringHealth";
import ExecBriefing from "@/components/founder-mc/ExecBriefing";
import EnterpriseReadiness from "@/components/founder-mc/EnterpriseReadiness";
import ProductStatus from "@/components/founder-mc/ProductStatus";
import AIIntelligence from "@/components/founder-mc/AIIntelligence";
import LaunchReadiness from "@/components/founder-mc/LaunchReadiness";
import FounderKPIs from "@/components/founder-mc/FounderKPIs";
import Roadmap from "@/components/founder-mc/Roadmap";
import ExecCopilot from "@/components/founder-mc/ExecCopilot";
import ExplainableScoresSection from "@/components/score/ExplainableScoresSection";
import ScoreExplainableDrawer from "@/components/score/ScoreExplainableDrawer";
import { Shield, Trophy } from "lucide-react";

export default function ExecutivePlatformStatus() {
  const state = usePlatformState();
  const guardian = useGuardian();
  const { canAccessDeveloper } = useDeveloper();
  const { user } = useAuth();
  const concierge = useExecConcierge();

  const snapshot = useMemo(() => {
    const runtime = {
      hasMemory: (concierge.messages?.length || 0) > 0,
      hasUserContext: !!concierge.userContext,
      hasExecutiveMemory: !!concierge.hasExecutiveMemory,
      hasLongTermRecall: !!concierge.hasLongTermRecall,
      hasScheduledSync: true,
      personaResolved: !!concierge.workspacePersona,
      pageContextResolved: !!concierge.pageContext,
      conversationLength: concierge.messages?.length || 0,
      learnedPreferences: concierge.learnedPreferences,
    };
    return computeFounderSnapshot(state, guardian, runtime);
  }, [state, guardian, concierge.userContext, concierge.messages, concierge.workspacePersona, concierge.pageContext, concierge.learnedPreferences]);
  const [heroExplain, setHeroExplain] = useState(false);

  if (!canAccessDeveloper) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Developer Access Required</h2>
          <p className="text-white/30 text-sm">Executive Platform Status™ is restricted to Developer and Super Admin roles.</p>
        </div>
      </div>
    );
  }

  if (state.safeMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  const { overview, launch } = snapshot;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-white/[0.02] to-transparent border border-indigo-500/10 rounded-2xl p-6 flex items-center gap-6 flex-wrap">
        <button type="button" onClick={() => setHeroExplain(true)} className="cursor-pointer hover:opacity-80 transition-opacity" title="Click to explain Platform Health™">
          <ScoreRing score={overview.platformHealth} size={90} label="Health" />
        </button>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-amber-400" />
            <h1 className="text-xl font-bold text-white">Executive Platform Status™</h1>
          </div>
          <p className="text-white/50 text-sm">Founder Mission Control™ — the single executive view of the entire EXECLEAD.AI platform.</p>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-white/40">v{overview.version} · Build {overview.buildNumber}</span>
            <span className="text-white/20">·</span>
            <span style={{ color: launch.color }}>{launch.levelShort} — {launch.levelName}</span>
            <span className="text-white/20">·</span>
            <span className="text-white/40">{overview.executionStream}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Launch Readiness</div>
          <div className="text-2xl font-bold" style={{ color: launch.color }}>{launch.score}%</div>
          <div className="text-[10px]" style={{ color: launch.color }}>{launch.launchReady ? "✓ Launch Ready" : "Not Yet Ready"}</div>
        </div>
      </div>

      {/* Section 1: Platform Overview */}
      <PlatformOverview overview={overview} />

      {/* Section 2: Executive Stream Intelligence™ */}
      <StreamProgress streams={snapshot.streams} snapshot={snapshot} user={user} />

      {/* Section 2b: Explainable Platform Scores™ */}
      <ExplainableScoresSection snapshot={snapshot} user={user} />

      {/* Section 3: Engineering Health */}
      <EngineeringHealth engineering={snapshot.engineering} />

      {/* Section 4: EXEC™ Daily Briefing */}
      <ExecBriefing snapshot={snapshot} />

      {/* Section 5 & 8 side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnterpriseReadiness snapshot={snapshot} user={user} />
        <LaunchReadiness launch={launch} />
      </div>

      {/* Section 6: Product Status */}
      <ProductStatus products={snapshot.products} />

      {/* Section 7: AI Intelligence */}
      <AIIntelligence aiIntelligence={snapshot.aiIntelligence} />

      {/* Section 9: Founder KPIs */}
      <FounderKPIs kpis={snapshot.kpis} />

      {/* Section 10: Roadmap */}
      <Roadmap roadmap={snapshot.roadmap} />

      {/* Section 11: EXEC™ Founder Copilot */}
      <ExecCopilot snapshot={snapshot} />

      {/* Section 12: Success — closing vision */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
        <p className="text-white/30 text-xs">
          Executive Platform Status™ — the single source of truth for Engineering, Architecture, Product, AI, Enterprise, Launch, and Strategy.
        </p>
      </div>

      {/* Hero Score Explainable Drawer */}
      {heroExplain && (
        <ScoreExplainableDrawer scoreId="platform_health" snapshot={snapshot} user={user} onClose={() => setHeroExplain(false)} />
      )}
    </div>
  );
}