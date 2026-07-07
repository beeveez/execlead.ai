import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const STALE_TIME = 2 * 60 * 1000; // 2 minutes — community stats don't change often

/**
 * Cached PUBLIC leaderboard data for the marketing Leaderboard page.
 *
 * Only public / verified profiles are surfaced — never private user data.
 * Each query loads independently and degrades gracefully (empty array on
 * error), so the public page never breaks even if a single source fails.
 */
export function usePublicLeaderboardData() {
  const learners = useQuery({
    queryKey: ["publicLeaderboard", "learners"],
    queryFn: () =>
      base44.entities.UserProfile
        .filter({ public_visibility: "public", status: "active" }, "-xp_points", 50)
        .catch(() => []),
    staleTime: STALE_TIME,
  });

  const organizations = useQuery({
    queryKey: ["publicLeaderboard", "organizations"],
    queryFn: () => base44.entities.Organization.list("-seats_used", 20).catch(() => []),
    staleTime: STALE_TIME,
  });

  const companies = useQuery({
    queryKey: ["publicLeaderboard", "companies"],
    queryFn: () =>
      base44.entities.Company
        .filter({ is_archived: false, status: "approved" }, "-employee_count", 20)
        .catch(() => []),
    staleTime: STALE_TIME,
  });

  const featuredExecutives = useQuery({
    queryKey: ["publicLeaderboard", "featuredExecutives"],
    queryFn: () =>
      base44.entities.UserProfile.filter({ verified_executive: true }, "-xp_points", 12).catch(() => []),
    staleTime: STALE_TIME,
  });

  const shareEvents = useQuery({
    queryKey: ["publicLeaderboard", "shareEvents"],
    queryFn: () => base44.entities.ShareEvent.list("-created_date", 100).catch(() => []),
    staleTime: STALE_TIME,
  });

  return {
    learners: learners.data ?? null,
    organizations: organizations.data ?? null,
    companies: companies.data ?? null,
    featuredExecutives: featuredExecutives.data ?? null,
    shareEvents: shareEvents.data ?? null,
  };
}