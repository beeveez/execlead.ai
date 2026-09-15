import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ClipboardCheck } from "lucide-react";
import ApprovalCard from "@/components/developer/approvals/ApprovalCard";
import DecisionDialog from "@/components/developer/approvals/DecisionDialog";
import ResumeDialog from "@/components/developer/approvals/ResumeDialog";

/**
 * Agent Approval Review — Phase 14F infrastructure surface.
 * ============================================================
 * READ path: RLS-governed client reads only — the authenticated user
 * sees exactly the approvals the existing AgentApproval read rules permit.
 * DECISION path: exclusively through the existing governed backend
 * capability (agentOrchestrationService → decide_approval). This page
 * never mutates AgentApproval records, never changes roles, and never
 * supplies agent/tool/user/execution identities — the backend is the
 * single authorization authority and re-validates every decision.
 */
export default function AgentApprovalReview() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [decided, setDecided] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resumeDialog, setResumeDialog] = useState(null);
  const [resumingId, setResumingId] = useState(null);

  const loadApprovals = useCallback(async () => {
    setError(null);
    try {
      const [pendingRecords, recentRecords] = await Promise.all([
        base44.entities.AgentApproval.filter({ status: "PENDING" }, "-requested_at", 200),
        base44.entities.AgentApproval.list("-created_date", 100),
      ]);
      setPending(pendingRecords);
      setDecided(recentRecords.filter((a) => a.status && a.status !== "PENDING").slice(0, 10));
    } catch (e) {
      setError(e.message || "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const openDecision = (approval, decision) => {
    if (processingId || submitting) return;
    setNotes("");
    setDialog({ approval, decision });
  };

  const confirmDecision = async () => {
    if (!dialog || submitting) return; // duplicate-click protection
    const { approval, decision } = dialog;
    setSubmitting(true);
    setProcessingId(approval.approval_id);
    try {
      const res = await base44.functions.invoke("agentOrchestrationService", {
        action: "decide_approval",
        approval_id: approval.approval_id,
        decision,
        notes: notes.trim(),
      });
      if (res && res.approval_id && (res.status === "APPROVED" || res.status === "REJECTED")) {
        toast({
          title: res.status === "APPROVED" ? "Approval recorded" : "Rejection recorded",
          description: res.message || "Decision recorded by the governed boundary.",
        });
      } else {
        // Backend authorization denial, expired, already-decided, or stale state —
        // the governed decision boundary is authoritative; nothing was recorded.
        toast({
          title: "Decision not recorded",
          description: (res && (res.error || res.message)) || "The governed decision boundary rejected this request.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Decision failed",
        description: e.message || "The governed decision capability could not be reached.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setProcessingId(null);
      setDialog(null);
      // Always re-read after a decision — expired / already-decided / stale
      // states resolve server-side and the list must reflect the truth.
      loadApprovals();
    }
  };

  const closeDialog = () => {
    if (submitting) return;
    setDialog(null);
  };

  // Governed continuation — the requester's explicit resume of an APPROVED
  // request. This UI never mutates AgentApproval or AgentExecution records;
  // it invokes ONLY the governed resume_approved_execution capability, which
  // re-validates every authorization server-side and executes exactly once.
  const openResume = (approval) => {
    if (processingId || submitting || resumingId) return;
    setResumeDialog({ approval });
  };

  const confirmResume = async () => {
    if (!resumeDialog || resumingId) return; // duplicate-click protection
    const { approval } = resumeDialog;
    setResumingId(approval.approval_id);
    try {
      const res = await base44.functions.invoke("agentOrchestrationService", {
        action: "resume_approved_execution",
        approval_id: approval.approval_id,
      });
      if (res && res.status === "SUCCEEDED") {
        toast({
          title: "Approved action executed",
          description: res.message || "The approved action executed exactly once through the governed boundary.",
        });
      } else if (res && res.status === "ALREADY_CONSUMED") {
        toast({
          title: "Already completed",
          description: res.message || "This approval was already consumed by exactly one governed execution.",
        });
      } else if (res && res.status === "PENDING_APPROVAL") {
        toast({
          title: "Still pending approval",
          description: res.message || "A human decision is still required before this action can execute.",
        });
      } else {
        // Backend authorization denial, expiry, stale state, or capability
        // mismatch — the governed continuation boundary is authoritative;
        // nothing was executed.
        toast({
          title: "Resume not executed",
          description: (res && (res.error || res.message)) || "The governed continuation boundary rejected this request.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Resume failed",
        description: e.message || "The governed continuation capability could not be reached.",
        variant: "destructive",
      });
    } finally {
      setResumingId(null);
      setResumeDialog(null);
      // Always re-read — consumed / expired / stale states resolve
      // server-side and the list must reflect the truth.
      loadApprovals();
    }
  };

  const closeResumeDialog = () => {
    if (resumingId) return;
    setResumeDialog(null);
  };

  const shown = tab === "pending" ? pending : decided;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <ClipboardCheck size={12} className="text-indigo-400" /> Platform Governance
          </div>
          <h1 className="text-2xl font-bold text-white">Agent Approval Review</h1>
          <p className="text-white/40 text-sm mt-1 max-w-2xl">
            Governed human decisions over AI Workforce approval requests. Decisions are recorded
            exclusively through the Agent Orchestration Service decision boundary, which
            re-validates authorization, expiry, and the self-approval prohibition. Approvals are
            single-use and never auto-execute.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 text-white/60 shrink-0"
          onClick={loadApprovals}
          disabled={loading}
        >
          <RefreshCw size={14} className={`mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
          <button className="ml-3 underline" onClick={loadApprovals}>Retry</button>
        </div>
      )}

      <div className="flex gap-2">
        {[
          ["pending", `Pending (${pending.length})`],
          ["decided", `Recently Decided (${decided.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              tab === key
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : shown.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center text-white/30 text-sm">
          {tab === "pending"
            ? "No pending approvals visible to your account."
            : "No recently decided approvals visible to your account."}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((approval) => (
            <ApprovalCard
              key={approval.id || approval.approval_id}
              approval={approval}
              currentUser={user}
              processing={processingId === approval.approval_id}
              onApprove={(a) => openDecision(a, "approve")}
              onReject={(a) => openDecision(a, "reject")}
              onResume={openResume}
              resuming={resumingId === approval.approval_id}
            />
          ))}
        </div>
      )}

      <DecisionDialog
        dialog={dialog}
        notes={notes}
        setNotes={setNotes}
        submitting={submitting}
        onConfirm={confirmDecision}
        onCancel={closeDialog}
      />

      <ResumeDialog
        dialog={resumeDialog}
        submitting={Boolean(resumingId)}
        onConfirm={confirmResume}
        onCancel={closeResumeDialog}
      />
    </div>
  );
}