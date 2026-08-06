import React, { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COMPETITOR_SEED, toEntityRecord } from "@/lib/competitiveIntelligence";
import IntelOverview from "@/components/competitive-intel/IntelOverview";
import IntelCompetitors from "@/components/competitive-intel/IntelCompetitors";
import IntelBattlecards from "@/components/competitive-intel/IntelBattlecards";
import IntelFeatureMatrix from "@/components/competitive-intel/IntelFeatureMatrix";
import IntelPositioning from "@/components/competitive-intel/IntelPositioning";
import IntelInsights from "@/components/competitive-intel/IntelInsights";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "competitors", label: "Competitors" },
  { key: "battlecards", label: "Battlecards" },
  { key: "matrix", label: "Feature Comparison" },
  { key: "positioning", label: "Positioning" },
  { key: "market-trends", label: "Market Trends" },
  { key: "product-evolution", label: "Product Evolution" },
  { key: "enterprise-intelligence", label: "Enterprise Intelligence" },
  { key: "win-loss", label: "Win/Loss Analysis" },
  { key: "roadmap-insights", label: "Roadmap Insights" },
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
    try {
      const created = await base44.entities.CompetitorProfile.create(rec);
      setCompetitors((prev) => [...prev, created]);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-3">
          <ShieldCheck size={13} /> Competitive Intelligence & Positioning Center™
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Enterprise Market Intelligence</h1>
        <p className="text-white/45 text-sm max-w-2xl mb-6">The single internal source of truth for product strategy, enterprise sales, marketing, and positioning. Manually curated from public information — never scraped, never guessed.</p>

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
            {tab === "overview" && <IntelOverview competitors={competitors} />}
            {tab === "competitors" && <IntelCompetitors competitors={competitors} onAdd={addCompetitor} />}
            {tab === "battlecards" && <IntelBattlecards competitors={competitors} />}
            {tab === "matrix" && <IntelFeatureMatrix competitors={competitors} />}
            {tab === "positioning" && <IntelPositioning competitors={competitors} />}
            {["market-trends", "product-evolution", "enterprise-intelligence", "win-loss", "roadmap-insights"].includes(tab) && <IntelInsights section={tab} />}
          </>
        )}
      </div>
    </div>
  );
}