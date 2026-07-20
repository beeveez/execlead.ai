import React, { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { ADMISSIONS_STATUSES, getCapacityInfo } from "@/lib/foundingAdmissionsEngine";
import { computePriorityScore, getPriorityLevel } from "@/lib/admissionsIntelligenceEngine";
import { syncReviewerAction } from "@/lib/admissionsCommunicationEngine";
import IntelligenceDashboard from "@/components/beta/admissions/IntelligenceDashboard";
import CohortManagement from "@/components/beta/admissions/CohortManagement";
import DiversityDashboard from "@/components/beta/admissions/DiversityDashboard";
import ReviewerPerformance from "@/components/beta/admissions/ReviewerPerformance";
import FounderDirectory from "@/components/beta/admissions/FounderDirectory";
import ActivationDashboard from "@/components/beta/admissions/ActivationDashboard";
import ProductInsights from "@/components/beta/admissions/ProductInsights";
import ApplicationReviewDrawer from "@/components/beta/admissions/ApplicationReviewDrawer";
import { Search, ClipboardList, Zap, Users, Globe, Clock, Award, Activity, BarChart3, Loader2, ShieldCheck } from "lucide-react";

const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer"];

export default function FoundingAdmissionsAdmin() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("queue");
  const [capacity, setCapacity] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.BetaApplication.list("-created_date", 500),
      getCapacityInfo(),
    ])
      .then(([recs, cap]) => { setRecords(recs || []); setCapacity(cap); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const result = records.filter((r) => {
      const matchSearch = !search ||
        r.application_id?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.full_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return result
      .map((r) => ({ ...r, _priorityScore: computePriorityScore(r, records) }))
      .sort((a, b) => b._priorityScore - a._priorityScore);
  }, [records, search, statusFilter]);

  if (!ADMIN_ROLES.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  const handleAction = async (applicationId, action, data) => {
    const result = await syncReviewerAction(applicationId, action, data);
    setRecords((prev) => prev.map((r) => r.id === applicationId ? { ...result, _priorityScore: computePriorityScore(result, prev) } : r));
    setSelected(null);
  };

  const reviewer = { id: user?.id, full_name: user?.full_name || user?.email, email: user?.email };

  const TABS = [
    { id: "queue", label: "Queue", icon: ClipboardList },
    { id: "intelligence", label: "Intelligence", icon: Zap },
    { id: "cohorts", label: "Cohorts", icon: Users },
    { id: "diversity", label: "Diversity", icon: Globe },
    { id: "reviewers", label: "Reviewers", icon: Clock },
    { id: "directory", label: "Directory", icon: Award },
    { id: "activation", label: "Activation", icon: Activity },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-amber-400" /> Founding Member Admissions
        </div>
        <h1 className="text-2xl font-bold text-white">Admissions Console</h1>
        <p className="text-white/40 text-sm mt-1">Executive admissions intelligence, cohort management, and reviewer operations.</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === t.id ? "bg-amber-500/15 text-amber-400" : "text-white/40 hover:text-white/70"
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "intelligence" && <IntelligenceDashboard records={records} capacityInfo={capacity} />}
      {activeTab === "cohorts" && <CohortManagement records={records} />}
      {activeTab === "diversity" && <DiversityDashboard records={records} />}
      {activeTab === "reviewers" && <ReviewerPerformance records={records} />}
      {activeTab === "directory" && <FounderDirectory records={records} />}
      {activeTab === "activation" && <ActivationDashboard records={records} />}
      {activeTab === "insights" && <ProductInsights records={records} />}

      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Application ID, email, or name..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40">
              <option value="all">All Statuses</option>
              {Object.entries(ADMISSIONS_STATUSES).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-white/30" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12"><Users size={28} className="text-white/20 mx-auto mb-3" /><p className="text-sm text-white/40">No applications found.</p></div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {filtered.map((app) => {
                  const status = ADMISSIONS_STATUSES[app.status] || ADMISSIONS_STATUSES.submitted;
                  const priority = getPriorityLevel(app._priorityScore);
                  return (
                    <div key={app.id} className="flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelected(app)}>
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: priority.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/80 font-medium">{app.full_name}</span>
                          <span className="text-[10px] text-amber-400 font-mono">{app.application_id}</span>
                        </div>
                        <div className="text-[10px] text-white/30 mt-0.5">{app.email} · {app.current_role || "—"} · {app.country || "—"}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${priority.badge}`}>{priority.label}</span>
                        <span className="text-[10px] text-white/30">{app._priorityScore}</span>
                        <div className="text-right">
                          <div className={`text-[10px] px-2 py-0.5 rounded-full ${
                            status.color === "#10b981" ? "text-emerald-400 bg-emerald-500/10" :
                            status.color === "#ef4444" ? "text-red-400 bg-red-500/10" :
                            status.color === "#6366f1" ? "text-indigo-400 bg-indigo-500/10" :
                            "text-amber-400 bg-amber-500/10"
                          }`}>{status.label}</div>
                          {app.application_score > 0 && <div className="text-[10px] text-white/30 mt-1">Score: {app.application_score}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {selected && <ApplicationReviewDrawer application={selected} reviewer={reviewer} onAction={handleAction} onClose={() => setSelected(null)} />}
    </div>
  );
}