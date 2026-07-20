import React from "react";
import { ScrollText, User, Shield, FileText } from "lucide-react";
import { getFullAuditTrail } from "@/lib/verificationAuditEngine";

const EVENT_ICONS = {
  application_created: FileText,
  evidence_uploaded: FileText,
  evidence_removed: FileText,
  status_changed: Shield,
  reviewer_assigned: User,
  approved: Shield,
  rejected: Shield,
  renewed: Shield,
  expired: Shield,
  suspended: Shield,
  restored: Shield,
  policy_evaluated: Shield,
  trust_snapshot_captured: Shield,
};

export default function EnterpriseAuditTrail({ verification }) {
  if (!verification) return null;
  const trail = getFullAuditTrail(verification);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Enterprise Audit™</h3>
        <span className="text-[9px] text-white/20 uppercase tracking-wider ml-auto">{trail.length} Events</span>
      </div>

      {trail.length === 0 ? (
        <div className="text-center py-6 text-xs text-white/30">No audit events recorded yet.</div>
      ) : (
        <div className="space-y-0 max-h-80 overflow-y-auto">
          {trail.slice().reverse().map((event, i) => {
            const Icon = EVENT_ICONS[event.event] || Shield;
            return (
              <div key={i} className="flex items-start gap-3 pb-3">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Icon size={12} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/70">{event.event_label || event.event}</span>
                    <span className="text-[9px] text-white/20">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  {event.actor && event.actor !== "system" && (
                    <div className="text-[10px] text-white/30 mt-0.5">by {event.actor}</div>
                  )}
                  {event.details && (
                    <div className="text-[11px] text-white/40 mt-1">{event.details}</div>
                  )}
                  {/* Governance metadata for v2.1 events */}
                  {event.policy_version && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {event.policy_version && <span className="text-[8px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">Policy v{event.policy_version}</span>}
                      {event.confidence_score !== undefined && <span className="text-[8px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">Confidence: {event.confidence_score}%</span>}
                      {event.risk_score !== undefined && <span className="text-[8px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">Risk: {event.risk_score}</span>}
                      {event.readiness_score !== undefined && <span className="text-[8px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">Readiness: {event.readiness_score}%</span>}
                      {event.decision_reason && event.decision_reason !== event.details && (
                        <span className="text-[8px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">Reason: {event.decision_reason}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}