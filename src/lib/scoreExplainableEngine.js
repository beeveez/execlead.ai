/**
 * EXECLEAD.AI — Explainable Progress™ Engine
 * ============================================================
 * Universal scoring engine that makes every platform score
 * explainable, traceable, and actionable. No metric may simply
 * display a percentage — every percentage must explain itself.
 *
 * For each score:
 *   - Breaks down into weighted contributions
 *   - Each contribution shows its gap to 100%
 *   - Exposes the scoring formula, completed/remaining points,
 *     projected completion, engineering effort, confidence
 *   - Each contribution is individually drillable into diagnostics
 */
import { computeRLSScores } from "@/lib/rlsRegistry";
import { computeRiskBasedCoverage, computeSecurityDebt } from "@/lib/entityDiscovery";

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

const round1 = (n) => Math.round(Number(n) * 10) / 10;

function getDeploymentPipelineResult() {
  try {
    const raw = localStorage.getItem("deployment_pipeline_result");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const PRODUCT_SCORE_MAP = { healthy: 85, attention: 60, blocked: 30 };
function getProductScore(snapshot, productId) {
  const p = snapshot.products?.find((p) => p.id === productId);
  return p ? (PRODUCT_SCORE_MAP[p.status] ?? 50) : 30;
}

export const SCORE_REGISTRY = {
  platform_health: {
    label: "Platform Health™",
    target: 100,
    owner: "Platform Engineering",
    deepLink: "/developer/system-health",
    module: "Platform Stability Engine™",
    getScore: (s) => s.overview?.platformHealth ?? s.engineering?.reliability ?? 0,
    getContributions: (s) => {
      const e = s.engineering || {};
      return [
        { id: "architecture", label: "Architecture Health", weight: 0.20, score: e.architectureHealth ?? 85, owner: "Platform Engineering", deepLink: "/developer", category: "Architecture", dependencies: ["Platform Manifest™", "Module Registry™"] },
        { id: "security", label: "Security Posture", weight: 0.25, score: e.securityScore ?? 85, owner: "Security Engineering", deepLink: "/security", category: "Security", dependencies: ["RLS Registry", "Zero Trust Engine"] },
        { id: "reliability", label: "Reliability", weight: 0.20, score: e.reliability ?? 100, owner: "Platform Engineering", deepLink: "/developer/stability", category: "Reliability", dependencies: ["Platform Stability Engine™"] },
        { id: "deployment", label: "Deployment Confidence", weight: 0.15, score: e.deploymentConfidence ?? 100, owner: "Release Engineering", deepLink: "/developer/deployments", category: "Deployment", dependencies: ["Deployment Readiness Engine™"] },
        { id: "experience", label: "Executive Experience", weight: 0.20, score: e.experienceScore ?? 0, owner: "Experience Engineering", deepLink: "/developer/experience-audit", category: "Experience", dependencies: ["Platform Experience Audit™"] },
      ];
    },
  },
  intelligence: {
    label: "EXEC™ Intelligence™",
    target: 100,
    owner: "AI Engineering",
    deepLink: "/developer/cognitive",
    module: "Cognitive Excellence Engine™",
    getScore: (s) => s.cognitive?.overall ?? s.aiIntelligence?.cognitiveScore ?? 0,
    getContributions: (s) => {
      const ai = s.aiIntelligence || {};
      return [
        { id: "leadership_dna", label: "Leadership DNA™", weight: 0.20, score: getProductScore(s, "leadership_dna"), owner: "AI Engineering", deepLink: "/leadership-dna", category: "Intelligence", dependencies: ["Leadership DNA™ Module"] },
        { id: "evidence", label: "Evidence Traceability™", weight: 0.20, score: ai.evidenceCoverage ?? 0, owner: "AI Engineering", deepLink: "/developer/cognitive", category: "Cognitive", dependencies: ["Cognitive Excellence Engine™"] },
        { id: "recommendations", label: "Recommendation Engine™", weight: 0.20, score: ai.recommendationQuality ?? 0, owner: "AI Engineering", deepLink: "/developer/cognitive", category: "Cognitive", dependencies: ["Cognitive Excellence Engine™"] },
        { id: "executive_simulator", label: "Executive Simulator™", weight: 0.15, score: getProductScore(s, "simulator"), owner: "AI Engineering", deepLink: "/simulator", category: "Intelligence", dependencies: ["Simulator™ Module"] },
        { id: "coaching", label: "Coaching Personalization™", weight: 0.15, score: ai.reasoningQuality ?? 0, owner: "AI Engineering", deepLink: "/coach", category: "Cognitive", dependencies: ["Cognitive Excellence Engine™"] },
        { id: "confidence", label: "Confidence Calibration™", weight: 0.10, score: ai.execConfidence ?? 0, owner: "AI Engineering", deepLink: "/developer/cognitive", category: "Cognitive", dependencies: ["Cognitive Excellence Engine™"] },
      ];
    },
  },
  stability: {
    label: "Platform Stability™",
    target: 100,
    owner: "Platform Engineering",
    deepLink: "/developer/stability",
    module: "Platform Stability Engine™",
    getScore: (s) => s.stability?.overall ?? 0,
    getContributions: (s) => {
      const cats = s.stability?.categories || [];
      if (cats.length === 0) return [{ id: "overall", label: "Overall Stability", weight: 1, score: s.stability?.overall ?? 0, owner: "Platform Engineering", deepLink: "/developer/stability", category: "Stability", dependencies: ["Platform Stability Engine™"] }];
      const w = 1 / cats.length;
      return cats.map((c) => ({
        id: c.id || c.name, label: c.name || c.id || "Category", weight: w, score: c.score ?? 0,
        owner: "Platform Engineering", deepLink: "/developer/stability", category: "Stability", dependencies: ["Platform Stability Engine™"],
      }));
    },
  },
  experience: {
    label: "Executive Experience™",
    target: 100,
    owner: "Experience Engineering",
    deepLink: "/developer/experience-audit",
    module: "Platform Experience Audit™",
    getScore: (s) => s.experienceAudit?.score ?? 0,
    getContributions: (s) => {
      const audit = s.experienceAudit || {};
      const dims = audit.dimensions || [];
      if (dims.length > 0) {
        const w = 1 / dims.length;
        return dims.map((d) => ({
          id: d.id || d.name, label: d.name || d.id || "Dimension", weight: w, score: d.score ?? audit.score ?? 0,
          owner: "Experience Engineering", deepLink: "/developer/experience-audit", category: "Experience", dependencies: ["Platform Experience Audit™"],
        }));
      }
      const findings = audit.findings || [];
      if (findings.length === 0) return [{ id: "overall", label: "Overall Experience", weight: 1, score: audit.score ?? 0, owner: "Experience Engineering", deepLink: "/developer/experience-audit", category: "Experience", dependencies: ["Platform Experience Audit™"] }];
      const groups = {};
      findings.forEach((f) => { const key = f.dimension || f.category || "General"; if (!groups[key]) groups[key] = 0; groups[key]++; });
      const keys = Object.keys(groups);
      const w = 1 / keys.length;
      return keys.map((key) => ({
        id: key.toLowerCase().replace(/\s+/g, "_"), label: key, weight: w, score: clamp(100 - groups[key] * 10),
        owner: "Experience Engineering", deepLink: "/developer/experience-audit", category: "Experience", dependencies: ["Platform Experience Audit™"],
      }));
    },
  },
  enterprise: {
    label: "Enterprise Readiness™",
    target: 100,
    owner: "Enterprise Engineering",
    deepLink: "/trust-center",
    module: "Enterprise Trust Center™",
    getScore: (s) => s.enterprise?.enterpriseScore ?? 0,
    getContributions: (s) => {
      const items = s.enterprise?.items || [];
      if (items.length === 0) return [{ id: "overall", label: "Enterprise Readiness", weight: 1, score: s.enterprise?.enterpriseScore ?? 0, owner: "Enterprise Engineering", deepLink: "/trust-center", category: "Enterprise", dependencies: ["Enterprise Trust Center™"] }];
      const w = 1 / items.length;
      return items.map((item) => ({
        id: item.id, label: item.label, weight: w, score: item.status === "implemented" ? 100 : item.status === "in_progress" ? 50 : 0,
        owner: "Enterprise Engineering", deepLink: item.route || "/enterprise", category: "Enterprise", dependencies: ["Enterprise Trust Center™"],
      }));
    },
  },
  launch: {
    label: "Launch Preparation™",
    target: 100,
    owner: "Release Engineering",
    deepLink: "/developer/launch-readiness",
    module: "Launch Readiness Engine™",
    getScore: (s) => s.launchReadiness?.launchReadinessScore ?? 0,
    getContributions: (s) => {
      const phases = s.launchReadiness?.phases || [];
      if (phases.length === 0) return [{ id: "overall", label: "Launch Readiness", weight: 1, score: s.launchReadiness?.launchReadinessScore ?? 0, owner: "Release Engineering", deepLink: "/developer/launch-readiness", category: "Launch", dependencies: ["Launch Readiness Engine™"] }];
      const w = 1 / phases.length;
      return phases.map((phase) => {
        const reqs = phase.requirements || [];
        const passed = reqs.filter((r) => r.passed).length;
        const score = reqs.length > 0 ? clamp((passed / reqs.length) * 100) : phase.passed ? 100 : 0;
        return {
          id: phase.id || phase.name, label: phase.name || "Phase", weight: w, score,
          owner: "Release Engineering", deepLink: phase.deepLink || "/developer/launch-readiness", category: "Launch", dependencies: ["Launch Readiness Engine™"],
        };
      });
    },
  },
  production_readiness: {
    label: "Production Readiness™",
    target: 100,
    owner: "Release Engineering",
    deepLink: "/developer/deployments",
    module: "Explainable Readiness Engine™",
    pointsBased: true,
    getScore: () => 0,
    getContributions: (s) => {
      const STREAM_MAX = 17;
      const streams = [
        { id: "stability", label: "Platform Stability™", score: s.stability?.overall ?? 0, owner: "Platform Engineering", deepLink: "/developer/stability", dependencies: ["Platform Stability Engine™"] },
        { id: "intelligence", label: "EXEC™ Intelligence™", score: s.cognitive?.overall ?? 0, owner: "AI Engineering", deepLink: "/developer/cognitive", dependencies: ["Cognitive Excellence Engine™"] },
        { id: "experience", label: "Executive Experience™", score: s.experienceAudit?.score ?? 0, owner: "Experience Engineering", deepLink: "/developer/experience-audit", dependencies: ["Platform Experience Audit™"] },
        { id: "enterprise", label: "Enterprise Readiness™", score: s.enterprise?.enterpriseScore ?? 0, owner: "Enterprise Engineering", deepLink: "/trust-center", dependencies: ["Enterprise Trust Center™"] },
        { id: "launch", label: "Launch Preparation™", score: s.launchReadiness?.launchReadinessScore ?? 0, owner: "Release Engineering", deepLink: "/developer/launch-readiness", dependencies: ["Launch Readiness Engine™"] },
      ];
      const streamContributions = streams.map((st) => ({
        id: st.id, label: st.label, maxPoints: STREAM_MAX,
        earnedPoints: round1((clamp(st.score) / 100) * STREAM_MAX),
        owner: st.owner, deepLink: st.deepLink, category: "Stream",
        dependencies: st.dependencies, sourceScore: clamp(st.score),
      }));

      const pipeline = getDeploymentPipelineResult();
      const milestones = [
        { id: "security_verification", label: "Security Verification™", maxPoints: 5, stageId: "security_verification", owner: "Security Engineering", deepLink: "/security", dependencies: ["Security Regression Suite™"] },
        { id: "release_candidate", label: "Release Candidate™", maxPoints: 3, stageId: "rc1", owner: "Release Engineering", deepLink: "/developer/deployments", dependencies: ["Deployment Pipeline™"] },
        { id: "executive_release_review", label: "Executive Release Review™", maxPoints: 3, stageId: "executive_release_review", owner: "Release Engineering", deepLink: "/developer/deployments", dependencies: ["Deployment Pipeline™"] },
        { id: "production_certification", label: "Production Certification™", maxPoints: 4, stageId: "production_certification", owner: "Release Engineering", deepLink: "/developer/deployments", dependencies: ["Deployment Pipeline™"] },
      ];
      const milestoneContributions = milestones.map((m) => {
        const status = pipeline?.stages?.[m.stageId]?.status;
        let earnedPoints = 0;
        if (status === "completed") earnedPoints = m.maxPoints;
        else if (status === "warning") earnedPoints = round1(m.maxPoints * 0.5);
        return {
          id: m.id, label: m.label, maxPoints: m.maxPoints, earnedPoints,
          owner: m.owner, deepLink: m.deepLink, category: "Milestone",
          dependencies: m.dependencies, stageStatus: status || "not_run",
        };
      });
      return [...streamContributions, ...milestoneContributions];
    },
  },
  security: {
    label: "Security Score™",
    target: 100,
    owner: "Security Engineering",
    deepLink: "/security",
    module: "RLS Registry™ + Entity Discovery™",
    getScore: (s) => s.engineering?.securityScore ?? 0,
    getContributions: () => {
      const rls = safe(() => computeRLSScores(), { rlsCoverage: 0, tenantIsolationScore: 0, securityScore: 0 });
      const risk = safe(() => computeRiskBasedCoverage(), { criticalCoverage: 0, overallCoverage: 0 });
      return [
        { id: "rls_coverage", label: "RLS Coverage™", weight: 0.30, score: rls.rlsCoverage ?? 0, owner: "Security Engineering", deepLink: "/security", category: "Access Control", dependencies: ["RLS Registry", "Entity Discovery™"] },
        { id: "tenant_isolation", label: "Tenant Isolation", weight: 0.25, score: rls.tenantIsolationScore ?? 0, owner: "Security Engineering", deepLink: "/security", category: "Isolation", dependencies: ["RLS Registry"] },
        { id: "critical_coverage", label: "Critical Entity Coverage™", weight: 0.25, score: risk.criticalCoverage ?? 0, owner: "Security Engineering", deepLink: "/security", category: "Coverage", dependencies: ["Entity Discovery™"] },
        { id: "overall_posture", label: "Overall Security Posture", weight: 0.20, score: rls.securityScore ?? 0, owner: "Security Engineering", deepLink: "/security", category: "Posture", dependencies: ["RLS Registry", "Zero Trust Engine"] },
      ];
    },
  },
  executive_readiness: {
    label: "Executive Readiness™",
    target: 100,
    owner: "Executive Platform",
    deepLink: "/executive-readiness",
    module: "Executive Intelligence Engine™",
    getScore: (s) => s.overview?.overallReadiness ?? 0,
    getContributions: (s) => [
      { id: "intelligence", label: "EXEC™ Intelligence™", weight: 0.20, score: s.cognitive?.overall ?? 0, owner: "AI Engineering", deepLink: "/developer/cognitive", category: "Intelligence", dependencies: ["Cognitive Excellence Engine™"] },
      { id: "stability", label: "Platform Stability™", weight: 0.20, score: s.stability?.overall ?? 0, owner: "Platform Engineering", deepLink: "/developer/stability", category: "Stability", dependencies: ["Platform Stability Engine™"] },
      { id: "experience", label: "Executive Experience™", weight: 0.20, score: s.experienceAudit?.score ?? 0, owner: "Experience Engineering", deepLink: "/developer/experience-audit", category: "Experience", dependencies: ["Platform Experience Audit™"] },
      { id: "enterprise", label: "Enterprise Readiness™", weight: 0.20, score: s.enterprise?.enterpriseScore ?? 0, owner: "Enterprise Engineering", deepLink: "/trust-center", category: "Enterprise", dependencies: ["Enterprise Trust Center™"] },
      { id: "launch", label: "Launch Preparation™", weight: 0.20, score: s.launchReadiness?.launchReadinessScore ?? 0, owner: "Release Engineering", deepLink: "/developer/launch-readiness", category: "Launch", dependencies: ["Launch Readiness Engine™"] },
    ],
  },
};

export const SCORE_IDS = Object.keys(SCORE_REGISTRY);

export function computeScoreExplanation(scoreId, snapshot) {
  const def = SCORE_REGISTRY[scoreId];
  if (!def) return null;

  const target = def.target;
  let rawContributions = safe(() => def.getContributions(snapshot), []);
  if (rawContributions.length === 0) {
    rawContributions = [{ id: "overall", label: def.label, weight: 1, score: 0, owner: def.owner, deepLink: def.deepLink, category: "Overall", dependencies: [def.module] }];
  }

  const pointsBased = def.pointsBased === true;
  let contributions, currentScore, formula, completedPoints, remainingPoints;

  if (pointsBased) {
    contributions = rawContributions.map((c) => {
      const maxPoints = c.maxPoints ?? 0;
      const earnedPoints = Math.max(0, Math.min(maxPoints, round1(Number(c.earnedPoints) || 0)));
      const gap = round1(Math.max(0, maxPoints - earnedPoints));
      return { ...c, maxPoints, earnedPoints, gap };
    });
    const totalMax = contributions.reduce((s, c) => s + c.maxPoints, 0);
    const totalEarned = contributions.reduce((s, c) => s + c.earnedPoints, 0);
    currentScore = totalMax > 0 ? round1((totalEarned / totalMax) * 100) : 0;
    contributions.sort((a, b) => b.gap - a.gap);
    formula = `${def.label} = ${contributions.map((c) => `${c.label} (${c.maxPoints} pts)`).join(" + ")} = ${totalMax} pts total`;
    completedPoints = round1(totalEarned);
    remainingPoints = round1(Math.max(0, totalMax - totalEarned));
  } else {
    currentScore = clamp(def.getScore(snapshot));
    contributions = rawContributions.map((c) => {
      const score = clamp(c.score ?? 0);
      const gap = Math.max(0, 100 - score);
      const gapContribution = round1(c.weight * gap);
      return { ...c, score, gap, gapContribution };
    });
    contributions.sort((a, b) => b.gapContribution - a.gapContribution);
    formula = `${def.label} = ${contributions.map((c) => `${c.label} (${Math.round(c.weight * 100)}%)`).join(" + ")}`;
    completedPoints = currentScore;
    remainingPoints = Math.max(0, target - currentScore);
  }

  const remaining = round1(Math.max(0, target - currentScore));

  const effortHours = contributions.reduce((sum, c) => {
    const gapVal = pointsBased ? c.gap : c.gapContribution;
    if (gapVal <= 0) return sum;
    const big = pointsBased ? 5 : 20;
    return sum + (gapVal > big ? 16 : gapVal > big / 2 ? 8 : gapVal > 1 ? 4 : 2);
  }, 0);

  let projectedCompletion;
  if (remaining <= 0) projectedCompletion = "Already at target";
  else if (effortHours > 0) {
    projectedCompletion = new Date(Date.now() + Math.ceil(effortHours / 8) * 86400000).toLocaleDateString();
  } else projectedCompletion = "At target";

  const confidence = currentScore >= 90 ? "High" : currentScore >= 75 ? "Medium" : "Low";
  const confidenceDetail = currentScore >= 90
    ? "High confidence — score is stable and at or near target"
    : currentScore >= 75
      ? "Medium confidence — approaching target but gaps remain"
      : "Low confidence — significant gap to target requires focused effort";

  return {
    scoreId, label: def.label, owner: def.owner, deepLink: def.deepLink, module: def.module,
    target, currentScore, remaining, contributions, formula,
    completedPoints, remainingPoints, projectedCompletion,
    engineeringEffort: effortHours > 0 ? `${effortHours} hours` : "None — at target",
    effortHours, confidence, confidenceDetail, pointsBased,
  };
}

export function computeContributionDetail(scoreId, contributionId, snapshot) {
  const explanation = computeScoreExplanation(scoreId, snapshot);
  if (!explanation) return null;
  const contribution = explanation.contributions.find((c) => c.id === contributionId);
  if (!contribution) return null;

  const def = SCORE_REGISTRY[scoreId];
  const pointsBased = explanation.pointsBased;

  if (pointsBased) {
    const { maxPoints, earnedPoints, gap } = contribution;
    const pct = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    const blockingIssues = [];
    if (gap > maxPoints * 0.5) {
      blockingIssues.push({ title: `${contribution.label} critically below target`, priority: "P0", status: "Blocking", description: `Earned ${earnedPoints}/${maxPoints} points (${pct}%) — a ${gap}-point gap.`, evidence: [`Earned: ${earnedPoints}/${maxPoints}`, `Gap: ${gap} pts`, `Category: ${contribution.category}`] });
    } else if (gap > 0) {
      blockingIssues.push({ title: `${contribution.label} below target`, priority: "P1", status: "Open", description: `Earned ${earnedPoints}/${maxPoints} points — a ${gap}-point gap to close.`, evidence: [`Earned: ${earnedPoints}/${maxPoints}`, `Gap: ${gap} pts`] });
    }
    const engineeringTasks = gap > maxPoints * 0.5
      ? [`Investigate root causes for ${contribution.label} underperformance (${earnedPoints}/${maxPoints})`, `Implement remediation plan for ${contribution.label}`, `Re-run ${def.module} to verify improvement`]
      : gap > 0
        ? [`Improve ${contribution.label} from ${earnedPoints} to ${maxPoints} points`, `Re-run ${def.module} to verify`]
        : [`${contribution.label} is at target — maintain current posture`];
    const effortHours = gap > maxPoints * 0.5 ? 16 : gap > maxPoints * 0.25 ? 8 : gap > 0 ? 4 : 0;
    const days = Math.ceil(effortHours / 8);
    const projectedCompletion = gap > 0 ? new Date(Date.now() + days * 86400000).toLocaleDateString() : "At target";
    const evidence = [
      `Earned points: ${earnedPoints}/${maxPoints}`,
      `Percentage: ${pct}%`,
      `Gap: ${gap} points`,
      `Category: ${contribution.category || "—"}`,
      `Source module: ${def.module}`,
      `Owner: ${contribution.owner}`,
      contribution.sourceScore !== undefined ? `Underlying score: ${contribution.sourceScore}/100` : `Stage status: ${contribution.stageStatus || "not_run"}`,
    ];
    return {
      ...contribution, scoreLabel: explanation.label, scoreId, pointsBased: true,
      target: maxPoints, gap, earnedPoints, maxPoints,
      blockingIssues, engineeringTasks, dependencies: contribution.dependencies || [],
      estimatedEffort: effortHours > 0 ? `${effortHours} hours` : "None — at target",
      effortHours, owner: contribution.owner, deepLink: contribution.deepLink,
      evidence, module: def.module, projectedCompletion,
    };
  }

  const gap = contribution.gap;
  const blockingIssues = [];
  if (gap > 30) {
    blockingIssues.push({ title: `${contribution.label} critically below target`, priority: "P0", status: "Blocking", description: `Score is ${contribution.score}/100 — a ${gap}-point gap. This is a major contributor to the ${explanation.label} gap.`, evidence: [`Current: ${contribution.score}/100`, `Target: 100`, `Gap: ${gap} pts`, `Weight: ${Math.round(contribution.weight * 100)}%`, `Gap contribution: ${contribution.gapContribution} pts`] });
  } else if (gap > 15) {
    blockingIssues.push({ title: `${contribution.label} below target`, priority: "P1", status: "Open", description: `Score is ${contribution.score}/100 — a ${gap}-point gap requires focused engineering effort.`, evidence: [`Current: ${contribution.score}/100`, `Gap: ${gap} pts`, `Weight: ${Math.round(contribution.weight * 100)}%`] });
  } else if (gap > 5) {
    blockingIssues.push({ title: `${contribution.label} needs improvement`, priority: "P2", status: "Open", description: `Score is ${contribution.score}/100 — a ${gap}-point gap to close.`, evidence: [`Current: ${contribution.score}/100`, `Gap: ${gap} pts`] });
  }
  const engineeringTasks = gap > 20
    ? [`Investigate root causes for ${contribution.label} underperformance (${contribution.score}/100)`, `Implement remediation plan for ${contribution.label}`, `Re-run ${def.module} to verify improvement`]
    : gap > 5
      ? [`Improve ${contribution.label} from ${contribution.score} to 100`, `Re-run ${def.module} to verify`]
      : gap > 0
        ? [`Optimize ${contribution.label} to close final ${gap}-point gap`]
        : [`${contribution.label} is at target — maintain current posture`];
  const effortHours = gap > 30 ? 16 : gap > 20 ? 8 : gap > 10 ? 4 : gap > 0 ? 2 : 0;
  const days = Math.ceil(effortHours / 8);
  const projectedCompletion = gap > 0 ? new Date(Date.now() + days * 86400000).toLocaleDateString() : "At target";
  const evidence = [
    `Current score: ${contribution.score}/100`, `Target: 100`, `Gap: ${gap} points`,
    `Weight in formula: ${Math.round(contribution.weight * 100)}%`,
    `Gap contribution: ${contribution.gapContribution} points to ${explanation.label}`,
    `Source module: ${def.module}`, `Owner: ${contribution.owner}`,
    `Category: ${contribution.category || "—"}`,
  ];
  return {
    ...contribution, scoreLabel: explanation.label, scoreId, pointsBased: false,
    target: 100, gap,
    blockingIssues, engineeringTasks, dependencies: contribution.dependencies || [],
    estimatedEffort: effortHours > 0 ? `${effortHours} hours` : "None — at target",
    effortHours, owner: contribution.owner, deepLink: contribution.deepLink,
    evidence, module: def.module, projectedCompletion,
  };
}

export function buildWhyNot100Context(scoreId, snapshot) {
  const exp = computeScoreExplanation(scoreId, snapshot);
  if (!exp) return "";
  const lines = [
    `SCORE: ${exp.label}`,
    `Current: ${exp.currentScore}/${exp.target}`,
    `Remaining: ${exp.remaining} points`,
    `Formula: ${exp.formula}`,
    `Completed Points: ${exp.completedPoints}/${exp.target}`,
    `Remaining Points: ${exp.remainingPoints}`,
    `Engineering Effort Remaining: ${exp.engineeringEffort}`,
    `Confidence: ${exp.confidence} (${exp.confidenceDetail})`,
    `Projected Completion: ${exp.projectedCompletion}`,
    ``,
    `CONTRIBUTION BREAKDOWN${exp.pointsBased ? " (points-based)" : ""}:`,
  ];
  if (exp.pointsBased) {
    exp.contributions.forEach((c) => {
      lines.push(`- ${c.label}: ${c.earnedPoints}/${c.maxPoints} pts (gap: ${c.gap} pts) [${c.category}]`);
    });
    const totalEarned = round1(exp.contributions.reduce((s, c) => s + c.earnedPoints, 0));
    const totalMax = exp.contributions.reduce((s, c) => s + c.maxPoints, 0);
    lines.push(``);
    lines.push(`RECONCILIATION:`);
    lines.push(`Sum of earned points: ${totalEarned} / ${totalMax}`);
    lines.push(`Displayed score: ${exp.currentScore}%`);
    lines.push(`Match: ${totalEarned === exp.currentScore ? "✓ RECONCILED" : "✗ MISMATCH"}`);
  } else {
    exp.contributions.forEach((c) => {
      lines.push(`- ${c.label}: score ${c.score}/100, weight ${Math.round(c.weight * 100)}%, gap ${c.gap}, contributes ${c.gapContribution} pts to remaining gap`);
    });
    lines.push(``);
    lines.push(`RECONCILIATION:`);
    lines.push(`Total gap contribution: ${exp.contributions.reduce((s, c) => s + c.gapContribution, 0)} pts (should ≈ ${exp.remaining})`);
  }
  return lines.join("\n");
}