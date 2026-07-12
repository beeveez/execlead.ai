/**
 * EXECLEAD.AI — Platform Self-Healing Engine™
 * -------------------------------------------
 * Wraps the Discovery Engine with a full repair lifecycle:
 *
 *   detected → patch_generated → applied → verified → closed
 *                                    ↘ failed → queued_for_review
 *
 * Capabilities:
 *   - runSelfHealingCycle()  Full cycle: analyze → classify → generate patches → verify
 *   - getHistory()            Past run snapshots with score/findings/repairs
 *   - getRecurringIssues()    Learning Engine — findings that persist across runs
 *   - markApplied/verifyAll   Manual lifecycle transitions
 *   - dismissFinding / exportAudit
 *
 * Persistence: localStorage (per-workspace, per-developer). No backend needed —
 * this is a developer tool, and the findings are derived from source code, not
 * runtime data.
 */
import { runPlatformExperienceAudit } from "./platformExperienceAudit";

const HISTORY_KEY = "exec_self_healing_history";
const LIFECYCLE_KEY = "exec_self_healing_lifecycle";
const MAX_HISTORY = 25;

// ─── Lifecycle state per finding signature ───
function loadLifecycle() {
  try { return JSON.parse(localStorage.getItem(LIFECYCLE_KEY) || "{}"); } catch { return {}; }
}
function saveLifecycle(state) {
  try { localStorage.setItem(LIFECYCLE_KEY, JSON.stringify(state)); } catch {}
}

function getLifecycleEntry(signature) {
  const state = loadLifecycle();
  return state[signature] || { status: "open", history: [] };
}

function setLifecycleEntry(signature, entry) {
  const state = loadLifecycle();
  state[signature] = entry;
  saveLifecycle(state);
}

function logLifecycleEvent(entry, action, detail = "") {
  entry.history = entry.history || [];
  entry.history.push({ action, detail, timestamp: new Date().toISOString() });
  entry.lastUpdated = new Date().toISOString();
}

// ─── Public lifecycle actions ───
export function markApplied(signature) {
  const entry = getLifecycleEntry(signature);
  entry.status = "applied";
  logLifecycleEvent(entry, "marked_applied", "Developer confirmed the repair patch was applied");
  setLifecycleEntry(signature, entry);
}

export function dismissFinding(signature, reason = "") {
  const entry = getLifecycleEntry(signature);
  entry.status = "dismissed";
  logLifecycleEvent(entry, "dismissed", reason || "Manually dismissed");
  setLifecycleEntry(signature, entry);
}

export function resetFinding(signature) {
  const entry = getLifecycleEntry(signature);
  entry.status = "open";
  logLifecycleEvent(entry, "reset", "Lifecycle reset to open");
  setLifecycleEntry(signature, entry);
}

// ─── Full self-healing cycle ───
export function runSelfHealingCycle() {
  const result = runPlatformExperienceAudit();

  // Attach lifecycle state + patch to each finding
  const findings = result.findings.map((f) => {
    const lc = getLifecycleEntry(f.signature);
    return { ...f, lifecycle: lc.status, lifecycleHistory: lc.history || [] };
  });

  // Verification Engine: check previously-applied findings
  // If a finding that was "applied" is STILL detected → it failed verification
  // If a finding that was "applied" is NO LONGER detected → verified/closed
  const lifecycle = loadLifecycle();
  const currentSignatures = new Set(findings.map((f) => f.signature));
  let verifiedCount = 0, failedCount = 0;

  Object.entries(lifecycle).forEach(([sig, entry]) => {
    if (entry.status === "applied") {
      if (!currentSignatures.has(sig)) {
        // Successfully resolved
        const updated = { ...entry, status: "verified" };
        logLifecycleEvent(updated, "verified", "Issue no longer detected after re-run — repair confirmed");
        lifecycle[sig] = updated;
        verifiedCount++;
      } else {
        // Still present — repair failed or wasn't applied correctly
        const updated = { ...entry, status: "failed" };
        logLifecycleEvent(updated, "verification_failed", "Issue still present after marked-applied — queued for review");
        lifecycle[sig] = updated;
        failedCount++;
      }
    }
  });
  saveLifecycle(lifecycle);

  // Learning Engine: detect recurring issues
  const recurring = getRecurringIssues();

  // Snapshot to history
  const snapshot = {
    id: `run-${Date.now()}`,
    timestamp: result.generatedAt,
    score: result.score,
    tier: result.tier.label,
    totalFindings: result.totalFindings,
    autoRepairable: result.summary.autoRepairable,
    signatures: findings.map((f) => f.signature),
    verifiedCount,
    failedCount,
  };
  pushHistory(snapshot);

  return {
    ...result,
    findings,
    verification: { verifiedCount, failedCount },
    recurring,
  };
}

// ─── History ───
function pushHistory(snapshot) {
  const history = getHistory();
  history.push(snapshot);
  if (history.length > MAX_HISTORY) history.shift();
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

// ─── Learning Engine ───
export function getRecurringIssues() {
  const history = getHistory();
  if (history.length < 2) return [];

  const lastRun = history[history.length - 1];
  const prevRun = history[history.length - 2];
  const prevSigs = new Set(prevRun.signatures);

  // Recurring = present in the last run AND the previous run
  return lastRun.signatures
    .filter((sig) => prevSigs.has(sig))
    .map((sig) => {
      const occurrences = history.filter((h) => h.signatures.includes(sig)).length;
      return { signature: sig, occurrences, firstSeen: history[0].timestamp, lastSeen: lastRun.timestamp };
    })
    .sort((a, b) => b.occurrences - a.occurrences);
}

// ─── Export ───
export function exportAuditJSON(cycleResult) {
  const payload = {
    generatedAt: cycleResult.generatedAt,
    score: cycleResult.score,
    tier: cycleResult.tier.label,
    summary: cycleResult.summary,
    dimensions: cycleResult.dimensions,
    verification: cycleResult.verification,
    findings: cycleResult.findings.map((f) => ({
      id: f.id, type: f.type, severity: f.severity, title: f.title,
      detail: f.detail, route: f.route, auto_repairable: f.auto_repairable,
      confidence: f.confidence, lifecycle: f.lifecycle,
      repair_patch: f.repair_patch || null,
    })),
    recurring: cycleResult.recurring,
    history: getHistory(),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadAuditJSON(cycleResult) {
  const json = exportAuditJSON(cycleResult);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exec-experience-audit-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Rollback Engine™ ───
// Explicitly marks a finding as rolled back — the developer undid the code change
// because verification failed. Logs the rollback for audit history.
export function rollbackFinding(signature, reason = "") {
  const entry = getLifecycleEntry(signature);
  const prevState = entry.status;
  entry.status = "rolled_back";
  entry.rolledBackFrom = prevState;
  logLifecycleEvent(entry, "rolled_back", reason || `Verification failed — restoring previous state (was ${prevState})`);
  setLifecycleEntry(signature, entry);
}

// ─── Engineering Metrics ───
// Computes the full Engineering Dashboard KPI set from lifecycle state + history.
export function computeEngineeringMetrics(cycleResult) {
  const lifecycle = loadLifecycle();
  const entries = Object.values(lifecycle);
  const todayStr = new Date().toDateString();

  const repairedToday = entries.filter((e) =>
    e.history?.some((h) => h.action === "marked_applied" && new Date(h.timestamp).toDateString() === todayStr)
  ).length;

  const verified = entries.filter((e) => e.status === "verified").length;
  const failed = entries.filter((e) => e.status === "failed").length;
  const rolledBack = entries.filter((e) => e.status === "rolled_back").length;
  const totalAttempts = verified + failed + rolledBack;
  const verificationSuccessRate = totalAttempts > 0 ? Math.round((verified / totalAttempts) * 100) : 100;

  // Technical debt: sum of estimated fix minutes for all open/applied/failed findings
  const techDebtMinutes = (cycleResult?.findings || [])
    .filter((f) => f.lifecycle !== "verified" && f.lifecycle !== "dismissed")
    .reduce((sum, f) => sum + (parseInt(f.estimated_fix_time) || 0), 0);

  // Engineering hours saved: each verified repair saved its estimated fix time
  const hoursSavedMinutes = entries
    .filter((e) => e.status === "verified")
    .reduce((sum, e) => sum + (parseInt(e.savedMinutes) || 3), 0);

  const recurring = getRecurringIssues();

  return {
    totalFindings: cycleResult?.findings?.length || 0,
    autoRepairable: cycleResult?.summary?.autoRepairable || 0,
    requiresReview: cycleResult?.summary?.requiresReview || 0,
    repairedToday,
    pendingReview: cycleResult?.summary?.requiresReview || 0,
    verificationSuccessRate,
    rollbackCount: rolledBack + failed,
    recurringCount: recurring.length,
    technicalDebtHours: Math.round((techDebtMinutes / 60) * 10) / 10,
    engineeringHoursSaved: Math.round((hoursSavedMinutes / 60) * 10) / 10,
    experienceScore: cycleResult?.score || 0,
    expectedAfterRepair: cycleResult?.summary?.expectedScoreAfterRepair || 0,
  };
}

// ─── Recommendation Engine™ ───
// Analyzes recurring patterns + current findings to suggest structural fixes.
export function generateRecommendations(cycleResult) {
  const recs = [];
  const recurring = getRecurringIssues();
  const findings = cycleResult?.findings || [];

  // Cluster recurring issues by type
  const recurringByType = {};
  recurring.forEach((r) => {
    const type = r.signature.split(":")[0];
    recurringByType[type] = (recurringByType[type] || 0) + 1;
  });
  Object.entries(recurringByType).forEach(([type, count]) => {
    if (count >= 2) {
      recs.push({
        priority: "high",
        title: `Structural fix needed — recurring ${type.replace(/_/g, " ")} (${count} runs)`,
        detail: `${count} recurring instances across audit runs. Individual patches keep regenerating — a structural guard is needed.`,
        action: `Implement a permanent prevention: CI check, lint rule, or registry validator that blocks ${type} from recurring.`,
      });
    }
  });

  // Broken nav — critical, user-facing
  const broken = findings.filter((f) => f.type === "broken_nav");
  if (broken.length > 0) {
    recs.push({
      priority: "critical",
      title: `${broken.length} broken nav link${broken.length !== 1 ? "s" : ""} — users hitting dead ends`,
      detail: "Sidebar items point to unregistered routes. This is a live user-facing issue.",
      action: "Remove the broken nav items or register the missing routes immediately.",
    });
  }

  // Orphan route cluster
  const orphans = findings.filter((f) => f.type === "orphan_route");
  if (orphans.length >= 3) {
    recs.push({
      priority: "medium",
      title: `${orphans.length} orphan routes — nav completeness gap`,
      detail: "Multiple routes have no sidebar entry. The workspace nav definitions lag behind route additions.",
      action: "Add a CI check that fails when a registered route lacks a nav entry in WORKSPACE_NAV.",
    });
  }

  // Score below target
  if ((cycleResult?.score || 0) < 90) {
    recs.push({
      priority: "high",
      title: `Experience Score ${cycleResult?.score} — below the 90 production target`,
      detail: `Applying all ${cycleResult?.summary?.autoRepairable || 0} safe repairs would raise the score to ${cycleResult?.summary?.expectedScoreAfterRepair || 0}.`,
      action: "Apply all auto-repairable findings, mark them applied, then re-run verification.",
    });
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
}

// ─── EXEC™ Experience Intelligence context builder ───
// Serializes live audit telemetry into a context string for InvokeLLM.
export function buildExecContext(cycleResult) {
  if (!cycleResult) return "No audit data available.";
  const findings = cycleResult.findings || [];
  const byType = {};
  findings.forEach((f) => { byType[f.type] = (byType[f.type] || 0) + 1; });
  const bySev = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach((f) => { bySev[f.severity]++; });

  const metrics = computeEngineeringMetrics(cycleResult);
  const recurring = getRecurringIssues();

  return `EXECLEAD.AI PLATFORM EXPERIENCE AUDIT — LIVE TELEMETRY

SCORE: ${cycleResult.score}/100 (${cycleResult.tier?.label || "Unknown"})
TARGET: 90

FINDINGS: ${findings.length} total
  Critical: ${bySev.critical}
  High: ${bySev.high}
  Medium: ${bySev.medium}
  Low: ${bySev.low}

BY TYPE: ${Object.entries(byType).map(([t, c]) => `${t}: ${c}`).join(", ")}

REPAIRABILITY:
  Auto-Repairable: ${metrics.autoRepairable}
  Requires Review: ${metrics.requiresReview}
  Expected Score After Repair: ${metrics.expectedAfterRepair}

ENGINEERING METRICS:
  Repaired Today: ${metrics.repairedToday}
  Verification Success Rate: ${metrics.verificationSuccessRate}%
  Rollback Count: ${metrics.rollbackCount}
  Technical Debt: ${metrics.technicalDebtHours} hours
  Engineering Hours Saved: ${metrics.engineeringHoursSaved} hours

RECURRING ISSUES: ${recurring.length}
${recurring.slice(0, 5).map((r) => `  - ${r.signature} (${r.occurrences} runs)`).join("\n")}

TOP FINDINGS (first 15):
${findings.slice(0, 15).map((f) => `- [${f.severity.toUpperCase()}] ${f.title} — ${f.detail} (Auto-repairable: ${f.auto_repairable}, Lifecycle: ${f.lifecycle})`).join("\n")}
`;
}