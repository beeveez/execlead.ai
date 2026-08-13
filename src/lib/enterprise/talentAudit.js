import { base44 } from "@/api/base44Client";

export function recordTalentAudit(context, eventType, resource) {
  return base44.entities.TalentIntelligenceAuditEvent.create({
    organizationId: context.organizationId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    eventType,
    resource,
    cohortId: context.cohortId || "",
    occurredAt: new Date().toISOString(),
  });
}

export const recordForecastGeneration = (context) => recordTalentAudit(context, "forecast_generated", "promotion_forecast");
export const recordSuccessionCalibration = (context) => recordTalentAudit(context, "succession_calibrated", "succession_candidate");