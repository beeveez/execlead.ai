import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getPlan, PLANS } from '@/lib/plans';
import { canAccessDeveloperWorkspace } from '@/lib/roles';
import { fetchTargetCompany, buildCompanyContext, setCachedCompanyContext } from '@/lib/companyContext';
import { setCachedCareerIntelligenceForm } from '@/lib/careerIntelligence/contextCache';
import { seedExecutiveContext, setMemoryContext } from '@/lib/executiveContextEngine';
import { loadExecutiveMemory } from '@/lib/experienceIntelligence/executiveMemory';
import { getUserActiveMemberships, PROGRAM_TYPES, getBestMembershipDiscount, hasLifetimePricingProtection } from '@/lib/membershipEngine';
import { syncFounderEntitlements } from '@/lib/entitlementSync';
import { getUserEntitlements, FOUNDER_BENEFIT_KEYS } from '@/lib/entitlementService';
import { useDeveloper } from '@/lib/DeveloperContext';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { getEffectivePlan, simulation } = useDeveloper();
  const [profile, setProfile] = useState(null);
  const [canonicalSubscription, setCanonicalSubscription] = useState(null);
  const [renewalDate, setRenewalDate] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [entitlements, setEntitlements] = useState(null);
  const [lastEntitlementRefresh, setLastEntitlementRefresh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileLoadAttempted, setProfileLoadAttempted] = useState(false);

  // ============================================================
  // SINGLE SOURCE OF TRUTH LOADER
  // Calls backend resolveSubscription (authoritative) in parallel
  // with the frontend profile load. If the backend is unavailable,
  // falls back to frontend computation from profile.subscription_plan.
  // ============================================================
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setProfileError(null);
    setProfileLoadAttempted(false);
    try {
      const [profiles, subRes] = await Promise.all([
        user?.id
          ? base44.entities.UserProfile.filter({ created_by_id: user.id })
          : Promise.resolve([]),
        user?.id
          ? base44.functions.invoke("resolveSubscription", {}).catch(() => null)
          : Promise.resolve(null),
      ]);

      const p = profiles[0] || null;
      // Defensive validation: ensure loaded profile belongs to the authenticated user
      if (p && user?.id && p.created_by_id && p.created_by_id !== user.id) {
        console.error("[SECURITY] SubscriptionContext: profile owner mismatch", {
          authenticatedUserId: user.id,
          profileOwnerId: p.created_by_id,
        });
        setProfile(null);
        setCanonicalSubscription(null);
        setEntitlements(null);
        setMemberships([]);
        setRenewalDate(null);
        setLoading(false);
        return;
      }

      // ── Idempotent career_intelligence initialization ──
      // If career_intelligence_json was never initialized (user existed before
      // onboarding calibration, or calibration failed), record the existing
      // journey state. This is a truthful recovery — NOT a fabricated baseline.
      // Only runs once; never overwrites an existing value.
      if (p && !p.career_intelligence_json) {
        const xp = p.xp_points || user?.journey_points || user?.journeyPoints || 0;
        const recoveryRecord = {
          initializedAt: new Date().toISOString(),
          initializedFrom: "journey_state_recovery",
          journeyXp: xp,
          readinessLevel: user?.readiness_level || user?.readinessLevel || null,
          note: "Career intelligence initialized from existing journey state — no calibration data available",
        };
        try {
          await base44.entities.UserProfile.update(p.id, {
            career_intelligence_json: JSON.stringify(recoveryRecord),
          });
          p.career_intelligence_json = JSON.stringify(recoveryRecord);
        } catch {}
      }

      setProfile(p);

      const canonical = subRes?.data || null;
      setCanonicalSubscription(canonical);

      // Renewal date: prefer backend result, fall back to invoice query
      if (canonical?.renewalDate) {
        setRenewalDate(canonical.renewalDate);
      } else if (p) {
        try {
          const invs = await base44.entities.Invoice.filter({ owner_user_id: user.id }, "-created_date", 1);
          setRenewalDate(invs[0]?.period_end || null);
        } catch {
          setRenewalDate(null);
        }
      } else {
        setRenewalDate(null);
      }

      // Load active membership programs (independent of subscription plan)
      if (user?.id) {
        try {
          const active = await getUserActiveMemberships(user.id);
          setMemberships(active);
        } catch {
          setMemberships([]);
        }
      }

      // ============================================================
      // ENTITLEMENTS: Backend is the primary source of truth.
      // If backend succeeded, populate from canonical result.
      // If backend failed, fall back to frontend entitlement service.
      // ============================================================
      if (canonical?.foundingMember) {
        const fm = canonical.foundingMember;
        setEntitlements({
          subscription: { plan: canonical.currentPlan, status: canonical.status, cycle: canonical.billingCycle },
          isFoundingMember: fm.isFoundingMember,
          founderPortalEnabled: fm.founderPortalEnabled,
          purchaseVerified: fm.purchaseVerified,
          founderNumber: fm.founderNumber,
          founderTier: fm.founderTier,
          founderSince: fm.founderSince,
          lifetimeDiscount: fm.lifetimeDiscount,
          discountEnabled: fm.founderPortalEnabled,
          priceProtection: fm.priceProtection,
          betaAccess: fm.founderPortalEnabled,
          earlyAccess: fm.founderPortalEnabled,
          communityAccess: fm.founderPortalEnabled,
          roadmapVoting: fm.founderPortalEnabled,
          feedbackSessions: fm.founderPortalEnabled,
          founderBenefits: fm.founderPortalEnabled ? FOUNDER_BENEFIT_KEYS : [],
          founderRecord: null,
          entitlementSource: "backend",
        });
        setLastEntitlementRefresh(Date.now());
        if (fm.isFoundingMember) {
          try {
            const active = await getUserActiveMemberships(user.id);
            setMemberships(active);
          } catch {}
        }
      } else if (user?.id && p) {
        // Fallback: frontend entitlement service
        try { await syncFounderEntitlements(user, p); } catch {}
        try {
          const ents = await getUserEntitlements(user.id, p);
          setEntitlements(ents);
          setLastEntitlementRefresh(Date.now());
          if (ents.isFoundingMember) {
            try {
              const active = await getUserActiveMemberships(user.id);
              setMemberships(active);
            } catch {}
          }
        } catch {
          setEntitlements(null);
        }
      } else {
        setEntitlements(null);
      }
    } catch (e) {
      setProfile(null);
      setProfileError(e?.message || 'Failed to load executive profile');
      setCanonicalSubscription(null);
      setRenewalDate(null);
      setMemberships([]);
      setEntitlements(null);
    } finally {
      setLoading(false);
      setProfileLoadAttempted(true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setProfileLoadAttempted(false);
      setProfileError(null);
      return;
    }
    loadProfile();
  }, [isAuthenticated, user?.id, loadProfile]);

  // Company Context Engine: load the target company profile and cache its
  // intelligence brief so every AI module auto-personalizes to it.
  useEffect(() => {
    if (!profile?.target_company) { setCachedCompanyContext(""); return; }
    let active = true;
    fetchTargetCompany(profile).then(c => {
      if (active) setCachedCompanyContext(buildCompanyContext(c));
    });
    return () => { active = false; };
  }, [profile?.target_company]);

  // Career Intelligence™ Context: cache the resolved Career Intelligence
  // Profile™ so every EXEC™ AI module (Coach, Simulator, Debate, Resume,
  // Academy, Council) auto-personalizes to the user's target role, industry,
  // country, and salary benchmark.
  useEffect(() => {
    if (!profile) { setCachedCareerIntelligenceForm(null); return; }
    setCachedCareerIntelligenceForm({
      target_company: profile.target_company,
      target_role: profile.target_role,
      preferred_industry: profile.preferred_industry,
      target_country: profile.target_country,
      expected_salary: profile.expected_salary,
      salary_currency: profile.salary_currency,
      work_preference: profile.work_preference,
    });
  }, [profile?.target_company, profile?.target_role, profile?.preferred_industry, profile?.target_country, profile?.expected_salary, profile?.salary_currency, profile?.work_preference]);

  // ── Executive Memory™: Async-load the user's persistent leadership
  // memory and seed it into the Executive Context Engine™.
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    loadExecutiveMemory(user.id).then(mem => {
      if (active && mem) setMemoryContext(mem);
    }).catch(() => {});
    return () => { active = false; };
  }, [user?.id]);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const isDevUser = canAccessDeveloperWorkspace(user?.role);
  // ============================================================
  // PLAN RESOLUTION: Backend canonical subscription is the primary
  // source. Developer simulation applies ONLY to developer-role
  // users and ONLY when explicitly active. Falls back to
  // profile.subscription_plan if backend is unavailable.
  // ============================================================
  const backendPlan = canonicalSubscription?.currentPlan;
  const realPlanId = isDevUser ? "developer_unlimited" : (backendPlan || profile?.subscription_plan || "free");
  const effectivePlanId = getEffectivePlan(realPlanId);
  const plan = PLANS[effectivePlanId] || PLANS.free;

  // ============================================================
  // FOUNDER STATUS — from the centralized Entitlement Service ONLY.
  // No profile.founding_member flag, no synthetic membership, no
  // cached/stale state. Developer simulation applies ONLY when
  // explicitly active in the developer console (never for real users).
  // ============================================================
  const serviceFounder = entitlements?.founderPortalEnabled ?? false;
  const simulationApplies = isDevUser && simulation?.active && simulation?.founder !== null;
  const isFoundingMember = simulationApplies ? simulation.founder : serviceFounder;

  const visibleMemberships = memberships.filter(m => m.program_type !== "founding_member" || isFoundingMember);
  const primaryMembership = visibleMemberships.length > 0 ? visibleMemberships[0] : null;
  const membershipMeta = primaryMembership?.program_type ? PROGRAM_TYPES[primaryMembership.program_type] : null;
  const bestDiscount = getBestMembershipDiscount(memberships);
  const hasProtection = hasLifetimePricingProtection(memberships);

  const fmMeta = PROGRAM_TYPES.founding_member;
  const membership = primaryMembership ? {
    name: primaryMembership.program_name || membershipMeta?.label || "Member",
    type: primaryMembership.program_type,
    icon: membershipMeta?.icon || "🏅",
    color: primaryMembership.badge_color || membershipMeta?.color || "#f59e0b",
    number: primaryMembership.membership_number,
    discount: bestDiscount,
    hasPriceProtection: hasProtection,
    since: primaryMembership.joined_date || (isFoundingMember ? entitlements?.founderSince : null),
    isLifetime: primaryMembership.is_lifetime,
  } : (isFoundingMember ? {
    name: "Founding Member",
    type: "founding_member",
    icon: fmMeta.icon,
    color: fmMeta.color,
    number: entitlements?.founderNumber || null,
    discount: entitlements?.lifetimeDiscount ?? 25,
    hasPriceProtection: entitlements?.priceProtection ?? true,
    since: entitlements?.founderSince || null,
    isLifetime: true,
  } : null);

  const effectiveMembership = (simulationApplies && simulation?.founder === false) ? null : membership;

  // ============================================================
  // CANONICAL SUBSCRIPTION OBJECT — single source of truth.
  // Every field is either from the backend resolveSubscription
  // function or derived from it. Frontend computation is only
  // a fallback when the backend is unavailable (source: "frontend_fallback").
  // Every page consumes this object — no page independently
  // determines plan, workspace, billing, or entitlements.
  // ============================================================
  const subscription = {
    // Plan fields (backward compatible)
    planName: plan.name,
    planTier: plan.id,
    status: simulation.subscriptionStatus || profile?.subscription_status || canonicalSubscription?.status || "active",
    billingCycle: profile?.subscription_cycle || canonicalSubscription?.billingCycle || "monthly",
    renewalDate,
    features: plan.features,
    limits: plan.limits,
    color: plan.color,
    icon: plan.icon,
    price: plan.price,
    isFoundingMember,
    purchaseVerified: simulationApplies ? simulation.founder : (entitlements?.purchaseVerified ?? false),
    founderPortalEnabled: isFoundingMember,
    membership: effectiveMembership,
    isSimulated: simulation.active,
    // Canonical fields from backend resolveSubscription
    userId: canonicalSubscription?.userId || user?.id,
    subscriptionId: canonicalSubscription?.subscriptionId || null,
    customerId: canonicalSubscription?.customerId || null,
    stripeSubscriptionId: canonicalSubscription?.stripeSubscriptionId || null,
    stripeCustomerId: canonicalSubscription?.stripeCustomerId || null,
    workspace: canonicalSubscription?.workspace || null,
    foundingMember: canonicalSubscription?.foundingMember || null,
    enterpriseOrganizationId: canonicalSubscription?.enterpriseOrganizationId || profile?.organization_id || null,
    enterpriseOrganizationName: canonicalSubscription?.enterpriseOrganizationName || null,
    enterpriseSeatId: canonicalSubscription?.enterpriseSeatId || null,
    seatRole: canonicalSubscription?.seatRole || null,
    trialEndsAt: canonicalSubscription?.trialEndsAt || null,
    cancelAtPeriodEnd: canonicalSubscription?.cancelAtPeriodEnd ?? false,
    nextInvoice: canonicalSubscription?.nextInvoice || null,
    paymentProvider: canonicalSubscription?.paymentProvider || "stripe",
    featureEntitlements: canonicalSubscription?.featureEntitlements || [],
    configVersion: canonicalSubscription?.configVersion || "1.0",
    lastSynced: canonicalSubscription?.lastSynced || null,
    source: canonicalSubscription?.source || "frontend_fallback",
    consistency: canonicalSubscription?.consistency || null,
  };

  // ── Executive Context Engine™: Seed identity, career, leadership,
  // journey, and capabilities layers. Must run AFTER subscription is
  // initialized to avoid temporal dead zone (TDZ) reference errors.
  useEffect(() => {
    seedExecutiveContext({ user, profile, subscription, entitlements });
  }, [
    user?.id, profile?.id,
    profile?.display_name, profile?.full_name, profile?.subscription_plan,
    profile?.organization_id, profile?.target_company, profile?.target_role,
    profile?.preferred_industry, profile?.target_country, profile?.expected_salary,
    profile?.career_stage, profile?.cached_journey_points, profile?.cached_readiness_score,
    profile?.promotion_readiness, profile?.executive_presence, profile?.leadership_maturity,
    profile?.commercial_maturity, profile?.communication_growth, profile?.confidence,
    profile?.strong_areas, profile?.weak_areas, profile?.ai_personality,
    profile?.career_goals, profile?.growth_plan,
    subscription?.planTier, entitlements,
  ]);

  return (
    <SubscriptionContext.Provider value={{ profile, subscription, canonicalSubscription, membership: effectiveMembership, memberships, renewalDate, loading, refreshProfile, entitlements, lastEntitlementRefresh, profileError, profileLoadAttempted }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
};