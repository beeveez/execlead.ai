import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { usePlatformState } from '@/lib/PlatformStateContext';
import { usePlatformReadiness } from '@/lib/PlatformReadinessContext';
import { useGuardian } from '@/lib/GuardianContext';
import { computeGuardianScore } from '@/lib/guardianValidationEngine';
import { computeLaunchReadiness } from '@/lib/launchReadinessEngine';
import { computeStabilityScore } from '@/lib/platformStabilityEngine';
import { READINESS_SCORES } from '@/lib/scalabilityAssessmentEngine';
import { computeCapacityMetrics } from '@/lib/foundingRolloutEngine';
import { computeSecurityIntelligence } from '@/lib/securityIntelligenceEngine';
import { computeHardeningAssessment, HARDENING_PHASES } from '@/lib/platformHardeningEngine';
import { canAccessDeveloperWorkspace } from '@/lib/roles';
import { useAuth } from '@/lib/AuthContext';

import HardeningHero from '@/components/developer/hardening/HardeningHero';
import DomainScoreGrid from '@/components/developer/hardening/DomainScoreGrid';
import QualityGateList from '@/components/developer/hardening/QualityGateList';
import IssueSummaryBar from '@/components/developer/hardening/IssueSummaryBar';
import HardeningPhases from '@/components/developer/hardening/HardeningPhases';

export default function PlatformHardeningDashboard() {
  const { user } = useAuth();
  const platformState = usePlatformState();
  const readiness = usePlatformReadiness();
  const guardian = useGuardian();

  const [securityIntel, setSecurityIntel] = useState(null);
  const [rolloutMetrics, setRolloutMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const canAccess = user && canAccessDeveloperWorkspace(user.role);

  useEffect(() => {
    if (!canAccess) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const [sec, rollout] = await Promise.all([
          computeSecurityIntelligence(),
          computeCapacityMetrics(base44),
        ]);
        if (!cancelled) { setSecurityIntel(sec); setRolloutMetrics(rollout); }
      } catch (e) {
        // Graceful degradation — engine handles null inputs
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [canAccess]);

  // ── Compute all hardening inputs from live engines ──
  const assessment = useMemo(() => {
    const guardianScore = computeGuardianScore();
    const launchReadiness = computeLaunchReadiness();
    const stabilityTelemetry = {
      platformState: {
        errorCount: platformState?.errorCount || 0,
        warningCount: platformState?.warningCount || 0,
        coverage: platformState?.coverage || {},
        health: platformState?.health || {},
        safeMode: platformState?.safeMode || false,
        status: platformState?.status || 'unknown',
      },
      guardian: { pending: guardian?.pending || [], brokenNavPaths: guardian?.brokenNavPaths || new Set() },
      certificate: { failures: 0, warnings: 0 },
    };
    const stability = computeStabilityScore(stabilityTelemetry);
    const perfDim = READINESS_SCORES.find(d => d.dimension === 'Performance');
    const secDim = READINESS_SCORES.find(d => d.dimension === 'Security');

    const platformHealth = platformState?.health?.overall ?? 100;
    const knowledgeSyncHealthy = rolloutMetrics?.knowledgeSyncHealthy ?? true;
    const aiSuccessRate = rolloutMetrics?.aiSuccessRate ?? 100;
    const criticalIncidents = rolloutMetrics?.criticalIncidents ?? 0;
    const securityCritical = securityIntel?.header?.critical ?? 0;

    return computeHardeningAssessment({
      // ── Domain Scores ──
      uxScore: null, // Phase 1 audit pending — no automated UX engine
      performanceScore: perfDim?.score ?? null,
      performanceDetail: perfDim?.rationale,
      securityScore: securityIntel?.header?.securityScore ?? secDim?.score ?? null,
      securityDetail: secDim?.rationale,
      testingScore: null, // Phase 4 audit pending — no test runner integrated
      stabilityScore: stability.overall,
      stabilityDetail: `${stability.tier} — ${stability.metrics.manifestErrors} manifest errors, ${stability.metrics.guardianPending} guardian pending`,

      // ── Quality Gate Inputs ──
      guardianScore: guardianScore.score,
      platformHealth,
      rolloutReadiness: launchReadiness.launchReadinessScore,
      criticalBugs: criticalIncidents,
      highSecurityIssues: securityCritical,
      memoryLeaks: null, // Phase 5 monitoring pending
      criticalPerfBottlenecks: null, // Phase 2 profiling pending
      aiQualityVerified: aiSuccessRate >= 90 ? true : (aiSuccessRate < 90 ? false : null),
      knowledgeSyncHealthy,
      testPassRate: null, // Phase 4 pending
      accessibilityWCAGAA: null, // Phase 1 audit pending
      lighthouseScore: null, // Phase 2 profiling pending

      // ── Issues ──
      openDefects: (securityIntel?.header?.failed ?? 0) + criticalIncidents,
      warnings: (securityIntel?.header?.warnings ?? 0) + (platformState?.warningCount ?? 0),
    });
  }, [platformState, guardian, securityIntel, rolloutMetrics]);

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-white/40 text-sm">The Platform Hardening Dashboard is available to developer and admin roles only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Platform Hardening Dashboard</h1>
        <p className="text-white/40 text-sm">
          Feature velocity creates products. Quality creates companies. No new major features until hardening is complete.
        </p>
      </div>

      {/* Hero — Overall Score + Release Readiness */}
      <div className="mb-6">
        <HardeningHero assessment={assessment} />
      </div>

      {/* Issue Summary */}
      <div className="mb-6">
        <IssueSummaryBar issues={assessment.issues} />
      </div>

      {/* Domain Scores */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Hardening Domains</h2>
          <span className="text-white/30 text-xs">
            {assessment.domains.filter(d => !d.pending).length} of {assessment.domains.length} domains measured · {assessment.pendingDomainCount} pending audit
          </span>
        </div>
        <DomainScoreGrid domains={assessment.domains} />
      </div>

      {/* Quality Gates + Phases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityGateList gates={assessment.gates} />
        <HardeningPhases phases={HARDENING_PHASES} />
      </div>

      {/* Computed At */}
      <div className="text-center text-white/20 text-xs mt-8">
        Assessment computed at {new Date(assessment.computedAt).toLocaleString()}
      </div>
    </div>
  );
}