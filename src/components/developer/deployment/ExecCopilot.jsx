import React, { useState } from "react";
import { Brain, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EXAMPLES = [
  "Why did this fail?",
  "What caused this warning?",
  "Show related issues.",
  "What's the fastest repair?",
  "Can Guardian repair this?",
  "Will this block production?",
];

export default function ExecCopilot({ context }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    const userMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const contextStr = typeof context === "string" ? context : JSON.stringify(context, null, 2).slice(0, 4000);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are EXEC™, the engineering intelligence copilot for the EXECLEAD.AI platform. A developer is asking about deployment pipeline diagnostics. Answer concisely (max 3 sentences). If the question is about a specific finding, reference its data.\n\nCURRENT DIAGNOSTICS CONTEXT:\n${contextStr}\n\nDEVELOPER QUESTION: ${question}`,
        response_json_schema: { type: "object", properties: { answer: { type: "string" } } },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer || res }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble analyzing that right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-white/10 bg-white/[0.02]">
      <div className="px-4 py-3 flex items-center gap-2">
        <Brain size={14} className="text-violet-400" />
        <span className="text-white/80 text-sm font-medium">Ask EXEC™</span>
        <span className="text-white/20 text-xs ml-auto">Engineering Copilot</span>
      </div>
      <div className="px-4 pb-2 max-h-40 overflow-y-auto space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 py-1">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => ask(ex)} className="text-xs text-white/50 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-2.5 py-1 transition-colors">
                {ex}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.role === "user" ? "text-white/70 text-right" : "text-violet-300/80"}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Loader2 size={12} className="animate-spin" /> EXEC™ is analyzing...
          </div>
        )}
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Ask EXEC™ about this stage..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400/40"
        />
        <button onClick={() => ask(input)} disabled={loading || !input.trim()} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white rounded-lg px-3 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}