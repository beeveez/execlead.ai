import React from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

const ACTION_LABELS = {
  identity_submitted: "Identity Submitted",
  identity_approved: "Identity Approved",
  identity_rejected: "Identity Rejected",
  identity_updated: "Identity Updated",
  email_verified: "Email Verified",
  phone_verified: "Phone Verified",
  professional_verified: "Professional Verified",
  profile_published: "Profile Published",
  verified_executive_granted: "Verified Executive Granted",
  documents_requested: "Additional Documents Requested",
};

export default function VerificationHistory({ logs = [] }) {
  if (logs.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-white/40" />
          <h3 className="text-white font-semibold text-sm">Verification History</h3>
        </div>
        <p className="text-white/30 text-xs text-center py-6">No verification activity yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={16} className="text-white/40" />
        <h3 className="text-white font-semibold text-sm">Verification History</h3>
      </div>
      <div className="space-y-2">
        {logs.map((log, i) => {
          const isApproved = log.decision === "approved";
          const isRejected = log.decision === "rejected";
          const Icon = isApproved ? CheckCircle : isRejected ? XCircle : Clock;
          const iconColor = isApproved ? "text-emerald-400" : isRejected ? "text-red-400" : "text-amber-400";

          return (
            <div key={log.id || i} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg">
              <Icon size={14} className={`${iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white/70 font-medium">
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                  {log.created_date && (
                    <span className="text-[10px] text-white/30 flex-shrink-0">
                      {new Date(log.created_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {log.document_type && (
                  <p className="text-[11px] text-white/30 mt-0.5">Document: {log.document_type}</p>
                )}
                {log.reviewer_name && (
                  <p className="text-[11px] text-white/30">Reviewer: {log.reviewer_name}</p>
                )}
                {log.reason && (
                  <p className="text-[11px] text-white/40 mt-1">{log.reason}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}