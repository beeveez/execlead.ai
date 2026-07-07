import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { getAvailableWorkspaces, getDefaultWorkspace, resolveWorkspaceNav } from "@/lib/workspaces";
import { normalizeRole, getEffectiveRole as computeEffectiveRole } from "@/lib/roles";

const WorkspaceContext = createContext(null);
export const useWorkspace = () => useContext(WorkspaceContext);

const STORAGE_KEY = "execlead_active_workspace";

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const { profile, subscription } = useSubscription();
  const { getEffectiveRole, getEffectivePlan, isSimulating } = useDeveloper();

  const [activeWorkspace, setActiveWorkspaceState] = useState(null);
  const [workspaceChosen, setWorkspaceChosen] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return !!localStorage.getItem(STORAGE_KEY);
  });

  const role = useMemo(() => {
    if (!user) return null;
    const impersonated = getEffectiveRole(user.role);
    const effective = isSimulating ? impersonated : computeEffectiveRole(impersonated, profile);
    return normalizeRole(effective);
  }, [user?.role, user?.id, profile?.organization_id, profile?.custom_role, isSimulating, getEffectiveRole]);

  const plan = useMemo(() => {
    if (!user) return null;
    return getEffectivePlan(subscription?.planTier) || subscription?.planTier || "free";
  }, [user?.id, subscription?.planTier, getEffectivePlan]);

  const availableWorkspaces = useMemo(() => {
    if (!role || !plan) return [];
    return getAvailableWorkspaces(role, plan, profile, isSimulating);
  }, [role, plan, profile?.organization_id, isSimulating]);

  // Restore saved workspace or default in-memory (without persisting the default).
  // workspaceChosen tracks whether the user has explicitly picked a workspace,
  // so the /home route knows whether to auto-redirect or show a chooser.
  useEffect(() => {
    if (availableWorkspaces.length === 0) return;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && availableWorkspaces.includes(saved)) {
      setActiveWorkspaceState(saved);
      setWorkspaceChosen(true);
    } else {
      const def = getDefaultWorkspace(availableWorkspaces, role);
      setActiveWorkspaceState(def);
      setWorkspaceChosen(false);
    }
  }, [availableWorkspaces.join(","), role]);

  const setActiveWorkspace = useCallback((wsId, { persist = true } = {}) => {
    if (!availableWorkspaces.includes(wsId)) return;
    setActiveWorkspaceState(wsId);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, wsId); } catch {}
      setWorkspaceChosen(true);
    }
  }, [availableWorkspaces]);

  const navGroups = useMemo(() => {
    if (!activeWorkspace || !role) return [];
    return resolveWorkspaceNav(activeWorkspace, role, plan, profile);
  }, [activeWorkspace, role, plan, profile]);

  const value = {
    activeWorkspace,
    availableWorkspaces,
    setActiveWorkspace,
    workspaceChosen,
    navGroups,
    role,
    plan,
    profile,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}