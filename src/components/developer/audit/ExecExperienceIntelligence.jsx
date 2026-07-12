import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { buildExecContext } from "@/lib/platformSelfHealingEngine";
import { Sparkles, Send, Loader2 } from "lucide-react";

const SUGGESTED = [
  "Why is the Experience Score low?",
  "What can be repaired automatically?",
  "How many findings remain?",
  "What is blocking production?",
  "Which modules repeatedly fail?",
  "Show the highest-risk issues.",
  "Estimate total repair time.",
  "Recommend the next engineering priority.",
];

export default function ExecExperienceIntelligence({ result }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    if (!q?.trim() || !result) return;
    setLoading(true);
    setAnswer("");
    try {
      const context = buildExecContext(result);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are EXEC™, the engineering intelligence assistant for EXECLEAD.AI. You are analyzing live platform audit telemetry. Answer the user's question concisely and specifically — reference actual findings, scores, and numbers from the data. If the data doesn't fully support an answer, say what you can and note the gap. Keep responses under 150 words.\n\n${context}\n\nUser question: ${q}`,
      });
      const text = typeof res === "string" ? res : (res?.output || res?.response || JSON.stringify(res));
      setAnswer(text);
    } catch {
      setAnswer("I couldn't analyze the audit data right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-indigo-400" />
        <h3 className="text-sm font-medium text-white">EXEC™ Experience Intelligence</h3>
        <span className="text-[10px] text-white/30 ml-1">Powered by live telemetry</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTED.map((q) => (
          <button key={q} onClick={() => { setQuestion(q); ask(q); }} disabled={loading}
            className="px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-indigo-500/10 text-white/50 hover:text-indigo-400 transition-colors border border-white/5 disabled:opacity-30">
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(question)}
          placeholder="Ask EXEC™ about platform health..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
        <button onClick={() => ask(question)} disabled={loading || !question.trim()}
          className="px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-sm flex items-center gap-1.5 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Ask
        </button>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-white/40 text-sm py-4">
          <Loader2 size={14} className="animate-spin" /> EXEC™ is analyzing live telemetry...
        </div>
      )}
      {answer && !loading && (
        <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-4 text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{answer}</div>
      )}
    </div>
  );
}