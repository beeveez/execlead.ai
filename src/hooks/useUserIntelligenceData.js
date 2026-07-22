import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Fetches all raw entity data for the User Intelligence™ dashboard
 * in parallel. Individual record failures are swallowed — any entity
 * that errors returns an empty array so the dashboard still renders.
 */
export function useUserIntelligenceData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled([
          base44.entities.User.list("-created_date", 500),
          base44.entities.UserProfile.list("-created_date", 500),
          base44.entities.UsageLog.list("-created_date", 500),
          base44.entities.Subscription.list("-created_date", 500),
          base44.entities.Organization.list("-created_date", 200),
          base44.entities.FoundingMember.list("-created_date", 500),
          base44.entities.BetaApplication.list("-created_date", 500),
          base44.entities.PlatformActivity.list("-created_date", 500),
        ]);
        const [users, profiles, usageLogs, subscriptions, organizations, foundingMembers, betaApps, activities] = results.map(
          (r) => (r.status === "fulfilled" ? r.value : [])
        );
        setData({ users, profiles, usageLogs, subscriptions, organizations, foundingMembers, betaApps, activities });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return { data, loading, error };
}