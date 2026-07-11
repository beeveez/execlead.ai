import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ELIMFrameworkOverview from "@/components/elim/ELIMFrameworkOverview";
import ELIMKnowledgePacks from "@/components/elim/ELIMKnowledgePacks";
import ELIMEvidenceRules from "@/components/elim/ELIMEvidenceRules";
import { Layers, Package, FlaskConical, BarChart3, Brain, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const TABS = [
  { id: "overview", label: "Frameworks", icon: Layers },
  { id: "scores", label: "Intelligence Scores", icon: Brain },
  { id: "packs", label: "Knowledge Packs", icon: Package },
  { id: "evidence", label: "Evidence & Research", icon: FlaskConical },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function ELIMManagementCenter() {
  const [tab, setTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (tab === "analytics") {
      base44.functions.invoke("manageELIM", { action: "get_analytics" })
        .then((res) => setAnalytics(res.data))
        .catch(() => setAnalytics(null));
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={20} className="text-indigo-400" />
            <h1 className="text-xl font-bold">ELIM™ Management Center</h1>
          </div>
          <p className="text-white/40 text-sm">EXECLEAD Leadership Intelligence Model™ — The central intelligence architecture</p>
          <Link to="/methodology" className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            View EELM™ Methodology <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && <ELIMFrameworkOverview />}
        {tab === "scores" && <ELIMFrameworkOverview />}
        {tab === "packs" && <ELIMKnowledgePacks />}
        {tab === "evidence" && <ELIMEvidenceRules />}
        {tab === "analytics" && <AnalyticsTab analytics={analytics} />}
      </div>
    </div>
  );
}

function AnalyticsTab({ analytics }) {
  if (!analytics) return <div className="text-white/30 text-sm text-center py-8">Loading analytics...</div>;
  const cards = [
    { label: "Frameworks", value: analytics.frameworks },
    { label: "Intelligence Scores", value: analytics.intelligenceScores },
    { label: "Evidence Sources", value: analytics.evidenceSources },
    { label: "Knowledge Packs", value: analytics.totalKnowledgePacks },
    { label: "Active Packs", value: analytics.active },
    { label: "Draft Packs", value: analytics.drafts },
  ];
  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-3">Adoption Analytics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
            <div className="text-3xl font-bold text-white/90">{c.value}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}