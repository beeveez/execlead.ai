import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { recordTalentAudit } from "@/lib/enterprise/talentAudit";

const DEMO_ORG = "demo-q3-director-readiness";

export default function useEnterpriseTalentData(resource = "chro_dashboard") {
  const { user } = useAuth();
  const { profile, role } = useWorkspace();
  const organizationId = profile?.organization_id || user?.organization_id || DEMO_ORG;
  const [state, setState] = useState({ loading: true, snapshots: [], candidates: [], error: "" });
  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.EnterpriseTalentAnalytics.filter({ organizationId }, "-snapshotDate", 10),
      base44.entities.SuccessionCandidateProfile.filter({ organizationId }, "-evidenceStrength", 100),
    ]).then(([snapshots, candidates]) => {
      if (active) setState({ loading: false, snapshots, candidates, error: "" });
      return recordTalentAudit({ organizationId, actorId: user.id, actorRole: role, cohortId: snapshots[0]?.cohortId }, resource.includes("succession") ? "succession_viewed" : "analytics_viewed", resource);
    }).catch((error) => active && setState({ loading: false, snapshots: [], candidates: [], error: error.message }));
    return () => { active = false; };
  }, [organizationId, resource, role, user?.id]);
  return { ...state, snapshot: state.snapshots[0], previousSnapshot: state.snapshots[1], organizationId };
}