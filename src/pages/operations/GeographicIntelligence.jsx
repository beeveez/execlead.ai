import React, { useState, useMemo } from "react";
import { Globe, Users, Building2, TrendingUp, DollarSign, Clock, MapPin, BarChart3, Download, ShieldCheck, FileJson, Brain } from "lucide-react";
import { useUserIntelligenceData } from "@/hooks/useUserIntelligenceData";
import { computeGeographicData, exportGeographicCSV } from "@/lib/geographicIntelligenceEngine";
import { StatCard, SectionCard, DistributionTable, BarChartCard, TrendChartCard, LoadingState, EmptyState } from "@/components/user-intelligence/shared";
import WorldMapSection from "@/components/geographic-intelligence/WorldMapSection";
import GeographicAIInsights from "@/components/geographic-intelligence/GeographicAIInsights";

export default function GeographicIntelligence() {
  const { data, loading, error } = useUserIntelligenceData();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const geoData = useMemo(() => (data ? computeGeographicData(data) : null), [data]);

  if (loading) return <LoadingState message="Loading geographic intelligence…" />;
  if (error || !data) return <EmptyState message="Unable to load geographic data." />;

  const ov = geoData.overview;
  const downloadCSV = () => download(exportGeographicCSV(geoData), "geographic-intelligence.csv", "text/csv");
  const downloadJSON = () => download(JSON.stringify(geoData, null, 2), "geographic-intelligence.json", "application/json");

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Globe size={12} className="text-indigo-400" /> Product Intelligence™ · Geographic Intelligence™ v1.0
          </div>
          <h1 className="text-2xl font-bold text-white">Geographic Intelligence™</h1>
          <p className="text-white/40 text-sm mt-1">Privacy-aware insights into user distribution, growth, engagement, and commercial performance across countries and regions.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white/90 transition-colors">
            <Download size={14} /> CSV
          </button>
          <button onClick={downloadJSON} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white/90 transition-colors">
            <FileJson size={14} /> JSON
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 bg-emerald-500/[0.04] border border-emerald-500/15 rounded-lg px-4 py-2">
        <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-300/70">Privacy by Design — aggregate data only. No street addresses, exact coordinates, or individual user locations. City-level data shown only when a minimum anonymity threshold (3+ users) is met.</p>
      </div>

      {/* Section 1: Executive Geographic Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Globe} label="Total Countries" value={ov.totalCountries} color="#10b981" />
        <StatCard icon={MapPin} label="Regions Represented" value={ov.totalRegions} color="#06b6d4" />
        <StatCard icon={Building2} label="Cities Represented" value={ov.totalCities} sub="privacy-aware" color="#a855f7" />
        <StatCard icon={TrendingUp} label="New Countries This Month" value={ov.newCountriesThisMonth} color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Fastest Growing Region" value={ov.fastestGrowing?.country || "—"} sub={`${ov.fastestGrowing?.growthRate || 0}% growth`} color="#6366f1" />
        <StatCard icon={Users} label="Largest User Base" value={ov.largestBase?.country || "—"} sub={`${ov.largestBase?.users || 0} users`} color="#ec4899" />
        <StatCard icon={Building2} label="Enterprise Countries" value={ov.enterpriseCountries} color="#3b82f6" />
        <StatCard icon={BarChart3} label="Average Growth Rate" value={`${ov.avgGrowth}%`} color="#14b8a6" />
      </div>

      {/* Section 2: Interactive World Map */}
      <WorldMapSection data={geoData} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />

      {/* Section 3: User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Top Countries — User Distribution" icon={Globe}>
          <DistributionTable data={geoData.countries.slice(0, 15)} max={15} />
        </SectionCard>
        <SectionCard title="Top Cities — Privacy-Aware" icon={MapPin}>
          {geoData.cities.length > 0 ? <DistributionTable data={geoData.cities} max={15} /> : <p className="text-white/30 text-sm">No cities meet the anonymity threshold (3+ users).</p>}
        </SectionCard>
      </div>

      {/* Section 4: Leadership Intelligence by Geography */}
      <SectionCard title="Leadership Intelligence by Geography" icon={Brain}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Country</th>
                <th className="text-right py-2 px-2">Users</th>
                <th className="text-right py-2 px-2">Avg Readiness</th>
                <th className="text-right py-2 px-2">Avg Promotion</th>
                <th className="text-right py-2 px-2">Journey Points</th>
                <th className="text-right py-2 px-2">Sessions</th>
                <th className="text-right py-2 px-2">Exec %</th>
              </tr>
            </thead>
            <tbody>
              {geoData.countries.filter((c) => c.country !== "Unknown").slice(0, 12).map((c, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedCountry(c.country)}>
                  <td className="py-2 px-2 text-white/80">{c.country}</td>
                  <td className="py-2 px-2 text-right text-white/60">{c.users}</td>
                  <td className="py-2 px-2 text-right text-white/60">{c.avgReadiness}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{c.avgPromotion}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{c.avgJourneyPoints}</td>
                  <td className="py-2 px-2 text-right text-white/60">{c.sessions}</td>
                  <td className="py-2 px-2 text-right text-white/60">{c.execPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Section 5: Commercial Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Commercial Intelligence by Country" icon={DollarSign}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 px-2">Country</th>
                  <th className="text-right py-2 px-2">MRR</th>
                  <th className="text-right py-2 px-2">ARPU</th>
                  <th className="text-right py-2 px-2">Exec Conv.</th>
                  <th className="text-right py-2 px-2">Pro Conv.</th>
                  <th className="text-right py-2 px-2">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {geoData.countries.filter((c) => c.country !== "Unknown" && c.mrr > 0).slice(0, 10).map((c, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2 px-2 text-white/80">{c.country}</td>
                    <td className="py-2 px-2 text-right text-emerald-400/70">${c.mrr}</td>
                    <td className="py-2 px-2 text-right text-white/60">${c.users > 0 ? (c.mrr / c.users).toFixed(2) : 0}</td>
                    <td className="py-2 px-2 text-right text-white/60">{c.execPercent}%</td>
                    <td className="py-2 px-2 text-right text-white/60">{c.proPercent}%</td>
                    <td className="py-2 px-2 text-right text-white/60">{c.enterpriseSubs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard title="Revenue by Region" icon={TrendingUp}>
          <BarChartCard data={geoData.regions.slice(0, 8).map((r) => ({ value: r.region, count: r.mrr }))} height={250} />
        </SectionCard>
      </div>

      {/* Section 6: Growth Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Growth Intelligence — Top Growing Countries" icon={TrendingUp}>
          <BarChartCard data={geoData.countries.filter((c) => c.country !== "Unknown").slice(0, 10).map((c) => ({ value: c.country, count: c.newUsers }))} height={250} />
        </SectionCard>
        <SectionCard title="Growth Rate by Country" icon={TrendingUp}>
          <DistributionTable data={geoData.countries.filter((c) => c.country !== "Unknown").map((c) => ({ value: c.country, count: parseFloat(c.growthRate) }))} max={10} />
        </SectionCard>
      </div>

      {/* Section 7: Company Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Most Targeted Companies" icon={Building2}>
          <DistributionTable data={geoData.targetCompanyDist} max={8} />
        </SectionCard>
        <SectionCard title="Most Popular Industries" icon={BarChart3}>
          <DistributionTable data={geoData.industryDist} max={8} />
        </SectionCard>
        <SectionCard title="Most Requested Roles" icon={Users}>
          <DistributionTable data={geoData.targetRoleDist} max={8} />
        </SectionCard>
      </div>

      {/* Section 8: Time Zone Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="User Activity by Hour" icon={Clock}>
          <BarChartCard data={geoData.hourBuckets} nameKey="hour" height={250} />
        </SectionCard>
        <SectionCard title="AI Usage by Hour" icon={Brain}>
          <BarChartCard data={geoData.aiHourBuckets} nameKey="hour" height={250} />
        </SectionCard>
      </div>
      <SectionCard title="Peak Usage Windows & Recommended Notification Times" icon={Clock}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {geoData.peakHours.map((h, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
              <Clock size={16} className="mx-auto text-indigo-400 mb-2" />
              <div className="text-lg font-bold text-white">{h.hour}</div>
              <div className="text-xs text-white/40">{h.count} activities</div>
              {i === 0 && <div className="text-[10px] text-emerald-400 mt-1">Best notification window</div>}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 9: Regional Benchmarks */}
      <SectionCard title="Regional Benchmarks — Comparative Analysis" icon={Globe}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Region</th>
                <th className="text-left py-2 px-2">Continent</th>
                <th className="text-right py-2 px-2">Users</th>
                <th className="text-right py-2 px-2">Engagement</th>
                <th className="text-right py-2 px-2">Growth %</th>
                <th className="text-right py-2 px-2">Exec %</th>
                <th className="text-right py-2 px-2">MRR</th>
                <th className="text-right py-2 px-2">ARPU</th>
                <th className="text-right py-2 px-2">Countries</th>
              </tr>
            </thead>
            <tbody>
              {geoData.regions.filter((r) => r.region !== "Other").map((r, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2 px-2 text-white/80">{r.region}</td>
                  <td className="py-2 px-2 text-white/50">{r.continent}</td>
                  <td className="py-2 px-2 text-right text-white/60">{r.users}</td>
                  <td className="py-2 px-2 text-right text-white/60">{r.engagement}%</td>
                  <td className="py-2 px-2 text-right text-emerald-400/70">{r.growthRate}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{r.execPercent}%</td>
                  <td className="py-2 px-2 text-right text-white/60">${r.mrr}</td>
                  <td className="py-2 px-2 text-right text-white/60">${r.arpu}</td>
                  <td className="py-2 px-2 text-right text-white/60">{r.countries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Section 10: EXEC™ Geographic Insights */}
      <GeographicAIInsights data={geoData} />
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