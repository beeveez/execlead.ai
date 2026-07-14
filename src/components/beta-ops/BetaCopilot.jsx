import React, { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";

const SUGGESTIONS = [
  "Who should we invite next?",
  "Which beta users are at risk?",
  "Which organizations are most engaged?",
  "Summarize today's feedback.",
  "Generate this week's beta report.",
  "What is our current beta health score?",
];

export default function BetaCopilot({ data }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const buildContext = () => {
    if (!data) return "No beta data available.";
    const d = data.dashboard;
    return [
      `BETA OPERATIONS SUMMARY:`,
      `Applications: ${d.applicationsReceived} (Pending: ${d.pendingReview}, Approved: ${d.approved}, Invited: ${d.invited}, Activated: ${d.activated})`,
      `Active Users: DAU ${d.dailyActive}, WAU ${d.weeklyActive}, MAU ${d.monthlyActive}`,
      `Completion Rate: ${d.completionRate}%, Retention: ${d.retentionRate}%`,
      `NPS: ${d.nps || "—"}, Feedback: ${d.feedbackReceived}, Bugs: ${d.bugReports}, Features: ${d.featureRequests}`,
      `Beta Health Score: ${d.betaHealthScore}/100`,
      `At-Risk Users: ${data.atRiskUsers?.length || 0}`,
      `Recommendations: ${data.recommendations?.map((r) => r.title).join("; ") || "None"}`,
    ].join("\n");
  };

  const ask = async (q) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setQuestion("");
    try {
      const prompt = `You are EXEC™ Beta Copilot, the AI assistant for EXECLEAD.AI's Founding Private Beta operations. Answer the question using the live beta telemetry below.

LIVE BETA TELEMETRY:
${buildContext()}

QUESTION: ${q}

Answer concisely in markdown. Reference actual numbers from the telemetry.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, model: "automatic" });
      setResponse({ question: q, answer: typeof res === "string" ? res : JSON.stringify(res) });
    } catch {
      setResponse({ question: q, answer: "Failed to get response. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">EXEC™ Beta Copilot</span>
        <span className="text-[10px] text-white/30 ml-auto">Powered by live beta telemetry</span>
      </div>

      <div className="max-h-64 overflow-y-auto mb-3 space-y-2">
        {!response && !loading && (
          <div className="text-center py-6">
            <Sparkles size={20} className="text-violet-400/40 mx-auto mb-2" />
            <p className="text-white/40 text-xs">Ask about beta operations — users, health, feedback, or what to do next.</p>
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
            <Loader2 size={13} className="animate-spin text-violet-400" /> EXEC™ is analyzing beta telemetry…
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)} disabled={loading} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors disabled:opacity-30">{s}</button>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(question)} placeholder="Ask about beta operations…" disabled={loading} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
        <button onClick={() => ask(question)} disabled={loading || !question.trim()} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white rounded-lg px-3 py-2 transition-colors">
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}