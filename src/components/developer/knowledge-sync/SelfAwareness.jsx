import React, { useState, useRef, useEffect } from "react";
import { Brain, Send, Loader2, Sparkles, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { buildSelfAwarenessPrompt } from "@/lib/execKnowledgeSyncEngine";

const SUGGESTED_QUESTIONS = [
  "What changed today?",
  "What new capabilities were added?",
  "Which modules changed?",
  "What is my current platform version?",
  "How healthy is the platform?",
  "What is still incomplete?",
  "What engineering work was completed?",
  "Which Knowledge Packs were refreshed?",
];

export default function SelfAwareness({ result }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [response, loading]);

  const ask = async (q) => {
    if (!q.trim() || loading || !result) return;
    setLoading(true);
    setError("");
    setQuestion("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildSelfAwarenessPrompt(result, q),
      });
      setResponse({ question: q, answer: typeof res === "string" ? res : JSON.stringify(res) });
    } catch (e) {
      setError(e?.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const history = result ? [] : [];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-400">
          <Brain size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">EXEC™ Self-Awareness</h3>
          <p className="text-[11px] text-white/40">EXEC™ answers using the latest synchronized platform state</p>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-64 overflow-y-auto mb-3 space-y-3">
        {!response && !loading && (
          <div className="text-center py-4">
            <Sparkles size={20} className="text-violet-400/40 mx-auto mb-2" />
            <p className="text-white/40 text-sm">Ask EXEC™ about platform changes, new capabilities, or current health.</p>
          </div>
        )}
        {response && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-violet-500/15 text-white/80 text-sm rounded-lg px-3 py-2 max-w-[85%]">{response.question}</div>
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
            <Loader2 size={14} className="animate-spin text-violet-400" /> EXEC™ is reasoning…
          </div>
        )}
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTED_QUESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)} disabled={loading || !result}
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
          placeholder="Ask EXEC™ about the platform…"
          disabled={loading || !result}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-50"
        />
        <button onClick={() => ask(question)} disabled={loading || !question.trim() || !result}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white rounded-lg px-3 py-2 transition-colors">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}