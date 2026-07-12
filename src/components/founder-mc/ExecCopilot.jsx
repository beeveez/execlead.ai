import React, { useState, useRef, useEffect } from "react";
import SectionCard from "./SectionCard";
import { Sparkles, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { buildCopilotPrompt } from "@/lib/founderMissionControl";

const SUGGESTIONS = [
  "What should I work on today?",
  "Are we ready for enterprise customers?",
  "What blocks public launch?",
  "Which stream is behind schedule?",
  "How healthy is the platform?",
  "What changed overnight?",
  "Estimate launch readiness.",
  "What are today's priorities?",
];

export default function ExecCopilot({ snapshot }) {
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
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildCopilotPrompt(snapshot, q),
        model: "automatic",
      });
      setResponse({ question: q, answer: typeof res === "string" ? res : JSON.stringify(res) });
    } catch (e) {
      setError(e?.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="EXEC™ Founder Copilot" subtitle="Ask any question about platform status" icon={Sparkles} accent="violet">
      <div ref={scrollRef} className="max-h-64 overflow-y-auto mb-3 space-y-3">
        {!response && !loading && (
          <div className="text-center py-4">
            <Sparkles size={20} className="text-violet-400/40 mx-auto mb-2" />
            <p className="text-white/40 text-sm">Ask EXEC™ about the platform's status, readiness, or priorities.</p>
          </div>
        )}
        {response && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-indigo-500/15 text-white/80 text-sm rounded-lg px-3 py-2 max-w-[85%]">{response.question}</div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/5 text-white/70 text-sm rounded-lg px-3 py-2 max-w-[85%] prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{response.answer}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-white/40 text-sm py-2">
            <Loader2 size={14} className="animate-spin text-violet-400" /> EXEC™ is analyzing…
          </div>
        )}
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTIONS.map((s) => (
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
          placeholder="Ask EXEC™ anything about the platform…"
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
        <button onClick={() => ask(question)} disabled={loading || !question.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white rounded-lg px-3 py-2 transition-colors">
          <Send size={14} />
        </button>
      </div>
    </SectionCard>
  );
}