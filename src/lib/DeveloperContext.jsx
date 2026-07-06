import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { isSuperAdmin } from "@/lib/roles";

const STORAGE_KEY = "execlead_developer_state";
const DeveloperContext = createContext(null);

const defaultState = {
  developerMode: false,
  simulatedPlan: null,
  featureOverrides: {},
  impersonation: null,
  sandbox: false,
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
    if (user && isSuperAdmin(user.role)) {
      setState(loadState());
    } else {
      setState(defaultState);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user && isSuperAdmin(user.role)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, user?.id, user?.role]);

  const userRole = user?.role;
  const isSuperAdminUser = isSuperAdmin(userRole);

  const toggleDeveloperMode = useCallback(() => {
    setState((prev) => ({ ...prev, developerMode: !prev.developerMode }));
  }, []);

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

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  const isSimulating = Boolean(state.simulatedPlan || state.impersonation);

  const getEffectivePlan = useCallback((realPlan) => {
    if (state.impersonation?.plan) return state.impersonation.plan;
    if (state.simulatedPlan) return state.simulatedPlan;
    if (state.developerMode && isSuperAdminUser) return "developer_unlimited";
    return realPlan;
  }, [state.impersonation, state.simulatedPlan, state.developerMode, isSuperAdminUser]);

  const getEffectiveRole = useCallback((realRole) => {
    if (state.impersonation?.role) return state.impersonation.role;
    return realRole;
  }, [state.impersonation]);

  return (
    <DeveloperContext.Provider value={{
      ...state,
      isSuperAdmin: isSuperAdminUser,
      isSimulating,
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