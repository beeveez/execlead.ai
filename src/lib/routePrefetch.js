import { queryClientInstance } from "@/lib/query-client";
import { getPricingCatalog } from "@/lib/pricingCatalog";
import { base44 } from "@/api/base44Client";

/**
 * Maps marketing routes to their lazy import functions.
 * Calling these prefetches the JS chunk so navigation is instant.
 * Vite deduplicates — safe to call multiple times.
 */
const ROUTE_LOADERS = {
  "/pricing": () => import("@/pages/Pricing"),
  "/leaderboard": () => import("@/pages/Leaderboard"),
};

/**
 * Prefetch a route's JS chunk AND its data on hover.
 * This makes navigation feel instant — the code and data are
 * already loaded by the time the user clicks.
 */
export function prefetchRoute(path) {
  // 1. Prefetch JS chunk (Vite deduplicates automatically)
  const loader = ROUTE_LOADERS[path];
  if (loader) loader();

  // 2. Prefetch data via React Query (deduplicates automatically)
  if (path === "/pricing") {
    queryClientInstance.prefetchQuery({
      queryKey: ["pricingCatalog"],
      queryFn: async () => (await getPricingCatalog()).filter((p) => p.visible),
      staleTime: 5 * 60 * 1000,
    });
  } else if (path === "/leaderboard") {
    const staleTime = 2 * 60 * 1000;
    queryClientInstance.prefetchQuery({
      queryKey: ["leaderboard", "shareEvents"],
      queryFn: () => base44.entities.ShareEvent.list("-created_date", 500).catch(() => []),
      staleTime,
    });
    queryClientInstance.prefetchQuery({
      queryKey: ["leaderboard", "referrals"],
      queryFn: () => base44.entities.Referral.list("-created_date", 500).catch(() => []),
      staleTime,
    });
    queryClientInstance.prefetchQuery({
      queryKey: ["leaderboard", "topLearners"],
      queryFn: () => base44.entities.UserProfile.filter({ status: "active" }, "-xp_points", 100).catch(() => []),
      staleTime,
    });
  }
}