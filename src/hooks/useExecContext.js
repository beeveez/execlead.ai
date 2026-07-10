import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { matchPageContext } from "@/lib/execConciergeConfig";

function computeRecommendations(data, user) {
  const recs = [];
  const rep = data?.reputation;
  const profile = data?.profile;

  if (!rep || rep.reputation_score === undefined) {
    recs.push({ label: "Calculate Executive Reputation™", path: "/reputation", priority: "high" });
  } else {
    if (rep.reputation_score < 500) {
      recs.push({ label: "Improve Executive Reputation™", path: "/reputation", priority: "high" });
    }
    if (rep.reputation_tier === "new_member" || rep.reputation_tier === "contributor") {
      recs.push({ label: "Earn your next reputation badge", path: "/reputation", priority: "medium" });
    }
  }

  if (profile) {
    if (!profile.identity_verified) {
      recs.push({ label: "Verify your identity", path: "/identity-verification", priority: "high" });
    }
    if ((profile.interview_readiness || 0) < 50) {
      recs.push({ label: "Prepare for interviews", path: "/career-studio", priority: "medium" });
    }
    if ((profile.leadership_maturity || 0) < 50) {
      recs.push({ label: "Complete Leadership DNA™", path: "/leadership-dna", priority: "medium" });
    }
    if (!profile.founding_member && profile.subscription_plan === "free") {
      recs.push({ label: "Upgrade your membership", path: "/compare-plans", priority: "low" });
    }
  }

  recs.push({ label: "Continue Leadership Journey", path: "/dashboard", priority: "low" });
  return recs.slice(0, 4);
}

export function useExecContext() {
  const location = useLocation();
  const { user } = useAuth();
  const [pageContext, setPageContext] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);

  useEffect(() => {
    setPageContext(matchPageContext(location.pathname));
  }, [location.pathname]);

  const fetchUserContext = useCallback(async () => {
    if (!user?.id) return null;
    if (userContext) return userContext;

    setLoadingContext(true);
    try {
      const repRes = await base44.functions.invoke("manageReputation", {
        action: "get_status",
        user_id: user.id,
      });
      const repData = repRes.data || repRes;
      const context = {
        reputation: repData?.reputation,
        profile: repData?.profile,
        recommendations: computeRecommendations(repData, user),
      };
      setUserContext(context);
      return context;
    } catch (e) {
      const fallback = { recommendations: computeRecommendations(null, user) };
      setUserContext(fallback);
      return fallback;
    } finally {
      setLoadingContext(false);
    }
  }, [user?.id, userContext]);

  return { pageContext, userContext, loadingContext, fetchUserContext };
}