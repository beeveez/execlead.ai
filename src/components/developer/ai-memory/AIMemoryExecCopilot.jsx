import React, { useState, useRef, useEffect } from "react";
import { Brain, Send, Loader2, Sparkles, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

function buildContext(capability, intel) {
  return `You are EXEC™, the AI diagnostics copilot for EXECLEAD.AI.
Answer using ONLY the following live telemetry data. Be concise and actionable.

${capability.name} Telemetry:
- Current Score: ${intel.score}/${intel.target} (${intel.percentage}%)
- Remaining Gap: ${intel.remainingGap} points
- Potential Score Gain: +${intel.potentialScoreGain}
- Confidence: ${intel.confidence}
- Trend: ${intel.trend}
- Owner: ${intel.owner}

Contributing Dimensions:
${intel.dimensions.map((d) => `- ${d.label}: ${d.score}/${d.target} (gap: ${d.gap}, gain: +${d.potentialGain}, status: ${d.status})`).join("\n")}

Failure Registry:
${intel.failures.map((f) => `- [${f.severity}] ${f.issue} — Current: ${f.currentValue}, Target: ${f.targetValue}, Gain: +${f.potentialScoreGain}, Hours: ${f.estimatedHours}, Status: ${f.status}`).join("\n")}

Engineering Tasks:
${intel.tasks.map((t) => `- [${t.priority}] ${t.task} — Hours: ${t.estimatedHours}, Gain: +${t.potentialScoreGain}, Owner: ${t.owner}, Auto Repair: ${t.autoRepair ? "Yes" : "No"}, Status: ${t.status}`).join("\n")}`;
}

export default function AIMemoryExecCopilot({ intelligence, capability = { name: "AI Memory Intelligence™", shortName: "AI Memory" } }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const questions = [
    `Why is ${capability.shortName} only ${intelligence.score}/${intelligence.target}?`,
    "Show all failing validations.",
    "Which engineering task has highest impact?",
    "Generate remediation sprint.",
    "Estimate remaining effort.",
    "Generate executive report.",
  ];

  const ask = async (question) => {
    if (loading) return;
    const q = question || input.trim();
    if (!q) return;
    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: q }]);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildContext(capability, intelligence)}\n\nQuestion: ${q}\n\nAnswer concisely using only the telemetry above:`,
      });
      const answer = typeof res === "string"
        ? res
        : (res?.output || res?.data?.output || res?.data || "Unable to generate response.");
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${e.message || "Failed to get response."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Brain size={13} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">EXEC™ Analysis</h3>
          <p className="text-[10px] text-white/30">Answers use only live telemetry</p>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            disabled={loading}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-violet-500/5 border border-violet-500/15 text-violet-300 hover:bg-violet-500/10 transition-colors disabled:opacity-40"
          >
            <Sparkles size={9} />
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                m.role === "user"
                  ? "bg-violet-500/10 border border-violet-500/20 text-white/80"
                  : "bg-white/[0.02] border border-white/5 text-white/70"
              }`}>
                {m.role === "user" && <User size={10} className="inline mr-1 text-violet-400" />}
                {m.role === "assistant" && <Brain size={10} className="inline mr-1 text-violet-400" />}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <Loader2 size={12} className="animate-spin text-violet-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder={`Ask EXEC™ about ${capability.shortName}…`}
          disabled={loading}
          className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-violet-500/40 disabled:opacity-50"
        />
        <button
          onClick={() => ask()}
          disabled={loading || !input.trim()}
          className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-30"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        </button>
      </div>
    </div>
  );
}