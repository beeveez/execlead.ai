import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useSecurityOperationsData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [events, incidents, otpLogs, usageLogs, auditLogs, sessions] = await Promise.all([
          base44.entities.SecurityEvent.list("-created_date", 100).catch(() => []),
          base44.entities.SecurityIncident.list("-created_date", 50).catch(() => []),
          base44.entities.OtpActivityLog.list("-created_date", 100).catch(() => []),
          base44.entities.UsageLog.filter({ status: "rate_limited" }, "-created_date", 50).catch(() => []),
          base44.entities.GovernanceAuditLog.list("-created_date", 50).catch(() => []),
          base44.entities.SecuritySession.list("-created_date", 50).catch(() => []),
        ]);
        setData({ events, incidents, otpLogs, usageLogs, auditLogs, sessions });
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