import React, { useState } from "react";
import { LayoutDashboard, Sparkles, Loader2, TrendingUp, TrendingDown, Activity, DollarSign, Building2, Target, Gauge, BarChart3, Percent } from "lucide-react";
import { KpiCard, SectionHeader, BetaBanner, AiInsightCard } from "./shared";
import { fmtCurrency, fmtNum } from "./shared";
import { buildIntelligencePrompt } from "@/lib/commercialRevenueEngine";
import { base44 } from "@/api/base44Client";

const TREND_RANGES = ["30 Days", "Quarter", "Year"];

export default function CommercialDashboard({ kpis, data }) {
  const [range, setRange] = useState("30 Days");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true); setInsights(null);
    try {
      const ctx = { mrr: kpis.mrr.value, arr: kpis.arr.value, totalCustomers: kpis.total_customers.value, enterpriseCustomers: kpis.enterprise_customers.value, pipelineValue: kpis.pipeline_value.value, acv: kpis.acv.value, collectedRevenue: kpis._meta.collectedRevenue, wonQuotes: kpis._meta.wonQuotes, beta: true };
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildIntelligencePrompt(ctx), response_json_schema: { type: "object", properties: { insights: { type: "array", items: { type: "object", properties: { insight: { type: "string" }, supportingMetrics: { type: "string" }, trendAnalysis: { type: "string" }, confidence: { type: "string" }, recommendedAction: { type: "string" } } } } } } });
      setInsights((res.data || res).insights);
    } catch {}
    setLoading(false);
  };

  const cards = [
    { ...kpis.arr, icon: DollarSign, color: "text-emerald-400" },
    { ...kpis.mrr, icon: Activity, color: "text-indigo-400" },
    { ...kpis.qrr, icon: BarChart3, color: "text-sky-400" },
    { ...kpis.total_customers, icon: Building2, color: "text-indigo-400" },
    { ...kpis.enterprise_customers, icon: Building2, color: "text-emerald-400" },
    { ...kpis.nrr, icon: Percent, color: "text-emerald-400" },
    { ...kpis.grr, icon: Percent, color: "text-emerald-400" },
    { ...kpis.expansion_revenue, icon: TrendingUp, color: "text-accent-orange" },
    { ...kpis.renewal_rate, icon: Target, color: "text-emerald-400" },
    { ...kpis.acv, icon: DollarSign, color: "text-indigo-400" },
    { ...kpis.ltv, icon: Gauge, color: "text-emerald-400" },
    { ...kpis.cac, icon: DollarSign, color: "text-amber-400" },
    { ...kpis.ltv_cac, icon: Percent, color: "text-emerald-400" },
    { ...kpis.gross_margin, icon: Percent, color: "text-emerald-400" },
    { ...kpis.growth_rate, icon: TrendingUp, color: "text-emerald-400" },
    { ...kpis.pipeline_value, icon: Target, color: "text-accent-orange" },
    { ...kpis.forecast_accuracy, icon: Gauge, color: "text-indigo-400" },
  ];

  return (
    <div>
      <SectionHeader icon={LayoutDashboard} title="Commercial Dashboard™" subtitle="The single executive view of how EXECLEAD.AI creates, expands, and retains recurring revenue." />
      <BetaBanner />
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Trends:</span>
        {TREND_RANGES.map((r) => <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded-full text-xs font-medium ${range === r ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-white/40 border border-transparent"}`}>{r}</button>)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c, i) => <KpiCard key={i} label={c.label} value={c.kind === "architecture" ? "—" : (c.label.includes("Revenue") || c.label.includes("Value") || c.label.includes("ACV") || c.label.includes("LTV") || c.label.includes("CAC") || c.label.includes("ARR") || c.label.includes("MRR") || c.label.includes("QRR") ? fmtCurrency(c.value) : fmtNum(c.value))} kind={c.kind} description={c.description} icon={c.icon} color={c.color} />)}
      </div>
      <div className="rounded-2xl border border-indigo-500/20 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Sparkles size={16} className="text-indigo-400" /><h3 className="text-white text-sm font-semibold">Commercial Intelligence™</h3></div>
          <button onClick={generateInsights} disabled={loading} className="inline-flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-lg">{loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate Insights</button>
        </div>
        <p className="text-white/45 text-xs mb-3">EXEC™ analyzes commercial behavior to surface expansion, retention, margin, and investment insights — grounded in real metrics.</p>
        {insights && <div className="space-y-2">{insights.map((x, i) => <AiInsightCard key={i} {...x} />)}</div>}
      </div>
    </div>
  );
}