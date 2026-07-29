/**
 * Intelligence Investigation Engine™ v2.0
 * --------------------------------------------------
 * Derives interactive investigation & remediation data from the existing
 * Intelligence Analysis data WITHOUT modifying any scoring logic.
 *
 * Produces: issues, affected components, recommended fixes (auto/manual),
 * AI explanations, impact analysis, timeline, activity log, score history,
 * dependency graph, AI recommendations, and per-metric comments.
 */
import { getIntelligenceAnalysis } from "@/lib/intelligenceAnalysisData";

const COMMENTS_KEY = "intelligence_comments_v2";

function loadAllComments() {
  try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || "{}"); } catch { return {}; }
}
function saveComments(all) {
  try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(all)); } catch {}
}

export function getComments(metricId) {
  return loadAllComments()[metricId] || [];
}
export function addComment(metricId, comment) {
  const all = loadAllComments();
  const list = all[metricId] || [];
  const entry = { id: `c-${Date.now()}`, author: comment.author || "You", text: comment.text, timestamp: new Date().toISOString() };
  list.push(entry);
  all[metricId] = list;
  saveComments(all);
  return list;
}
export function deleteComment(metricId, commentId) {
  const all = loadAllComments();
  const list = (all[metricId] || []).filter((c) => c.id !== commentId);
  all[metricId] = list;
  saveComments(all);
  return list;
}

const SEVERITY_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };

/**
 * Derive a structured issue list from concerns, adding detected/updated dates,
 * business & technical impact, and estimated score improvement.
 */
export function deriveIssues(analysis) {
  if (!analysis?.concerns) return [];
  const baseDate = analysis.historicalTrend?.validationHistory?.[0]?.timestamp || "2026-07-10";
  return analysis.concerns.map((c, i) => ({
    id: `${analysis.metricId}-issue-${i + 1}`,
    title: c.title,
    description: c.description,
    severity: c.severity,
    businessImpact: analysis.businessImpact?.platform?.[0] || "Reduces platform intelligence score",
    technicalImpact: c.workspace ? `Affects ${c.workspace} workflows` : "Operational impact detected",
    estimatedImprovement: c.pointsLost || "—",
    status: c.status,
    detectedDate: baseDate,
    lastUpdated: analysis.executiveSummary?.lastUpdated || "recently",
    owner: c.owner,
    confidence: c.confidence,
    component: c.workspace,
  }));
}

/**
 * Derive affected components by grouping issues by their workspace component.
 * Each component gets a derived current/target score and issue count.
 */
export function deriveComponents(analysis) {
  if (!analysis) return [];
  const issues = deriveIssues(analysis);
  const targetScore = analysis.executiveSummary?.target || 100;
  const currentScore = analysis.executiveSummary?.currentScore || 0;
  const groups = {};
  issues.forEach((iss) => {
    const key = iss.component || "Platform";
    if (!groups[key]) groups[key] = { component: key, issues: [], maxSeverity: "Low", owner: iss.owner };
    groups[key].issues.push(iss);
    if ((SEVERITY_RANK[iss.severity] || 0) > (SEVERITY_RANK[groups[key].maxSeverity] || 0)) {
      groups[key].maxSeverity = iss.severity;
    }
  });
  return Object.values(groups).map((g, i) => {
    const penalty = g.issues.length * 3;
    return {
      component: g.component,
      currentScore: Math.max(0, targetScore - penalty),
      targetScore,
      issueCount: g.issues.length,
      severity: g.maxSeverity,
      owner: g.owner,
      lastUpdated: analysis.executiveSummary?.lastUpdated || "recently",
      status: g.issues.every((x) => x.status === "Resolved") ? "Resolved" : g.issues.some((x) => x.status === "In Progress") ? "In Progress" : "Open",
    };
  });
}

/**
 * Derive recommended fixes from recommendations, classifying auto-fix vs manual
 * and adding complexity, risk, dependencies, and step lists.
 */
export function deriveFixes(analysis) {
  if (!analysis?.recommendations) return [];
  return analysis.recommendations.map((r, i) => {
    const isAutoFix = /repair|optimize|recalibrate|complete|resolve|fill|register/i.test(r.action || r.title || "");
    const effort = r.estimatedEffort || "—";
    const hours = parseInt(effort, 10);
    const complexity = hours <= 1 || /minutes|hour/i.test(effort) ? "Low" : /day/i.test(effort) && hours <= 2 ? "Medium" : /week/i.test(effort) || hours > 5 ? "High" : "Medium";
    const risk = isAutoFix && complexity === "Low" ? "Low" : complexity === "High" ? "High" : "Medium";
    return {
      id: `${analysis.metricId}-fix-${i + 1}`,
      priority: r.priority,
      title: r.title,
      description: r.description,
      recommendedAction: r.action || "Apply Fix",
      expectedImprovement: r.expectedImprovement || "—",
      estimatedTime: effort,
      complexity,
      risk,
      dependencies: r.blockingDependency || "—",
      fixType: isAutoFix ? "auto" : "manual",
      owner: r.owner,
      confidence: r.confidence,
      to: r.to,
      steps: isAutoFix
        ? ["Review the proposed change", "Apply the automated remediation", "Validate the updated score"]
        : ["Navigate to the target module", "Review current configuration", "Apply the manual change", "Re-run analysis to validate"],
    };
  });
}

/**
 * Generate AI explanations at four levels from existing analysis data.
 */
export function deriveAiExplanation(analysis) {
  if (!analysis) return null;
  const es = analysis.executiveSummary;
  return {
    simple: `${analysis.label} is at ${es.currentScore} out of ${es.target}. The gap of ${es.gap} point(s) comes from ${analysis.concerns?.length || 0} open issue(s).`,
    technical: analysis.concerns?.map((c) => `${c.title}: ${c.description}`).join(" ") || "No technical issues detected.",
    executiveSummary: `${analysis.label} ${es.status}. Severity: ${es.severity}. Recovery estimate: ${es.recoveryEstimate}. ${analysis.businessImpact?.executive?.[0] || ""}`,
    businessValue: analysis.businessImpact?.customer?.[0] || "Direct impact on platform quality and user experience.",
  };
}

/**
 * Derive impact analysis from forecast + business impact.
 */
export function deriveImpactAnalysis(analysis) {
  if (!analysis) return null;
  const es = analysis.executiveSummary;
  const forecast = analysis.forecast || [];
  const finalScore = forecast.length > 1 ? forecast[forecast.length - 1].score : es.target;
  return {
    currentScore: es.currentScore,
    targetScore: es.target,
    improvement: es.target - es.currentScore,
    businessValue: analysis.businessImpact?.customer?.[0] || "Improved platform quality",
    riskReduction: analysis.deploymentRisks?.blockingIssues?.length > 0 ? "Unblocks deployment gate" : "Reduces operational risk",
    governanceImprovement: `Closes ${analysis.concerns?.length || 0} governance finding(s)`,
    projectedFinalScore: finalScore,
  };
}

/**
 * Derive a timeline of issue lifecycle events.
 */
export function deriveTimeline(analysis) {
  if (!analysis) return [];
  const events = [];
  const issues = deriveIssues(analysis);
  const trend = analysis.historicalTrend;
  issues.forEach((iss) => {
    events.push({ event: "Issue Detected", detail: iss.title, timestamp: iss.detectedDate, type: "detected" });
    events.push({ event: "Issue Updated", detail: `${iss.title} — ${iss.status}`, timestamp: iss.lastUpdated, type: "updated" });
  });
  if (trend?.resolvedIssues > 0) events.push({ event: "Issues Resolved", detail: `${trend.resolvedIssues} issue(s) resolved`, timestamp: trend.validationHistory?.[trend.validationHistory.length - 1]?.timestamp || "recently", type: "resolved" });
  (analysis.recommendations || []).forEach((r) => {
    events.push({ event: "Fix Available", detail: r.title, timestamp: es_lastUpdated(analysis), type: "fix" });
  });
  (trend?.validationHistory || []).forEach((h) => {
    events.push({ event: "Score Recalculated", detail: `Score moved to ${h.score}`, timestamp: h.timestamp, type: "recalc" });
  });
  return events.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
function es_lastUpdated(a) { return a.executiveSummary?.lastUpdated || "recently"; }

/**
 * Derive an activity log (who/what/when/before/after) from historical trend + evidence.
 */
export function deriveActivityLog(analysis) {
  if (!analysis) return [];
  const log = [];
  const trend = analysis.historicalTrend;
  const hist = trend?.validationHistory || [];
  for (let i = 1; i < hist.length; i++) {
    log.push({
      actor: "Validation Engine",
      action: "Score recalculated",
      timestamp: hist[i].timestamp,
      before: String(hist[i - 1].score),
      after: String(hist[i].score),
    });
  }
  (analysis.evidence || []).forEach((e) => {
    log.push({ actor: e.source, action: "Evidence recorded", timestamp: e.timestamp, before: "—", after: e.detail });
  });
  (analysis.recommendations || []).forEach((r) => {
    log.push({ actor: r.owner, action: `Recommended: ${r.title}`, timestamp: es_lastUpdated(analysis), before: "—", after: r.expectedImprovement });
  });
  return log.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

/**
 * Expand the 3-point validation history into 7/30/90-day score history series.
 */
export function deriveScoreHistory(analysis) {
  if (!analysis) return { 7: [], 30: [], 90: [] };
  const hist = analysis.historicalTrend?.validationHistory || [];
  const current = analysis.executiveSummary?.currentScore || 0;
  const previous = analysis.historicalTrend?.previousScore || current;
  const base = hist.length ? hist[0].score : previous;
  const last = hist.length ? hist[hist.length - 1].score : current;
  const mid = hist.length > 1 ? hist[1].score : Math.round((base + last) / 2);
  const gen = (n, start, end) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const noise = Math.sin(i * 1.3) * 1.5;
      out.push({ day: i, score: Math.round(start + (end - start) * t + noise) });
    }
    return out;
  };
  return {
    7: gen(7, last, current),
    30: gen(30, base, current),
    90: gen(90, Math.max(0, base - 5), current),
  };
}

/**
 * Derive dependency graph nodes & edges with broken-dependency highlighting.
 */
export function deriveDependencyGraph(analysis) {
  if (!analysis) return { nodes: [], edges: [] };
  const es = analysis.executiveSummary;
  const isBlocked = es.currentScore < es.target && es.severity === "high";
  const nodes = [
    { id: analysis.metricId, label: analysis.label, type: "metric", score: es.currentScore, broken: isBlocked },
    ...(analysis.dependencies || []).map((d) => {
      const id = d.to.split("/").filter(Boolean).pop() || d.name;
      return { id, label: d.name, type: "dependency", score: null, broken: false, to: d.to };
    }),
  ];
  const edges = (analysis.dependencies || []).map((d) => {
    const id = d.to.split("/").filter(Boolean).pop() || d.name;
    return { from: analysis.metricId, to: id, broken: isBlocked };
  });
  return { nodes, edges };
}

/**
 * Categorize recommendations into AI recommendation buckets.
 */
export function deriveAiRecommendations(analysis) {
  const fixes = deriveFixes(analysis);
  if (!fixes.length) return { topPriority: [], quickWins: [], highImpact: [], longTerm: [] };
  return {
    topPriority: fixes.filter((f) => f.priority === 1),
    quickWins: fixes.filter((f) => f.complexity === "Low"),
    highImpact: fixes.filter((f) => /week/i.test(f.estimatedTime) || f.complexity === "High"),
    longTerm: fixes.filter((f) => f.complexity === "High"),
  };
}

/**
 * Full investigation bundle for a metric.
 */
export function getInvestigationBundle(metricId) {
  const analysis = getIntelligenceAnalysis(metricId);
  if (!analysis) return null;
  return {
    metricId,
    label: analysis.label,
    analysis,
    issues: deriveIssues(analysis),
    components: deriveComponents(analysis),
    fixes: deriveFixes(analysis),
    aiExplanation: deriveAiExplanation(analysis),
    impactAnalysis: deriveImpactAnalysis(analysis),
    timeline: deriveTimeline(analysis),
    activityLog: deriveActivityLog(analysis),
    scoreHistory: deriveScoreHistory(analysis),
    dependencyGraph: deriveDependencyGraph(analysis),
    aiRecommendations: deriveAiRecommendations(analysis),
    comments: getComments(metricId),
    summary: {
      overallScore: analysis.executiveSummary.currentScore,
      target: analysis.executiveSummary.target,
      trend: analysis.executiveSummary.trend,
      severity: analysis.executiveSummary.severity,
      businessImpact: analysis.businessImpact,
      issueCount: analysis.concerns?.length || 0,
      resolvedCount: analysis.historicalTrend?.resolvedIssues || 0,
      pendingCount: (analysis.concerns?.length || 0) - (analysis.historicalTrend?.resolvedIssues || 0),
      estimatedImprovement: `+${analysis.executiveSummary.gap} points to target`,
    },
  };
}