import React, { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COMPETITOR_SEED, toEntityRecord } from "@/lib/competitiveIntelligence";
import IntelDashboard from "@/components/competitive-intel/IntelDashboard";
import IntelCompetitors from "@/components/competitive-intel/IntelCompetitors";
import IntelBattlecards from "@/components/competitive-intel/IntelBattlecards";
import IntelFeatureMatrix from "@/components/competitive-intel/IntelFeatureMatrix";
import IntelMarketLandscape from "@/components/competitive-intel/IntelMarketLandscape";
import IntelWinLoss from "@/components/competitive-intel/IntelWinLoss";
import IntelPositioning from "@/components/competitive-intel/IntelPositioning";
import IntelPricing from "@/components/competitive-intel/IntelPricing";
import IntelAiAssistant from "@/components/competitive-intel/IntelAiAssistant";
import IntelNews from "@/components/competitive-intel/IntelNews";
import IntelExecutiveInsights from "@/components/competitive-intel/IntelExecutiveInsights";
import IntelRoadmap from "@/components/competitive-intel/IntelRoadmap";
import IntelReports from "@/components/competitive-intel/IntelReports";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "competitors", label: "Competitor Profiles™" },
  { key: "battlecards", label: "Battlecards™" },
  { key: "feature-intelligence", label: "Feature Intelligence™" },
  { key: "market-landscape", label: "Market Landscape™" },
  { key: "win-loss", label: "Win/Loss Intelligence™" },
  { key: "positioning", label: "Strategic Positioning™" },
  { key: "pricing", label: "Pricing Intelligence™" },
  { key: "ai-intelligence", label: "AI Intelligence™" },
  { key: "news", label: "News & Product Updates™" },
  { key: "executive-insights", label: "Executive Insights™" },
  { key: "roadmap-influence", label: "Roadmap Influence™" },
  { key: "reports", label: "Reports & Export" },
];

export default function CompetitiveIntelligenceCenter() {
  const [tab, setTab] = useState("overview");
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.CompetitorProfile.list("-created_date", 100);
      if (!list || list.length === 0) {
        await base44.entities.CompetitorProfile.bulkCreate(COMPETITOR_SEED.map(toEntityRecord));
        const seeded = await base44.entities.CompetitorProfile.list("-created_date", 100);
        setCompetitors(seeded || []);
      } else {
        setCompetitors(list);
      }
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addCompetitor = async (rec) => {
    try { const created = await base44.entities.CompetitorProfile.create(rec); setCompetitors((p) => [...p, created]); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-3">
          <ShieldCheck size={13} /> Competitive Intelligence & Battlecard Center™
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Market Intelligence & Strategic Positioning</h1>
        <p className="text-white/45 text-sm max-w-2xl mb-6">The single internal source of competitive truth for Product, Sales, Marketing, Founder, and Enterprise teams. Evidence-based — public information only, never scraped, never invented.</p>

        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tab === t.key ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-white/40 hover:text-white/70 border border-transparent"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-white/40" /></div>
        ) : (
          <>
            {tab === "overview" && <IntelDashboard competitors={competitors} />}
            {tab === "competitors" && <IntelCompetitors competitors={competitors} onAdd={addCompetitor} />}
            {tab === "battlecards" && <IntelBattlecards competitors={competitors} />}
            {tab === "feature-intelligence" && <IntelFeatureMatrix competitors={competitors} />}
            {tab === "market-landscape" && <IntelMarketLandscape competitors={competitors} />}
            {tab === "win-loss" && <IntelWinLoss competitors={competitors} />}
            {tab === "positioning" && <IntelPositioning competitors={competitors} />}
            {tab === "pricing" && <IntelPricing competitors={competitors} />}
            {tab === "ai-intelligence" && <IntelAiAssistant competitors={competitors} />}
            {tab === "news" && <IntelNews competitors={competitors} />}
            {tab === "executive-insights" && <IntelExecutiveInsights competitors={competitors} />}
            {tab === "roadmap-influence" && <IntelRoadmap />}
            {tab === "reports" && <IntelReports competitors={competitors} />}
          </>
        )}
      </div>
    </div>
  );
}