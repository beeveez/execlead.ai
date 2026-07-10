import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ExecutiveCodeOfConduct from "@/components/legacy/ExecutiveCodeOfConduct";

export default function CodeOfConductGate({ children, trigger = "community" }) {
  const { user } = useAuth();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    base44.functions.invoke("manageCodeOfConduct", { action: "get_status" })
      .then((res) => {
        const d = res.data || res;
        setNeedsAcceptance(d.needs_acceptance);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading || !user) return children;

  if (needsAcceptance) {
    return (
      <>
        {children}
        <ExecutiveCodeOfConduct
          trigger={trigger}
          onAccepted={() => setNeedsAcceptance(false)}
          onDeclined={() => setNeedsAcceptance(false)}
        />
      </>
    );
  }

  return children;
}