import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, PlayCircle,
} from "lucide-react";

const RISK_STYLES = {
  low: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-orange-500/10 text-orange-400",
  critical: "bg-red-500/10 text-red-400",
};

const STATUS_STYLES = {
  PENDING: "bg-amber-500/10 text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-400",
  REJECTED: "bg-red-500/10 text-red-400",
  EXPIRED: "bg-white/5 text-white/40",
  CANCELLED: "bg-white/5 text-white/40",
};

function fmt(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function shortId(id) {
  return typeof id === "string" && id.length > 12 ? id.slice(0, 8) + "…" : id || "—";
}

export default function ApprovalCard({ approval, currentUser, processing, onApprove, onReject, onResume, resuming }) {
  const isDecided = approval.status !== "PENDING";
  // Frontend UX guards only — the backend decide_approval boundary remains
  // the single authorization authority for every decision, and the governed
  // resume_approved_execution capability remains the single continuation
  // authority for every approved action.
  const isSelf = Boolean(currentUser) && approval.user_id === currentUser.id;
  // Governed continuation state, read from the approval binding only —
  // this card never mutates AgentApproval or AgentExecution records.
  const consumed = Boolean(approval.metadata && approval.metadata.executed_execution_id);
  const resumeAvailable = approval.status === "APPROVED" && isSelf && !consumed;
  const isExpired =
    !isDecided && Boolean(approval.expires_at) && Date.parse(approval.expires_at) < Date.now();
  const controlsDisabled = isDecided || isSelf || isExpired || Boolean(processing);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[approval.status] || "bg-white/5 text-white/40"}`}>
              {consumed
                ? "CONSUMED — COMPLETED"
                : approval.status === "APPROVED" && isSelf
                  ? "APPROVED — READY TO RESUME"
                  : approval.status}
            </span>
            {consumed && (
              <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-xs">
                Executed exactly once
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${RISK_STYLES[approval.risk_level] || "bg-white/5 text-white/40"}`}>
              risk: {approval.risk_level || "—"}
            </span>
            {isSelf && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-white/40 text-xs">
                <ShieldAlert size={12} /> Your request — self-decision prohibited
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs">
                <AlertTriangle size={12} /> Expired
              </span>
            )}
            {processing && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs animate-pulse">
                Recording decision…
              </span>
            )}
            {resuming && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs animate-pulse">
                Resuming approved action…
              </span>
            )}
          </div>
          <div className="mt-2 text-white text-sm font-medium truncate" title={approval.approval_id}>
            {approval.agent_id} → {approval.tool_id}
          </div>
        </div>
        {!isDecided && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
              disabled={controlsDisabled}
              onClick={() => onApprove(approval)}
            >
              <CheckCircle2 size={14} className="mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              disabled={controlsDisabled}
              onClick={() => onReject(approval)}
            >
              <XCircle size={14} className="mr-1" /> Reject
            </Button>
          </div>
        )}
        {resumeAvailable && (
          <div className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10"
              disabled={resuming || Boolean(processing)}
              onClick={() => onResume && onResume(approval)}
            >
              <PlayCircle size={14} className="mr-1" /> {resuming ? "Resuming…" : "Resume"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Requested action</div>
          <div className="text-white/60">{approval.requested_action || "—"}</div>
        </div>
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Reason</div>
          <div className="text-white/60">{approval.request_reason || "—"}</div>
        </div>
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Requester</div>
          <div className="text-white/60" title={approval.user_id}>{shortId(approval.user_id)}</div>
        </div>
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Required approver role</div>
          <div className="text-white/60">{approval.required_approver_role || "—"}</div>
        </div>
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Requested at</div>
          <div className="text-white/60">{fmt(approval.requested_at)}</div>
        </div>
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Expires at</div>
          <div className="text-white/60">{fmt(approval.expires_at)}</div>
        </div>
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Execution reference</div>
          <div className="text-white/60" title={approval.execution_id || ""}>
            {shortId(approval.execution_id)}
          </div>
        </div>
        <div>
          <div className="text-white/30 uppercase tracking-wider mb-0.5">Approval ID</div>
          <div className="text-white/60 font-mono" title={approval.approval_id}>
            {shortId(approval.approval_id)}
          </div>
        </div>
        {isDecided && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <div className="text-white/30 uppercase tracking-wider mb-0.5">Decided at</div>
              <div className="text-white/60">{fmt(approval.decided_at)}</div>
            </div>
            <div>
              <div className="text-white/30 uppercase tracking-wider mb-0.5">Decision notes</div>
              <div className="text-white/60">{approval.decision_notes || approval.rejection_reason || "—"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}