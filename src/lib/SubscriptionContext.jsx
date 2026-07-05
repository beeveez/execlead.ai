import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getPlan } from '@/lib/plans';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [renewalDate, setRenewalDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = await base44.entities.UserProfile.list();
      const p = profiles[0] || null;
      setProfile(p);
      if (p) {
        try {
          const invs = await base44.entities.Invoice.list("-created_date", 1);
          setRenewalDate(invs[0]?.period_end || null);
        } catch {
          setRenewalDate(null);
        }
      } else {
        setRenewalDate(null);
      }
    } catch (e) {
      setProfile(null);
      setRenewalDate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [isAuthenticated, loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const plan = getPlan(profile);

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
  };

  return (
    <SubscriptionContext.Provider value={{ profile, subscription, renewalDate, loading, refreshProfile }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
};