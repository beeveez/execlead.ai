import React, { useMemo, useState } from "react";
import { Sparkles, Loader2, Send, TrendingUp, Target, AlertTriangle, FileText, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { computeEngineeringSummary, computeEngineeringTaskRegistry } from "@/lib/foundationCertificationEngine";

const SUGGESTED_QUESTIONS = [
  "Why is Foundation Certification only 86%?",
  "Which fixes produce the highest score gain?",
  "Show every failing module.",
  "Generate engineering sprint plan.",
  "Estimate remaining effort.",
  "Generate executive report summary.",
];

function buildTelemetryContext(cert) {
  const summary = computeEngineeringSummary(cert);
  const registry = computeEngineeringTaskRegistry(cert);
  const top5 = registry.tasks.slice(0, 5);

  return `FOUNDATION CERTIFICATION LIVE TELEMETRY:
- Current Score: ${summary.currentScore}%
- Certification Target: ${summary.certificationTarget}%
- Production Target: ${summary.productionTarget}%
- Remaining to Certification: ${summary.remainingPoints} pts
- Remaining to Production: ${summary.productionRemainingPoints} pts
- Remaining Tasks: ${summary.remainingTasks}
- Estimated Hours: ${summary.estimatedHours}h
- Blocking Domains: ${summary.blockingDomains.join(", ")}
- Confidence: ${summary.confidence}
- Trend: ${summary.trend.label}
- Total Score Gain Available: +${summary.totalScoreGain}%
- Max Potential Score: ${summary.maxPotentialScore}%
- Release Candidate Status: ${summary.releaseCandidateStatus}
- Execution Stage: ${summary.executionStage}

TOP 5 TASKS BY SCORE GAIN:
${top5.map((t, i) => `${i + 1}. ${t.task} — +${t.scoreGain}% gain, ${t.estimatedMinutes} min, ${t.roi}, ${t.difficulty}`).join("\n")}

CERTIFICATION METRICS:
${cert.metrics.map((m) => `- ${m.label}: ${m.value}%/${m.threshold}% ${m.passed ? "✓ PASS" : "✗ FAIL"}`).join("\n")}

FAILING MODULES:
${[...new Set(cert.verification.issues.map((i) => i.component))].slice(0, 15).join(", ")}`;
}

export default function ExecCopilot({ cert }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const telemetry = useMemo(() => buildTelemetryContext(cert), [cert]);

  const ask = async (q) => {
    setLoading(true);
    setResponse(null);
    setQuestion(q);
    try {
      const prompt = `You are EXEC™, the AI operating system for EXECLEAD.AI. Report platform state directly — do NOT address the user, do NOT use phrases like "the founder's inquiry is noted", "your question is", or any chatbot language. Communicate like an executive operations platform stating facts.

LIVE TELEMETRY (use this data exclusively — never generalize):
${telemetry}

QUESTION: ${q}

Answer in markdown. Report platform state directly. Every claim must reference a specific number from the telemetry above. Never use "systemic overhead", "reconciliation discrepancy", "hidden weighting", "baseline adjustment", or any vague language. Every point deducted must trace to a named module with a specific number.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, model: "automatic" });
      setResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setResponse(`Error: ${e?.message || "Failed to get response"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-400" />
        <h3 className="text-sm font-bold text-white">EXEC™ Copilot — Foundation Certification Intelligence™</h3>
        <span className="text-[10px] text-white/30 ml-auto">Answers from live telemetry only</span>
      </div>

      {/* Suggested questions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {q.includes("highest") ? <Zap size={11} /> : q.includes("failing") ? <AlertTriangle size={11} /> : q.includes("sprint") ? <Target size={11} /> : q.includes("effort") ? <TrendingUp size={11} /> : <FileText size={11} />}
            {q}
          </button>
        ))}
      </div>

      {/* Custom question */}
      <div className="flex gap-2 mb-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && question.trim()) ask(question); }}
          placeholder="Ask EXEC™ about Foundation Certification..."
          className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-violet-500/30"
        />
        <button
          onClick={() => question.trim() && ask(question)}
          disabled={loading || !question.trim()}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-xs font-medium transition-colors"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Ask
        </button>
      </div>

      {/* Response */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-violet-400 py-4">
          <Loader2 size={14} className="animate-spin" /> EXEC™ analyzing live telemetry...
        </div>
      )}
      {response && !loading && (
        <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}