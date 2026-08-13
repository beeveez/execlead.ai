import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { deriveReadiness } from "@/lib/journey/xpRules";

let journeyRequest;

function loadJourney() {
  if (!journeyRequest) {
    journeyRequest = base44.functions.invoke("manageJourney", { action: "compute" })
      .then((response) => response.data)
      .catch(() => null);
  }
  return journeyRequest;
}

export default function useExecutiveReadiness() {
  const { user } = useAuth();
  const [journey, setJourney] = useState(null);

  useEffect(() => {
    let active = true;
    loadJourney().then((data) => { if (active) setJourney(data); });
    return () => { active = false; };
  }, []);

  return useMemo(() => ({
    user,
    readiness: deriveReadiness(user, journey),
    isEnterpriseManaged: !!(user?.organizationId || user?.organization_id),
  }), [journey, user]);
}