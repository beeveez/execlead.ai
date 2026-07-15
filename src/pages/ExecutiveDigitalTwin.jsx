import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useDeveloper } from '@/lib/DeveloperContext';
import { base44 } from '@/api/base44Client';
import { buildDigitalTwin, runScenario, SCENARIO_TEMPLATES } from '@/lib/executiveDigitalTwinEngine';
import {
  getCachedTwin, setCachedTwin, createMetrics,
  subscribeToRebuild, queueRebuild,
} from '@/lib/digitalTwinCache';
import { Brain, Sparkles, RefreshCw, Clock, ChevronRight } from 'lucide-react';
import DigitalTwinHero from '@/components/digital-twin/DigitalTwinHero';
import LeadershipForecast from '@/components/digital-twin/LeadershipForecast';
import ScenarioSimulator from '@/components/digital-twin/ScenarioSimulator';
import CareerTrajectory from '@/components/digital-twin/CareerTrajectory';
import TwinIntelligence from '@/components/digital-twin/TwinIntelligence';
import RecommendationEngine from '@/components/digital-twin/RecommendationEngine';
import {
  HeroSkeleton, ForecastSkeleton, TrajectorySkeleton, SimulatorSkeleton,
  IntelligenceSkeleton, RecommendationSkeleton, SectionLoader,
} from '@/components/digital-twin/SectionSkeleton';
import PerformanceMetrics from '@/components/digital-twin/PerformanceMetrics';

export default function ExecutiveDigitalTwin() {
  const { user } = useAuth();
  const { developerMode } = useDeveloper();

  // Phase 1: Immediate cache lookup — no async, no blocking
  const cacheRef = useRef(null);
  if (!cacheRef.current && user?.id) {
    cacheRef.current = getCachedTwin(user.id);
  }

  const [twin, setTwin] = useState(() => cacheRef.current?.twin || null);
  const [refreshing, setRefreshing] = useState(false);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [runningScenario, setRunningScenario] = useState(null);
  const [metrics, setMetrics] = useState(() => {
    const m = createMetrics();
    if (cacheRef.current) {
      m.cacheHit = true;
      m.firstRenderTime = performance.now() - m.pageLoadStart;
    }
    return m;
  });

  const cachedAt = cacheRef.current?.cachedAt || null;

  // ============================================================
  // Background Data Fetch + Twin Rebuild
  // ============================================================
  const rebuildTwin = useCallback(async (reason = 'initial_load') => {
    if (!user?.id) return;
    setRefreshing(true);
    setMetrics((prev) => ({ ...prev, backgroundRefreshStatus: 'refreshing', rebuildReason: reason }));

    const fetchStart = performance.now();

    try {
      const results = await Promise.all([
        base44.entities.IdentityVerification.filter({ user_id: user.id }, '-created_date', 1).catch(() => []),
        base44.entities.VerificationLog.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.EvidenceItem.filter({ created_by_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.ExecutiveCredential.list('-created_date', 50).catch(() => []),
        base44.entities.LeadershipDNA.filter({ user_id: user.id }, '-created_date', 1).catch(() => []),
        base44.entities.PortfolioVersion.list('-created_date', 10).catch(() => []),
        base44.entities.JourneyEvent.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
        base44.entities.LessonProgress.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.SimulationSession.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
        base44.entities.Achievement.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
        base44.entities.ExecutiveCompetency.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
        base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1).catch(() => []),
      ]);

      const dataSourcesLoaded = results.filter((r) => r !== null && r !== undefined).length;

      const buildStart = performance.now();
      const built = buildDigitalTwin({
        user,
        verification: results[0][0] || null,
        logs: results[1],
        evidence: results[2],
        credentials: results[3],
        leadershipDNA: results[4]?.[0] || null,
        portfolioVersions: results[5],
        journeyEvents: results[6],
        lessonProgress: results[7],
        simulations: results[8],
        achievements: results[9],
        competencies: results[10],
        profile: results[11]?.[0] || {},
      });
      const twinBuildTime = performance.now() - buildStart;

      setTwin(built);
      setCachedTwin(user.id, built, { twinBuildTime, dataSourcesLoaded });

      setMetrics((prev) => ({
        ...prev,
        totalLoadTime: performance.now() - prev.pageLoadStart,
        twinBuildTime,
        dataSourcesLoaded,
        backgroundRefreshStatus: 'completed',
      }));
    } catch (e) {
      setMetrics((prev) => ({ ...prev, backgroundRefreshStatus: 'error' }));
    }
    setRefreshing(false);
  }, [user?.id]);

  // Phase 2: Kick off background rebuild on mount (non-blocking)
  useEffect(() => {
    if (user?.id) {
      rebuildTwin('initial_load');
    }
  }, [user?.id, rebuildTwin]);

  // Phase 3: Subscribe to data-change rebuild events
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToRebuild((reason) => {
      rebuildTwin(reason);
    });
    return unsub;
  }, [user?.id, rebuildTwin]);

  // Phase 4: Realtime subscriptions — queue rebuild on entity changes
  useEffect(() => {
    if (!user?.id) return;
    const entities = [
      base44.entities.IdentityVerification,
      base44.entities.EvidenceItem,
      base44.entities.ExecutiveCredential,
      base44.entities.UserProfile,
      base44.entities.LeadershipDNA,
      base44.entities.ResumeImport,
    ];
    const unsubs = entities.map((entity) =>
      entity.subscribe?.((event) => {
        if (event?.type === 'create' || event?.type === 'update' || event?.type === 'delete') {
          queueRebuild(`entity_change:${event.type}`);
        }
      })
    );
    return () => unsubs.forEach((fn) => fn && fn());
  }, [user?.id]);

  const handleRunScenario = async (scenarioId) => {
    if (!twin) return;
    setRunningScenario(scenarioId);
    setScenarioResult(null);
    await new Promise((r) => setTimeout(r, 600));
    const result = runScenario(twin, scenarioId);
    setScenarioResult(result);
    setRunningScenario(null);
  };

  // Determine which sections have data
  const hasHero = !!twin?.scores;
  const hasForecast = !!twin?.forecast;
  const hasTrajectory = !!twin?.trajectory;
  const hasIntelligence = !!twin?.intelligence;
  const hasRecommendations = !!twin?.recommendations;
  const hasSimulator = !!twin?.scores;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header — always renders immediately */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Brain size={12} className="text-violet-400" />
            Executive AI Brain™
            {refreshing && (
              <span className="flex items-center gap-1 text-indigo-400 normal-case tracking-normal ml-2">
                <RefreshCw size={10} className="animate-spin" />
                Refreshing...
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">Executive Digital Twin™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
            A living AI representation of {user?.full_name || 'your'} executive identity — continuously modeling capability,
            predicting future growth, simulating career decisions, and generating explainable recommendations across
            identity, evidence, verification, trust, and leadership intelligence.
          </p>
        </div>
        {/* Last Updated badge */}
        {cachedAt && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/30 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5">
            <Clock size={10} />
            Last Updated: {new Date(cachedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Hero — cached data renders immediately, skeleton if no cache */}
      <SectionLoader loading={!hasHero} skeleton={HeroSkeleton} label="scores">
        {hasHero && <DigitalTwinHero twin={twin} />}
      </SectionLoader>

      {/* Leadership Forecast */}
      <SectionLoader loading={!hasForecast} skeleton={ForecastSkeleton} label="forecast">
        {hasForecast && <LeadershipForecast forecast={twin.forecast} twin={twin} />}
      </SectionLoader>

      {/* Career Trajectory */}
      <SectionLoader loading={!hasTrajectory} skeleton={TrajectorySkeleton} label="trajectory">
        {hasTrajectory && <CareerTrajectory trajectory={twin.trajectory} />}
      </SectionLoader>

      {/* Scenario Simulator */}
      <SectionLoader loading={!hasSimulator} skeleton={SimulatorSkeleton} label="simulator">
        {hasSimulator && (
          <ScenarioSimulator
            templates={SCENARIO_TEMPLATES}
            onRun={handleRunScenario}
            result={scenarioResult}
            running={runningScenario}
            currentScores={twin.scores}
          />
        )}
      </SectionLoader>

      {/* Twin Intelligence */}
      <SectionLoader loading={!hasIntelligence} skeleton={IntelligenceSkeleton} label="intelligence">
        {hasIntelligence ? (
          <TwinIntelligence intelligence={twin.intelligence} />
        ) : (
          <div className="text-center py-8 text-white/30 text-sm">
            <Sparkles size={20} className="text-violet-400/30 mx-auto mb-2 animate-pulse" />
            Generating fresh executive insights...
          </div>
        )}
      </SectionLoader>

      {/* Recommendations */}
      <SectionLoader loading={!hasRecommendations} skeleton={RecommendationSkeleton} label="recommendations">
        {hasRecommendations && <RecommendationEngine recommendations={twin.recommendations} />}
      </SectionLoader>

      {/* Performance Metrics™ — Developer Mode only */}
      {developerMode && <PerformanceMetrics metrics={metrics} cachedAt={cachedAt} />}
    </div>
  );
}