import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { X, Loader2, AlertTriangle, FileText } from "lucide-react";

const ACTIONS = [
  { value: "edit_profile", label: "Edit Profile" },
  { value: "delete_profile", label: "Delete Profile" },
  { value: "restore_profile", label: "Restore Profile" },
  { value: "create_administrator", label: "Create Administrator" },
  { value: "remove_administrator", label: "Remove Administrator" },
  { value: "promote_user", label: "Promote User" },
  { value: "demote_user", label: "Demote User" },
  { value: "modify_permissions", label: "Modify Permissions" },
  { value: "change_security_policies", label: "Change Security Policies" },
  { value: "change_platform_settings", label: "Change Platform Settings" },
  { value: "configure_ai_services", label: "Configure AI Services" },
  { value: "configure_developer_workspace", label: "Configure Developer Workspace" },
  { value: "configure_operations_workspace", label: "Configure Operations Workspace" },
  { value: "configure_enterprise_workspace", label: "Configure Enterprise Workspace" },
  { value: "configure_executive_workspace", label: "Configure Executive Workspace" },
  { value: "export_user_information", label: "Export User Information" },
  { value: "view_audit_history", label: "View Audit History" },
];

const CATEGORIES = [
  { value: "personnel_change", label: "Personnel Change" },
  { value: "security_incident", label: "Security Incident" },
  { value: "compliance_requirement", label: "Compliance Requirement" },
  { value: "organizational_restructure", label: "Organizational Restructure" },
  { value: "user_request", label: "User Request" },
  { value: "data_correction", label: "Data Correction" },
  { value: "duplicate_profile_cleanup", label: "Duplicate Profile Cleanup" },
  { value: "test_data_cleanup", label: "Test Data Cleanup" },
  { value: "platform_configuration", label: "Platform Configuration" },
  { value: "security_configuration", label: "Security Configuration" },
  { value: "developer_request", label: "Developer Request" },
  { value: "operations_request", label: "Operations Request" },
  { value: "production_support", label: "Production Support" },
  { value: "emergency_change", label: "Emergency Change" },
  { value: "system_maintenance", label: "System Maintenance" },
  { value: "legal_requirement", label: "Legal Requirement" },
  { value: "audit_finding", label: "Audit Finding" },
  { value: "other", label: "Other" },
];

export default function GovernanceRequestForm({ onClose, onSubmitted }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    action: "",
    target_user_name: "",
    target_user_email: "",
    target_user_role: "",
    justification_category: "",
    business_justification: "",
    other_explanation: "",
    requester_department: "",
    requester_workspace: "",
    supporting_evidence: "",
    affected_users: 0,
    affected_modules: 0,
    affected_workspaces: 0,
    data_sensitivity: "low",
    security_risk: "low",
    operational_risk: "low",
  });

  const justificationLength = form.business_justification.trim().length;
  const isValid = form.action && form.justification_category && justificationLength >= 50 && justificationLength <= 1000
    && (form.justification_category !== "other" || form.other_explanation.trim().length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("founderGovernance", {
        action: "submit_request",
        action_type: form.action,
        action: form.action,
        target_user_name: form.target_user_name,
        target_user_email: form.target_user_email,
        target_user_role: form.target_user_role,
        justification_category: form.justification_category,
        business_justification: form.business_justification,
        other_explanation: form.other_explanation,
        requester_department: form.requester_department,
        requester_workspace: form.requester_workspace,
        supporting_evidence: form.supporting_evidence,
        impact_assessment: {
          affected_users: Number(form.affected_users) || 0,
          affected_modules: Number(form.affected_modules) || 0,
          affected_workspaces: Number(form.affected_workspaces) || 0,
          data_sensitivity: form.data_sensitivity,
          security_risk: form.security_risk,
          operational_risk: form.operational_risk,
        },
        current_values: {},
        requested_values: {},
      });
      const data = res.data || res;
      toast({
        title: "Request Submitted",
        description: `Risk: ${data.risk_level} (${data.risk_score}/100) · Impact: ${data.impact_level}`,
      });
      onSubmitted();
    } catch (err) {
      toast({ title: "Submission Failed", description: err.response?.data?.error || err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50";
  const labelClass = "text-[10px] text-white/40 uppercase tracking-wider font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border border-white/10 rounded-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Governance Approval Request</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className={labelClass}>Protected Action *</label>
            <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} required className={`${inputClass} mt-1 text-white/70`}>
              <option value="">Select an action...</option>
              {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Target User Name</label>
              <input value={form.target_user_name} onChange={e => setForm({ ...form, target_user_name: e.target.value })} className={`${inputClass} mt-1`} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Target User Email</label>
              <input value={form.target_user_email} onChange={e => setForm({ ...form, target_user_email: e.target.value })} className={`${inputClass} mt-1`} placeholder="john@execlead.ai" />
            </div>
            <div>
              <label className={labelClass}>Target User Role</label>
              <select value={form.target_user_role} onChange={e => setForm({ ...form, target_user_role: e.target.value })} className={`${inputClass} mt-1 text-white/70`}>
                <option value="">—</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="platform_admin">Platform Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Justification Category *</label>
              <select value={form.justification_category} onChange={e => setForm({ ...form, justification_category: e.target.value })} required className={`${inputClass} mt-1 text-white/70`}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Your Department</label>
              <input value={form.requester_department} onChange={e => setForm({ ...form, requester_department: e.target.value })} className={`${inputClass} mt-1`} placeholder="Engineering" />
            </div>
          </div>

          {form.justification_category === "other" && (
            <div>
              <label className={labelClass}>Additional Explanation (required for "Other") *</label>
              <input value={form.other_explanation} onChange={e => setForm({ ...form, other_explanation: e.target.value })} className={`${inputClass} mt-1`} placeholder="Explain the category..." />
            </div>
          )}

          <div>
            <label className={labelClass}>Business Justification * ({justificationLength}/1000 chars, min 50)</label>
            <textarea value={form.business_justification} onChange={e => setForm({ ...form, business_justification: e.target.value })} rows={3} maxLength={1000}
              className={`${inputClass} mt-1 resize-none`} placeholder="e.g. User requested profile correction after name change..." />
            {justificationLength > 0 && justificationLength < 50 && (
              <p className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1"><AlertTriangle size={10} /> Minimum 50 characters required ({50 - justificationLength} more needed)</p>
            )}
          </div>

          {/* Impact Assessment */}
          <div className="border border-white/5 rounded-lg p-3 space-y-3 bg-white/[0.01]">
            <span className={labelClass}>Change Impact Assessment</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-white/30">Affected Users</label>
                <input type="number" min="0" value={form.affected_users} onChange={e => setForm({ ...form, affected_users: e.target.value })} className={`${inputClass} mt-0.5`} />
              </div>
              <div>
                <label className="text-[10px] text-white/30">Affected Modules</label>
                <input type="number" min="0" value={form.affected_modules} onChange={e => setForm({ ...form, affected_modules: e.target.value })} className={`${inputClass} mt-0.5`} />
              </div>
              <div>
                <label className="text-[10px] text-white/30">Affected Workspaces</label>
                <input type="number" min="0" value={form.affected_workspaces} onChange={e => setForm({ ...form, affected_workspaces: e.target.value })} className={`${inputClass} mt-0.5`} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-white/30">Data Sensitivity</label>
                <select value={form.data_sensitivity} onChange={e => setForm({ ...form, data_sensitivity: e.target.value })} className={`${inputClass} mt-0.5 text-white/70`}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/30">Security Risk</label>
                <select value={form.security_risk} onChange={e => setForm({ ...form, security_risk: e.target.value })} className={`${inputClass} mt-0.5 text-white/70`}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/30">Operational Risk</label>
                <select value={form.operational_risk} onChange={e => setForm({ ...form, operational_risk: e.target.value })} className={`${inputClass} mt-0.5 text-white/70`}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Supporting Evidence (optional)</label>
            <input value={form.supporting_evidence} onChange={e => setForm({ ...form, supporting_evidence: e.target.value })} className={`${inputClass} mt-1`} placeholder="Link or reference to supporting documentation" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/60">Cancel</Button>
            <Button type="submit" disabled={!isValid || submitting} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30">
              {submitting ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Submitting...</> : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}