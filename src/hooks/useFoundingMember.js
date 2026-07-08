import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export function useFoundingMember() {
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const members = await base44.entities.FoundingMember.filter({ user_id: user.id });
      setMember(members.length > 0 ? members[0] : null);
    } catch (e) {}
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return { member, loading, reload: load };
}