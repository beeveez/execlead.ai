import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart, LayoutDashboard, FileText, CheckCircle2, Clock, Sparkles,
  Loader2, Building2, ChevronDown, Check, Plus,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ProcurementDashboard from "@/components/procurement/ProcurementDashboard";
import ProcurementRequestList from "@/components/procurement/ProcurementRequestList";
import ProcurementIntakeWizard from "@/components/procurement/ProcurementIntakeWizard";
import ProcurementRequestDetail from "@/components/procurement/ProcurementRequestDetail";
import ProcurementSLATracking from "@/components/procurement/ProcurementSLATracking";
import ProcurementCopilot from "@/components/procurement/ProcurementCopilot";
import {
  generateRequestNumber, generateApprovalChain, computeSLADeadline,
  buildTimelineEvent, parseApprovalChain, parseTimeline, computeSLAStatus,
} from "@/lib/procurementEngine";

const MODULES = [
  { id: "dashboard", label: "Procurement Dashboard™", icon: LayoutDashboard, desc: "KPIs & overview" },
  { id: "requests", label: "Procurement Requests™", icon: FileText, desc: "All procurement requests" },
  { id: "approvals", label: "Approval Workflow™", icon: CheckCircle2, desc: "Pending approvals queue" },
  { id: "sla", label: "SLA Tracking™", icon: Clock, desc: "SLA compliance & breaches" },
  { id: "copilot", label: "EXEC™ Procurement Copilot", icon: Sparkles, desc: "AI procurement intelligence" },
];

export default function ProcurementCommandCenter() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const reqs = await base44.entities.ProcurementRequest.list("-created_date", 500);
      setRequests(Array.isArray(reqs) ? reqs : []);
    } catch (e) { console.error("Procurement requests load failed:", e); }
    try {
      const orgs = await base44.entities.Organization.list("-created_date", 200);
      const orgArr = Array.isArray(orgs) ? orgs : [];
      setOrganizations(orgArr);
      if (orgArr.length > 0) setSelectedOrgId(orgArr[0].id);
    } catch (e) { console.error("Organizations load failed:", e); }
    try {
      const depts = await base44.entities.Department.list("-created_date", 500);
      setDepartments(Array.isArray(depts) ? depts : []);
    } catch (e) { console.error("Departments load failed:", e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
  const filteredRequests = useMemo(() => {
    if (!selectedOrgId) return requests || [];
    return (requests || []).filter((r) => r.organization_id === selectedOrgId);
  }, [requests, selectedOrgId]);

  const handleCreateRequest = async (formData) => {
    try {
      const requestNumber = generateRequestNumber(requests);
      const approvalChain = generateApprovalChain(formData.amount || 0);
      const slaDeadline = computeSLADeadline(formData.priority);
      const timeline = [buildTimelineEvent("created", `Request ${requestNumber} submitted by ${user?.full_name || user?.email || "user"}`, user?.id, user?.full_name || user?.email)];

      const payload = {
        ...formData,
        request_number: requestNumber,
        status: "pending_approval",
        approval_chain_json: JSON.stringify(approvalChain),
        current_approval_step: 0,
        sla_deadline: slaDeadline,
        sla_status: "on_track",
        timeline_json: JSON.stringify(timeline),
        requested_by_id: user?.id,
        requested_by_name: user?.full_name || user?.email,
        budget_validated: (formData.budget_amount || 0) >= (formData.amount || 0),
      };

      const created = await base44.entities.ProcurementRequest.create(payload);
      setRequests((prev) => [created, ...prev]);
      setShowWizard(false);
    } catch (e) {
      console.error("Failed to create procurement request:", e);
    }
  };

  const handleApprove = async (request) => {
    try {
      const chain = parseApprovalChain(request);
      const currentStep = request.current_approval_step || 0;
      const updatedChain = [...chain];
      updatedChain[currentStep] = {
        ...updatedChain[currentStep],
        status: "approved",
        approver_id: user?.id,
        approver_name: user?.full_name || user?.email,
        acted_at: new Date().toISOString(),
      };
      const isLastStep = currentStep >= chain.length - 1;
      const newStatus = isLastStep ? "approved" : "pending_approval";
      const newStep = isLastStep ? currentStep : currentStep + 1;
      const timeline = parseTimeline(request);
      timeline.push(buildTimelineEvent("approved", `Step ${currentStep + 1} approved by ${user?.full_name || user?.email}`, user?.id, user?.full_name || user?.email));

      const updates = {
        approval_chain_json: JSON.stringify(updatedChain),
        current_approval_step: newStep,
        status: newStatus,
        timeline_json: JSON.stringify(timeline),
        sla_status: computeSLAStatus(request.sla_deadline, newStatus),
        ...(isLastStep && {
          approved_by_id: user?.id,
          approved_by_name: user?.full_name || user?.email,
          approved_at: new Date().toISOString(),
        }),
      };

      const updated = await base44.entities.ProcurementRequest.update(request.id, updates);
      setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, ...updated } : r)));
      setSelectedRequest(null);
    } catch (e) {
      console.error("Failed to approve request:", e);
    }
  };

  const handleReject = async (request, reason) => {
    try {
      const chain = parseApprovalChain(request);
      const currentStep = request.current_approval_step || 0;
      const updatedChain = [...chain];
      updatedChain[currentStep] = {
        ...updatedChain[currentStep],
        status: "rejected",
        approver_id: user?.id,
        approver_name: user?.full_name || user?.email,
        acted_at: new Date().toISOString(),
        note: reason,
      };
      const timeline = parseTimeline(request);
      timeline.push(buildTimelineEvent("rejected", `Request rejected by ${user?.full_name || user?.email}: ${reason}`, user?.id, user?.full_name || user?.email));

      const updates = {
        approval_chain_json: JSON.stringify(updatedChain),
        status: "rejected",
        rejected_by_id: user?.id,
        rejected_by_name: user?.full_name || user?.email,
        rejected_at: new Date().toISOString(),
        rejected_reason: reason,
        timeline_json: JSON.stringify(timeline),
        sla_status: "n_a",
      };

      const updated = await base44.entities.ProcurementRequest.update(request.id, updates);
      setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, ...updated } : r)));
      setSelectedRequest(null);
    } catch (e) {
      console.error("Failed to reject request:", e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  const activeModule = MODULES.find((m) => m.id === tab);

  const renderModule = () => {
    switch (tab) {
      case "dashboard":
        return <ProcurementDashboard requests={filteredRequests} onNewRequest={() => setShowWizard(true)} onSelectRequest={setSelectedRequest} />;
      case "requests":
        return <ProcurementRequestList requests={filteredRequests} onNewRequest={() => setShowWizard(true)} onSelectRequest={setSelectedRequest} />;
      case "approvals":
        return <ProcurementRequestList requests={filteredRequests} onSelectRequest={setSelectedRequest} pendingOnly />;
      case "sla":
        return <ProcurementSLATracking requests={filteredRequests} onSelectRequest={setSelectedRequest} />;
      case "copilot":
        return <ProcurementCopilot requests={filteredRequests} onSelectRequest={setSelectedRequest} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <ShoppingCart size={12} className="text-indigo-400" /> Enterprise Procurement™
          </div>
          <h1 className="text-2xl font-bold text-white">Enterprise Procurement™</h1>
          <p className="text-white/40 text-sm mt-1">Command center for procurement requests, approval workflows, SLA tracking, and procurement governance.</p>
        </div>
        <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Organization Switcher */}
      {organizations.length > 0 && (
        <div className="relative">
          <button onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)} className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedOrg?.brand_color || "#6366f1"}20`, border: `1px solid ${selectedOrg?.brand_color || "#6366f1"}40` }}>
              <Building2 size={18} style={{ color: selectedOrg?.brand_color || "#6366f1" }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-white font-medium text-sm">{selectedOrg?.name || "Select organization"}</span>
              <div className="text-white/30 text-xs truncate">{selectedOrg?.domain || selectedOrg?.industry || "—"}</div>
            </div>
            <ChevronDown size={16} className={`text-white/30 transition-transform ${orgSwitcherOpen ? "rotate-180" : ""}`} />
          </button>
          {orgSwitcherOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
              {organizations.map((org) => (
                <button key={org.id} onClick={() => { setSelectedOrgId(org.id); setOrgSwitcherOpen(false); }} className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${org.id === selectedOrgId ? "bg-indigo-500/5" : ""}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${org.brand_color || "#6366f1"}20` }}>
                    <Building2 size={14} style={{ color: org.brand_color || "#6366f1" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{org.name}</div>
                    <div className="text-white/30 text-xs truncate">{org.domain || org.industry || "—"}</div>
                  </div>
                  {org.id === selectedOrgId && <Check size={14} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Command center: module rail + content */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 lg:sticky lg:top-4">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {MODULES.map((m) => (
                <button key={m.id} onClick={() => setTab(m.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors shrink-0 lg:w-full ${tab === m.id ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
                  <m.icon size={16} className={tab === m.id ? "text-indigo-400" : "text-white/30"} />
                  <div className="hidden lg:block min-w-0">
                    <div className="text-xs font-medium truncate">{m.label}</div>
                    <div className="text-white/20 text-[10px] truncate">{m.desc}</div>
                  </div>
                  <span className="lg:hidden text-xs whitespace-nowrap">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-center gap-2">
            {activeModule && <activeModule.icon size={16} className="text-indigo-400" />}
            <h2 className="text-white font-medium text-sm">{activeModule?.label}</h2>
          </div>
          {renderModule()}
        </div>
      </div>

      {/* Intake Wizard Modal */}
      <ProcurementIntakeWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={handleCreateRequest}
        organizations={organizations}
        departments={departments}
        user={user}
      />

      {/* Request Detail Drawer */}
      <ProcurementRequestDetail
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        user={user}
      />
    </div>
  );
}