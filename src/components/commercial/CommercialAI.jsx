import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { buildCommercialContext } from "@/lib/commercialUtils";
import { Brain, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTED_QUESTIONS = [
  "Who is most likely to upgrade?",
  "Which users should I contact today?",
  "Which enterprise accounts need attention?",
  "What is preventing Professional users from upgrading?",
  "What is my current commercial health?",
  "What should I prioritize this week?",
];

const MD_COMPONENTS = {
  h1: ({ node, ...p }) => <h1 className="text-base font-bold text-white mt-3 mb-1" {...p} />,
  h2: ({ node, ...p }) => <h2 className="text-sm font-bold text-white mt-3 mb-1" {...p} />,
  p: ({ node, ...p }) => <p className="text-sm text-white/70 leading-relaxed mb-2" {...p} />,
  ul: ({ node, ...p }) => <ul className="list-disc list-inside space-y-1 text-sm text-white/70 mb-2" {...p} />,
  ol: ({ node, ...p }) => <ol className="list-decimal list-inside space-y-1 text-sm text-white/70 mb-2" {...p} />,
  strong: ({ node, ...p }) => <strong className="font-bold text-white" {...p} />,
};

export default function CommercialAI({ data }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const ask = async (q) => {
    if (!q.trim() || loading) return;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const context = buildCommercialContext(data);
      const prompt = `You are the Commercial Intelligence AI for EXECLEAD.AI, an executive leadership platform.

Here is the current commercial data snapshot from the Airtable CRM:
${context}

Answer the founder's question based on this data. Be specific, data-driven, and actionable. If the data doesn't fully support an answer, say so and suggest what additional data would help.

Founder's question: ${q}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const answer = typeof res === "string" ? res : res?.response || JSON.stringify(res);
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e?.message || "Failed to get response"}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-400" />
        <div>
          <h2 className="text-base font-semibold text-white">Commercial AI</h2>
          <p className="text-xs text-white/40">Ask any commercial question — powered by your Airtable CRM data</p>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map(q => (
            <button key={q} onClick={() => ask(q)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-xs text-white/60 hover:text-white/80 transition-colors">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {q}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="space-y-3 max-h-[500px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {msg.role === "user" ? (
              <div className="max-w-[80%] px-4 py-2 rounded-xl bg-indigo-500/20 text-sm text-white">{msg.content}</div>
            ) : (
              <div className="max-w-[85%] px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                <ReactMarkdown components={MD_COMPONENTS}>{msg.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(question)}
          placeholder="Ask about your commercial performance..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/40 transition-colors"
        />
        <button onClick={() => ask(question)} disabled={loading || !question.trim()} className="px-4 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}