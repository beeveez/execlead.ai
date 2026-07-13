import React, { useMemo, useState } from "react";
import { Sparkles, Loader2, Send, AlertCircle, Zap, Target, FileText, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { computeMetadataScorecard, computeMetadataEngineeringTasks, computeMetadataRiskMatrix } from "@/lib/metadataIntelligenceEngine";
import { buildMissingEntriesTable } from "@/lib/metadataCompletionEngine";

const SUGGESTED_QUESTIONS = [
  "Why is Metadata Coverage only 36%?",
  "Show all missing metadata.",
  "Which fixes have the highest impact?",
  "Generate Metadata Sprint.",
  "Estimate completion using current engineering velocity.",
  "Generate Executive Report.",
  "Generate Engineering Report.",
];

function buildTelemetryContext(report) {
  const sc = computeMetadataScorecard(report);
  const tasks = computeMetadataEngineeringTasks(report);
  const risks = computeMetadataRiskMatrix(report);
  const entries = buildMissingEntriesTable(report);
  const top5 = tasks.tasks.slice(0, 5);

  return `METADATA INTELLIGENCE LIVE TELEMETRY:
- Current Coverage: ${sc.currentCoverage}%
- Target: ${sc.target}%
- Remaining: ${sc.remaining}%
- Registered Assets: ${sc.registeredAssets}
- Discovered Assets: ${sc.discoveredAssets}
- Missing Metadata: ${sc.missingMetadata}
- Missing Registries: ${sc.missingRegistries}
- Missing Manifest Entries: ${sc.missingManifestEntries}
- Missing Relationships: ${sc.missingRelationships}
- Confidence: ${sc.confidence}
- Trend: ${sc.trend.label}
- Estimated Completion: ${sc.estimatedCompletion}
- Total Score Gain Available: +${tasks.totalScoreGain}%
- Max Potential Coverage: ${tasks.maxPotentialScore}%
- Total Engineering Hours: ${tasks.totalHours}h

REGISTRY COVERAGE:
- Routes: ${report.routeCoverage.pct}% (${report.routeCoverage.complete}/${report.routeCoverage.total})
- Modules: ${report.moduleCoverage.pct}% (${report.moduleCoverage.complete}/${report.moduleCoverage.total})
- Capabilities: ${report.capabilityCoverage.pct}% (${report.capabilityCoverage.complete}/${report.capabilityCoverage.total})
- Frameworks: ${report.frameworkCoverage.pct}% (${report.frameworkCoverage.complete}/${report.frameworkCoverage.total})
- Personas: ${report.personaCoverage.pct}% (${report.personaCoverage.complete}/${report.personaCoverage.total})
- Knowledge: ${report.knowledgeCoverage.pct}% (${report.knowledgeCoverage.covered}/${report.knowledgeCoverage.total})

TOP 5 FIXES BY SCORE GAIN:
${top5.map((t, i) => `${i + 1}. ${t.task} — +${t.scoreGain}% gain, ${t.estimatedHours}h, ${t.roi}, ${t.difficulty}`).join("\n")}

ACTIVE RISKS (${risks.length}):
${risks.map((r) => `- ${r.label} (${r.severity}): ${r.description}`).join("\n")}

MISSING ENTRIES BY TYPE:
${["Route", "Module", "Persona", "Knowledge Entry"].map((t) => `- ${t}: ${entries.filter((e) => e.type === t).length}`).join("\n")}`;
}

export default function MetadataExecCopilot({ report }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const telemetry = useMemo(() => buildTelemetryContext(report), [report]);

  const ask = async (q) => {
    setLoading(true);
    setResponse(null);
    setQuestion(q);
    try {
      const prompt = `You are EXEC™, the AI operating system for EXECLEAD.AI. Report platform state directly — do NOT address the user, do NOT use phrases like "the founder's inquiry is noted", "your question is", or any chatbot language. Communicate like an executive operations platform stating facts.

LIVE METADATA TELEMETRY (use this data exclusively — never generalize):
${telemetry}

QUESTION: ${q}

Answer in markdown. Report platform state directly. Every claim must reference a specific number from the telemetry above. If asked about completion timelines or engineering velocity, state "Awaiting telemetry" since velocity is not yet tracked. Never use vague language — every point must trace to a named registry or asset.`;
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
        <h3 className="text-sm font-bold text-white">EXEC™ Copilot — Metadata Intelligence™</h3>
        <span className="text-[10px] text-white/30 ml-auto">Answers from live telemetry only</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button key={q} onClick={() => ask(q)} disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 disabled:opacity-50 transition-colors flex items-center gap-1.5">
            {q.includes("impact") ? <Zap size={11} /> : q.includes("Sprint") ? <Target size={11} /> : q.includes("missing") ? <AlertCircle size={11} /> : q.includes("completion") ? <TrendingUp size={11} /> : q.includes("Report") ? <FileText size={11} /> : <Sparkles size={11} />}
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && question.trim()) ask(question); }} placeholder="Ask EXEC™ about metadata coverage..."
          className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-violet-500/30" />
        <button onClick={() => question.trim() && ask(question)} disabled={loading || !question.trim()}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-xs font-medium transition-colors">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Ask
        </button>
      </div>

      {loading && <div className="flex items-center gap-2 text-xs text-violet-400 py-4"><Loader2 size={14} className="animate-spin" /> EXEC™ analyzing live metadata telemetry...</div>}
      {response && !loading && (
        <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}