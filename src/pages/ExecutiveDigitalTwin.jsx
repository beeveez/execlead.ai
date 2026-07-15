import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useDeveloper } from '@/lib/DeveloperContext';
import { base44 } from '@/api/base44Client';
import { buildCoreTwin, enrichTwin, runScenario, SCENARIO_TEMPLATES } from '@/lib/executiveDigitalTwinEngine';
import {
  getCachedTwin, setCachedTwin, createMetrics, recordDataSourceTiming,
} from '@/lib/digitalTwinCache';
import { Brain, RefreshCw, Clock, Sparkles } from 'lucide-react';
import DigitalTwinHero from '@/components/digital-twin/DigitalTwinHero';
import ExecutiveSnapshot from '@/components/digital-twin/ExecutiveSnapshot';
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

// Minimal data sources for the instant Executive Snapshot™
const SNAPSHOT_SOURCES = [
  { name: 'Identity', fetch: (uid) => base44.entities.IdentityVerification.filter({ user_id: uid }, '-created_date', 1) },
  { name: 'Evidence', fetch: (uid) => base44.entities.EvidenceItem.filter({ created_by_id: uid }, '-created_date', 50) },
  { name: 'Credentials', fetch: () => base44.entities.ExecutiveCredential.list('-created_date', 50) },
];

// Full data sources for the complete Digital Twin™ analysis
const FULL_DATA_SOURCES = [
  { name: 'Identity',          fetch: (uid) => base44.entities.IdentityVerification.filter({ user_id: uid }, '-created_date', 1) },
  { name: 'Verification Logs',  fetch: (uid) => base44.entities.VerificationLog.filter({ user_id: uid }, '-created_date', 50) },
  { name: 'Evidence',          fetch: (uid) => base44.entities.EvidenceItem.filter({ created_by_id: uid }, '-created_date', 50) },
  { name: 'Credentials',       fetch: () => base44.entities.ExecutiveCredential.list('-created_date', 50) },
  { name: 'Leadership DNA',    fetch: (uid) => base44.entities.LeadershipDNA.filter({ user_id: uid }, '-created_date', 1) },
  { name: 'Portfolio',         fetch: () => base44.entities.PortfolioVersion.list('-created_date', 10) },
  { name: 'Journey',           fetch: (uid) => base44.entities.JourneyEvent.filter({ user_id: uid }, '-created_date', 30) },
  { name: 'Learning',          fetch: (uid) => base44.entities.LessonProgress.filter({ user_id: uid }, '-created_date', 50) },
  { name: 'Simulations',       fetch: (uid) => base44.entities.SimulationSession.filter({ user_id: uid }, '-created_date', 20) },
  { name: 'Achievements',      fetch: (uid) => base44.entities.Achievement.filter({ user_id: uid }, '-created_date', 30) },
  { name: 'Competencies',      fetch: (uid) => base44.entities.ExecutiveCompetency.filter({ user_id: uid }, '-created_date', 30) },
  { name: 'Profile',           fetch: (uid) => base44.entities.UserProfile.filter({ user_id: uid }, '-created_date', 1) },
];

const TRUST_LEVEL_NAMES = ['Unverified', 'Registered', 'Email Verified', 'Identity Verified', 'Professional Verified', 'Executive Verified'];

export default function ExecutiveDigitalTwin() {
  const { user } = useAuth();
  const { developerMode } = useDeveloper();

  // ── Synchronous cache lookup — zero async, zero blocking ──
  const cacheRef = useRef(null);
  if (!cacheRef.current && user?.id) {
    cacheRef.current = getCachedTwin(user.id);
  }
  const cachedTwin = cacheRef.current?.twin || null;
  const cachedAt = cacheRef.current?.cachedAt || null;
  const hasCachedTwin = !!(cachedTwin?.scores && cachedTwin?.forecast);

  // ── State ──
  const [twin, setTwin] = useState(hasCachedTwin ? cachedTwin : null);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(!hasCachedTwin);
  const [generating, setGenerating] = useState(false);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [runningScenario, setRunningScenario] = useState(null);
  const [metrics, setMetrics] = useState(() => {
    const m = createMetrics();
    m.cacheHit = hasCachedTwin;
    if (hasCachedTwin) m.firstRenderTime = performance.now() - m.pageLoadStart;
    return m;
  });

  // ============================================================
  // Phase 1: Instant Snapshot — 3 minimal queries, non-blocking
  // ============================================================
  useEffect(() => {
    if (!user?.id || hasCachedTwin) return;

    let cancelled = false;
    setSnapshotLoading(true);

    (async () => {
      try {
        const results = await Promise.all(
          SNAPSHOT_SOURCES.map(async (s) => {
            try { return await s.fetch(user.id); }
            catch { return []; }
          })
        );

        if (cancelled) return;

        const verification = results[0]?.[0] || {};
        const evidence = results[1] || [];
        const credentials = results[2] || [];

        setSnapshot({
          trustScore: verification.trust_score || 0,
          trustLevel: verification.trust_level || 0,
          trustLevelName: TRUST_LEVEL_NAMES[verification.trust_level || 0] || 'Unverified',
          identityConfidence: verification.confidence_overall || 0,
          evidenceCount: evidence.length,
          credentialCount: credentials.length,
        });
        setSnapshotLoading(false);
        setMetrics((prev) => ({
          ...prev,
          firstRenderTime: performance.now() - prev.pageLoadStart,
        }));
      } catch {
        if (!cancelled) setSnapshotLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id, hasCachedTwin]);

  // ============================================================
  // Phase 2: Full Twin Generation — async, user-triggered
  // ============================================================
  const generateTwin = useCallback(async () => {
    if (!user?.id || generating) return;

    setGenerating(true);
    setMetrics((prev) => ({
      ...prev,
      backgroundRefreshStatus: 'refreshing',
      rebuildReason: 'user_triggered',
      pageLoadStart: performance.now(),
    }));

    try {
      // ── Fetch all 12 data sources in parallel with per-source timing ──
      const fetchStart = performance.now();
      const timedPromises = FULL_DATA_SOURCES.map(async (source) => {
        const t0 = performance.now();
        try {
          const result = await source.fetch(user.id);
          const duration = performance.now() - t0;
          const recordCount = Array.isArray(result) ? result.length : (result ? 1 : 0);
          return { data: result, duration, status: 'ok', recordCount, name: source.name };
        } catch {
          const duration = performance.now() - t0;
          return { data: [], duration, status: 'error', recordCount: 0, name: source.name };
        }
      });

      const results = await Promise.all(timedPromises);
      const fetchDuration = performance.now() - fetchStart;

      // Record per-source timings
      const m = { ...metrics };
      m.dataSourceTimings = [];
      m.slowestQuery = null;
      m.blockingRequests = [];
      results.forEach((r) => recordDataSourceTiming(m, r.name, r.duration, r.status, r.recordCount));
      m.dataSourcesLoaded = results.filter((r) => r.status === 'ok').length;
      m.dataSourcesTotal = FULL_DATA_SOURCES.length;
      m.dataSourcesTotalRequested = FULL_DATA_SOURCES.length;
      m.parallelRequests = true;
      setMetrics(m);

      // ── Build CORE twin (fast, synchronous) — powers Hero + Simulator ──
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
      setCachedTwin(user.id, built, { coreBuildTime, fetchDuration });
      setMetrics((prev) => ({ ...prev, coreBuildTime, twinBuildTime: coreBuildTime }));

      // ── Defer enrichment — doesn't block Hero render ──
      const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
      schedule(() => {
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
        setGenerating(false);
      });
    } catch {
      setMetrics((prev) => ({ ...prev, backgroundRefreshStatus: 'error' }));
      setGenerating(false);
    }
  }, [user?.id, generating, metrics]);

  // ============================================================
  // Scenario Simulator
  // ============================================================
  const handleRunScenario = async (scenarioId) => {
    if (!twin) return;
    setRunningScenario(scenarioId);
    setScenarioResult(null);
    await new Promise((r) => setTimeout(r, 600));
    setScenarioResult(runScenario(twin, scenarioId));
    setRunningScenario(null);
  };

  // ── Progressive section readiness ──
  const hasHero = !!twin?.scores;
  const hasForecast = !!twin?.forecast;
  const hasTrajectory = !!twin?.trajectory;
  const hasIntelligence = !!twin?.intelligence;
  const hasRecommendations = !!twin?.recommendations;
  const hasSimulator = !!twin?.scores;

  // ── Show snapshot view if no twin generated yet ──
  const showSnapshot = !hasHero && !generating;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Brain size={12} className="text-violet-400" />
            Executive AI Brain™
            {generating && (
              <span className="flex items-center gap-1 text-indigo-400 normal-case tracking-normal ml-2">
                <RefreshCw size={10} className="animate-spin" />
                Generating...
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
            {showSnapshot ? 'Snapshot' : 'Twin'}: {new Date(cachedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* ── Snapshot View (instant) or Full Twin View ── */}
      {showSnapshot ? (
        snapshotLoading ? (
          <SectionLoader loading skeleton={HeroSkeleton} label="snapshot" />
        ) : (
          <ExecutiveSnapshot
            snapshot={snapshot || { trustScore: 0, trustLevel: 0, trustLevelName: 'Unverified', identityConfidence: 0, evidenceCount: 0, credentialCount: 0 }}
            user={user}
            cachedAt={cachedAt}
            hasCachedTwin={false}
            onGenerate={generateTwin}
            generating={generating}
          />
        )
      ) : (
        <>
          {/* Full Twin Sections */}
          <SectionLoader loading={!hasHero} skeleton={HeroSkeleton} label="scores">
            {hasHero && <DigitalTwinHero twin={twin} />}
          </SectionLoader>

          {/* Refresh button when twin is loaded */}
          {hasHero && !generating && (
            <div className="flex justify-end">
              <button
                onClick={generateTwin}
                className="flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 rounded-lg px-3 py-1.5 transition-colors"
              >
                <RefreshCw size={11} />
                Refresh Executive Digital Twin™
              </button>
            </div>
          )}

          <SectionLoader loading={!hasForecast} skeleton={ForecastSkeleton} label="forecast">
            {hasForecast && <LeadershipForecast forecast={twin.forecast} twin={twin} />}
          </SectionLoader>

          <SectionLoader loading={!hasTrajectory} skeleton={TrajectorySkeleton} label="trajectory">
            {hasTrajectory && <CareerTrajectory trajectory={twin.trajectory} />}
          </SectionLoader>

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

          <SectionLoader loading={!hasRecommendations} skeleton={RecommendationSkeleton} label="recommendations">
            {hasRecommendations && <RecommendationEngine recommendations={twin.recommendations} />}
          </SectionLoader>
        </>
      )}

      {/* Performance Metrics™ — Developer Mode only */}
      {developerMode && <PerformanceMetrics metrics={metrics} cachedAt={cachedAt} />}
    </div>
  );
}