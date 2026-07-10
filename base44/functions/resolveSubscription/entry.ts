import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================
// SUBSCRIPTION SERVICE — Single Source of Truth (Backend)
// ============================================================
// This function resolves the authoritative subscription object
// for the authenticated user. The frontend NEVER independently
// determines the plan — it consumes this result.
//
// Flow: Authenticated User → resolveSubscription → Canonical Object
//
// Data sources (all read server-side):
//   1. UserProfile (subscription_plan, status, cycle)
//   2. Subscription entity (Stripe customer_id, subscription_id)
//   3. FoundingMember (founder status, purchase verification)
//   4. ExecutiveAffiliation (enterprise seat, org, role)
//   5. PaymentSettings (payment provider)
//   6. Invoice (renewal date, next invoice)
//
// Security: Every field is resolved from DB records via the
// service role. The frontend receives the result but cannot
// override it. Developer simulation is applied ONLY on the
// frontend, ONLY for developer-role users.
// ============================================================

const PLAN_TIERS: Record<string, number> = {
  free: 0, professional: 1, executive: 2, enterprise: 3, developer: 4,
};

const ACTIVE_FOUNDER_STATUSES = ["active", "verified", "lifetime"];
const ELIGIBLE_PLANS = ["professional", "executive"];
const FOUNDER_DISCOUNT = 25;

// Feature → minimum plan mapping (mirrors src/lib/featureCatalog.js DEFAULT_FEATURES)
const FEATURE_MIN_PLANS: Record<string, string> = {
  resume_builder: "free", basic_dashboard: "free", basic_analytics: "free",
  ai_coaching_limited: "free", interview_simulations_limited: "free",
  career_path: "free", company_profile: "free", marketplace: "free",
  unlimited_ai_coach: "professional", executive_simulator: "professional",
  executive_debate: "professional", truth_engine: "professional",
  executive_academy: "professional", career_advisor: "professional",
  company_intelligence: "professional", leadership_analytics: "professional",
  daily_executive_challenge: "professional", executive_journal: "professional",
  ats_resume_analyzer: "professional", resume_intelligence: "professional",
  linkedin_optimizer: "professional", career_studio: "professional",
  executive_council: "professional", leadership_dna: "professional",
  executive_legacy: "executive", board_meeting_simulator: "executive",
  cio_coaching: "executive", cfo_coaching: "executive", coo_coaching: "executive",
  executive_presentation_coach: "executive", executive_review_simulator: "executive",
  customer_escalation_simulator: "executive", crisis_management: "executive",
  executive_negotiation_coach: "executive", executive_storytelling: "executive",
  executive_strategy_workshops: "executive", executive_portfolio: "executive",
  board_readiness_assessment: "executive",
  team_dashboard: "enterprise", hr_dashboard: "enterprise", department_analytics: "enterprise",
  seat_management: "enterprise", role_management: "enterprise", company_branding: "enterprise",
  custom_learning_paths: "enterprise", organization_reports: "enterprise", sso: "enterprise",
  audit_logs: "enterprise", api_access: "enterprise", ai_usage_dashboard: "enterprise",
  dedicated_customer_success: "enterprise", enterprise_analytics: "enterprise",
  admin_console: "enterprise", promotion_readiness: "enterprise", succession_planning: "enterprise",
  learning_analytics: "enterprise", learning_assignments: "enterprise", scim_ready: "enterprise",
  azure_ad: "enterprise", google_workspace: "enterprise", quarterly_business_reviews: "enterprise",
  priority_support: "enterprise", enterprise_sla: "enterprise",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ── 1. Load UserProfile ──
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    const profile = profiles[0] || null;

    // Security: profile must belong to the authenticated user
    if (profile && profile.created_by_id !== user.id) {
      return Response.json({ error: 'Profile owner mismatch' }, { status: 403 });
    }

    // ── 2. Load Subscription entity (Stripe-backed, if exists) ──
    let subscriptionRecord = null;
    try {
      const subs = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: user.id });
      subscriptionRecord = subs[0] || null;
    } catch { subscriptionRecord = null; }

    // ── 3. Load FoundingMember record ──
    let founderRecord = null;
    try {
      const founders = await base44.asServiceRole.entities.FoundingMember.filter({ user_id: user.id });
      founderRecord = founders[0] || null;
    } catch { founderRecord = null; }

    // ── 4. Load ExecutiveAffiliation (enterprise seat) ──
    let affiliation = null;
    try {
      const affs = await base44.asServiceRole.entities.ExecutiveAffiliation.filter({ user_id: user.id, status: "active" });
      affiliation = affs[0] || null;
    } catch { affiliation = null; }

    // ── 5. Load PaymentSettings ──
    let paymentSettings = null;
    try {
      const ps = await base44.asServiceRole.entities.PaymentSettings.filter({ is_active: true });
      paymentSettings = ps[0] || null;
    } catch { paymentSettings = null; }

    // ── 6. Load latest invoice ──
    let nextInvoice = null;
    try {
      const invs = await base44.asServiceRole.entities.Invoice.filter({ owner_user_id: user.id }, "-created_date", 1);
      nextInvoice = invs[0] || null;
    } catch { nextInvoice = null; }

    // ── 7. Resolve canonical plan ──
    const isDevUser = user.role === 'developer' || user.role === 'super_admin';
    const rawPlan = profile?.subscription_plan || "free";
    const currentPlan = isDevUser ? "developer" : rawPlan;

    // ── 8. Resolve founder status ──
    const hasActiveRecord = Boolean(founderRecord && ACTIVE_FOUNDER_STATUSES.includes(founderRecord.status));
    const purchaseVerified = Boolean(
      founderRecord && founderRecord.purchase_verified === true && founderRecord.payment_status === "paid"
    );
    const subscriptionEligible = ELIGIBLE_PLANS.includes(currentPlan) || isDevUser;
    const founderPortalEnabled = Boolean(hasActiveRecord && purchaseVerified && subscriptionEligible);

    // ── 9. Resolve workspace (must match subscription) ──
    let workspace: string;
    if (isDevUser) {
      workspace = "developer";
    } else if (affiliation?.organization_id || currentPlan === "enterprise") {
      workspace = "enterprise";
    } else if (founderPortalEnabled) {
      workspace = "founder";
    } else {
      workspace = currentPlan; // free, professional, executive
    }

    // ── 10. Compute feature entitlements (backend-authoritative) ──
    const userTier = PLAN_TIERS[currentPlan] ?? 0;
    const featureEntitlements = Object.entries(FEATURE_MIN_PLANS)
      .filter(([, minPlan]) => userTier >= (PLAN_TIERS[minPlan] ?? 0))
      .map(([id]) => id);

    // ── 11. Consistency validation ──
    const checks = [
      { label: "Profile Plan === Resolved Plan", pass: rawPlan === currentPlan || isDevUser },
      { label: "Workspace === Plan", pass: workspace === currentPlan || workspace === "founder" || workspace === "enterprise" || workspace === "developer" },
      { label: "Founder Status Consistent", pass: !(hasActiveRecord && !founderPortalEnabled && subscriptionEligible && purchaseVerified) },
      { label: "Enterprise Affiliation Consistent", pass: !affiliation?.organization_id || workspace === "enterprise" || currentPlan === "enterprise" },
    ];
    const consistency = {
      allMatch: checks.every(c => c.pass),
      checks,
    };

    // ── 12. Build canonical subscription object ──
    const canonical = {
      userId: user.id,
      subscriptionId: subscriptionRecord?.subscription_id || null,
      customerId: subscriptionRecord?.customer_id || null,
      stripeSubscriptionId: subscriptionRecord?.subscription_id || null,
      stripeCustomerId: subscriptionRecord?.customer_id || null,
      currentPlan,
      billingCycle: profile?.subscription_cycle || subscriptionRecord?.billing_cycle || "monthly",
      status: profile?.subscription_status || subscriptionRecord?.status || "active",
      workspace,
      foundingMember: {
        isFoundingMember: Boolean(hasActiveRecord),
        founderPortalEnabled,
        purchaseVerified,
        founderNumber: founderRecord?.founding_member_number || null,
        founderTier: founderRecord?.founding_tier || null,
        founderSince: founderRecord?.joined_date || null,
        lifetimeDiscount: founderRecord?.lifetime_discount_percentage ?? FOUNDER_DISCOUNT,
        priceProtection: founderRecord?.protected_pricing ?? true,
      },
      enterpriseOrganizationId: affiliation?.organization_id || profile?.organization_id || null,
      enterpriseOrganizationName: affiliation?.organization_name || null,
      enterpriseSeatId: affiliation?.id || null,
      seatRole: affiliation?.role_title || affiliation?.affiliation_type || null,
      renewalDate: nextInvoice?.period_end || subscriptionRecord?.current_period_end || null,
      trialEndsAt: subscriptionRecord?.status === "trialing" ? subscriptionRecord?.current_period_end : null,
      cancelAtPeriodEnd: subscriptionRecord?.cancel_at_period_end ?? false,
      nextInvoice: nextInvoice ? {
        amount: nextInvoice.amount || 0,
        currency: nextInvoice.currency || "USD",
        periodEnd: nextInvoice.period_end || null,
      } : null,
      paymentProvider: paymentSettings?.provider || subscriptionRecord?.payment_provider || "stripe",
      featureEntitlements,
      configVersion: "1.0",
      lastSynced: new Date().toISOString(),
      source: "backend",
      consistency,
    };

    return Response.json(canonical);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});