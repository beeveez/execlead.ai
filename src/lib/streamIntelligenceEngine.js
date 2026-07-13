/**
 * EXECLEAD.AI — Executive Stream Intelligence™ Engine
 * ============================================================
 * Derives detailed diagnostics for each execution stream from the
 * live FounderSnapshot™. Replaces the static Stream Progress™ bars
 * with a full operational intelligence layer per stream.
 *
 * Per stream produces:
 *   Executive Summary · Current/Target Score · Gap Analysis ·
 *   Trend (30/90d) · Completed Milestones · Remaining Blockers ·
 *   Risks · Technical Debt · Engineering Recommendations ·
 *   Estimated Effort · Dependencies · Deep Links · History
 */
import { PLATFORM_METADATA } from "./platformManifest";

const HISTORY_KEY = "stream_intel_history";
const MAX_HISTORY = 200;

export const STREAM_CONFIG = {
  stability: {
    name: "Platform Stability™",
    module: "Platform Stability Engine™",
    deepLink: "/developer/stability",
    target: 95,
    owner: "Platform Infrastructure",
  },
  intelligence: {
    name: "EXEC™ Intelligence™",
    module: "Cognitive Excellence Engine™",
    deepLink: "/developer/cognitive",
    target: 90,
    owner: "AI Engineering",
  },
  experience: {
    name: "Executive Experience™",
    module: "Platform Autonomic Experience Engine™",
    deepLink: "/developer/experience-audit",
    target: 90,
    owner: "Experience Engineering",
  },
  enterprise: {
    name: "Enterprise Readiness™",
    module: "Enterprise Trust Center™",
    deepLink: "/trust-center",
    target: 90,
    owner: "Enterprise Engineering",
  },
  launch: {
    name: "Launch Preparation™",
    module: "Launch Readiness Engine™",
    deepLink: "/developer/launch-readiness",
    target: 100,
    owner: "Release Engineering",
  },
};

// ── History persistence ──
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function persistStreamSnapshot(streamId, score) {
  if (!STREAM_CONFIG[streamId]) return;
  const history = loadHistory();
  if (!history[streamId]) history[streamId] = [];
  const now = Date.now();
  const arr = history[streamId];
  if (arr.length > 0 && now - arr[arr.length - 1].t < 3600000) {
    arr[arr.length - 1] = { t: now, s: score };
  } else {
    arr.push({ t: now, s: score });
  }
  if (arr.length > MAX_HISTORY) history[streamId] = arr.slice(-MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export function getStreamHistory(streamId) {
  return loadHistory()[streamId] || [];
}

function computeTrend(history, currentScore) {
  const now = Date.now();
  const d30cutoff = now - 30 * 86400000;
  const d90cutoff = now - 90 * 86400000;
  const d30 = history.filter((h) => h.t >= d30cutoff);
  const d90 = history.filter((h) => h.t >= d90cutoff);
  const first = history.length > 0 ? history[0].s : currentScore;
  const delta = Math.round((currentScore - first) * 10) / 10;
  return {
    days30: d30,
    days90: d90,
    direction: delta > 2 ? "up" : delta < -2 ? "down" : "stable",
    delta,
  };
}

// ── Per-stream source extraction ──
function getSource(streamId, snapshot) {
  const stream = snapshot.streams?.find((s) => s.id === streamId);
  const completion = stream?.completion ?? 0;
  switch (streamId) {
    case "stability":
      return { score: snapshot.stability?.overall ?? completion, raw: snapshot.stability };
    case "intelligence":
      return { score: snapshot.cognitive?.overall ?? completion, raw: snapshot.cognitive };
    case "experience":
      return { score: snapshot.experienceAudit?.score ?? completion, raw: snapshot.experienceAudit };
    case "enterprise":
      return { score: snapshot.enterprise?.enterpriseScore ?? completion, raw: snapshot.enterprise };
    case "launch":
      return { score: snapshot.launchReadiness?.launchReadinessScore ?? completion, raw: snapshot.launchReadiness };
    default:
      return { score: completion, raw: null };
  }
}

// ── Blocker derivation per stream ──
function deriveBlockers(streamId, source, owner) {
  const blockers = [];
  const raw = source.raw || {};
  let idx = 1;
  const add = (title, priority, category, fix, effort, evidence) =>
    blockers.push({
      id: `${streamId}-B${String(idx++).padStart(2, "0")}`,
      title,
      owner,
      priority,
      category,
      status: "Open",
      evidence: evidence || [],
      recommendedFix: fix,
      estimatedEffort: effort,
    });

  if (streamId === "stability") {
    (raw.categories || []).forEach((c) => {
      if ((c.score ?? 100) < 85) {
        add(
          `${c.name || c.id} stability below target (${c.score ?? 0}%)`,
          c.score < 60 ? "P0" : c.score < 75 ? "P1" : "P2",
          "Stability",
          `Investigate ${c.name || c.id} category findings and apply remediations. Re-run Platform Stability Engine™ to verify improvement.`,
          c.score < 60 ? "1–2 days" : c.score < 75 ? "4–8 hours" : "2–4 hours",
          [`Category score: ${c.score ?? 0}/100`, c.id ? `Category ID: ${c.id}` : ""].filter(Boolean)
        );
      }
    });
  } else if (streamId === "intelligence") {
    (raw.pillars || []).forEach((p) => {
      if ((p.score ?? 100) < 85) {
        add(
          `${p.name || p.id} cognitive pillar below target (${p.score ?? 0}%)`,
          p.score < 60 ? "P0" : p.score < 75 ? "P1" : "P2",
          "Cognitive Excellence",
          `Strengthen the ${p.name || p.id} pillar — improve evidence coverage, reasoning chains, or prompt quality. Re-run Cognitive Excellence Engine™.`,
          p.score < 60 ? "2–3 days" : "1–2 days",
          [`Pillar score: ${p.score ?? 0}/100`, p.id ? `Pillar: ${p.id}` : ""].filter(Boolean)
        );
      }
    });
    (raw.supportingMetrics || []).forEach((m) => {
      if ((m.score ?? 100) < 70) {
        add(
          `Supporting metric "${m.name || m.id}" at ${m.score ?? 0}%`,
          "P2",
          "Cognitive Excellence",
          `Improve ${m.name || m.id} — review prompt templates and evidence resolution paths.`,
          "2–4 hours",
          [`Metric: ${m.score ?? 0}/100`]
        );
      }
    });
  } else if (streamId === "experience") {
    (raw.findings || []).forEach((f) => {
      const sev = f.severity || f.level || "warning";
      add(
        f.title || f.description || f.message || "Experience finding",
        sev === "error" || sev === "critical" ? "P0" : sev === "warning" ? "P1" : "P2",
        "Executive Experience",
        f.recommendation || f.recommendedAction || f.fix || "Apply recommended remediation from the Platform Experience Audit.",
        sev === "error" ? "4–8 hours" : "1–2 hours",
        [f.description || f.message || "", f.dimension ? `Dimension: ${f.dimension}` : ""].filter(Boolean)
      );
    });
  } else if (streamId === "enterprise") {
    (raw.items || []).forEach((item) => {
      if (item.status !== "implemented") {
        add(
          `${item.label} not yet ${item.status === "planned" ? "implemented" : "production-ready"}`,
          item.status === "planned" ? "P1" : "P2",
          "Enterprise Readiness",
          `Complete implementation and route verification for ${item.label}${item.route ? ` (route: ${item.route})` : ""}.`,
          "1–3 days",
          [`Current status: ${item.status}`, item.route ? `Route: ${item.route}` : ""].filter(Boolean)
        );
      }
    });
    const nonCompliant = (raw.complianceFrameworks || []).filter((c) => c.status !== "compliant" && c.status !== "certified");
    nonCompliant.slice(0, 3).forEach((c) => {
      add(
        `Compliance framework "${c.name}" at ${c.status}`,
        "P1",
        "Compliance",
        `Advance ${c.name} to compliant/certified status — complete required controls and evidence collection.`,
        "3–5 days",
        [`Framework: ${c.name}`, `Status: ${c.status}`]
      );
    });
  } else if (streamId === "launch") {
    (raw.phases || []).forEach((phase) => {
      if (!phase.passed) {
        (phase.requirements || []).filter((r) => !r.passed).slice(0, 4).forEach((req) => {
          add(
            `Launch phase "${phase.name}": ${req.label}`,
            "P0",
            "Launch Readiness",
            req.detail || req.action || `Resolve requirement "${req.label}" in phase ${phase.name} to advance launch readiness.`,
            "2–6 hours",
            [`Phase: ${phase.name}`, req.detail ? `Detail: ${req.detail}` : ""].filter(Boolean)
          );
        });
      }
    });
  }
  return blockers;
}

// ── Dependencies & deep links per stream ──
function deriveDependencies(streamId, snapshot) {
  const deps = {
    stability: [
      { name: "Platform Manifest™", type: "Engine", status: "Active", deepLink: "/developer" },
      { name: "Guardian™", type: "Engine", status: "Active", deepLink: "/guardian" },
    ],
    intelligence: [
      { name: "EXEC™ Knowledge Sync", type: "Engine", status: "Active", deepLink: "/developer/knowledge-sync" },
      { name: "ELIM Management Center™", type: "Module", status: "Active", deepLink: "/elim" },
    ],
    experience: [
      { name: "Platform Experience Audit™", type: "Engine", status: "Active", deepLink: "/developer/experience-audit" },
      { name: "Self-Healing Engine™", type: "Engine", status: "Active", deepLink: "/developer" },
    ],
    enterprise: [
      { name: "Trust Center™", type: "Module", status: "Active", deepLink: "/trust-center" },
      { name: "Vendor Due Diligence™", type: "Module", status: "Active", deepLink: "/vendor-due-diligence" },
    ],
    launch: [
      { name: "Launch Readiness Engine™", type: "Engine", status: "Active", deepLink: "/developer/launch-readiness" },
      { name: "Deployment Center™", type: "Module", status: "Active", deepLink: "/developer/deployments" },
    ],
  };
  return deps[streamId] || [];
}

function deriveDeepLinks(streamId, snapshot) {
  const links = {
    stability: [
      { label: "Platform Stability Dashboard", route: "/developer/stability", status: "active" },
      { label: "System Health", route: "/developer/system-health", status: "active" },
    ],
    intelligence: [
      { label: "Cognitive Excellence Dashboard", route: "/developer/cognitive", status: "active" },
      { label: "EXEC™ Intelligence Center", route: "/intelligence", status: "active" },
      { label: "ELIM Management", route: "/elim", status: "active" },
    ],
    experience: [
      { label: "Experience Audit", route: "/developer/experience-audit", status: "active" },
      { label: "Developer Console", route: "/developer", status: "active" },
    ],
    enterprise: [
      { label: "Trust Center", route: "/trust-center", status: "active" },
      { label: "Enterprise Dashboard", route: "/enterprise", status: "active" },
      { label: "Vendor Due Diligence", route: "/vendor-due-diligence", status: "active" },
    ],
    launch: [
      { label: "Launch Readiness", route: "/developer/launch-readiness", status: "active" },
      { label: "Deployment Center", route: "/developer/deployments", status: "active" },
    ],
  };
  return links[streamId] || [];
}

// ── Main compute ──
export function computeStreamIntelligence(streamId, snapshot) {
  const config = STREAM_CONFIG[streamId];
  if (!config) return null;

  const source = getSource(streamId, snapshot);
  const currentScore = Math.round(source.score);
  const targetScore = config.target;
  const gap = Math.max(0, targetScore - currentScore);

  const blockers = deriveBlockers(streamId, source, config.owner);
  const p0Count = blockers.filter((b) => b.priority === "P0").length;

  const history = getStreamHistory(streamId);
  const trend = computeTrend(history, currentScore);

  const completedMilestones = history
    .filter((h, i) => i > 0 && h.s >= targetScore && history[i - 1].s < targetScore)
    .map((h) => ({ label: `${config.name} reached ${targetScore}%`, date: new Date(h.t).toISOString() }));
  if (currentScore >= targetScore && completedMilestones.length === 0) {
    completedMilestones.push({ label: `${config.name} at target (${targetScore}%)`, date: new Date().toISOString() });
  }

  const techDebtItems = blockers.map((b) => ({
    id: b.id,
    title: b.title,
    effort: b.estimatedEffort,
    priority: b.priority,
  }));
  const effortHours = blockers.reduce((sum, b) => {
    const m = b.estimatedEffort.match(/(\d+)/);
    return sum + (m ? parseInt(m[1]) : 2);
  }, 0);

  const risks = blockers.slice(0, 5).map((b) => ({
    description: b.title,
    severity: b.priority === "P0" ? "Critical" : b.priority === "P1" ? "High" : "Medium",
    likelihood: b.priority === "P0" ? "High" : "Medium",
    impact: b.priority === "P0" ? "High" : b.priority === "P1" ? "Medium" : "Low",
  }));

  const recommendations = [];
  if (p0Count > 0) recommendations.push(`Resolve ${p0Count} P0 blocker(s) immediately — these block ${config.name} advancement.`);
  if (gap > 0) recommendations.push(`Close a ${gap}-point gap to reach the ${targetScore}% target.`);
  recommendations.push(`Focus engineering effort on ${config.owner} priorities: ${blockers.slice(0, 3).map((b) => b.title).join("; ") || "no critical blockers — maintain posture"}.`);
  if (trend.direction === "down") recommendations.push(`Score trending down (${trend.delta} points) — investigate regression root causes.`);
  recommendations.push(`Re-run ${config.module} after remediation to verify improvement.`);

  const estimatedEffort =
    blockers.length === 0
      ? "< 1 day (monitoring only)"
      : p0Count > 0
        ? `${effortHours}–${effortHours + 4} hours (P0 priority)`
        : `${effortHours} hours`;

  const executiveSummary = `${config.name} is at ${currentScore}/${targetScore}% (${gap > 0 ? `${gap} points below target` : "at or above target"}). ${blockers.length} blocker(s) identified (${p0Count} P0). Trend is ${trend.direction} (${trend.delta >= 0 ? "+" : ""}${trend.delta} pts). ${gap <= 0 ? "Stream is on target." : `Estimated ${estimatedEffort} to close the gap.`}`;

  return {
    streamId,
    streamName: config.name,
    module: config.module,
    deepLink: config.deepLink,
    owner: config.owner,
    executiveSummary,
    currentScore,
    targetScore,
    gap,
    gapAnalysis:
      gap <= 0
        ? `Stream has reached or exceeded its ${targetScore}% target. Focus shifts to monitoring and continuous improvement.`
        : `A ${gap}-point gap remains. ${p0Count} P0 blocker(s) and ${blockers.length - p0Count} lower-priority items must be resolved. At current velocity, estimated ${estimatedEffort} of engineering effort is required.`,
    trend,
    completedMilestones,
    blockers,
    risks,
    technicalDebt: { count: blockers.length, hours: effortHours, items: techDebtItems },
    engineeringRecommendations: recommendations,
    estimatedEffort,
    dependencies: deriveDependencies(streamId, snapshot),
    deepLinks: deriveDeepLinks(streamId, snapshot),
    history: {
      daily: history.slice(-30),
      weekly: history.filter((_, i) => i % Math.max(1, Math.floor(history.length / 12)) === 0).slice(-12),
      monthly: history.slice(-12),
      milestones: completedMilestones,
    },
    sourceData: source.raw,
    computedAt: new Date().toISOString(),
  };
}

// ── EXEC™ copilot telemetry context (live data, not generic) ──
export function buildStreamCopilotContext(streamId, snapshot) {
  const intel = computeStreamIntelligence(streamId, snapshot);
  if (!intel) return "";
  const lines = [
    `STREAM: ${intel.streamName} (${intel.module})`,
    `Current Score: ${intel.currentScore}/${intel.targetScore} (gap: ${intel.gap})`,
    `Trend: ${intel.trend.direction} (${intel.trend.delta >= 0 ? "+" : ""}${intel.trend.delta} pts over ${intel.trend.days90.length || 0} data points)`,
    `Blockers: ${intel.blockers.length} total (${intel.blockers.filter((b) => b.priority === "P0").length} P0, ${intel.blockers.filter((b) => b.priority === "P1").length} P1, ${intel.blockers.filter((b) => b.priority === "P2").length} P2)`,
    `Technical Debt: ${intel.technicalDebt.count} items, ~${intel.technicalDebt.hours} hours`,
    `Estimated Effort to target: ${intel.estimatedEffort}`,
    ``,
    `BLOCKERS (live telemetry):`,
    ...intel.blockers.map((b) => `- [${b.priority}] ${b.title} | Owner: ${b.owner} | Fix: ${b.recommendedFix} | Effort: ${b.estimatedEffort}`),
    ``,
    `RISKS:`,
    ...intel.risks.map((r) => `- ${r.severity}: ${r.description} (likelihood ${r.likelihood}, impact ${r.impact})`),
    ``,
    `ENGINEERING RECOMMENDATIONS:`,
    ...intel.engineeringRecommendations.map((r) => `- ${r}`),
    ``,
    `SOURCE DATA:`,
    JSON.stringify(intel.sourceData || {}, null, 2).slice(0, 1500),
  ];
  return lines.join("\n");
}