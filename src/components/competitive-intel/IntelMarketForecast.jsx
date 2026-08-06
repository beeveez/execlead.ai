import React, { useState } from "react";
import { Telescope, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, BetaBanner } from "@/components/commercial-revenue/shared";
import { buildForecastPrompt, FORECAST_AREAS } from "@/lib/competitiveIntelligence";

const TYPE_COLOR = { Baseline: "text-sky-400 bg-sky-500/10 border-sky-500/25", Optimistic: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Pessimistic: "text-rose-400 bg-rose-500/10 border-rose-500/25", Alternative: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" };
const CONF_COLOR = { High: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Medium: "text-amber-400 bg-amber-500/10 border-amber-500/25", Low: "text-rose-400 bg-rose-500/10 border-rose-500/25", Unknown: "text-white/50 bg-white/5 border-white/10" };

export default function IntelMarketForecast({ forecasts, trends, competitors, onRefresh }) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildForecastPrompt({ trends, competitors }),
        response_json_schema: { type: "object", properties: { scenarios: { type: "array", items: { type: "object", properties: { scenario_name: { type: "string" }, forecast_area: { type: "string" }, scenario_type: { type: "string" }, assumption: { type: "string" }, summary: { type: "string" }, confidence: { type: "string" }, time_horizon: { type: "string" }, evidence_summary: { type: "string" } } } } } },
      });
      const scenarios = (res.data || res).scenarios || [];
      const today = new Date().toISOString().slice(0, 10);
      const records = scenarios.map((s) => ({
        scenario_name: s.scenario_name,
        forecast_area: FORECAST_AREAS.includes(s.forecast_area) ? s.forecast_area : "Executive Assessments",
        scenario_type: ["Baseline", "Optimistic", "Pessimistic", "Alternative"].includes(s.scenario_type) ? s.scenario_type : "Baseline",
        assumption: s.assumption, summary: s.summary, confidence: ["High", "Medium", "Low", "Unknown"].includes(s.confidence) ? s.confidence : "Medium",
        time_horizon: s.time_horizon, evidence_summary: s.evidence_summary, generated_by: "AI Scenario Engine", last_updated: today,
      }));
      if (records.length) { await base44.entities.MarketForecast.bulkCreate(records); onRefresh?.(); }
    } catch {}
    setGenerating(false);
  };

  return (
    <div>
      <SectionHeader icon={Telescope} title="Market Forecast™" subtitle="AI-identified future scenarios — increasing executive assessments, AI coaching growth, enterprise governance, Responsible AI adoption, executive analytics expansion. Every forecast is labeled Scenario, Assumption, and Confidence. Forecasts are never presented as facts." />
      <BetaBanner />
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/45 max-w-2xl">Scenarios are generated from verified market trends and competitor profiles only. Clearly labeled: Forecast · Scenario · Assumption · Confidence Level.</p>
        <button onClick={generate} disabled={generating} className="inline-flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-lg">{generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate Scenarios</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {forecasts.map((f) => (
          <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm text-white font-semibold">{f.scenario_name}</h3>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase whitespace-nowrap ${TYPE_COLOR[f.scenario_type] || TYPE_COLOR.Baseline}`}>{f.scenario_type}</span>
            </div>
            <div className="text-[10px] text-white/40 mb-2">{f.forecast_area} · Horizon {f.time_horizon || "—"} · Updated {f.last_updated || "—"}</div>
            {f.summary && <p className="text-xs text-white/60 mb-2">{f.summary}</p>}
            {f.assumption && <div className="text-[11px] text-amber-400/80 mb-1"><span className="font-semibold">Assumption:</span> {f.assumption}</div>}
            {f.evidence_summary && <div className="text-[11px] text-white/45 mb-2"><span className="font-semibold text-white/55">Evidence:</span> {f.evidence_summary}</div>}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-white/40">Confidence</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${CONF_COLOR[f.confidence] || CONF_COLOR.Unknown}`}>{f.confidence}</span>
              <span className="text-[10px] text-white/35 ml-auto">{f.generated_by || "AI Scenario Engine"}</span>
            </div>
          </div>
        ))}
        {forecasts.length === 0 && <p className="text-white/40 text-sm">No forecast scenarios yet. Generate AI scenarios from verified market trends.</p>}
      </div>
    </div>
  );
}