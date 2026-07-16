import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { buildCommercialContext } from "@/lib/commercialUtils";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

const MD_COMPONENTS = {
  h1: ({ node, ...p }) => <h1 className="text-lg font-bold text-white mt-4 mb-2" {...p} />,
  h2: ({ node, ...p }) => <h2 className="text-base font-bold text-white mt-4 mb-2" {...p} />,
  h3: ({ node, ...p }) => <h3 className="text-sm font-bold text-white/80 mt-3 mb-1" {...p} />,
  p: ({ node, ...p }) => <p className="text-sm text-white/70 leading-relaxed mb-2" {...p} />,
  ul: ({ node, ...p }) => <ul className="list-disc list-inside space-y-1 text-sm text-white/70 mb-2" {...p} />,
  ol: ({ node, ...p }) => <ol className="list-decimal list-inside space-y-1 text-sm text-white/70 mb-2" {...p} />,
  strong: ({ node, ...p }) => <strong className="font-bold text-white" {...p} />,
};

export default function FounderInsights({ data }) {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const context = buildCommercialContext(data);
      const prompt = `You are the Commercial Intelligence AI for EXECLEAD.AI, an executive leadership platform.

Here is today's commercial data snapshot from the Airtable CRM:
${context}

Generate a daily executive briefing for the founder. Structure your response with these sections:

## What Happened Today
Summarize the key metrics, notable changes, and significant events from today's data.

## Why It Happened
Analyze the trends, drivers, and patterns behind the numbers.

## What Should I Do Today
Provide 3-5 specific, prioritized action items based on the data.

## Biggest Commercial Risks
Identify 2-3 commercial risks with specific mitigation strategies.

## Opportunities to Pursue
Highlight 2-3 growth opportunities with rationale and next steps.

Be specific, data-driven, and actionable. Use the actual numbers from the data snapshot.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setBriefing(typeof res === "string" ? res : res?.response || JSON.stringify(res));
    } catch (e) {
      setError(e?.message || "Failed to generate briefing");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-semibold text-white">Founder Daily Briefing</h2>
            <p className="text-xs text-white/40">AI-generated executive summary of commercial performance</p>
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : briefing ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {briefing ? "Regenerate" : "Generate Briefing"}
        </button>
      </div>

      {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="ml-3 text-sm text-white/40">Generating executive briefing...</span>
        </div>
      )}

      {briefing && !loading && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <ReactMarkdown components={MD_COMPONENTS}>{briefing}</ReactMarkdown>
        </div>
      )}

      {!briefing && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="w-10 h-10 text-white/20 mb-3" />
          <p className="text-sm text-white/40">Click "Generate Briefing" to get your daily AI-powered commercial intelligence summary.</p>
        </div>
      )}
    </div>
  );
}