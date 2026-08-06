import React, { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COMPETITOR_SEED, toEntityRecord } from "@/lib/competitiveIntelligence";
import IntelDashboard from "@/components/competitive-intel/IntelDashboard";
import IntelCompetitors from "@/components/competitive-intel/IntelCompetitors";
import IntelEvidence from "@/components/competitive-intel/IntelEvidence";
import IntelBattlecards from "@/components/competitive-intel/IntelBattlecards";
import IntelFeatureMatrix from "@/components/competitive-intel/IntelFeatureMatrix";
import IntelNews from "@/components/competitive-intel/IntelNews";
import IntelPricing from "@/components/competitive-intel/IntelPricing";
import IntelPositioning from "@/components/competitive-intel/IntelPositioning";
import IntelProductEvolution from "@/components/competitive-intel/IntelProductEvolution";
import IntelOpportunity from "@/components/competitive-intel/IntelOpportunity";
import IntelWinLoss from "@/components/competitive-intel/IntelWinLoss";
import IntelBriefings from "@/components/competitive-intel/IntelBriefings";
import IntelRoadmap from "@/components/competitive-intel/IntelRoadmap";
import IntelAiAssistant from "@/components/competitive-intel/IntelAiAssistant";
import IntelReports from "@/components/competitive-intel/IntelReports";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "competitors", label: "Competitor Profiles™" },
  { key: "evidence", label: "Competitive Evidence™" },
  { key: "battlecards", label: "Battlecards™" },
  { key: "feature-intelligence", label: "Feature Intelligence™" },
  { key: "market-intelligence", label: "Market Intelligence™" },
  { key: "pricing", label: "Pricing Intelligence™" },
  { key: "positioning", label: "Executive Positioning™" },
  { key: "product-evolution", label: "Product Evolution™" },
  { key: "opportunity", label: "Opportunity Intelligence™" },
  { key: "win-loss", label: "Win/Loss Intelligence™" },
  { key: "briefings", label: "Executive Briefings™" },
  { key: "roadmap", label: "Roadmap Intelligence™" },
  { key: "ai-search", label: "AI Search" },
  { key: "reports", label: "Reports" },
];

export default function CompetitiveIntelligenceCenter() {
  const [tab, setTab] = useState("overview");
  const [competitors, setCompetitors] = useState([]);
  const [evidence, setEvidence] = useState([]);
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
      try { setEvidence(await base44.entities.CompetitiveEvidence.list("-created_date", 200) || []); } catch {}
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
          <ShieldCheck size={13} /> Competitive Intelligence & Battlecard Center™ · Enterprise Market Intelligence Platform™
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Market Intelligence & Strategic Positioning</h1>
        <p className="text-white/45 text-sm max-w-2xl mb-6">The single internal source of competitive truth for Product, Sales, Marketing, Executive Leadership, Strategy, and Commercial teams. Evidence-based — public information only, never scraped, never invented. Every claim is traceable to its source.</p>

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
            {tab === "overview" && <IntelDashboard competitors={competitors} evidence={evidence} />}
            {tab === "competitors" && <IntelCompetitors competitors={competitors} onAdd={addCompetitor} />}
            {tab === "evidence" && <IntelEvidence competitors={competitors} />}
            {tab === "battlecards" && <IntelBattlecards competitors={competitors} />}
            {tab === "feature-intelligence" && <IntelFeatureMatrix competitors={competitors} />}
            {tab === "market-intelligence" && <IntelNews competitors={competitors} />}
            {tab === "pricing" && <IntelPricing competitors={competitors} />}
            {tab === "positioning" && <IntelPositioning competitors={competitors} />}
            {tab === "product-evolution" && <IntelProductEvolution competitors={competitors} />}
            {tab === "opportunity" && <IntelOpportunity competitors={competitors} />}
            {tab === "win-loss" && <IntelWinLoss competitors={competitors} />}
            {tab === "briefings" && <IntelBriefings competitors={competitors} />}
            {tab === "roadmap" && <IntelRoadmap />}
            {tab === "ai-search" && <IntelAiAssistant competitors={competitors} />}
            {tab === "reports" && <IntelReports competitors={competitors} evidence={evidence} />}
          </>
        )}
      </div>
    </div>
  );
}