import React, { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COMPETITOR_SEED, toEntityRecord } from "@/lib/competitiveIntelligence";
import { MARKET_TREND_SEED, SIGNAL_SEED } from "@/lib/competitiveIntelligence";
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
import IntelMarketTrends from "@/components/competitive-intel/IntelMarketTrends";
import IntelSignals from "@/components/competitive-intel/IntelSignals";
import IntelTimeline from "@/components/competitive-intel/IntelTimeline";
import IntelThreatIndex from "@/components/competitive-intel/IntelThreatIndex";
import IntelMoat from "@/components/competitive-intel/IntelMoat";
import IntelMarketForecast from "@/components/competitive-intel/IntelMarketForecast";
import IntelSettings from "@/components/competitive-intel/IntelSettings";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "competitors", label: "Competitors" },
  { key: "battlecards", label: "Battlecards™" },
  { key: "feature-intelligence", label: "Feature Intelligence™" },
  { key: "market-intelligence", label: "Market Intelligence™" },
  { key: "market-trends", label: "Market Trends™" },
  { key: "signals", label: "Competitive Signals™" },
  { key: "competitor-timeline", label: "Competitor Timeline™" },
  { key: "threat-index", label: "Strategic Threat Index™" },
  { key: "enterprise-deals", label: "Enterprise Deals™" },
  { key: "moat", label: "EXECLEAD.AI Moat™" },
  { key: "roadmap", label: "Roadmap Intelligence™" },
  { key: "market-forecast", label: "Market Forecast™" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
  { key: "evidence", label: "Competitive Evidence™" },
  { key: "pricing", label: "Pricing Intelligence™" },
  { key: "positioning", label: "Executive Positioning™" },
  { key: "product-evolution", label: "Product Evolution™" },
  { key: "opportunity", label: "Opportunity Intelligence™" },
  { key: "briefings", label: "Executive Briefings™" },
  { key: "ai-search", label: "AI Positioning Assistant™" },
];

export default function CompetitiveIntelligenceCenter() {
  const [tab, setTab] = useState("overview");
  const [competitors, setCompetitors] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [signals, setSignals] = useState([]);
  const [trends, setTrends] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.CompetitorProfile.list("-created_date", 100);
      if (!list || list.length === 0) {
        await base44.entities.CompetitorProfile.bulkCreate(COMPETITOR_SEED.map(toEntityRecord));
        setCompetitors(await base44.entities.CompetitorProfile.list("-created_date", 100) || []);
      } else {
        setCompetitors(list);
      }
      try { setEvidence(await base44.entities.CompetitiveEvidence.list("-created_date", 200) || []); } catch {}

      try {
        const sigs = await base44.entities.ChangeHistory.list("-change_date", 200) || [];
        if (sigs.length === 0) { await base44.entities.ChangeHistory.bulkCreate(SIGNAL_SEED); setSignals(await base44.entities.ChangeHistory.list("-change_date", 200) || []); }
        else setSignals(sigs);
      } catch {}

      try {
        const tr = await base44.entities.MarketTrend.list("-last_updated", 100) || [];
        if (tr.length === 0) { await base44.entities.MarketTrend.bulkCreate(MARKET_TREND_SEED); setTrends(await base44.entities.MarketTrend.list("-last_updated", 100) || []); }
        else setTrends(tr);
      } catch {}

      try { setForecasts(await base44.entities.MarketForecast.list("-last_updated", 100) || []); } catch {}
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
          <ShieldCheck size={13} /> Competitive Intelligence & Battlecard Center™ · V3 Strategic Market Intelligence Platform
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Strategic Market Intelligence Platform</h1>
        <p className="text-white/45 text-sm max-w-2xl mb-6">The internal source of strategic market truth — guiding Product, Sales, Marketing, Leadership, and Enterprise strategy. Evidence-based: public information only, never scraped, never invented. Every claim is traceable to its source.</p>

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
            {tab === "battlecards" && <IntelBattlecards competitors={competitors} />}
            {tab === "feature-intelligence" && <IntelFeatureMatrix competitors={competitors} />}
            {tab === "market-intelligence" && <IntelNews competitors={competitors} />}
            {tab === "market-trends" && <IntelMarketTrends trends={trends} onRefresh={load} />}
            {tab === "signals" && <IntelSignals signals={signals} competitors={competitors} onRefresh={load} />}
            {tab === "competitor-timeline" && <IntelTimeline signals={signals} competitors={competitors} />}
            {tab === "threat-index" && <IntelThreatIndex competitors={competitors} />}
            {tab === "enterprise-deals" && <IntelWinLoss competitors={competitors} />}
            {tab === "moat" && <IntelMoat competitors={competitors} />}
            {tab === "roadmap" && <IntelRoadmap />}
            {tab === "market-forecast" && <IntelMarketForecast forecasts={forecasts} trends={trends} competitors={competitors} onRefresh={load} />}
            {tab === "reports" && <IntelReports competitors={competitors} evidence={evidence} />}
            {tab === "settings" && <IntelSettings />}
            {tab === "evidence" && <IntelEvidence competitors={competitors} />}
            {tab === "pricing" && <IntelPricing competitors={competitors} />}
            {tab === "positioning" && <IntelPositioning competitors={competitors} />}
            {tab === "product-evolution" && <IntelProductEvolution competitors={competitors} />}
            {tab === "opportunity" && <IntelOpportunity competitors={competitors} />}
            {tab === "briefings" && <IntelBriefings competitors={competitors} />}
            {tab === "ai-search" && <IntelAiAssistant competitors={competitors} />}
          </>
        )}
      </div>
    </div>
  );
}