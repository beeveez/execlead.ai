import React, { useState } from "react";
import { Check, X, FileText, Loader2, Eye, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { IDENTITY_STATUSES, DOCUMENT_TYPES } from "@/lib/trustEngine";

export default function VerificationAdminTable({ verifications = [], onAction }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [requestModal, setRequestModal] = useState(null);
  const [requestNote, setRequestNote] = useState("");
  const [error, setError] = useState("");

  const handleApprove = async (verification) => {
    setActionLoading(verification.id);
    setError("");
    try {
      await base44.functions.invoke("manageIdentityVerification", {
        action: "approve",
        verificationId: verification.id,
      });
      onAction();
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Action failed");
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal.id);
    setError("");
    try {
      await base44.functions.invoke("manageIdentityVerification", {
        action: "reject",
        verificationId: rejectModal.id,
        reason: rejectReason,
      });
      setRejectModal(null);
      setRejectReason("");
      onAction();
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Action failed");
    }
    setActionLoading(null);
  };

  const handleRequestDocs = async () => {
    if (!requestModal) return;
    setActionLoading(requestModal.id);
    setError("");
    try {
      await base44.functions.invoke("manageIdentityVerification", {
        action: "request_documents",
        verificationId: requestModal.id,
        notes: requestNote,
      });
      setRequestModal(null);
      setRequestNote("");
      onAction();
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Action failed");
    }
    setActionLoading(null);
  };

  const viewDocument = async (verification) => {
    if (!verification.identity_document_uri) return;
    try {
      const response = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: verification.identity_document_uri,
        expires_in: 300,
      });
      window.open(response.signed_url || response.data?.signed_url, "_blank");
    } catch (e) {
      setError("Unable to generate document link.");
    }
  };

  if (verifications.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
        <FileText size={32} className="text-white/10 mx-auto mb-3" />
        <p className="text-white/30 text-sm">No verification records found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/[0.05] border border-red-500/15 rounded-lg text-xs text-red-400">
          <X size={14} /> {error}
        </div>
      )}

      {verifications.map((v) => {
        const status = v.identity_status || "pending_upload";
        const statusMeta = IDENTITY_STATUSES[status] || IDENTITY_STATUSES.pending_upload;
        const docType = DOCUMENT_TYPES.find(d => d.id === v.identity_document_type);
        const canAct = status === "pending_upload" || status === "submitted" || status === "under_review" || status === "rejected";

        return (
          <div key={v.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-white/40" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-medium text-sm truncate">{v.user_name || "Unknown User"}</div>
                  <div className="text-white/40 text-xs truncate">{v.user_email}</div>
                  {docType && (
                    <div className="text-white/30 text-[11px] mt-0.5">Document: {docType.label}</div>
                  )}
                  {v.identity_submitted_date && (
                    <div className="text-white/30 text-[11px]">
                      Submitted: {new Date(v.identity_submitted_date).toLocaleDateString()}
                    </div>
                  )}
                  {v.identity_rejection_reason && (
                    <div className="text-red-400/70 text-[11px] mt-1">Reason: {v.identity_rejection_reason}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusMeta.badgeClass}`}>
                  {statusMeta.label}
                </span>
              </div>
            </div>

            {canAct && (
              <div className="mt-3 flex items-center gap-2 flex-wrap pt-3 border-t border-white/5">
                {v.identity_document_uri && (
                  <button
                    onClick={() => viewDocument(v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors"
                  >
                    <Eye size={13} /> View Document
                  </button>
                )}
                <button
                  onClick={() => handleApprove(v)}
                  disabled={actionLoading === v.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  {actionLoading === v.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
                </button>
                <button
                  onClick={() => { setRejectModal(v); setRejectReason(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
                >
                  <X size={13} /> Reject
                </button>
                <button
                  onClick={() => { setRequestModal(v); setRequestNote(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-colors"
                >
                  <MessageSquare size={13} /> Request Documents
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-sm mb-2">Reject Identity Verification</h3>
            <p className="text-white/40 text-xs mb-4">Provide a reason for rejection. The user will be able to resubmit.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Document image is unclear. Please upload a higher quality scan."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-red-500/50 h-24 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason.trim() || actionLoading === rejectModal.id} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                {actionLoading === rejectModal.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Documents Modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRequestModal(null)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-sm mb-2">Request Additional Documents</h3>
            <p className="text-white/40 text-xs mb-4">Specify what additional documents or information you need from the user.</p>
            <textarea
              value={requestNote}
              onChange={e => setRequestNote(e.target.value)}
              placeholder="e.g. Please upload a back side of your ID card."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 h-24 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRequestModal(null)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleRequestDocs} disabled={actionLoading === requestModal.id} className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                {actionLoading === requestModal.id ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />} Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}