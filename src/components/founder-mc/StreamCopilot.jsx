import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { buildStreamCopilotContext } from "@/lib/streamIntelligenceEngine";

const SUGGESTIONS = (streamName, score, target) => [
  `Why is ${streamName} only ${score}%?`,
  `What must be completed to reach ${target}%?`,
  `What are the top blockers for ${streamName}?`,
  `How much engineering effort is needed to hit target?`,
  `What is the trend for ${streamName}?`,
  `Which dependencies are blocking progress?`,
];

export default function StreamCopilot({ streamId, streamName, currentScore, targetScore, snapshot }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [response, loading]);

  const ask = async (q) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError("");
    setQuestion("");
    try {
      const telemetry = buildStreamCopilotContext(streamId, snapshot);
      const prompt = `You are EXEC™, the AI operating system for EXECLEAD.AI. A founder is asking about the "${streamName}" execution stream.

LIVE STREAM TELEMETRY (use this data, do not generalize):
${telemetry}

FOUNDER QUESTION: ${q}

Answer concisely in markdown. Reference the actual scores, blocker counts, and effort estimates from the telemetry above. If asked about reaching a target, cite the specific blockers and their estimated effort. If asked "why is it only X%", cite the actual blockers and their root causes. Be direct and data-driven.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, model: "automatic" });
      setResponse({ question: q, answer: typeof res === "string" ? res : JSON.stringify(res) });
    } catch (e) {
      setError(e?.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = SUGGESTIONS(streamName, currentScore, targetScore);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">EXEC™ Stream Copilot</span>
        <span className="text-[10px] text-white/30 ml-auto">Powered by live telemetry</span>
      </div>

      <div ref={scrollRef} className="max-h-56 overflow-y-auto mb-3 space-y-2">
        {!response && !loading && (
          <div className="text-center py-4">
            <Sparkles size={18} className="text-violet-400/40 mx-auto mb-2" />
            <p className="text-white/40 text-xs">Ask EXEC™ about {streamName} — scores, blockers, effort, or what's needed to reach target.</p>
          </div>
        )}
        {response && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-violet-500/15 text-white/80 text-xs rounded-lg px-3 py-1.5 max-w-[85%]">{response.question}</div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/5 text-white/70 text-xs rounded-lg px-3 py-2 max-w-[85%] prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{response.answer}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-white/40 text-xs py-2">
            <Loader2 size={13} className="animate-spin text-violet-400" /> EXEC™ is analyzing live telemetry…
          </div>
        )}
        {error && <div className="text-red-400 text-xs">{error}</div>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestions.map((s) => (
          <button key={s} onClick={() => ask(s)} disabled={loading}
            className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors disabled:opacity-30">
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(question)}
          placeholder={`Ask about ${streamName}…`}
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
        <button onClick={() => ask(question)} disabled={loading || !question.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white rounded-lg px-3 py-2 transition-colors">
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}