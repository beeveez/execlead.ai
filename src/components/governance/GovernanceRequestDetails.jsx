import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, XCircle, RefreshCw, Shield, Clock, User, AlertTriangle, FileText } from "lucide-react";

const ACTION_LABELS = {
  edit_profile: "Edit Profile", delete_profile: "Delete Profile", restore_profile: "Restore Profile",
  create_administrator: "Create Administrator", remove_administrator: "Remove Administrator",
  promote_user: "Promote User", demote_user: "Demote User", modify_permissions: "Modify Permissions",
  change_security_policies: "Change Security Policies", change_platform_settings: "Change Platform Settings",
  configure_ai_services: "Configure AI Services", configure_developer_workspace: "Configure Developer Workspace",
  configure_operations_workspace: "Configure Operations Workspace",
  configure_enterprise_workspace: "Configure Enterprise Workspace",
  configure_executive_workspace: "Configure Executive Workspace",
  export_user_information: "Export User Information", view_audit_history: "View Audit History",
};

const RISK_STYLES = {
  low: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  high: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

export default function GovernanceRequestDetails({ request, isFounder, onClose, onDecision }) {
  const [decision, setDecision] = useState(null); // "approve" | "reject" | "request_revision"
  const [notes, setNotes] = useState("");
  const risk = RISK_STYLES[request.risk_level] || RISK_STYLES.low;
  const impactRisk = RISK_STYLES[request.impact_level] || RISK_STYLES.low;

  const elapsed = request.submitted_at
    ? Math.round((Date.now() - new Date(request.submitted_at).getTime()) / 60000)
    : 0;
  const elapsedStr = elapsed > 60 ? `${Math.round(elapsed / 60)}h ${elapsed % 60}m` : `${elapsed}m`;

  const handleConfirm = () => {
    if (notes.trim().length < 10) return;
    onDecision(request.request_id, decision, notes);
  };

  const canDecide = isFounder && request.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Governance Request</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Action + Risk */}
          <div>
            <h3 className="text-lg font-bold text-white">{ACTION_LABELS[request.action] || request.action}</h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${risk.bg} ${risk.text} ${risk.border} font-medium uppercase`}>
                Risk: {request.risk_level} · {request.risk_score}/100
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${impactRisk.bg} ${impactRisk.text} ${impactRisk.border} font-medium uppercase`}>
                Impact: {request.impact_level}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 font-medium uppercase">
                {request.status}
              </span>
            </div>
          </div>

          {/* Requester */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
              <User size={12} /> Requester
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Field label="Name" value={request.requester_name} />
              <Field label="Email" value={request.requester_email} />
              <Field label="Role" value={request.requester_role} />
              <Field label="Department" value={request.requester_department || "—"} />
              <Field label="Workspace" value={request.workspace || "—"} />
              <Field label="Submitted" value={elapsedStr + " ago"} />
            </div>
          </div>

          {/* Target */}
          {(request.target_user_name || request.target_user_email) && (
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
                <User size={12} /> Target User
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Field label="Name" value={request.target_user_name || "—"} />
                <Field label="Email" value={request.target_user_email || "—"} />
                <Field label="Role" value={request.target_user_role || "—"} />
              </div>
            </div>
          )}

          {/* Justification */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
              <FileText size={12} /> Business Justification
            </div>
            <div>
              <span className="text-[10px] text-white/30">Category</span>
              <p className="text-sm text-white/70 capitalize">{request.justification_category?.replace(/_/g, " ")}</p>
            </div>
            {request.other_explanation && (
              <div>
                <span className="text-[10px] text-white/30">Other Explanation</span>
                <p className="text-sm text-white/70">{request.other_explanation}</p>
              </div>
            )}
            <div>
              <span className="text-[10px] text-white/30">Justification</span>
              <p className="text-sm text-white/80 leading-relaxed">{request.business_justification}</p>
            </div>
          </div>

          {/* Impact Assessment */}
          {request.impact_assessment_json && (
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
                <AlertTriangle size={12} /> Impact Assessment
              </div>
              {(() => {
                const ia = JSON.parse(request.impact_assessment_json || "{}");
                return (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Field label="Affected Users" value={ia.affected_users ?? 0} />
                    <Field label="Affected Modules" value={ia.affected_modules ?? 0} />
                    <Field label="Affected Workspaces" value={ia.affected_workspaces ?? 0} />
                    <Field label="Data Sensitivity" value={ia.data_sensitivity || "—"} />
                    <Field label="Security Risk" value={ia.security_risk || "—"} />
                    <Field label="Operational Risk" value={ia.operational_risk || "—"} />
                  </div>
                );
              })()}
            </div>
          )}

          {/* Supporting Evidence */}
          {request.supporting_evidence && (
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Supporting Evidence</span>
              <p className="text-sm text-white/70 mt-1">{request.supporting_evidence}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs text-white/30">
            <Field label="IP Address" value={request.ip_address || "—"} />
            <Field label="Browser" value={request.browser || "—"} />
            <Field label="Device" value={request.device || "—"} />
            <Field label="Request ID" value={request.request_id?.substring(0, 8) + "..."} />
          </div>

          {/* Decision UI */}
          {canDecide ? (
            <div className="space-y-3 border-t border-white/5 pt-4">
              {decision && (
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                    {decision === "approve" ? "Approval Reason" : decision === "reject" ? "Rejection Reason" : "Revision Notes"} * (min 10 chars)
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none"
                    placeholder={decision === "approve" ? "Explain why this request is approved..." : decision === "reject" ? "Explain why this request is rejected..." : "What needs to be revised?"} />
                </div>
              )}
              <div className="flex items-center gap-2">
                {!decision && (
                  <>
                    <Button onClick={() => setDecision("approve")} className="bg-emerald-600 hover:bg-emerald-500 flex-1">
                      <CheckCircle2 size={14} className="mr-1.5" /> Approve
                    </Button>
                    <Button onClick={() => setDecision("reject")} className="bg-red-600 hover:bg-red-500 flex-1">
                      <XCircle size={14} className="mr-1.5" /> Reject
                    </Button>
                    <Button onClick={() => setDecision("request_revision")} variant="outline" className="text-white/60 flex-1">
                      <RefreshCw size={14} className="mr-1.5" /> Revision
                    </Button>
                  </>
                )}
                {decision && (
                  <>
                    <Button variant="ghost" onClick={() => { setDecision(null); setNotes(""); }} className="text-white/60">Cancel</Button>
                    <Button onClick={handleConfirm} disabled={notes.trim().length < 10}
                      className={`flex-1 ${decision === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : decision === "reject" ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"} disabled:opacity-30`}>
                      Confirm {decision === "approve" ? "Approval" : decision === "reject" ? "Rejection" : "Revision Request"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="border-t border-white/5 pt-4">
              {request.status !== "pending" && request.decision_notes && (
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Decision Notes</span>
                  <p className="text-sm text-white/70 mt-1">{request.decision_notes}</p>
                  <p className="text-[10px] text-white/30 mt-2">By {request.approver_name} · {new Date(request.decided_at).toLocaleString()}</p>
                </div>
              )}
              {!isFounder && request.status === "pending" && (
                <p className="text-xs text-white/30 text-center py-2">Only the Founder Root Administrator can approve or reject requests.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-[10px] text-white/30 block">{label}</span>
      <span className="text-white/70 capitalize">{String(value)}</span>
    </div>
  );
}