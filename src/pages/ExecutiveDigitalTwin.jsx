import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { buildDigitalTwin, runScenario, SCENARIO_TEMPLATES } from '@/lib/executiveDigitalTwinEngine';
import { Loader2, Brain, Sparkles } from 'lucide-react';
import DigitalTwinHero from '@/components/digital-twin/DigitalTwinHero';
import LeadershipForecast from '@/components/digital-twin/LeadershipForecast';
import ScenarioSimulator from '@/components/digital-twin/ScenarioSimulator';
import CareerTrajectory from '@/components/digital-twin/CareerTrajectory';
import TwinIntelligence from '@/components/digital-twin/TwinIntelligence';
import RecommendationEngine from '@/components/digital-twin/RecommendationEngine';

export default function ExecutiveDigitalTwin() {
  const { user } = useAuth();
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [runningScenario, setRunningScenario] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [verificationRecs, logs, evidence, credentials, leadershipDNA, portfolioVersions, journeyEvents, lessonProgress, simulations, achievements, competencies, profiles] = await Promise.all([
        base44.entities.IdentityVerification.filter({ user_id: user.id }).catch(() => []),
        base44.entities.VerificationLog.filter({ user_id: user.id }, '-created_date', 100).catch(() => []),
        base44.entities.EvidenceItem.filter({}, '-created_date', 100).catch(() => []),
        base44.entities.ExecutiveCredential.list('-created_date', 100).catch(() => []),
        base44.entities.LeadershipDNA.filter({ user_id: user.id }).catch(() => []),
        base44.entities.PortfolioVersion.list('-created_date', 20).catch(() => []),
        base44.entities.JourneyEvent.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.LessonProgress.filter({ user_id: user.id }).catch(() => []),
        base44.entities.SimulationSession.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.Achievement.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.ExecutiveCompetency.filter({ user_id: user.id }).catch(() => []),
        base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []),
      ]);

      const verification = verificationRecs[0] || null;
      const profile = profiles?.[0] || {};

      const built = buildDigitalTwin({
        user,
        verification,
        logs,
        evidence,
        credentials,
        leadershipDNA: leadershipDNA?.[0] || null,
        portfolioVersions,
        journeyEvents,
        lessonProgress,
        simulations,
        achievements,
        competencies,
        profile,
      });

      setTwin(built);
    } catch (e) {
      // error
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleRunScenario = async (scenarioId) => {
    if (!twin) return;
    setRunningScenario(scenarioId);
    setScenarioResult(null);
    // Small delay for UX
    await new Promise(r => setTimeout(r, 600));
    const result = runScenario(twin, scenarioId);
    setScenarioResult(result);
    setRunningScenario(null);
  };

  if (loading || !twin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <Brain size={48} className="text-indigo-400/30" />
            <Sparkles size={16} className="text-violet-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <Loader2 size={14} className="animate-spin" />
            Building your Executive Digital Twin™...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
        <Brain size={12} className="text-violet-400" />
        Executive AI Brain™
      </div>
      <h1 className="text-2xl font-bold text-white -mt-3">Executive Digital Twin™</h1>
      <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
        A living AI representation of {user?.full_name || 'your'} executive identity — continuously modeling capability,
        predicting future growth, simulating career decisions, and generating explainable recommendations across
        identity, evidence, verification, trust, and leadership intelligence.
      </p>

      <DigitalTwinHero twin={twin} />
      <LeadershipForecast forecast={twin.forecast} twin={twin} />
      <ScenarioSimulator
        templates={SCENARIO_TEMPLATES}
        onRun={handleRunScenario}
        result={scenarioResult}
        running={runningScenario}
        currentScores={twin.scores}
      />
      <CareerTrajectory trajectory={twin.trajectory} />
      <TwinIntelligence intelligence={twin.intelligence} />
      <RecommendationEngine recommendations={twin.recommendations} />
    </div>
  );
}