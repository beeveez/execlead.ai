import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { getEffectiveRole } from "@/lib/roles";

// ============================================================
// ORGANIZATION MEMBERS HOOK — Tenant Isolation
// Returns ONLY members of the current user's organization.
// Platform Admin / Super Admin bypass isolation (see all).
// ============================================================

export function useOrganizationMembers() {
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useSubscription();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlatformWide, setIsPlatformWide] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (loadingProfile) return;

      const role = getEffectiveRole(user?.role, profile);
      const platformWide = role === "platform_admin" || role === "super_admin";
      setIsPlatformWide(platformWide);

      const orgId = profile?.organization_id;
      setOrganizationId(orgId);

      try {
        if (platformWide) {
          const all = await base44.entities.UserProfile.list();
          setMembers(all);
        } else if (orgId) {
          const orgMembers = await base44.entities.UserProfile.filter({ organization_id: orgId });
          setMembers(orgMembers);
        } else {
          setMembers(profile ? [profile] : []);
        }
      } catch (e) {
        setMembers([]);
      }
      setLoading(false);
    };
    load();
  }, [profile?.organization_id, loadingProfile]);

  return { members, loading, isPlatformWide, organizationId };
}