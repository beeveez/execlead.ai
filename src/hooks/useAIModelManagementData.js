import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useAIModelManagementData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageLogs, routingEvents, policyEvents] = await Promise.all([
          base44.entities.UsageLog.list("-created_date", 200).catch(() => []),
          base44.entities.ModelRoutingEvent.list("-created_date", 50).catch(() => []),
          base44.entities.AIPolicyEvent.list("-created_date", 50).catch(() => []),
        ]);
        setData({ usageLogs, routingEvents, policyEvents });
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