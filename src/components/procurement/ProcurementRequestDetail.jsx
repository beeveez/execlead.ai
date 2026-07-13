import React, { useState } from "react";
import { X, Check, AlertTriangle, Building2, DollarSign, User, Calendar, Tag, FileText, Clock } from "lucide-react";
import ProcurementApprovalChain from "@/components/procurement/ProcurementApprovalChain";
import ProcurementTimeline from "@/components/procurement/ProcurementTimeline";
import {
  formatCurrency, getCategoryMeta, getPriorityBadge, getStatusBadge, getSLABadgeClass,
  parseApprovalChain,
} from "@/lib/procurementEngine";

export default function ProcurementRequestDetail({ request, onClose, onApprove, onReject, user }) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  if (!request) return null;

  const status = getStatusBadge(request.status);
  const priority = getPriorityBadge(request.priority);
  const cat = getCategoryMeta(request.category);
  const chain = parseApprovalChain(request);
  const currentStep = request.current_approval_step || 0;
  const canAct = request.status === "pending_approval";
  const budgetValid = (request.budget_amount || 0) >= (request.amount || 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl bg-[#0d0d14] border-l border-white/10 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur-md border-b border-white/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-indigo-400">{request.request_number}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.badge}`}>{status.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priority.badge}`}>{priority.label}</span>
              </div>
              <h2 className="text-white font-semibold text-base truncate">{request.title}</h2>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors shrink-0"><X size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-white/5">
          {["overview", "approvals", "timeline"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${activeTab === t ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {activeTab === "overview" && (
            <>
              {request.description && (
                <Section title="Description">
                  <p className="text-sm text-white/60 leading-relaxed">{request.description}</p>
                </Section>
              )}
              {request.justification && (
                <Section title="Business Justification">
                  <p className="text-sm text-white/60 leading-relaxed">{request.justification}</p>
                </Section>
              )}
              <div className="grid grid-cols-2 gap-3">
                <DetailRow icon={DollarSign} label="Amount" value={formatCurrency(request.amount, request.currency)} />
                <DetailRow icon={Tag} label="Category" value={cat.label} />
                <DetailRow icon={Building2} label="Organization" value={request.organization_name || "—"} />
                <DetailRow icon={Building2} label="Department" value={request.department_name || "—"} />
                <DetailRow icon={Building2} label="Cost Center" value={request.cost_center || "—"} />
                <DetailRow icon={User} label="Vendor" value={request.vendor_name || "—"} />
                <DetailRow icon={DollarSign} label="Budget" value={formatCurrency(request.budget_amount, request.currency)} />
                <DetailRow icon={User} label="Requestor" value={request.requested_by_name || "—"} />
                <DetailRow icon={Calendar} label="Created" value={new Date(request.created_date).toLocaleDateString("en-US", { dateStyle: "medium" })} />
                {request.sla_deadline && (
                  <DetailRow icon={Clock} label="SLA Deadline" value={new Date(request.sla_deadline).toLocaleDateString("en-US", { dateStyle: "medium" })} />
                )}
              </div>
              <div className={`p-3 rounded-lg border text-xs ${getSLABadgeClass(request.sla_status)}`}>
                SLA Status: <span className="font-medium capitalize">{(request.sla_status || "on_track").replace("_", " ")}</span>
              </div>
              <div className={`p-3 rounded-lg border text-xs ${budgetValid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                Budget Validation: {budgetValid ? "✓ Within budget allocation" : `⚠ Over budget by ${formatCurrency(request.amount - request.budget_amount, request.currency)}`}
              </div>
              {request.rejected_reason && (
                <Section title="Rejection Reason">
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-red-400/80">{request.rejected_reason}</div>
                </Section>
              )}
            </>
          )}
          {activeTab === "approvals" && (
            <Section title="Approval Workflow™">
              <ProcurementApprovalChain request={request} />
            </Section>
          )}
          {activeTab === "timeline" && (
            <Section title="Procurement Timeline™">
              <ProcurementTimeline request={request} />
            </Section>
          )}
        </div>

        {/* Action Bar */}
        {canAct && (
          <div className="sticky bottom-0 bg-[#0d0d14]/95 backdrop-blur-md border-t border-white/5 p-5">
            {!showReject ? (
              <div className="flex items-center gap-2">
                <button onClick={() => onApprove(request)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
                  <Check size={16} /> Approve
                </button>
                <button onClick={() => setShowReject(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors">
                  <AlertTriangle size={16} /> Reject
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." rows={2} className="w-full px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50" />
                <div className="flex items-center gap-2">
                  <button onClick={() => { onReject(request, rejectReason); setShowReject(false); setRejectReason(""); }} disabled={!rejectReason.trim()} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white text-sm font-medium transition-colors">Confirm Rejection</button>
                  <button onClick={() => setShowReject(false)} className="px-4 py-2 text-white/40 hover:text-white/80 text-sm transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs text-white/30 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02]">
      <Icon size={14} className="text-white/30 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className="text-sm text-white/70 truncate">{value}</div>
      </div>
    </div>
  );
}