import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { canAccessDeveloperWorkspace, normalizeRole } from "@/lib/roles";

const STORAGE_KEY = "execlead_developer_state";
const DeveloperContext = createContext(null);

const defaultState = {
  developerMode: false,
  simulatedPlan: null,
  featureOverrides: {},
  impersonation: null,
  sandbox: false,
  simulatedFounder: null,
  simulatedSubscriptionStatus: null,
  simulatedReferralLevel: null,
  simulatedBetaAccess: null,
  simulatedRegion: null,
  lastUserId: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
}

export const DeveloperProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    if (user && canAccessDeveloperWorkspace(user.role)) {
      const loaded = loadState();
      // CRITICAL: Simulation state is scoped to the user. If the stored
      // state belongs to a different user (account switch on the same
      // browser), wipe ALL simulation fields — simulatedFounder, plan,
      // impersonation, etc. must never leak across accounts.
      const isSameUser = loaded.lastUserId === user.id;
      const safeState = isSameUser ? loaded : {
        ...defaultState,
        developerMode: true,
        lastUserId: user.id,
      };
      // Developer AND Super Admin roles are always in developer mode.
      // This ensures developer tools NEVER disappear due to subscription
      // changes, localStorage resets, or toggle accidents.
      // Subscription plans MUST NEVER override administrative roles.
      if (normalizeRole(user.role) === "developer" || normalizeRole(user.role) === "super_admin") {
        setState({ ...safeState, developerMode: true, lastUserId: user.id });
      } else {
        setState({ ...safeState, lastUserId: user.id });
      }
    } else {
      setState(defaultState);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user && canAccessDeveloperWorkspace(user.role)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, user?.id, user?.role]);

  const userRole = user?.role;
  const canAccessDev = canAccessDeveloperWorkspace(userRole);
  const isSuperAdminUser = normalizeRole(userRole) === "super_admin";

  const toggleDeveloperMode = useCallback(() => {
    setState((prev) => {
      // Developer and Super Admin roles cannot toggle off — always in developer mode
      const r = normalizeRole(userRole);
      if (r === "developer" || r === "super_admin") return prev;
      return { ...prev, developerMode: !prev.developerMode };
    });
  }, [userRole]);

  const setSimulatedPlan = useCallback((plan) => {
    setState((prev) => ({ ...prev, simulatedPlan: plan === prev.simulatedPlan ? null : plan }));
  }, []);

  const setFeatureOverride = useCallback((featureId, enabled) => {
    setState((prev) => ({
      ...prev,
      featureOverrides: { ...prev.featureOverrides, [featureId]: enabled },
    }));
  }, []);

  const clearFeatureOverride = useCallback((featureId) => {
    setState((prev) => {
      const next = { ...prev.featureOverrides };
      delete next[featureId];
      return { ...prev, featureOverrides: next };
    });
  }, []);

  const clearFeatureOverrides = useCallback(() => {
    setState((prev) => ({ ...prev, featureOverrides: {} }));
  }, []);

  const setImpersonation = useCallback((role, plan, name) => {
    setState((prev) => ({ ...prev, impersonation: role ? { role, plan, name } : null }));
  }, []);

  const stopImpersonation = useCallback(() => {
    setState((prev) => ({ ...prev, impersonation: null }));
  }, []);

  const toggleSandbox = useCallback(() => {
    setState((prev) => ({ ...prev, sandbox: !prev.sandbox }));
  }, []);

  const setSimulatedFounder = useCallback((value) => {
    setState((prev) => ({ ...prev, simulatedFounder: value }));
  }, []);

  const setSimulatedSubscriptionStatus = useCallback((value) => {
    setState((prev) => ({ ...prev, simulatedSubscriptionStatus: value }));
  }, []);

  const setSimulatedReferralLevel = useCallback((value) => {
    setState((prev) => ({ ...prev, simulatedReferralLevel: value }));
  }, []);

  const setSimulatedBetaAccess = useCallback((value) => {
    setState((prev) => ({ ...prev, simulatedBetaAccess: value }));
  }, []);

  const setSimulatedRegion = useCallback((value) => {
    setState((prev) => ({ ...prev, simulatedRegion: value }));
  }, []);

  const clearSimulation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      simulatedPlan: null,
      impersonation: null,
      featureOverrides: {},
      simulatedFounder: null,
      simulatedSubscriptionStatus: null,
      simulatedReferralLevel: null,
      simulatedBetaAccess: null,
      simulatedRegion: null,
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  const isSimulating = Boolean(
    state.simulatedPlan ||
    state.impersonation ||
    state.simulatedFounder !== null ||
    state.simulatedSubscriptionStatus !== null ||
    state.simulatedReferralLevel !== null ||
    state.simulatedBetaAccess !== null ||
    state.simulatedRegion !== null
  );

  const simulation = {
    plan: state.simulatedPlan || state.impersonation?.plan || null,
    role: state.impersonation?.role || null,
    founder: state.simulatedFounder,
    subscriptionStatus: state.simulatedSubscriptionStatus,
    referralLevel: state.simulatedReferralLevel,
    betaAccess: state.simulatedBetaAccess,
    region: state.simulatedRegion,
    active: isSimulating,
  };

  const getEffectivePlan = useCallback((realPlan) => {
    if (state.impersonation?.plan) return state.impersonation.plan;
    if (state.simulatedPlan) return state.simulatedPlan;
    if (canAccessDev && state.developerMode) return "developer_unlimited";
    return realPlan;
  }, [state.impersonation, state.simulatedPlan, state.developerMode, canAccessDev]);

  const getEffectiveRole = useCallback((realRole) => {
    if (state.impersonation?.role) return state.impersonation.role;
    return realRole;
  }, [state.impersonation]);

  return (
    <DeveloperContext.Provider value={{
      ...state,
      isSuperAdmin: isSuperAdminUser,
      canAccessDeveloper: canAccessDev,
      isSimulating,
      simulation,
      getEffectivePlan,
      getEffectiveRole,
      toggleDeveloperMode,
      setSimulatedPlan,
      setFeatureOverride,
      clearFeatureOverride,
      clearFeatureOverrides,
      setImpersonation,
      stopImpersonation,
      toggleSandbox,
      setSimulatedFounder,
      setSimulatedSubscriptionStatus,
      setSimulatedReferralLevel,
      setSimulatedBetaAccess,
      setSimulatedRegion,
      clearSimulation,
      resetAll,
    }}>
      {children}
    </DeveloperContext.Provider>
  );
};

export const useDeveloper = () => {
  const ctx = useContext(DeveloperContext);
  if (!ctx) throw new Error("useDeveloper must be used within a DeveloperProvider");
  return ctx;
};