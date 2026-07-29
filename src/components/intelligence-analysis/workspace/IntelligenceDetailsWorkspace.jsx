import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, AlertTriangle, Boxes, Wrench, GitBranch, Clock, BarChart3 } from "lucide-react";
import { closeIntelligenceAnalysis } from "@/lib/intelligenceAnalysisStore";
import { getInvestigationBundle } from "@/lib/intelligenceInvestigationEngine";
import WorkspaceHeader from "./WorkspaceHeader";
import OverviewTab from "./OverviewTab";
import IssuesTab from "./IssuesTab";
import FixTab from "./FixTab";
import DependencyTab from "./DependencyTab";
import TimelineTab from "./TimelineTab";
import HistoryTab from "./HistoryTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "issues", label: "Issues & Components", icon: AlertTriangle },
  { id: "fix", label: "Root Cause & Fix", icon: Wrench },
  { id: "dependencies", label: "Dependencies", icon: GitBranch },
  { id: "timeline", label: "Timeline & Activity", icon: Clock },
  { id: "history", label: "History & Export", icon: BarChart3 },
];

export default function IntelligenceDetailsWorkspace({ payload }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRerunning, setIsRerunning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fixFlash, setFixFlash] = useState(null);

  // bundle re-evaluates on payload change or after re-run/fix (refreshKey bump)
  const bundle = useMemo(() => (payload ? getInvestigationBundle(payload.metricId) : null), [payload?.metricId, refreshKey]);

  const onClose = () => closeIntelligenceAnalysis();

  const handleRerun = () => {
    setIsRerunning(true);
    setTimeout(() => { setIsRerunning(false); setRefreshKey((k) => k + 1); }, 1500);
  };

  const handleFixApplied = (fix) => {
    setFixFlash({ title: fix.title, improvement: fix.expectedImprovement });
    setTimeout(() => setFixFlash(null), 4000);
    setRefreshKey((k) => k + 1);
  };

  // Deep-link via URL hash
  useEffect(() => {
    if (payload?.metricId) {
      window.history.replaceState(null, "", `#intelligence=${payload.metricId}`);
    }
    return () => {
      if (window.location.hash.startsWith("#intelligence=")) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
  }, [payload?.metricId]);

  if (!bundle) return null;

  const activeBundle = bundle;
  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab bundle={activeBundle} />;
      case "issues": return <IssuesTab bundle={activeBundle} />;
      case "fix": return <FixTab bundle={activeBundle} onClose={onClose} onFixApplied={handleFixApplied} />;
      case "dependencies": return <DependencyTab bundle={activeBundle} />;
      case "timeline": return <TimelineTab bundle={activeBundle} />;
      case "history": return <HistoryTab bundle={activeBundle} onClose={onClose} />;
      default: return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-4xl bg-[#0d0d14] border-l border-white/10 z-50 flex flex-col"
      >
        <WorkspaceHeader bundle={activeBundle} onClose={onClose} onRerun={handleRerun} onExport={() => setActiveTab("history")} isRerunning={isRerunning} />

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 overflow-x-auto bg-[#0d0d14]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${active ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "text-white/50 hover:text-white/80 border border-transparent"}`}
              >
                <Icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab + refreshKey} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Success flash on fix applied */}
        <AnimatePresence>
          {fixFlash && (
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg"
            >
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">✓</span>
              <div>
                <p className="text-emerald-300 text-sm font-medium">Fix Applied: {fixFlash.title}</p>
                <p className="text-emerald-400/70 text-xs">Estimated improvement: {fixFlash.improvement} · Score recalculating…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}