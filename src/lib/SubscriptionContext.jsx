import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getPlan, PLANS } from '@/lib/plans';
import { canAccessDeveloperWorkspace } from '@/lib/roles';
import { fetchTargetCompany, buildCompanyContext, setCachedCompanyContext } from '@/lib/companyContext';
import { getUserActiveMemberships, PROGRAM_TYPES, getBestMembershipDiscount, hasLifetimePricingProtection } from '@/lib/membershipEngine';
import { syncFounderEntitlements } from '@/lib/entitlementSync';
import { getUserEntitlements } from '@/lib/entitlementService';
import { useDeveloper } from '@/lib/DeveloperContext';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { getEffectivePlan, simulation } = useDeveloper();
  const [profile, setProfile] = useState(null);
  const [renewalDate, setRenewalDate] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [entitlements, setEntitlements] = useState(null);
  const [lastEntitlementRefresh, setLastEntitlementRefresh] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = user?.id
        ? await base44.entities.UserProfile.filter({ created_by_id: user.id })
        : await base44.entities.UserProfile.list();
      const p = profiles[0] || null;
      setProfile(p);
      if (p) {
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
      // CENTRALIZED ENTITLEMENT SERVICE — single source of truth.
      // Founder status is determined SOLELY by getUserEntitlements(),
      // which reads the FoundingMember entity directly. No profile
      // flag fallback, no synthetic membership, no cached/stale state.
      // Account switch (user.id change) triggers a full refetch.
      // ============================================================
      if (user?.id && p) {
        // Self-heal existing founder records / clear stale flags
        try { await syncFounderEntitlements(user, p); } catch {}
        // Read the single source of truth
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
      setRenewalDate(null);
      setMemberships([]);
      setEntitlements(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
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

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const isDevUser = canAccessDeveloperWorkspace(user?.role);
  const realPlanId = isDevUser ? "developer_unlimited" : (profile?.subscription_plan || "free");
  const effectivePlanId = getEffectivePlan(realPlanId);
  const plan = PLANS[effectivePlanId] || PLANS.free;
  // ============================================================
  // FOUNDER STATUS — from the centralized Entitlement Service ONLY.
  // No profile.founding_member flag, no synthetic membership, no
  // cached/stale state. Developer simulation applies ONLY when
  // explicitly active in the developer console (never for real users).
  // ============================================================
  // Use founderPortalEnabled (ALL conditions: active record + purchase
  // verified + eligible subscription) — NOT just isFoundingMember (which
  // only means a record exists). This prevents Free users with stale
  // records from seeing the badge.
  const serviceFounder = entitlements?.founderPortalEnabled ?? false;
  // Developer simulation applies ONLY to developer-role users and ONLY
  // when explicitly active. It never leaks to real user accounts and
  // never persists to the database — the backend validation is the
  // authoritative source of truth for real users.
  const simulationApplies = isDevUser && simulation?.active && simulation?.founder !== null;
  const isFoundingMember = simulationApplies ? simulation.founder : serviceFounder;

  // Membership programs are independent of the subscription plan.
  // A user may be on the Free plan AND be a Founding Member — both
  // statuses are displayed side by side, never one replacing the other.
  // Filter out founding_member program memberships when the user is not
  // entitled — prevents UserMembership records from showing the badge
  // when the Entitlement Service says founderPortalEnabled is false.
  const visibleMemberships = memberships.filter(m => m.program_type !== "founding_member" || isFoundingMember);
  const primaryMembership = visibleMemberships.length > 0 ? visibleMemberships[0] : null;
  const membershipMeta = primaryMembership?.program_type ? PROGRAM_TYPES[primaryMembership.program_type] : null;
  const bestDiscount = getBestMembershipDiscount(memberships);
  const hasProtection = hasLifetimePricingProtection(memberships);

  const fmMeta = PROGRAM_TYPES.founding_member;
  // Build the membership object from DB-backed sources ONLY.
  // The founder fallback uses the entitlement service result —
  // NEVER the profile.founding_member flag.
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

  // Hide membership badge ONLY when a developer is explicitly simulating non-founder
  const effectiveMembership = (simulationApplies && simulation?.founder === false) ? null : membership;

  const subscription = {
    planName: plan.name,
    planTier: plan.id,
    status: simulation.subscriptionStatus || profile?.subscription_status || "active",
    billingCycle: profile?.subscription_cycle || "monthly",
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
  };

  return (
    <SubscriptionContext.Provider value={{ profile, subscription, membership: effectiveMembership, memberships, renewalDate, loading, refreshProfile, entitlements, lastEntitlementRefresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
};