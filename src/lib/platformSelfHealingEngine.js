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