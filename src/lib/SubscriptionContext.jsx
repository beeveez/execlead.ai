import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getPlan, PLANS } from '@/lib/plans';
import { canAccessDeveloperWorkspace } from '@/lib/roles';
import { fetchTargetCompany, buildCompanyContext, setCachedCompanyContext } from '@/lib/companyContext';
import { getUserActiveMemberships, PROGRAM_TYPES, getBestMembershipDiscount, hasLifetimePricingProtection } from '@/lib/membershipEngine';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [renewalDate, setRenewalDate] = useState(null);
  const [memberships, setMemberships] = useState([]);
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
    } catch (e) {
      setProfile(null);
      setRenewalDate(null);
      setMemberships([]);
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
  const plan = isDevUser ? PLANS.developer_unlimited : getPlan(profile);
  const isFoundingMember = profile?.founding_member === true;

  // Membership programs are independent of the subscription plan.
  // A user may be on the Free plan AND be a Founding Member — both
  // statuses are displayed side by side, never one replacing the other.
  const primaryMembership = memberships.length > 0 ? memberships[0] : null;
  const membershipMeta = primaryMembership?.program_type ? PROGRAM_TYPES[primaryMembership.program_type] : null;
  const bestDiscount = getBestMembershipDiscount(memberships);
  const hasProtection = hasLifetimePricingProtection(memberships);

  const membership = primaryMembership ? {
    name: primaryMembership.program_name || membershipMeta?.label || "Member",
    type: primaryMembership.program_type,
    icon: membershipMeta?.icon || "🏅",
    color: primaryMembership.badge_color || membershipMeta?.color || "#f59e0b",
    number: primaryMembership.membership_number,
    discount: bestDiscount,
    hasPriceProtection: hasProtection,
    since: primaryMembership.joined_date || (isFoundingMember ? profile?.founding_member_since : null),
    isLifetime: primaryMembership.is_lifetime,
  } : null;

  const subscription = {
    planName: plan.name,
    planTier: plan.id,
    status: profile?.subscription_status || "active",
    billingCycle: profile?.subscription_cycle || "monthly",
    renewalDate,
    features: plan.features,
    limits: plan.limits,
    color: plan.color,
    icon: plan.icon,
    price: plan.price,
    isFoundingMember,
    membership,
  };

  return (
    <SubscriptionContext.Provider value={{ profile, subscription, membership, memberships, renewalDate, loading, refreshProfile }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
};