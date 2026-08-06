import React, { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SUGGESTIONS = [
  "Compare EXECLEAD.AI with BetterUp",
  "How should we position against CoachHub?",
  "What makes us different from Valence?",
  "Which enterprise personas should we target?",
  "Which competitor overlaps most with our roadmap?",
];

export default function IntelAiAssistant({ competitors }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async (question) => {
    const query = question || q;
    if (!query.trim()) return;
    setLoading(true); setAnswer(null);
    try {
      const compact = competitors.map((c) => `${c.company_name} (${c.category}, ${c.primary_market}): ${c.primary_value_proposition || "Not documented"}. Strengths: ${c.strengths || "Not documented"}. Limitations: ${c.limitations || "Not documented"}.`).join("\n");
      const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI — the world's first AI Executive Leadership Operating System (Executive Readiness™, simulations, succession, decision intelligence, evidence-based identity). Answer the user's question using ONLY the verified competitor profiles below and EXECLEAD.AI's positioning. Be factual and concise. If information is not in the profiles, say it is not publicly documented rather than guessing.\n\nEXECLEAD.AI positioning: AI-native Executive Leadership Operating System — Executive Readiness™, AI Coaching, Leadership Simulations, Succession Planning, Decision Intelligence, Executive Identity™, evidence-based development, enterprise governance.\n\nCOMPETITOR PROFILES:\n${compact}\n\nUSER QUESTION: ${query}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: "object", properties: { answer: { type: "string" } } } });
      setAnswer((res.data || res).answer || "No response.");
    } catch { setAnswer("The AI positioning assistant is temporarily unavailable. Please try again."); }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Sparkles size={16} className="text-amber-400" /><h2 className="text-lg font-semibold">AI Positioning Assistant™</h2></div>
      <p className="text-white/45 text-xs mb-4">Ask product, sales, and founder questions. Answers are grounded in verified competitor profiles and internal positioning — never invented.</p>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="Ask a positioning question…" className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40" />
        <button onClick={() => ask()} disabled={loading} className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-sm font-semibold px-4 py-2.5 rounded-xl">{loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map((s) => <button key={s} onClick={() => { setQ(s); ask(s); }} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white/80">{s}</button>)}
      </div>
      {answer && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-1.5"><Sparkles size={11} /> EXEC™ Insight</div>
          <p className="text-xs text-white/75 leading-relaxed">{answer}</p>
          <p className="text-white/35 text-[10px] mt-2">Grounded in verified competitor profiles. Not guarantees.</p>
        </div>
      )}
    </div>
  );
}