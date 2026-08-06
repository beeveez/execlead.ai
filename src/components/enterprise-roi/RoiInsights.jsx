import React, { useEffect, useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RoiInsights({ inputs, roi, onInsights }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(false);
    try {
      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI. Analyze this Enterprise Leadership ROI calculation and provide 3-4 strategic observations for an enterprise buyer (CHRO/CFO). Be concise, executive, and value-focused. Do NOT guarantee outcomes. Mark these as planning estimates.\n\nORG: ${inputs.organizationName || "—"} | Leadership population: ${inputs.leadershipPopulation} | Assessments/yr: ${inputs.assessmentsPerYear} | Coaching budget: $${inputs.executiveCoachingBudget} | External recruitment: $${inputs.externalRecruitmentSpend} | Avg hiring cost: $${inputs.avgExecutiveHiringCost} | Promotion decisions/yr: ${inputs.promotionDecisionsPerYear}\n\nRESULTS: Annual gross value $${roi.annualGrossValue} | Net impact $${roi.annualNetValue} | 3-yr ROI ${roi.threeYearROI}% | Admin hours saved ${roi.totalHoursSaved} | Coaching capacity ${roi.newCoachingCapacity} | Coverage ${roi.coverageNewPct}% | Hiring savings $${roi.hiringSavings}\n\nReturn JSON: { "insights": [string, string, ...] }`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { insights: { type: "array", items: { type: "string" } } } },
      });
      const data = res.data || res;
      setInsights(data.insights || []);
      onInsights?.(data.insights || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={15} className="text-amber-400" />
        <h3 className="text-white text-sm font-semibold">AI Executive Insights™</h3>
      </div>
      <p className="text-white/45 text-[11px] mb-3">
        AI-generated observations based on the information you provided. These are estimates for planning purposes and not guarantees.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-white/50 text-xs"><Loader2 size={14} className="animate-spin" /> Analyzing your results…</div>
      ) : error ? (
        <div className="flex items-center gap-2 text-rose-400 text-xs"><AlertCircle size={14} /> Insights unavailable. <button onClick={generate} className="underline">Retry</button></div>
      ) : (
        <ul className="space-y-2">
          {insights.map((ins, i) => (
            <li key={i} className="flex items-start gap-2 text-white/70 text-xs leading-relaxed">
              <span className="text-amber-400 mt-0.5">•</span> {ins}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}