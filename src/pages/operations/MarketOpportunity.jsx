import React, { useState, useMemo } from "react";
import { Target, TrendingUp, DollarSign, Building2, Languages, Crown, Download, FileJson, Zap, Globe } from "lucide-react";
import { useUserIntelligenceData } from "@/hooks/useUserIntelligenceData";
import { computeGeographicData } from "@/lib/geographicIntelligenceEngine";
import { computeMarketOpportunity, exportOpportunityCSV } from "@/lib/marketOpportunityEngine";
import { StatCard, SectionCard, DistributionTable, BarChartCard, LoadingState, EmptyState } from "@/components/user-intelligence/shared";
import OpportunityMapSection from "@/components/market-opportunity/OpportunityMapSection";
import MarketAdvisor from "@/components/market-opportunity/MarketAdvisor";

const PRIORITY_COLORS = { Immediate: "#10b981", Next: "#06b6d4", Future: "#6366f1", "Long-Term": "#f59e0b" };
const LOC_COLORS = { Ready: "#10b981", "Near Ready": "#06b6d4", Planning: "#f59e0b", "Not Started": "#ef4444" };

export default function MarketOpportunity() {
  const { data, loading, error } = useUserIntelligenceData();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const geoData = useMemo(() => (data ? computeGeographicData(data) : null), [data]);
  const marketData = useMemo(() => (geoData ? computeMarketOpportunity(geoData, data) : null), [geoData, data]);

  if (loading) return <LoadingState message="Loading market opportunity intelligence…" />;
  if (error || !data || !marketData) return <EmptyState message="Unable to load market opportunity data." />;

  const ov = marketData.overview;

  const downloadCSV = () => download(exportOpportunityCSV(marketData), "market-opportunity.csv", "text/csv");
  const downloadJSON = () => download(JSON.stringify(marketData, null, 2), "market-opportunity.json", "application/json");

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Globe size={12} className="text-indigo-400" /> Product Intelligence™ · Market Opportunity Intelligence™ v1.0
          </div>
          <h1 className="text-2xl font-bold text-white">Market Opportunity Intelligence™</h1>
          <p className="text-white/40 text-sm mt-1">AI-powered strategic decision intelligence for market expansion, investment, localization, and enterprise growth.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white/90 transition-colors"><Download size={14} /> CSV</button>
          <button onClick={downloadJSON} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white/90 transition-colors"><FileJson size={14} /> JSON</button>
        </div>
      </div>

      {/* Section 1: Executive Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Target} label="Global Opportunity Score™" value={`${ov.globalScore}/100`} color="#6366f1" />
        <StatCard icon={TrendingUp} label="Top Expansion Country" value={ov.topCountry?.country || "—"} sub={`Score: ${ov.topCountry?.opportunityScore || 0}`} color="#10b981" />
        <StatCard icon={Zap} label="Fastest Emerging Market" value={ov.fastestGrowing?.country || "—"} sub={`${ov.fastestGrowing?.growthRate || 0}% growth`} color="#06b6d4" />
        <StatCard icon={Building2} label="Highest Enterprise Potential" value={ov.highestEnterprise?.country || "—"} sub={`${ov.highestEnterprise?.enterpriseSubs || 0} enterprise`} color="#a855f7" />
        <StatCard icon={Target} label="Highest Conversion Market" value={ov.highestConversion?.country || "—"} sub={`${ov.highestConversion?.execPercent || 0}% exec`} color="#f59e0b" />
        <StatCard icon={DollarSign} label="Highest Revenue Potential" value={ov.highestRevenue?.country || "—"} sub={`$${ov.highestRevenue?.mrr || 0} MRR`} color="#ec4899" />
        <StatCard icon={Globe} label="Most Underserved Region" value={ov.underserved?.country || "—"} sub={`Score: ${ov.underserved?.opportunityScore || 0}`} color="#ef4444" />
        <StatCard icon={TrendingUp} label="Recommended Priority" value={ov.topCountry?.priority || "—"} color="#14b8a6" />
      </div>

      {/* Section 2: Interactive Opportunity Map */}
      <OpportunityMapSection data={marketData} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />

      {/* Section 3: Market Opportunity Score™ Ranking */}
      <SectionCard title="Market Opportunity Score™ — Country Rankings" icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Country</th>
                <th className="text-center py-2 px-2">Score</th>
                <th className="text-left py-2 px-2">Label</th>
                <th className="text-center py-2 px-2">Tier</th>
                <th className="text-left py-2 px-2">Priority</th>
                <th className="text-right py-2 px-2">Users</th>
                <th className="text-right py-2 px-2">Growth</th>
                <th className="text-right py-2 px-2">MRR</th>
                <th className="text-left py-2 px-2">Localization</th>
              </tr>
            </thead>
            <tbody>
              {marketData.scoredCountries.map((c, i) => (
                <tr key={i} className={`border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer ${selectedCountry === c.country ? "bg-indigo-500/5" : ""}`} onClick={() => setSelectedCountry(c.country)}>
                  <td className="py-2 px-2 text-white/30">{i + 1}</td>
                  <td className="py-2 px-2 text-white/80">{c.country}</td>
                  <td className="py-2 px-2 text-center"><span className="font-bold" style={{ color: c.tierColor }}>{c.opportunityScore}</span></td>
                  <td className="py-2 px-2 text-white/50">{c.opportunityLabel}</td>
                  <td className="py-2 px-2 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${c.tierColor}20`, color: c.tierColor }}>T{c.tier}</span></td>
                  <td className="py-2 px-2"><span className="text-[10px] font-medium" style={{ color: PRIORITY_COLORS[c.priority] }}>{c.priority}</span></td>
                  <td className="py-2 px-2 text-right text-white/60">{c.users}</td>
                  <td className="py-2 px-2 text-right text-white/60">{c.growthRate}%</td>
                  <td className="py-2 px-2 text-right text-emerald-400/70">${c.mrr}</td>
                  <td className="py-2 px-2"><span className="text-[10px]" style={{ color: LOC_COLORS[c.localizationStatus] }}>{c.localizationStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Section 4: Expansion Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(marketData.priorities).map(([priority, countries]) => (
          <SectionCard key={priority} title={`${priority} (${countries.length})`} icon={Zap}>
            {countries.length > 0 ? (
              <div className="space-y-2">
                {countries.slice(0, 8).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{c.country}</span>
                    <span className="font-bold" style={{ color: c.tierColor }}>{c.opportunityScore}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/30 text-xs">No countries</p>}
          </SectionCard>
        ))}
      </div>

      {/* Section 5: Market Tiers */}
      <SectionCard title="Market Tier Classification" icon={Target}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {marketData.tierDist.map((t) => (
            <div key={t.tier} className="bg-white/[0.02] border rounded-lg p-4 text-center" style={{ borderColor: `${t.color}30` }}>
              <div className="text-3xl font-bold" style={{ color: t.color }}>{t.count}</div>
              <div className="text-xs text-white/40 mt-1">Tier {t.tier}</div>
              <div className="text-[10px] text-white/30">{t.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 6: Enterprise Opportunity */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Building2} label="Enterprise Customers" value={marketData.enterprise.totalEnterprise} color="#a855f7" />
        <StatCard icon={Building2} label="Enterprise Countries" value={marketData.scoredCountries.filter((c) => c.enterpriseSubs > 0).length} color="#6366f1" />
        <StatCard icon={Target} label="Avg Sessions/Country" value={marketData.enterprise.avgSeats} color="#06b6d4" />
        <StatCard icon={TrendingUp} label="Expansion Potential" value={marketData.scoredCountries.filter((c) => c.enterpriseSubs === 0 && c.opportunityScore >= 60).length} sub="high-score, no enterprise yet" color="#10b981" />
      </div>

      {/* Section 7: Localization Readiness */}
      <SectionCard title="Localization Readiness" icon={Languages}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {marketData.localizationSummary.map((l) => (
            <div key={l.status} className="bg-white/[0.02] border rounded-lg p-3 text-center" style={{ borderColor: `${LOC_COLORS[l.status]}30` }}>
              <div className="text-2xl font-bold" style={{ color: LOC_COLORS[l.status] }}>{l.count}</div>
              <div className="text-[10px] text-white/40">{l.status}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-white/40 border-b border-white/5">
              <th className="text-left py-2 px-2">Country</th><th className="text-center py-2 px-2">Score</th><th className="text-left py-2 px-2">Language</th><th className="text-left py-2 px-2">Currency</th><th className="text-left py-2 px-2">Billing</th><th className="text-left py-2 px-2">Legal</th><th className="text-left py-2 px-2">Privacy</th><th className="text-left py-2 px-2">AI Support</th><th className="text-left py-2 px-2">Status</th>
            </tr></thead>
            <tbody>
              {marketData.scoredCountries.slice(0, 12).map((c, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 px-2 text-white/80">{c.country}</td>
                  <td className="py-2 px-2 text-center text-white/60">{c.opportunityScore}</td>
                  <td className="py-2 px-2"><span style={{ color: LOC_COLORS[c.localizationStatus] }}>{c.localizationStatus}</span></td>
                  <td className="py-2 px-2"><span style={{ color: LOC_COLORS[c.localizationStatus] }}>{c.localizationStatus}</span></td>
                  <td className="py-2 px-2"><span style={{ color: LOC_COLORS[c.localizationStatus] }}>{c.localizationStatus}</span></td>
                  <td className="py-2 px-2 text-white/30">—</td>
                  <td className="py-2 px-2 text-white/30">—</td>
                  <td className="py-2 px-2 text-white/30">—</td>
                  <td className="py-2 px-2"><span className="text-[10px] font-medium" style={{ color: LOC_COLORS[c.localizationStatus] }}>{c.localizationStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Section 8: Marketing Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(marketData.marketingRecs).map(([channel, countries]) => (
          <SectionCard key={channel} title={`Recommended for ${channel.charAt(0).toUpperCase() + channel.slice(1)}`} icon={Target}>
            {countries.length > 0 ? (
              <div className="space-y-2">
                {countries.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">{c.country}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: `${c.tierColor}20`, color: c.tierColor }}>T{c.tier}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                      <span>{c.growthRate}% growth</span>
                      <span className="font-bold" style={{ color: c.tierColor }}>{c.opportunityScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/30 text-xs">No recommendations</p>}
          </SectionCard>
        ))}
      </div>

      {/* Section 9: Founding Member Intelligence */}
      <SectionCard title="Founding Member Intelligence" icon={Crown}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-white/40 mb-2">Founding Members by Country</h4>
            {marketData.fmByCountry.length > 0 ? <DistributionTable data={marketData.fmByCountry.map((f) => ({ value: f.country, count: f.count }))} max={10} /> : <p className="text-white/30 text-xs">No data</p>}
          </div>
          <div>
            <h4 className="text-xs text-white/40 mb-2">Countries Needing More Founding Members</h4>
            {marketData.fmNeeded.length > 0 ? (
              <div className="space-y-2">
                {marketData.fmNeeded.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{c.country}</span>
                    <span className="text-white/40">{c.users} users · {marketData.fmByCountry.find((f) => f.country === c.country)?.count || 0} founders</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/30 text-xs">All markets have sufficient founding members.</p>}
          </div>
        </div>
      </SectionCard>

      {/* Section 10: Revenue Opportunity */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Current Revenue (MRR)" value={`$${marketData.revenue.currentRevenue.toLocaleString()}`} color="#10b981" />
        <StatCard icon={TrendingUp} label="Projected Revenue" value={`$${Math.round(marketData.revenue.projectedRevenue).toLocaleString()}`} sub="next month" color="#06b6d4" />
        <StatCard icon={TrendingUp} label="Revenue Growth" value={`${marketData.revenue.revenueGrowth}%`} color="#6366f1" />
        <StatCard icon={DollarSign} label="Revenue Concentration" value={`${marketData.revenue.revenueConcentration.toFixed(0)}%`} sub="top 5 countries" color="#f59e0b" />
      </div>

      {/* Section 11: EXEC™ Market Advisor */}
      <MarketAdvisor data={marketData} />
    </div>
  );
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}