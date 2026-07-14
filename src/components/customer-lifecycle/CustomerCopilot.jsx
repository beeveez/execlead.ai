import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, StatCard, EmptyState } from "./Shared";

const SUGGESTED_QUESTIONS = [
  "Who is at risk of churning?",
  "Who should graduate to champion?",
  "Which organizations are ready for Enterprise?",
  "Who should receive a Founder invitation?",
  "What's our overall customer health?",
  "Which customers need immediate attention?",
];

export default function CustomerCopilot({ data }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function ask(question) {
    if (!question.trim() || loading) return;
    const userMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const { customers, organizations, pipeline, journeyAnalytics, playbooks } = data;

    const summary = {
      totalCustomers: customers.length,
      avgHealth: customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.health.total, 0) / customers.length) : 0,
      atRisk: customers.filter((c) => ["critical", "high"].includes(c.health.riskLevel)),
      champions: customers.filter((c) => c.lifecycleStage === "champion"),
      enterpriseReady: organizations.filter((o) => o.avgHealth >= 65 && o.memberCount >= 3),
      powerUsers: customers.filter((c) => c.lifecycleStage === "power_user"),
      founderCandidates: customers.filter((c) => c.referralCount >= 2 || (c.reputation?.reputation_score > 300)),
      pipeline: pipeline.stages.map((s) => ({ stage: s.label, count: s.count, conversion: s.conversionRate })),
      journey: journeyAnalytics,
      playbooks: playbooks.total,
      organizations: organizations.length,
    };

    const prompt = `You are the EXEC™ Customer Copilot for EXECLEAD.AI. Answer the user's question based on this customer lifecycle data snapshot:

${JSON.stringify(summary, null, 2)}

Question: ${question}

Provide a concise, actionable answer. If listing customers, include names and key metrics. Focus on executive-level insights and recommendations.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { answer: { type: "string" } } },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer || res }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't process that request. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="At-Risk Customers" value={data.customers.filter((c) => ["critical", "high"].includes(c.health.riskLevel)).length} icon={Sparkles} accent="rose" />
        <StatCard label="Champions" value={data.customers.filter((c) => c.lifecycleStage === "champion").length} icon={Sparkles} accent="amber" />
        <StatCard label="Enterprise Ready" value={data.organizations.filter((o) => o.avgHealth >= 65).length} icon={Sparkles} accent="cyan" />
        <StatCard label="Founder Candidates" value={data.customers.filter((c) => c.referralCount >= 2 || (c.reputation?.reputation_score > 300)).length} icon={Sparkles} accent="purple" />
      </div>

      <SectionCard title="EXEC™ Customer Copilot" icon={Sparkles}>
        <div className="flex flex-col h-[400px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
            {messages.length === 0 ? (
              <EmptyState message="Ask a question about your customers" />
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0"><Bot size={14} className="text-indigo-400" /></div>}
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-indigo-500/20 text-white" : "bg-white/5 text-white/80"}`}>
                    {msg.content}
                  </div>
                  {msg.role === "user" && <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><User size={14} className="text-white/40" /></div>}
                </div>
              ))
            )}
            {loading && <div className="flex justify-start"><div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Bot size={14} className="text-indigo-400 animate-pulse" /></div></div>}
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => ask(q)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white/70 hover:bg-white/10 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(input)}
              placeholder="Ask about your customers…"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
            <button onClick={() => ask(input)} disabled={loading || !input.trim()}
              className="px-4 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-30 transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}