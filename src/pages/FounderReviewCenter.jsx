import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Loader2, Shield, Gavel, Clock, CheckCircle2, XCircle, RefreshCw,
  AlertTriangle, Filter, BarChart3, FileText, Search, Crown,
  TrendingUp, Activity, Ban,
} from "lucide-react";
import GovernanceRequestForm from "@/components/governance/GovernanceRequestForm";
import GovernanceRequestDetails from "@/components/governance/GovernanceRequestDetails";
import GovernanceAnalytics from "@/components/governance/GovernanceAnalytics";
import NotificationHealth from "@/components/governance/NotificationHealth";

const TABS = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-amber-400" },
  { value: "approved", label: "Approved", icon: CheckCircle2, color: "text-emerald-400" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400" },
  { value: "revision_requested", label: "Revision", icon: RefreshCw, color: "text-blue-400" },
  { value: "all", label: "All", icon: FileText, color: "text-white/60" },
];

const RISK_COLORS = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

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

export default function FounderReviewCenter() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [isFounder, setIsFounder] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("founderGovernance", { action: "list_requests", status: activeTab, limit: 100 });
      const data = res.data || res;
      setRequests(data.requests || []);
    } catch (err) {
      toast({ title: "Error", description: err.message || "Could not load requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const checkFounder = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("founderGovernance", { action: "is_founder" });
      const data = res.data || res;
      setIsFounder(data.is_founder);
    } catch {}
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("founderGovernance", { action: "get_analytics" });
      setAnalytics(res.data || res);
    } catch {}
  }, []);

  useEffect(() => { checkFounder(); }, [checkFounder]);
  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleDecision = async (requestId, decision, notes) => {
    try {
      await base44.functions.invoke("founderGovernance", {
        action: decision,
        request_id: requestId,
        decision_notes: notes,
      });
      toast({ title: `Request ${decision}`, description: `The request has been ${decision}.` });
      setSelectedRequest(null);
      await loadRequests();
      if (showAnalytics) await loadAnalytics();
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.error || err.message, variant: "destructive" });
    }
  };

  const filtered = requests
    .filter(r => !search || r.requester_name?.toLowerCase().includes(search.toLowerCase()) || r.action?.toLowerCase().includes(search.toLowerCase()))
    .filter(r => filterRisk === "all" || r.risk_level === filterRisk)
    .filter(r => filterCategory === "all" || r.justification_category === filterCategory);

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const criticalCount = requests.filter(r => r.risk_level === "critical").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Crown size={12} className="text-amber-400" /> Founder Root Administrator
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gavel size={20} className="text-indigo-400" /> Founder Governance & Approval Center™
          </h1>
          <p className="text-white/40 text-sm mt-1 max-w-2xl">
            Centralized governance authority for all protected administrative operations. Every privileged action requires Founder approval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFounder && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <Crown size={12} /> Founder Access
            </span>
          )}
          <Button variant="outline" className="text-white/60" onClick={() => { setShowAnalytics(!showAnalytics); if (!analytics) loadAnalytics(); }}>
            <BarChart3 size={14} className="mr-1.5" /> Analytics
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-500">
            <FileText size={14} className="mr-1.5" /> New Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Pending" value={pendingCount} color="text-amber-400" bg="bg-amber-500/10" />
        <StatCard icon={AlertTriangle} label="Critical Risk" value={criticalCount} color="text-red-400" bg="bg-red-500/10" />
        <StatCard icon={CheckCircle2} label="Total Requests" value={requests.length} color="text-indigo-400" bg="bg-indigo-500/10" />
        <StatCard icon={Shield} label="Your Role" value={isFounder ? "Founder" : "Admin"} color="text-white/60" bg="bg-white/5" />
      </div>

      {/* Notification Engine Health */}
      <NotificationHealth />

      {/* Analytics */}
      {showAnalytics && analytics && <GovernanceAnalytics analytics={analytics} />}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.value ? "border-indigo-500 text-white" : "border-transparent text-white/30 hover:text-white/60"
              }`}>
              <Icon size={12} className={activeTab === tab.value ? tab.color : ""} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by requester or action..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        </div>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Categories</option>
          <option value="personnel_change">Personnel Change</option>
          <option value="security_incident">Security Incident</option>
          <option value="compliance_requirement">Compliance</option>
          <option value="duplicate_profile_cleanup">Duplicate Cleanup</option>
          <option value="test_data_cleanup">Test Data Cleanup</option>
          <option value="emergency_change">Emergency Change</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No {activeTab === "all" ? "" : activeTab} requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard key={req.request_id} request={req} onClick={() => setSelectedRequest(req)} />
          ))}
        </div>
      )}

      {/* Request Form Modal */}
      {showForm && (
        <GovernanceRequestForm
          onClose={() => setShowForm(false)}
          onSubmitted={() => { setShowForm(false); loadRequests(); }}
        />
      )}

      {/* Request Details Drawer */}
      {selectedRequest && (
        <GovernanceRequestDetails
          request={selectedRequest}
          isFounder={isFounder}
          onClose={() => setSelectedRequest(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={14} className={color} />
        </div>
        <span className="text-white/30 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}

function RequestCard({ request, onClick }) {
  const elapsed = request.submitted_at ? Math.round((Date.now() - new Date(request.submitted_at).getTime()) / 60000) : 0;
  const riskClass = RISK_COLORS[request.risk_level] || RISK_COLORS.low;

  return (
    <button onClick={onClick} className="w-full text-left bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white truncate">{ACTION_LABELS[request.action] || request.action}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskClass} font-medium uppercase`}>
              {request.risk_level} · {request.risk_score}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              request.impact_level === "critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
              request.impact_level === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
              request.impact_level === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            } border font-medium uppercase`}>
              {request.impact_level} impact
            </span>
          </div>
          <p className="text-white/40 text-xs truncate">
            {request.requester_name} → {request.target_user_name || "N/A"} · {request.justification_category?.replace(/_/g, " ")}
          </p>
          <p className="text-white/30 text-xs mt-0.5 truncate">{request.business_justification?.substring(0, 100)}...</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-white/30 text-xs">{elapsed > 60 ? `${Math.round(elapsed / 60)}h` : `${elapsed}m`} ago</div>
          <div className="text-white/20 text-[10px] mt-0.5">{request.workspace || "—"}</div>
        </div>
      </div>
    </button>
  );
}