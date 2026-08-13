import { base44 } from "@/api/base44Client";

export function recordTalentAudit(context, eventType, resource) {
  const timestamp = new Date().toISOString();
  return base44.entities.GovernanceAuditLog.create({
    audit_id: `TALENT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    requester_id: context.actorId,
    action: eventType,
    decision: "approved",
    timestamp,
    workspace: "enterprise",
    organizationId: context.organizationId,
    userId: context.actorId,
    role: context.actorRole,
    resourceAccessed: resource,
    business_justification: "Authorized enterprise talent intelligence access",
  });
}

export const recordForecastGeneration = (context) => recordTalentAudit(context, "forecast_generated", "promotion_forecast");
export const recordSuccessionCalibration = (context) => recordTalentAudit(context, "succession_calibrated", "succession_candidate");