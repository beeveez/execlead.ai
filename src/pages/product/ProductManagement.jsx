import React, { useState, useMemo } from "react";
import { useProductManagement } from "@/hooks/useProductManagement";
import PMSidebar from "@/components/product/PMSidebar";
import FeedbackDetailDrawer from "@/components/product/FeedbackDetailDrawer";
import Dashboard from "@/components/product/Dashboard";
import FeedbackInbox from "@/components/product/FeedbackInbox";
import BugTracker from "@/components/product/BugTracker";
import FeatureRequests from "@/components/product/FeatureRequests";
import ProductRoadmap from "@/components/product/ProductRoadmap";
import ReleaseCenter from "@/components/product/ReleaseCenter";
import AIProductInsights from "@/components/product/AIProductInsights";
import CustomerRequests from "@/components/product/CustomerRequests";
import ProductAnalytics from "@/components/product/ProductAnalytics";
import { Boxes, RefreshCw, Loader2, Shield } from "lucide-react";

export default function ProductManagement() {
  const pm = useProductManagement();
  const [section, setSection] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => pm.feedback.find(f => f.id === selectedId) || null, [pm.feedback, selectedId]);

  const sectionProps = { pm, onSelect: setSelectedId };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Boxes size={12} className="text-indigo-400" /> Product Management Center
          </div>
          <h1 className="text-2xl font-bold text-white">Product Management Center</h1>
          <p className="text-white/40 text-sm mt-1 max-w-2xl">
            Unified command center for feedback, bugs, features, roadmap, releases, and AI-driven product insights — all powered by the single Feedback entity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pm.lastRefresh && <span className="text-[10px] text-white/30">Updated {new Date(pm.lastRefresh).toLocaleTimeString()}</span>}
          <button onClick={pm.refresh} disabled={pm.loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-50">
            {pm.loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <PMSidebar active={section} onSelect={setSection} kpis={pm.insights?.kpis} />

        <div className="flex-1 min-w-0">
          {pm.loading && !pm.insights ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : !pm.canManage ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
              <Shield size={32} className="mx-auto text-white/20 mb-3" />
              <h2 className="text-white font-medium mb-1">Product Management Access Required</h2>
              <p className="text-white/30 text-sm">This center is restricted to developers, product managers, and administrators.</p>
            </div>
          ) : pm.error ? (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400 text-sm font-medium">Failed to load product data</p>
              <p className="text-white/30 text-xs mt-1">{pm.error}</p>
              <button onClick={pm.refresh} className="mt-3 text-xs text-indigo-400">Retry</button>
            </div>
          ) : (
            <>
              {section === "dashboard" && <Dashboard {...sectionProps} onNavigate={setSection} />}
              {section === "inbox" && <FeedbackInbox {...sectionProps} />}
              {section === "bugs" && <BugTracker {...sectionProps} />}
              {section === "features" && <FeatureRequests {...sectionProps} />}
              {section === "roadmap" && <ProductRoadmap {...sectionProps} />}
              {section === "releases" && <ReleaseCenter {...sectionProps} />}
              {section === "insights" && <AIProductInsights {...sectionProps} />}
              {section === "requests" && <CustomerRequests {...sectionProps} />}
              {section === "analytics" && <ProductAnalytics {...sectionProps} />}
            </>
          )}
        </div>
      </div>

      {selected && <FeedbackDetailDrawer feedback={selected} pm={pm} onClose={() => setSelectedId(null)} />}
    </div>
  );
}