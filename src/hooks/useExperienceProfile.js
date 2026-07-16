/**
 * useExperienceProfile — React hook for accessing the current
 * Experience Profile™ resolved from user context.
 *
 * Returns the full profile configuration including modules, missions,
 * objectives, recommendations, and upgrade opportunities.
 */
import { useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { resolveExperienceProfile } from "@/lib/experienceIntelligence/experienceProfiles";

export function useExperienceProfile() {
  const { user } = useAuth();
  const { role, plan, activeWorkspace, profile } = useWorkspace();

  return useMemo(() => {
    const userWithRole = user ? { ...user, role } : null;
    const profileInput = { ...profile, subscription_plan: plan };
    return resolveExperienceProfile(userWithRole, profileInput, activeWorkspace);
  }, [user, role, plan, activeWorkspace, profile]);
}