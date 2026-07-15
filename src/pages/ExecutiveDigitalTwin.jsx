import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useDeveloper } from '@/lib/DeveloperContext';
import { base44 } from '@/api/base44Client';
import { buildCoreTwin, enrichTwin, runScenario, SCENARIO_TEMPLATES } from '@/lib/executiveDigitalTwinEngine';
import {
  getCachedTwin, setCachedTwin, createMetrics, recordDataSourceTiming,
  subscribeToRebuild, queueRebuild, isCacheStale, getCacheTTL,
} from '@/lib/digitalTwinCache';
import { Brain, Sparkles, RefreshCw, Clock } from 'lucide-react';
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

// Data source definitions — each has a name, fetch function, and index in results
const DATA_SOURCES = [
  { name: 'Identity',         fetch: (uid) => base44.entities.IdentityVerification.filter({ user_id: uid }, '-created_date', 1) },
  { name: 'Verification Logs', fetch: (uid) => base44.entities.VerificationLog.filter({ user_id: uid }, '-created_date', 50) },
  { name: 'Evidence',         fetch: (uid) => base44.entities.EvidenceItem.filter({ created_by_id: uid }, '-created_date', 50) },
  { name: 'Credentials',      fetch: () => base44.entities.ExecutiveCredential.list('-created_date', 50) },
  { name: 'Leadership DNA',   fetch: (uid) => base44.entities.LeadershipDNA.filter({ user_id: uid }, '-created_date', 1) },
  { name: 'Portfolio',        fetch: () => base44.entities.PortfolioVersion.list('-created_date', 10) },
  { name: 'Journey',          fetch: (uid) => base44.entities.JourneyEvent.filter({ user_id: uid }, '-created_date', 30) },
  { name: 'Learning',        fetch: (uid) => base44.entities.LessonProgress.filter({ user_id: uid }, '-created_date', 50) },
  { name: 'Simulations',      fetch: (uid) => base44.entities.SimulationSession.filter({ user_id: uid }, '-created_date', 20) },
  { name: 'Achievements',     fetch: (uid) => base44.entities.Achievement.filter({ user_id: uid }, '-created_date', 30) },
  { name: 'Competencies',    fetch: (uid) => base44.entities.ExecutiveCompetency.filter({ user_id: uid }, '-created_date', 30) },
  { name: 'Profile',          fetch: (uid) => base44.entities.UserProfile.filter({ user_id: uid }, '-created_date', 1) },
];

export default function ExecutiveDigitalTwin() {
  const { user } = useAuth();
  const { developerMode } = useDeveloper();

  // Phase 1: Synchronous cache lookup — zero async, zero blocking
  const cacheRef = useRef(null);
  if (!cacheRef.current && user?.id) {
    cacheRef.current = getCachedTwin(user.id);
  }

  const cachedTwin = cacheRef.current?.twin || null;
  const cachedAt = cacheRef.current?.cachedAt || null;
  const cacheWasStale = cacheRef.current?.isStale ?? true;

  const [twin, setTwin] = useState(cachedTwin);
  const [coreReady, setCoreReady] = useState(!!cachedTwin?.scores);
  const [refreshing, setRefreshing] = useState(false);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [runningScenario, setRunningScenario] = useState(null);
  const [metrics, setMetrics] = useState(() => {
    const m = createMetrics();
    m.cacheHit = !!cachedTwin;
    m.cacheStale = cacheWasStale;
    if (cachedTwin) {
      m.firstRenderTime = performance.now() - m.pageLoadStart;
    }
    return m;
  });

  // ============================================================
  // Phase 2: Background fetch with per-source timing
  // ============================================================
  const rebuildTwin = useCallback(async (reason = 'initial_load') => {
    if (!user?.id) return;

    // Skip rebuild if cache is fresh (within TTL) — unless explicitly forced
    if (reason === 'initial_load' && cachedTwin && !cacheWasStale) {
      setMetrics((prev) => ({
        ...prev,
        skippedRebuild: true,
        backgroundRefreshStatus: 'completed',
        totalLoadTime: performance.now() - prev.pageLoadStart,
      }));
      return;
    }

    setRefreshing(true);
    setMetrics((prev) => ({
      ...prev,
      backgroundRefreshStatus: 'refreshing',
      rebuildReason: reason,
      skippedRebuild: false,
    }));

    try {
      // ── Phase 2a: Fire ALL queries in parallel with individual timing ──
      const fetchStart = performance.now();
      const timedPromises = DATA_SOURCES.map(async (source) => {
        const t0 = performance.now();
        try {
          const result = await source.fetch(user.id);
          const duration = performance.now() - t0;
          const recordCount = Array.isArray(result) ? result.length : (result ? 1 : 0);
          return { data: result, duration, status: 'ok', recordCount, name: source.name };
        } catch (e) {
          const duration = performance.now() - t0;
          return { data: [], duration, status: 'error', recordCount: 0, name: source.name };
        }
      });

      const results = await Promise.all(timedPromises);
      const fetchDuration = performance.now() - fetchStart;

      // Record per-source timings into metrics
      const updatedMetrics = { ...metrics };
      updatedMetrics.dataSourceTimings = [];
      updatedMetrics.slowestQuery = null;
      updatedMetrics.blockingRequests = [];
      results.forEach((r) => {
        recordDataSourceTiming(updatedMetrics, r.name, r.duration, r.status, r.recordCount);
      });
      updatedMetrics.dataSourcesLoaded = results.filter((r) => r.status === 'ok').length;
      updatedMetrics.dataSourcesTotal = DATA_SOURCES.length;
      updatedMetrics.dataSourcesTotalRequested = DATA_SOURCES.length;
      updatedMetrics.parallelRequests = true;
      setMetrics(updatedMetrics);

      // ── Phase 2b: Build CORE twin (fast, synchronous) — powers Hero + Simulator ──
      const coreBuildStart = performance.now();
      const built = buildCoreTwin({
        user,
        verification: results[0]?.data?.[0] || null,
        logs: results[1]?.data || [],
        evidence: results[2]?.data || [],
        credentials: results[3]?.data || [],
        leadershipDNA: results[4]?.data?.[0] || null,
        portfolioVersions: results[5]?.data || [],
        journeyEvents: results[6]?.data || [],
        lessonProgress: results[7]?.data || [],
        simulations: results[8]?.data || [],
        achievements: results[9]?.data || [],
        competencies: results[10]?.data || [],
        profile: results[11]?.data?.[0] || {},
      });
      const coreBuildTime = performance.now() - coreBuildStart;

      // Set core twin immediately — Hero + Simulator render NOW
      setTwin(built);
      setCoreReady(true);
      setCachedTwin(user.id, built, { coreBuildTime, fetchDuration });

      setMetrics((prev) => ({
        ...prev,
        coreBuildTime,
        twinBuildTime: coreBuildTime,
      }));

      // ── Phase 2c: Defer enrichment to next tick — doesn't block Hero render ──
      // Use requestIdleCallback if available, else setTimeout(0)
      const scheduleEnrichment = window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
      scheduleEnrichment(() => {
        const enrichStart = performance.now();
        const enriched = enrichTwin(built);
        const enrichmentTime = performance.now() - enrichStart;

        setTwin(enriched);
        setCachedTwin(user.id, enriched, { coreBuildTime, enrichmentTime, fetchDuration });

        setMetrics((prev) => ({
          ...prev,
          enrichmentTime,
          twinBuildTime: coreBuildTime + enrichmentTime,
          totalLoadTime: performance.now() - prev.pageLoadStart,
          backgroundRefreshStatus: 'completed',
        }));
        setRefreshing(false);
      });
    } catch (e) {
      setMetrics((prev) => ({ ...prev, backgroundRefreshStatus: 'error' }));
      setRefreshing(false);
    }
  }, [user?.id, cachedTwin, cacheWasStale, metrics]);

  // Kick off background rebuild on mount (non-blocking)
  useEffect(() => {
    if (user?.id) {
      rebuildTwin('initial_load');
    }
  }, [user?.id, rebuildTwin]);

  // Subscribe to data-change rebuild events
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToRebuild((reason) => {
      rebuildTwin(reason);
    });
    return unsub;
  }, [user?.id, rebuildTwin]);

  // Realtime subscriptions — queue rebuild on entity changes
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

  // Determine which sections have data — progressive rendering
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
        {cachedAt && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/30 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5">
            <Clock size={10} />
            Last Updated: {new Date(cachedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Hero — renders immediately from cache or core build */}
      <SectionLoader loading={!hasHero} skeleton={HeroSkeleton} label="scores">
        {hasHero && <DigitalTwinHero twin={twin} />}
      </SectionLoader>

      {/* Leadership Forecast — waits for enrichment */}
      <SectionLoader loading={!hasForecast} skeleton={ForecastSkeleton} label="forecast">
        {hasForecast && <LeadershipForecast forecast={twin.forecast} twin={twin} />}
      </SectionLoader>

      {/* Career Trajectory — waits for enrichment */}
      <SectionLoader loading={!hasTrajectory} skeleton={TrajectorySkeleton} label="trajectory">
        {hasTrajectory && <CareerTrajectory trajectory={twin.trajectory} />}
      </SectionLoader>

      {/* Scenario Simulator — available as soon as core scores are ready */}
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

      {/* Twin Intelligence — waits for enrichment */}
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

      {/* Recommendations — waits for enrichment */}
      <SectionLoader loading={!hasRecommendations} skeleton={RecommendationSkeleton} label="recommendations">
        {hasRecommendations && <RecommendationEngine recommendations={twin.recommendations} />}
      </SectionLoader>

      {/* Performance Metrics™ — Developer Mode only */}
      {developerMode && <PerformanceMetrics metrics={metrics} cachedAt={cachedAt} />}
    </div>
  );
}