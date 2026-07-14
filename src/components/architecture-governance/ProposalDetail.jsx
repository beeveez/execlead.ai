import React from "react";
import { Button } from "@/components/ui/button";
import {
  STATUS_META,
  RECOMMENDATION_META,
  PROPOSAL_TYPE_META,
} from "@/lib/architectureGovernanceEngine";
import ImpactScorePanel from "./ImpactScorePanel";
import {
  X, FileText, Users, Link2, Search, Lightbulb,
  Compass, Flag, Shield, Lock, Rocket, Wrench, Gavel, User,
} from "lucide-react";

const IMPACT_FIELDS = [
  { key: "business_justification",         label: "Business Justification",            icon: FileText },
  { key: "user_personas_affected",         label: "User Personas Affected",            icon: Users },
  { key: "dependencies",                   label: "Dependencies",                      icon: Link2 },
  { key: "existing_capabilities_reviewed", label: "Existing Capabilities Reviewed",    icon: Search },
  { key: "alternative_solutions",         label: "Alternative Solutions Considered",  icon: Lightbulb },
  { key: "impact_navigation_registry",    label: "Impact on Navigation Registry™",    icon: Compass },
  { key: "impact_feature_flags",          label: "Impact on Feature Flags",           icon: Flag },
  { key: "impact_security",               label: "Impact on Security",                icon: Shield },
  { key: "impact_privacy",                label: "Impact on Privacy",                 icon: Lock },
  { key: "impact_release_readiness",      label: "Impact on Release Readiness",       icon: Rocket },
  { key: "estimated_maintenance_cost",    label: "Estimated Maintenance Cost",        icon: Wrench },
];

/**
 * Full proposal detail — shows all impact fields, score panel,
 * recommendation, and review history. Provides a "Review" action.
 */
export default function ProposalDetail({ proposal, onClose, onReview, canReview }) {
  const status = STATUS_META[proposal.status] || STATUS_META.draft;
  const rec = RECOMMENDATION_META[proposal.recommendation] || RECOMMENDATION_META.pending;
  const typeMeta = PROPOSAL_TYPE_META[proposal.proposal_type] || { label: proposal.proposal_type };

  const scores = {};
  IMPACT_FIELDS.forEach(() => {});

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-mono">{typeMeta.label}</span>
              <span className="text-[10px] text-white/20">•</span>
              <span className="text-[10px] text-white/30 font-mono">{proposal.proposal_id || "—"}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium ml-1"
                style={{ backgroundColor: status.color + "15", color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white truncate">{proposal.title}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 ml-4"><X size={18} /></button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Impact fields */}
          <div className="lg:col-span-2 space-y-4">
            {IMPACT_FIELDS.map((field) => {
              const value = proposal[field.key];
              return (
                <div key={field.key}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <field.icon size={12} className="text-white/30" />
                    <span className="text-[10px] uppercase tracking-wider text-white/30">{field.label}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed pl-5">
                    {value || <span className="text-white/20 italic">Not provided</span>}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Score + Recommendation */}
          <div className="space-y-4">
            <ImpactScorePanel scores={proposal} overallScore={proposal.overall_score || 0} />

            {/* Recommendation */}
            <div className={`border rounded-xl p-4 ${rec.border} ${rec.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Gavel size={14} className={rec.text} />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Recommendation</span>
              </div>
              <div className={`text-base font-bold ${rec.text}`}>{rec.label}</div>
              {proposal.recommendation_notes && (
                <p className="text-xs text-white/40 mt-2 leading-relaxed">{proposal.recommendation_notes}</p>
              )}
              {proposal.conditions && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-white/30">Conditions</span>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">{proposal.conditions}</p>
                </div>
              )}
            </div>

            {/* Reviewer info */}
            {proposal.reviewed_by_name && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-white/40">
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={12} />
                  <span>Reviewed by {proposal.reviewed_by_name}</span>
                </div>
                {proposal.reviewed_at && (
                  <span className="text-white/20">{new Date(proposal.reviewed_at).toLocaleString()}</span>
                )}
              </div>
            )}

            {/* Submitter info */}
            {proposal.submitted_by_name && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-white/40">
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={12} />
                  <span>Submitted by {proposal.submitted_by_name}</span>
                </div>
                {proposal.submitted_at && (
                  <span className="text-white/20">{new Date(proposal.submitted_at).toLocaleString()}</span>
                )}
              </div>
            )}

            {canReview && proposal.status !== "rejected" && proposal.status !== "implemented" && (
              <Button
                onClick={onReview}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Gavel size={14} className="mr-2" /> Review Proposal
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}