import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const STALE_TIME = 2 * 60 * 1000; // 2 minutes — data is community stats, doesn't change often

/**
 * Cached leaderboard data via React Query.
 * Each query loads independently and is cached across page visits,
 * so returning to the Leaderboard is instant.
 */
export function useLeaderboardData() {
  const shareEvents = useQuery({
    queryKey: ["leaderboard", "shareEvents"],
    queryFn: () => base44.entities.ShareEvent.list("-created_date", 500).catch(() => []),
    staleTime: STALE_TIME,
  });

  const referrals = useQuery({
    queryKey: ["leaderboard", "referrals"],
    queryFn: () => base44.entities.Referral.list("-created_date", 500).catch(() => []),
    staleTime: STALE_TIME,
  });

  const topLearners = useQuery({
    queryKey: ["leaderboard", "topLearners"],
    queryFn: () => base44.entities.UserProfile.filter({ status: "active" }, "-xp_points", 100).catch(() => []),
    staleTime: STALE_TIME,
  });

  return {
    shareEvents: shareEvents.data ?? null,
    referrals: referrals.data ?? null,
    topLearners: topLearners.data ?? null,
  };
}