/**
 * Pricing Intent™ predicates — dependency-free (EXEC™ routing precedence)
 * ============================================================
 * Extracted from the Knowledge Authority Guard™ so the EXEC™ routing
 * precedence matrix can be regression-tested offline. Behavior is unchanged
 * except for the routing-precedence exemption below.
 *
 * ROUTING PRECEDENCE DEFECT (fixed): the broad commercial pricing fallback
 * matched the bare token "plan", so a personal DEVELOPMENT PLAN
 * ("...create a prioritized development plan based on those gaps") was
 * claimed as a pricing question and intercepted by the informational-pricing
 * guard before the Agent Router could classify it as leadership analysis.
 *
 * Fix principle: specific leadership-analysis intent must be classified
 * BEFORE the broad commercial/private-beta fallback. A personal development
 * plan, coaching plan, or action plan is a leadership-analysis artifact —
 * never a pricing plan. Genuine pricing detection (pricing / price / cost /
 * memberships / plan-recommendation / purchase / upgrade intent) is NOT
 * weakened: those still match exactly as before.
 *
 * Dependency-free by design.
 */

export const PRICING_INFO_PATTERN =
  /\b(plans?|pricing|price|cost|memberships?|included in professional|included in executive|enterprise pricing)\b/i;

export const COMMERCIAL_ACTION_PATTERN =
  /\b(which plan should|right plan for me|recommend(?: a)? plan|should i buy|buy|purchase|join|apply|participate|upgrade|switch plans?|change my plan|subscribe|sign up)\b/i;

// Leadership-development-plan exemption (routing precedence): a personal
// development / coaching / learning / career / growth / action plan is a
// leadership-analysis artifact, not a pricing plan.
export const LEADERSHIP_DEVELOPMENT_PLAN_PATTERN =
  /\b(development|coaching|learning|career|growth|action)\s+plans?\b/i;

export function isInformationalPricingQuestion(query = "") {
  return (
    PRICING_INFO_PATTERN.test(query) &&
    !COMMERCIAL_ACTION_PATTERN.test(query) &&
    !LEADERSHIP_DEVELOPMENT_PLAN_PATTERN.test(query)
  );
}