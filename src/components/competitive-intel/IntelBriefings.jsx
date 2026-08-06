import React, { useState } from "react";
import { FileText, Sparkles, Loader2, Copy, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PERIODS = [
  { key: "weekly", label: "Weekly Executive Brief" },
  { key: "monthly", label: "Monthly Market Report" },
  { key: "quarterly", label: "Quarterly Strategy Review" },
];

export default function IntelBriefings({ competitors }) {
  const [period, setPeriod] = useState("weekly");
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setBrief(null);
    try {
      const compact = competitors.map((c) => `${c.company_name} (${c.category}, ${c.primary_market}): ${c.primary_value_proposition || "Not documented"}.`).join("\n");
      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI — the world's first AI Executive Leadership Operating System. Generate a ${period} executive briefing for Product, Sales, Marketing, and Executive Leadership using ONLY the competitor data below. Include: competitor snapshot, market trends, product evolution, threat assessment, opportunities, and strategic recommendations. Be factual; do NOT invent capabilities or pricing.\n\nCOMPETITORS:\n${compact}\n\nReturn JSON: { "competitorSnapshot": string, "marketTrends": string, "productEvolution": string, "threatAssessment": string, "opportunities": string, "strategicRecommendations": [string] }`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { competitorSnapshot: { type: "string" }, marketTrends: { type: "string" }, productEvolution: { type: "string" }, threatAssessment: { type: "string" }, opportunities: { type: "string" }, strategicRecommendations: { type: "array", items: { type: "string" } } } } });
      setBrief((res.data || res));
    } catch { setBrief(null); }
    setLoading(false);
  };

  const exportMd = () => {
    if (!brief) return;
    const md = `# EXECLEAD.AI ${PERIODS.find((p) => p.key === period).label}\n\n## Competitor Snapshot\n${brief.competitorSnapshot}\n\n## Market Trends\n${brief.marketTrends}\n\n## Product Evolution\n${brief.productEvolution}\n\n## Threat Assessment\n${brief.threatAssessment}\n\n## Opportunities\n${brief.opportunities}\n\n## Strategic Recommendations\n${(brief.strategicRecommendations || []).map((r) => `- ${r}`).join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `execlead-${period}-brief.md`; a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><FileText size={16} className="text-indigo-400" /><h2 className="text-lg font-semibold">Executive Briefings™</h2></div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white">
            {PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <button onClick={generate} disabled={loading} className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2 rounded-xl">{loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate</button>
        </div>
      </div>
      {brief && (
        <div className="space-y-3">
          <div className="flex justify-end gap-2">
            <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(brief, null, 2))} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-lg"><Copy size={12} /> Copy</button>
            <button onClick={exportMd} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-lg"><Download size={12} /> Export MD</button>
          </div>
          <Block label="Competitor Snapshot" v={brief.competitorSnapshot} />
          <Block label="Market Trends" v={brief.marketTrends} />
          <Block label="Product Evolution" v={brief.productEvolution} />
          <Block label="Threat Assessment" v={brief.threatAssessment} />
          <Block label="Opportunities" v={brief.opportunities} />
          {brief.strategicRecommendations?.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-1.5">Strategic Recommendations</div>
              <ul className="list-decimal list-inside text-[11px] text-white/70 space-y-0.5">{brief.strategicRecommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          <p className="text-white/35 text-[10px]">AI-generated briefing based solely on tracked competitor profiles. Not guarantees.</p>
        </div>
      )}
    </div>
  );
}

function Block({ label, v }) {
  if (!v) return null;
  return <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3"><div className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold mb-0.5">{label}</div><div className="text-xs text-white/70 leading-relaxed">{v}</div></div>;
}