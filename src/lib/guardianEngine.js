/**
 * EXECLEAD.AI — Guardian™ Self-Healing Engine
 * --------------------------------------------
 * Background consistency validation + confidence-based auto-repair.
 *
 * Triggers: startup, interval, deployment, feature_update, navigation_change, manual
 * Checks: routes, navigation, permissions, feature registry, feature flags,
 *         plans, page components, role mappings (via runConsistencyCheck)
 *
 * Confidence tiers:
 *   95–100% → apply automatically
 *   70–94%  → queue for manual approval
 *   < 70%   → alert only (no modification)
 *
 * Every repair: snapshot before → apply → validate health → rollback if degraded.
 * Every repair is recorded to the GuardianActivity entity (audit log).
 */
import { base44 } from "@/api/base44Client";
import { runConsistencyCheck } from "./consistencyEngine";
import { DEFAULT_FEATURES } from "./featureCatalog";

export const GUARDIAN_VERSION = "1.0";

function catalogDefaults(def) {
  return {
    feature_id: def.id,
    name: def.name,
    description: def.description,
    category: def.category,
    icon: def.icon,
    minimum_plan: def.minimumPlan,
    is_enabled: def.isEnabled,
    sort_order: def.sortOrder,
    limit_label: def.limitLabel || "",
    status: "live",
    visibility: "public",
    coming_soon: false,
    nav_enabled: false,
    pricing_enabled: true,
  };
}

/* ----------------------------- confidence ----------------------------- */

export function confidenceFor(action) {
  if (!action) return 0;
  if (action.type === "link") return 0;
  if (action.type === "code") return 0; // code-level changes are never auto-applied
  switch (action.op) {
    case "create": return 98;      // create missing flag from catalog definition
    case "set_route": return 97;   // create flag with correct route
    case "repair_route": return 96; // restore expected route_path (deterministic)
    case "delete": return 78;      // delete orphan — could be intentional → queue
    default: return 0;
  }
}

export function classifyRepair(action) {
  const c = confidenceFor(action);
  let tier;
  if (c >= 95) tier = "auto";
  else if (c >= 70) tier = "queue";
  else tier = "alert";
  return { tier, confidence: c };
}

/** Nav paths referenced by navigation but with no matching route → auto-hide. */
export function computeBrokenNavPaths(report) {
  const set = new Set();
  (report.findings || []).forEach((f) => {
    if (f.category === "navigation" && f.severity === "critical" && f.route) set.add(f.route);
  });
  return set;
}

/* --------------------------- entity actions --------------------------- */

async function applyEntityAction(action) {
  const def = action.featureId ? DEFAULT_FEATURES.find((f) => f.id === action.featureId) : null;
  if ((action.op === "create" || action.op === "set_route") && def) {
    return await base44.entities.Feature.create(catalogDefaults(def));
  }
  if (action.op === "delete" && action.recordId) {
    return await base44.entities.Feature.delete(action.recordId);
  }
  if (action.op === "repair_route" && action.recordId) {
    return await base44.entities.Feature.update(action.recordId, { route_path: action.expectedRoute });
  }
  throw new Error("Unsupported entity action: " + action.op);
}

/* ------------------------------ logging ------------------------------- */

async function logActivity(rec) {
  const activity = {
    scan_id: rec.scanId,
    trigger: rec.trigger,
    category: rec.finding?.category || "feature",
    severity: rec.finding?.severity || "warning",
    issue: rec.finding?.title || "",
    finding_id: rec.finding?.id || "",
    action_taken: rec.actionLabel || "",
    action_type: rec.tier === "auto" ? "auto" : rec.tier === "queue" ? "queued" : "alert",
    confidence_score: rec.confidence,
    result: rec.result,
    rollback_status: rec.rollbackStatus,
    snapshot_json: rec.snapshot || "",
    action_json: rec.action ? JSON.stringify(rec.action) : "",
    feature_id: rec.finding?.feature || rec.action?.featureId || "",
    route: rec.finding?.route || "",
    error_message: rec.error || "",
    approved_by: rec.approvedBy || "",
  };
  try {
    const created = await base44.entities.GuardianActivity.create(activity);
    return { ...activity, id: created.id, created_date: created.created_date };
  } catch {
    return activity;
  }
}

/* ------------------------------ rollback ------------------------------ */

export async function rollbackActivity(activity) {
  if (!activity || !["applied", "queued"].includes(activity.result)) return false;
  try {
    if (activity.snapshot_json) {
      // repair_route — restore previous field values
      const rec = JSON.parse(activity.snapshot_json);
      if (rec.id) await base44.entities.Feature.update(rec.id, rec);
    } else if (activity.feature_id) {
      // create/set_route — delete the created record
      const recs = await base44.entities.Feature.filter({ feature_id: activity.feature_id });
      if (recs && recs[0]) await base44.entities.Feature.delete(recs[0].id);
    }
    if (activity.id) {
      await base44.entities.GuardianActivity.update(activity.id, { result: "rolled_back", rollback_status: "rolled_back" });
    }
    return true;
  } catch {
    return false;
  }
}

/* --------------------------- manual approval -------------------------- */

export async function approveActivity(activity, userId) {
  if (!activity) return false;
  try {
    const action = activity.action_json ? JSON.parse(activity.action_json) : null;
    if (!action) return false;
    await applyEntityAction(action);
    if (activity.id) {
      await base44.entities.GuardianActivity.update(activity.id, {
        result: "applied",
        action_type: "manual",
        approved_by: userId || "",
        rollback_status: activity.snapshot_json ? "available" : "none",
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function dismissActivity(activity) {
  if (!activity?.id) return false;
  try {
    await base44.entities.GuardianActivity.update(activity.id, { result: "skipped" });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------ main scan ----------------------------- */

export async function runGuardianScan({ trigger = "manual", userId = null, autoResolve = true } = {}) {
  const scanId = `scan-${Date.now()}`;
  const liveBefore = await base44.entities.Feature.list("sort_order", 200);
  const reportBefore = runConsistencyCheck(liveBefore);

  const activities = [];
  const pending = [];
  let issuesFixed = 0;
  let alertsCount = 0;

  for (const finding of reportBefore.findings) {
    if (finding.severity === "information" || !finding.actions || finding.actions.length === 0) continue;

    for (const action of finding.actions) {
      const { tier, confidence } = classifyRepair(action);

      // Code-level / link actions → alert (never auto-modify)
      if (action.type !== "entity") {
        alertsCount++;
        continue;
      }

      if (tier === "auto" && autoResolve) {
        const before = action.recordId ? liveBefore.find((f) => f.id === action.recordId) : null;
        const snapshot = before ? JSON.stringify(before) : null;
        try {
          await applyEntityAction(action);
          const act = await logActivity({
            scanId, trigger, userId, finding, action, tier, confidence,
            result: "applied", rollbackStatus: snapshot ? "available" : "none",
            snapshot, actionLabel: action.label,
          });
          activities.push(act);
          issuesFixed++;
        } catch (e) {
          const act = await logActivity({
            scanId, trigger, userId, finding, action, tier, confidence,
            result: "failed", rollbackStatus: "none",
            error: String(e.message || e), actionLabel: action.label,
          });
          activities.push(act);
        }
      } else if (tier === "queue") {
        // Dedup: don't re-queue an already-open item for the same finding
        try {
          const existing = await base44.entities.GuardianActivity.filter({ finding_id: finding.id, result: "queued" }, "-created_date", 1);
          if (existing && existing.length > 0) continue;
        } catch {}
        const act = await logActivity({
          scanId, trigger, userId, finding, action, tier: "queue", confidence,
          result: "queued", rollbackStatus: "none", actionLabel: action.label,
        });
        activities.push(act);
        pending.push(act);
      } else {
        alertsCount++;
      }
    }
  }

  // Validate health after repairs
  const liveAfter = await base44.entities.Feature.list("sort_order", 200);
  const reportAfter = runConsistencyCheck(liveAfter);

  // Auto-rollback if health degraded
  let rolledBack = false;
  if (autoResolve && issuesFixed > 0 && reportAfter.health.overall < reportBefore.health.overall) {
    for (const act of activities) {
      if (act.result === "applied") await rollbackActivity(act);
    }
    rolledBack = true;
  }

  return {
    scanId,
    trigger,
    reportBefore,
    reportAfter,
    activities,
    pending,
    issuesFixed,
    alertsCount,
    rolledBack,
    brokenNavPaths: computeBrokenNavPaths(reportBefore),
    scannedAt: new Date().toISOString(),
  };
}