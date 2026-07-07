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

  // Auto-detect or restore active workspace on login / when availability changes
  useEffect(() => {
    if (availableWorkspaces.length === 0) return;
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && availableWorkspaces.includes(saved)) {
      setActiveWorkspaceState(saved);
    } else {
      const def = getDefaultWorkspace(availableWorkspaces, role);
      setActiveWorkspaceState(def);
      try { localStorage.setItem(STORAGE_KEY, def); } catch {}
    }
  }, [availableWorkspaces.join(","), role]);

  const setActiveWorkspace = useCallback((wsId) => {
    if (!availableWorkspaces.includes(wsId)) return;
    setActiveWorkspaceState(wsId);
    try { localStorage.setItem(STORAGE_KEY, wsId); } catch {}
  }, [availableWorkspaces]);

  const navGroups = useMemo(() => {
    if (!activeWorkspace || !role) return [];
    return resolveWorkspaceNav(activeWorkspace, role, plan, profile);
  }, [activeWorkspace, role, plan, profile]);

  const value = {
    activeWorkspace,
    availableWorkspaces,
    setActiveWorkspace,
    navGroups,
    role,
    plan,
    profile,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}