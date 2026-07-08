import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export const ROLE_META = {
  member: { label: "Member", color: "#6366f1", bg: "bg-indigo-500/10", icon: "👤" },
  moderator: { label: "Moderator", color: "#10b981", bg: "bg-emerald-500/10", icon: "🛡️" },
  community_admin: { label: "Admin", color: "#f59e0b", bg: "bg-amber-500/10", icon: "👑" },
  founder: { label: "Founder", color: "#a855f7", bg: "bg-purple-500/10", icon: "🏆" },
  platform_admin: { label: "Platform Admin", color: "#ef4444", bg: "bg-red-500/10", icon: "⚡" },
};

export const MODERATION_ROLES = ["moderator", "community_admin", "founder", "platform_admin"];

export function canModerate(role) {
  return MODERATION_ROLES.includes(role);
}

export function getOnlineCount(memberCount) {
  return Math.max(1, Math.floor((memberCount || 0) * 0.077));
}

export function useCommunityMemberships() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) { setMemberships([]); setLoading(false); return; }
    try {
      const active = await base44.entities.CommunityMembership.filter({
        user_id: user.id,
        status: "active",
      }, "-joined_at", 100);
      setMemberships(active);
    } catch {
      setMemberships([]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const isMemberOf = useCallback((communityId) => {
    return memberships.some((m) => m.community_id === communityId);
  }, [memberships]);

  return { memberships, loading, reload: load, isMemberOf };
}