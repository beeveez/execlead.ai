import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useAIComputeData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageLogs, subscriptions, billingEvents] = await Promise.all([
          base44.entities.UsageLog.list("-created_date", 200).catch(() => []),
          base44.entities.Subscription.list("-created_date", 50).catch(() => []),
          base44.entities.BillingEvent.list("-created_date", 50).catch(() => []),
        ]);
        setData({ usageLogs, subscriptions, billingEvents });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
}