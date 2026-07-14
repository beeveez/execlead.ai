import React, { useState, useEffect, useCallback } from "react";
import { Users, RefreshCw, LayoutDashboard, UserCircle, TrendingUp, Building2, Clock, BookOpen, Sparkles, FileText, BarChart3, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fetchCustomerLifecycleData, computeCustomerLifecycle } from "@/lib/customerLifecycleEngine";
import { Spinner } from "@/components/customer-lifecycle/Shared";
import LifecyclePipeline from "@/components/customer-lifecycle/LifecyclePipeline";
import CustomerSuccess from "@/components/customer-lifecycle/CustomerSuccess";
import Organization360 from "@/components/customer-lifecycle/Organization360";
import CustomerTimeline from "@/components/customer-lifecycle/CustomerTimeline";
import SuccessPlaybooks from "@/components/customer-lifecycle/SuccessPlaybooks";
import CustomerCopilot from "@/components/customer-lifecycle/CustomerCopilot";
import ReportCenter from "@/components/customer-lifecycle/ReportCenter";
import JourneyAnalytics from "@/components/customer-lifecycle/JourneyAnalytics";
import Customer360 from "@/components/customer-lifecycle/Customer360";

const TABS = [
  { id: "pipeline", label: "Lifecycle Pipeline", icon: TrendingUp },
  { id: "success", label: "Customer Success", icon: UserCircle },
  { id: "organizations", label: "Organization 360", icon: Building2 },
  { id: "timeline", label: "Customer Timeline", icon: Clock },
  { id: "playbooks", label: "Success Playbooks", icon: BookOpen },
  { id: "copilot", label: "EXEC™ Customer Copilot", icon: Sparkles },
  { id: "analytics", label: "Journey Analytics", icon: BarChart3 },
  { id: "reports", label: "Report Center", icon: FileText },
];

export default function CustomerLifecycleManagement() {
  const [tab, setTab] = useState("pipeline");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await fetchCustomerLifecycleData(base44);
      setData(computeCustomerLifecycle(raw));
    } catch {
      setData(computeCustomerLifecycle({}));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users size={22} className="text-indigo-400" />
              Customer Lifecycle Management™
            </h1>
            <p className="text-white/40 text-sm mt-1">
              360-degree customer operations — from first application through enterprise success
            </p>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-indigo-400 text-indigo-400" : "border-transparent text-white/40 hover:text-white/60"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <Spinner label="Loading customer lifecycle data…" />
        ) : (
          <>
            {tab === "pipeline" && <LifecyclePipeline data={data} />}
            {tab === "success" && <CustomerSuccess data={data} onSelectCustomer={setSelectedCustomer} />}
            {tab === "organizations" && <Organization360 data={data} />}
            {tab === "timeline" && <CustomerTimeline data={data} onSelectCustomer={setSelectedCustomer} />}
            {tab === "playbooks" && <SuccessPlaybooks data={data} onSelectCustomer={setSelectedCustomer} />}
            {tab === "copilot" && <CustomerCopilot data={data} />}
            {tab === "analytics" && <JourneyAnalytics data={data} />}
            {tab === "reports" && <ReportCenter data={data} />}
          </>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-t-2xl md:rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <Customer360 customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
          </div>
        </div>
      )}
    </div>
  );
}