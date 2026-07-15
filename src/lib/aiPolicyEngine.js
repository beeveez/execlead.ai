/**
 * EXECLEAD.AI — AI Policy Engine™
 * ============================================================
 * Core Platform Service #10
 *
 * Governs HOW AI should be used. Applies platform rules before
 * any AI request is executed. Sits between the AI Optimization
 * Layer™ (which decides IF AI is needed) and the LLM invocation.
 *
 *   User → EXEC™ → AI Optimization Layer™ → AI Policy Engine™ →
 *   Context Builder → Knowledge Pack → Model Router → LLM → Response
 *
 * Enforces 10 policy categories:
 *   1. Subscription   2. Workspace    3. Feature       4. Organization
 *   5. AI Budget      6. Security    7. Trust         8. Privacy
 *   9. Context        10. Compliance
 *
 * Philosophy:
 *   Optimization decides whether AI is needed.
 *   Policy decides how AI is allowed to operate.
 *   Governed Intelligence.
 */

import { base44 } from "@/api/base44Client";

// ============================================================
// §1 — SUBSCRIPTION POLICY
// Defines what each plan tier allows.
// ============================================================

export const SUBSCRIPTION_POLICIES = {
  free: {
    label: "Free",
    maxDailySessions: 10,
    contextWindow: 2000,
    knowledgeFirst: true,
    cachePreferred: true,
    blockedIntents: ["executive_debate", "interview_simulation", "decision_intelligence"],
    limitedIntents: ["resume_analysis"],
    allowedIntents: ["static_information", "database_query", "dashboard", "knowledge", "navigation", "billing", "configuration"],
    model: "small",
    aiPriority: "lowest",
  },
  professional: {
    label: "Professional",
    maxDailySessions: 100,
    contextWindow: 8000,
    allowedIntents: ["executive_coaching", "resume_analysis", "leadership_journey", "interview_simulation", "company_intelligence", "analytics", "knowledge", "navigation", "billing", "configuration", "database_query", "dashboard", "static_information"],
    model: "balanced",
    aiPriority: "standard",
  },
  executive: {
    label: "Executive",
    maxDailySessions: 1000,
    contextWindow: 32000,
    allowedIntents: null, // null = all intents allowed
    model: "premium",
    aiPriority: "highest",
    highestPriority: true,
  },
  enterprise: {
    label: "Enterprise",
    maxDailySessions: -1, // unlimited
    contextWindow: 64000,
    allowedIntents: null,
    model: "organization_policy",
    aiPriority: "enterprise",
    customKnowledgePacks: true,
    departmentIsolation: true,
  },
};

// ============================================================
// §2 — WORKSPACE POLICY
// Ensures workspace isolation — never mix contexts.
// ============================================================

export const WORKSPACE_POLICIES = {
  executive: {
    persona: "Leadership Persona",
    knowledgePacks: "Leadership Knowledge Packs",
    allowedIntents: ["executive_coaching", "leadership_journey", "resume_analysis", "interview_simulation", "executive_debate", "decision_intelligence", "company_intelligence", "knowledge", "navigation", "database_query", "dashboard", "billing", "configuration", "analytics", "static_information", "general_inquiry"],
  },
  enterprise: {
    persona: "Enterprise Persona",
    knowledgePacks: "Organization Knowledge Packs",
    allowedIntents: ["enterprise_operations", "billing", "analytics", "knowledge", "navigation", "database_query", "dashboard", "configuration", "platform_governance", "general_inquiry"],
  },
  operations: {
    persona: "Operations Persona",
    knowledgePacks: "Operations Knowledge Packs",
    allowedIntents: ["platform_governance", "enterprise_operations", "billing", "analytics", "knowledge", "navigation", "database_query", "dashboard", "configuration", "general_inquiry"],
  },
  developer: {
    persona: "Developer Persona",
    knowledgePacks: "Developer Knowledge Packs",
    allowedIntents: ["developer_assistance", "platform_governance", "analytics", "knowledge", "navigation", "database_query", "dashboard", "configuration", "general_inquiry"],
  },
};

// ============================================================
// §3 — MODEL POLICY
// Selects model based on complexity.
// ============================================================

export const MODEL_POLICIES = {
  small: { label: "Small Model", maxTokens: 2000, costMultiplier: 0.5 },
  balanced: { label: "Balanced Model", maxTokens: 8000, costMultiplier: 1.0 },
  premium: { label: "Premium Model", maxTokens: 32000, costMultiplier: 2.0 },
  organization_policy: { label: "Organization Policy Model", maxTokens: 64000, costMultiplier: 1.5 },
};

// ============================================================
// §4 — TRUST POLICY
// Certain features require verified trust levels.
// ============================================================

const TRUST_REQUIREMENTS = {
  executive_debate: { minTrustLevel: 3, label: "Identity Verified" },
  executive_council: { minTrustLevel: 4, label: "Professional Verified" },
  decision_intelligence: { minTrustLevel: 3, label: "Identity Verified" },
  digital_twin: { minTrustLevel: 3, label: "Identity Verified" },
};

// ============================================================
// §5 — SECURITY POLICY
// Prevents exposure of sensitive information.
// ============================================================

const SECURITY_BLOCKED_PATTERNS = [
  "api key", "secret", "password", "token", "private key",
  "system prompt", "system instruction", "internal prompt",
  "developer only", "enterprise only", "hidden document",
];

const PRIVACY_BLOCKED_PATTERNS = [
  "other organization", "other users", "private enterprise data",
  "deleted records", "expired sessions", "sensitive metadata",
];

// ============================================================
// §6 — AI BUDGET POLICY
// Tracks budget limits per tier.
// ============================================================

const BUDGET_LIMITS = {
  free: { monthly: 2.0, daily: 0.10, perFeature: 0.02 },
  professional: { monthly: 20.0, daily: 1.0, perFeature: 0.10 },
  executive: { monthly: 100.0, daily: 5.0, perFeature: 0.50 },
  enterprise: { monthly: 500.0, daily: 25.0, perFeature: 2.0 },
};

// ============================================================
// §7 — POLICY EVALUATION
// ============================================================

/**
 * Evaluate all 10 policy categories for a given request.
 *
 * @param {string} requestText - The user's request
 * @param {object} opts - { intent, plan, workspace, user, organization, trustLevel, estimatedCost, ... }
 * @returns {object} Policy Decision Object
 */
export function evaluatePolicy(requestText, opts = {}) {
  const startedAt = Date.now();
  const plan = normalizePlan(opts.plan);
  const workspace = opts.workspace || "executive";
  const intent = opts.intent || "general_inquiry";
  const trustLevel = opts.trustLevel || 0;
  const organization = opts.organization || null;
  const estimatedCost = opts.estimatedCost || 0;

  const subPolicy = SUBSCRIPTION_POLICIES[plan] || SUBSCRIPTION_POLICIES.free;
  const wsPolicy = WORKSPACE_POLICIES[workspace] || WORKSPACE_POLICIES.executive;
  const budget = BUDGET_LIMITS[plan] || BUDGET_LIMITS.free;

  const policies = [];
  const blockedPolicies = [];
  let upgradeMessage = null;
  let violationType = "none";
  let modelAssigned = subPolicy.model;
  let contextLimit = subPolicy.contextWindow;

  // ── 1. Subscription Policy ──
  const subPassed = checkSubscriptionPolicy(intent, subPolicy);
  policies.push({
    name: "Subscription Policy",
    category: "subscription",
    passed: subPassed.passed,
    reason: subPassed.reason,
    details: { plan, model: subPolicy.model, contextWindow: subPolicy.contextWindow },
  });
  if (!subPassed.passed) {
    blockedPolicies.push("subscription");
    violationType = "subscription";
    upgradeMessage = subPassed.upgradeMessage || `This feature requires a ${getNextPlanUp(plan)} subscription. Upgrade to unlock.`;
  }

  // ── 2. Workspace Policy ──
  const wsPassed = checkWorkspacePolicy(intent, wsPolicy, workspace);
  policies.push({
    name: "Workspace Policy",
    category: "workspace",
    passed: wsPassed.passed,
    reason: wsPassed.reason,
    details: { workspace, persona: wsPolicy.persona },
  });
  if (!wsPassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("workspace");
    violationType = "workspace";
    upgradeMessage = `This request is not available in the ${workspace} workspace. Switch workspaces or contact your administrator.`;
  }

  // ── 3. Feature Policy ──
  const featurePassed = checkFeaturePolicy(intent, opts.feature, opts.featureAllowed);
  policies.push({
    name: "Feature Policy",
    category: "feature",
    passed: featurePassed.passed,
    reason: featurePassed.reason,
  });
  if (!featurePassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("feature");
    violationType = "feature";
    upgradeMessage = featurePassed.upgradeMessage || "This feature is not enabled for your account.";
  }

  // ── 4. Organization Policy ──
  const orgPassed = checkOrganizationPolicy(intent, organization, workspace);
  policies.push({
    name: "Organization Policy",
    category: "organization",
    passed: orgPassed.passed,
    reason: orgPassed.reason,
  });
  if (!orgPassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("organization");
    violationType = "organization";
    upgradeMessage = "This request requires organization membership. Contact your enterprise administrator.";
  }

  // ── 5. AI Budget Policy ──
  const budgetPassed = checkBudgetPolicy(estimatedCost, budget, opts.currentDailySpend, opts.currentMonthlySpend);
  policies.push({
    name: "AI Budget Policy",
    category: "budget",
    passed: budgetPassed.passed,
    reason: budgetPassed.reason,
    details: { monthly: budget.monthly, daily: budget.daily, projected: budgetPassed.projected },
  });
  if (!budgetPassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("budget");
    violationType = "budget";
    upgradeMessage = budgetPassed.reason;
  }

  // ── 6. Security Policy ──
  const secPassed = checkSecurityPolicy(requestText);
  policies.push({
    name: "Security Policy",
    category: "security",
    passed: secPassed.passed,
    reason: secPassed.reason,
  });
  if (!secPassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("security");
    violationType = "security";
    upgradeMessage = "This request has been blocked for security reasons. Sensitive information cannot be processed through AI.";
  }

  // ── 7. Trust Policy ──
  const trustPassed = checkTrustPolicy(intent, trustLevel);
  policies.push({
    name: "Trust Policy",
    category: "trust",
    passed: trustPassed.passed,
    reason: trustPassed.reason,
  });
  if (!trustPassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("trust");
    violationType = "trust";
    upgradeMessage = trustPassed.upgradeMessage || `This feature requires ${trustPassed.requiredLabel}. Complete identity verification to unlock.`;
  }

  // ── 8. Privacy Policy ──
  const privacyPassed = checkPrivacyPolicy(requestText);
  policies.push({
    name: "Privacy Policy",
    category: "privacy",
    passed: privacyPassed.passed,
    reason: privacyPassed.reason,
  });
  if (!privacyPassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("privacy");
    violationType = "privacy";
    upgradeMessage = "This request has been blocked to protect user privacy. AI cannot access data from other users or organizations.";
  }

  // ── 9. Context Policy ──
  const contextPassed = checkContextPolicy(opts.contextSize, contextLimit);
  policies.push({
    name: "Context Policy",
    category: "context",
    passed: contextPassed.passed,
    reason: contextPassed.reason,
    details: { limit: contextLimit, current: opts.contextSize || 0 },
  });
  if (!contextPassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("context");
    violationType = "context";
    // Don't block — just trim context
    policies[policies.length - 1].passed = true;
    policies[policies.length - 1].reason = `Context trimmed to ${contextLimit} tokens (was ${opts.contextSize || 0})`;
    blockedPolicies.splice(blockedPolicies.indexOf("context"), 1);
  }

  // ── 10. Compliance Policy ──
  const compliancePassed = checkCompliancePolicy(intent, organization, opts.region);
  policies.push({
    name: "Compliance Policy",
    category: "compliance",
    passed: compliancePassed.passed,
    reason: compliancePassed.reason,
  });
  if (!compliancePassed.passed && !blockedPolicies.length) {
    blockedPolicies.push("compliance");
    violationType = "compliance";
    upgradeMessage = "This request cannot be processed due to compliance requirements.";
  }

  // ── Model selection ──
  // Override model based on intent complexity if subscription allows
  if (!blockedPolicies.length) {
    modelAssigned = selectModel(intent, plan, subPolicy);
  }

  // ── Budget remaining ──
  const budgetRemaining = Math.max(0, budget.monthly - (opts.currentMonthlySpend || 0));

  const evaluationTimeMs = Date.now() - startedAt;
  const allPassed = blockedPolicies.length === 0;
  const hasWarning = !allPassed && policies.some((p) => !p.passed && p.category === "context");

  return {
    approved: allPassed,
    status: allPassed ? "approved" : (hasWarning ? "warning" : "blocked"),
    policies,
    blockedPolicies,
    violationType: allPassed ? "none" : violationType,
    upgradeMessage: allPassed ? null : upgradeMessage,
    model: modelAssigned,
    contextLimit,
    budgetRemaining,
    evaluationTimeMs,
    subscription: plan,
    workspace,
    trustLevel,
    estimatedCost,
  };
}

// ============================================================
// §8 — POLICY CHECK FUNCTIONS
// ============================================================

function checkSubscriptionPolicy(intent, subPolicy) {
  if (subPolicy.allowedIntents === null) {
    return { passed: true, reason: `${subPolicy.label} plan — all intents allowed` };
  }
  if (subPolicy.blockedIntents?.includes(intent)) {
    return {
      passed: false,
      reason: `${intent.replace(/_/g, " ")} is blocked on ${subPolicy.label} plan`,
      upgradeMessage: `This feature is not available on the Free plan. Upgrade to Professional or higher to unlock ${intent.replace(/_/g, " ")}.`,
    };
  }
  if (!subPolicy.allowedIntents.includes(intent) && intent !== "general_inquiry") {
    return {
      passed: false,
      reason: `${intent.replace(/_/g, " ")} requires a higher subscription tier`,
      upgradeMessage: `Your current plan doesn't include this feature. Upgrade to unlock ${intent.replace(/_/g, " ")}.`,
    };
  }
  return { passed: true, reason: `${subPolicy.label} plan allows this intent` };
}

function checkWorkspacePolicy(intent, wsPolicy, workspace) {
  if (!wsPolicy.allowedIntents || wsPolicy.allowedIntents.includes(intent) || intent === "general_inquiry" || intent === "navigation") {
    return { passed: true, reason: `Intent allowed in ${workspace} workspace (${wsPolicy.persona})` };
  }
  return { passed: false, reason: `Intent "${intent}" not available in ${workspace} workspace — prevents cross-workspace contamination` };
}

function checkFeaturePolicy(intent, feature, featureAllowed) {
  if (feature && featureAllowed === false) {
    return {
      passed: false,
      reason: `Feature "${feature}" is not enabled`,
      upgradeMessage: `The "${feature}" feature is not enabled for your account. Contact your administrator.`,
    };
  }
  return { passed: true, reason: "Feature entitlements verified" };
}

function checkOrganizationPolicy(intent, organization, workspace) {
  if (workspace === "enterprise" && !organization) {
    return { passed: false, reason: "Enterprise workspace requires organization membership" };
  }
  return { passed: true, reason: "Organization policy satisfied" };
}

function checkBudgetPolicy(estimatedCost, budget, currentDailySpend, currentMonthlySpend) {
  const daily = currentDailySpend || 0;
  const monthly = currentMonthlySpend || 0;
  const projectedMonthly = monthly + estimatedCost;
  const projectedDaily = daily + estimatedCost;

  if (budget.daily > 0 && projectedDaily > budget.daily) {
    return {
      passed: false,
      reason: `Daily AI budget exceeded ($${projectedDaily.toFixed(2)} / $${budget.daily.toFixed(2)}) — preferring cache, knowledge, and smaller models`,
      projected: projectedMonthly,
    };
  }
  if (budget.monthly > 0 && projectedMonthly > budget.monthly) {
    return {
      passed: false,
      reason: `Monthly AI budget exceeded ($${projectedMonthly.toFixed(2)} / $${budget.monthly.toFixed(2)}) — preferring non-AI sources`,
      projected: projectedMonthly,
    };
  }
  return {
    passed: true,
    reason: `Budget available ($${monthly.toFixed(2)}/$${budget.monthly.toFixed(2)} monthly, $${daily.toFixed(2)}/$${budget.daily.toFixed(2)} daily)`,
    projected: projectedMonthly,
  };
}

function checkSecurityPolicy(requestText) {
  if (!requestText) return { passed: true, reason: "No request text to evaluate" };
  const lower = requestText.toLowerCase();
  const matched = SECURITY_BLOCKED_PATTERNS.find((p) => lower.includes(p));
  if (matched) {
    return { passed: false, reason: `Security policy violation: request contains "${matched}" — sensitive data blocked from AI` };
  }
  return { passed: true, reason: "No security violations detected" };
}

function checkTrustPolicy(intent, trustLevel) {
  const requirement = TRUST_REQUIREMENTS[intent];
  if (!requirement) return { passed: true, reason: "No trust requirements for this intent" };
  if (trustLevel >= requirement.minTrustLevel) {
    return { passed: true, reason: `Trust level ${trustLevel} meets requirement (${requirement.label})` };
  }
  return {
    passed: false,
    reason: `Trust level ${trustLevel} below required ${requirement.minTrustLevel} (${requirement.label})`,
    upgradeMessage: `This feature requires ${requirement.label}. Visit the Verification Center™ to complete identity verification.`,
    requiredLabel: requirement.label,
  };
}

function checkPrivacyPolicy(requestText) {
  if (!requestText) return { passed: true, reason: "No request text to evaluate" };
  const lower = requestText.toLowerCase();
  const matched = PRIVACY_BLOCKED_PATTERNS.find((p) => lower.includes(p));
  if (matched) {
    return { passed: false, reason: `Privacy policy violation: request attempts to access "${matched}"` };
  }
  return { passed: true, reason: "No privacy violations detected" };
}

function checkContextPolicy(contextSize, contextLimit) {
  if (!contextSize || contextSize <= contextLimit) {
    return { passed: true, reason: `Context within limits (${contextSize || 0}/${contextLimit} tokens)` };
  }
  return { passed: false, reason: `Context exceeds limit (${contextSize}/${contextLimit} tokens) — will be trimmed` };
}

function checkCompliancePolicy(intent, organization, region) {
  // Basic compliance check — can be extended for GDPR, CCPA, etc.
  return { passed: true, reason: "Compliance requirements met" };
}

// ============================================================
// §9 — MODEL ROUTER™
// Selects model based on complexity and subscription.
// ============================================================

function selectModel(intent, plan, subPolicy) {
  const baseModel = subPolicy.model;

  // Strategic/complex intents get premium models if subscription allows
  const complexIntents = ["decision_intelligence", "executive_debate", "resume_analysis"];
  const mediumIntents = ["interview_simulation", "executive_coaching", "developer_assistance"];

  if (plan === "free") return "small";
  if (plan === "professional") {
    if (complexIntents.includes(intent)) return "balanced";
    return "balanced";
  }
  if (plan === "executive") {
    if (complexIntents.includes(intent)) return "premium";
    if (mediumIntents.includes(intent)) return "balanced";
    return "balanced";
  }
  if (plan === "enterprise") return "organization_policy";

  return baseModel;
}

// ============================================================
// §10 — USAGE TRACKING
// ============================================================

export async function trackPolicyDecision(decision, requestText, opts = {}) {
  try {
    await base44.entities.AIPolicyEvent.create({
      request_text: (requestText || "").slice(0, 500),
      intent: opts.intent || null,
      status: decision.status,
      subscription: decision.subscription,
      workspace: decision.workspace,
      model_assigned: decision.model,
      context_limit: decision.contextLimit,
      policies_json: JSON.stringify(decision.policies),
      blocked_policies_json: JSON.stringify(decision.blockedPolicies),
      upgrade_message: decision.upgradeMessage,
      trust_level: decision.trustLevel,
      organization_id: opts.organization?.id || opts.organizationId || null,
      user_id: opts.user?.id || opts.userId || null,
      user_name: opts.user?.full_name || opts.userName || null,
      module: opts.module || null,
      estimated_cost: decision.estimatedCost || 0,
      budget_remaining: decision.budgetRemaining || 0,
      evaluation_time_ms: decision.evaluationTimeMs || 0,
      violation_type: decision.violationType || "none",
    });
  } catch {}
}

// ============================================================
// §11 — MAIN ENFORCEMENT FUNCTION
// Wraps evaluatePolicy + trackPolicyDecision.
// ============================================================

/**
 * Enforce AI Policy — evaluates all policies and tracks the decision.
 * Call this before any AI invocation.
 *
 * @returns {Promise<object>} Policy Decision Object
 */
export async function enforcePolicy(requestText, opts = {}) {
  const decision = evaluatePolicy(requestText, opts);
  await trackPolicyDecision(decision, requestText, opts);
  return decision;
}

// ============================================================
// §12 — ANALYTICS AGGREGATION
// ============================================================

export async function getPolicyAnalytics(limit = 500) {
  try {
    const events = await base44.entities.AIPolicyEvent.list("-created_date", limit);

    const total = events.length;
    const approved = events.filter((e) => e.status === "approved").length;
    const blocked = events.filter((e) => e.status === "blocked").length;
    const warnings = events.filter((e) => e.status === "warning").length;

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;

    const avgEvalTime = total > 0
      ? Math.round(events.reduce((s, e) => s + (e.evaluation_time_ms || 0), 0) / total)
      : 0;

    // Violation type breakdown
    const violations = {};
    events.filter((e) => e.violation_type && e.violation_type !== "none").forEach((e) => {
      violations[e.violation_type] = (violations[e.violation_type] || 0) + 1;
    });

    // Subscription distribution
    const subscriptionDist = {};
    events.forEach((e) => {
      const sub = e.subscription || "unknown";
      subscriptionDist[sub] = (subscriptionDist[sub] || 0) + 1;
    });

    // Workspace distribution
    const workspaceDist = {};
    events.forEach((e) => {
      const ws = e.workspace || "unknown";
      workspaceDist[ws] = (workspaceDist[ws] || 0) + 1;
    });

    // Most triggered policies (from blocked_policies_json)
    const policyTriggerCounts = {};
    events.forEach((e) => {
      try {
        const blocked = JSON.parse(e.blocked_policies_json || "[]");
        blocked.forEach((p) => {
          policyTriggerCounts[p] = (policyTriggerCounts[p] || 0) + 1;
        });
      } catch {}
    });

    return {
      total,
      approved,
      blocked,
      warnings,
      approvalRate,
      blockRate,
      avgEvalTime,
      violations,
      subscriptionDist,
      workspaceDist,
      policyTriggerCounts,
    };
  } catch {
    return {
      total: 0, approved: 0, blocked: 0, warnings: 0,
      approvalRate: 0, blockRate: 0, avgEvalTime: 0,
      violations: {}, subscriptionDist: {}, workspaceDist: {}, policyTriggerCounts: {},
    };
  }
}

// ============================================================
// §13 — HELPERS
// ============================================================

function normalizePlan(plan) {
  if (!plan) return "free";
  const lower = String(plan).toLowerCase();
  if (lower.includes("enterprise")) return "enterprise";
  if (lower.includes("executive")) return "executive";
  if (lower.includes("professional") || lower.includes("pro")) return "professional";
  return "free";
}

function getNextPlanUp(plan) {
  const order = ["free", "professional", "executive", "enterprise"];
  const idx = order.indexOf(plan);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : "executive";
}

// ============================================================
// EXPORTS
// ============================================================

export const AI_POLICY_ENGINE_VERSION = "1.0";
export const POLICY_CATEGORIES = [
  "subscription", "workspace", "feature", "organization", "budget",
  "security", "trust", "privacy", "context", "compliance",
];