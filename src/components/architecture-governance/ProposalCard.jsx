import React from "react";
import {
  STATUS_META,
  RECOMMENDATION_META,
  PROPOSAL_TYPE_META,
} from "@/lib/architectureGovernanceEngine";
import { ChevronRight } from "lucide-react";

/**
 * Compact card for a single architecture proposal in the list.
 */
export default function ProposalCard({ proposal, onClick }) {
  const status = STATUS_META[proposal.status] || STATUS_META.draft;
  const rec = RECOMMENDATION_META[proposal.recommendation] || RECOMMENDATION_META.pending;
  const typeMeta = PROPOSAL_TYPE_META[proposal.proposal_type] || { label: proposal.proposal_type };

  const score = proposal.overall_score || 0;
  const scoreColor = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-white/30 font-mono">{typeMeta.label}</span>
            <span className="text-[10px] text-white/20">•</span>
            <span className="text-[10px] text-white/30 font-mono">{proposal.proposal_id || "—"}</span>
          </div>
          <h3 className="text-sm font-semibold text-white/90 group-hover:text-white truncate">{proposal.title}</h3>
        </div>
        <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center gap-3">
        {/* Score badge */}
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] uppercase tracking-wider text-white/30">Score</span>
          <span className="text-lg font-bold" style={{ color: scoreColor }}>{score}</span>
        </div>

        {/* Status badge */}
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: status.color + "15", color: status.color }}
        >
          {status.label}
        </span>

        {/* Recommendation badge */}
        {proposal.recommendation && proposal.recommendation !== "pending" && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${rec.bg} ${rec.text}`}>
            {rec.label}
          </span>
        )}

        {proposal.submitted_by_name && (
          <span className="text-[10px] text-white/20 ml-auto truncate">
            by {proposal.submitted_by_name}
          </span>
        )}
      </div>
    </button>
  );
}