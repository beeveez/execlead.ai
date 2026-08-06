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
      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI. Analyze this Enterprise Leadership ROI calculation and provide 3-4 strategic planning observations for an enterprise buyer (CHRO/CFO). Be concise, executive, and value-focused. Do NOT guarantee outcomes. Reference specific numbers from the data.\n\nORG: ${inputs.organizationName || "—"} | Leadership population: ${inputs.leadershipPopulation} | Assessments/yr: ${inputs.assessmentsPerYear} | Coaching budget: $${inputs.executiveCoachingBudget} | Executive recruitment: $${inputs.executiveRecruitmentBudget} | Avg hiring cost: $${inputs.avgExecutiveHiringCost} | Promotion decisions/yr: ${inputs.promotionDecisions} | Current coaching coverage: ${inputs.currentCoachingCoveragePct}% | Internal promotion: ${inputs.internalPromotionPct}% | External hiring: ${inputs.externalExecutiveHiringPct}%\n\nRESULTS: Annual gross value $${roi.annualGrossValue} | Net impact $${roi.annualNetValue} | 3-yr ROI ${roi.threeYearROI}% | Admin hours saved ${roi.totalHoursSaved} | AI coaching capacity ${roi.aiCoachingCapacity} | Coverage ${roi.currentCoachingCoveragePct}%→${roi.newCoveragePct}% | Hiring savings $${roi.executiveHiringSavings} | Internal promotion opportunity ${roi.internalPromotionOpportunity}\n\nReturn JSON: { "insights": [string, ...] }`;
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
      <p className="text-white/45 text-[11px] mb-3">AI-generated planning insights based solely on the information you provided. These are estimates intended to support business planning and are not guarantees.</p>
      {loading ? (
        <div className="flex items-center gap-2 text-white/50 text-xs"><Loader2 size={14} className="animate-spin" /> Analyzing your results…</div>
      ) : error ? (
        <div className="flex items-center gap-2 text-rose-400 text-xs"><AlertCircle size={14} /> Insights unavailable. <button onClick={generate} className="underline">Retry</button></div>
      ) : (
        <ul className="space-y-2">
          {insights.map((ins, i) => (
            <li key={i} className="flex items-start gap-2 text-white/70 text-xs leading-relaxed"><span className="text-amber-400 mt-0.5">•</span> {ins}</li>
          ))}
        </ul>
      )}
    </div>
  );
}