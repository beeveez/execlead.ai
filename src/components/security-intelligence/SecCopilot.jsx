import React, { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildSecurityExecPrompt } from "@/lib/securityIntelligenceEngine";

const QUICK_QUESTIONS = [
  { label: "Why did tests fail?", context: "why_failed" },
  { label: "Show failing entities", context: "failing_entities" },
  { label: "What blocks deployment?", context: "blocking_deployment" },
  { label: "Highest security improvement?", context: "highest_improvement" },
  { label: "Generate Security Sprint", context: "security_sprint" },
];

export default function SecCopilot({ intel, title = "Ask EXEC™" }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (q, context) => {
    setLoading(true);
    setResponse("");
    try {
      const prompt = buildSecurityExecPrompt(intel, context || "why_failed");
      const fullPrompt = context
        ? prompt
        : `${prompt}\n\nUser Question: ${q}\n\nAnswer based ONLY on the live security telemetry above.`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        model: "gemini_3_flash",
      });
      setResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setResponse(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    ask(question, null);
  };

  return (
    <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-indigo-400 text-[10px] uppercase tracking-wider mb-3">
        <Sparkles size={12} /> {title}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q.context}
            onClick={() => ask(q.label, q.context)}
            disabled={loading}
            className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about security telemetry..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-[11px] text-white/80 placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
        />
        <button type="submit" disabled={loading || !question.trim()} className="px-3 py-1.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        </button>
      </form>
      {response && (
        <div className="bg-white/[0.02] border border-white/5 rounded p-3 text-[11px] text-white/60 max-h-48 overflow-y-auto whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}