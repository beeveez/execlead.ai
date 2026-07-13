import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Send, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const SUGGESTED = [
  "Why is Metadata Completion only 36%?",
  "Which 20 fixes give the highest impact?",
  "Which missing entries block production?",
  "Generate remediation roadmap.",
  "Generate engineering sprint.",
  "Estimate remaining effort.",
];

function buildTelemetryContext(report) {
  return `LIVE METADATA TELEMETRY (use exclusively — never generalize):
- Overall Coverage: ${report.overallCoverage}%
- Route Coverage: ${report.routeCoverage.pct}% (${report.routeCoverage.complete}/${report.routeCoverage.total})
- Module Coverage: ${report.moduleCoverage.pct}% (${report.moduleCoverage.complete}/${report.moduleCoverage.total})
- Capability Coverage: ${report.capabilityCoverage.pct}% (${report.capabilityCoverage.complete}/${report.capabilityCoverage.total})
- Framework Coverage: ${report.frameworkCoverage.pct}% (${report.frameworkCoverage.complete}/${report.frameworkCoverage.total})
- Persona Coverage: ${report.personaCoverage.pct}% (${report.personaCoverage.complete}/${report.personaCoverage.total})
- Knowledge Coverage: ${report.knowledgeCoverage.pct}% (${report.knowledgeCoverage.covered}/${report.knowledgeCoverage.total})
- Manifest Findings: ${report.manifestValidation.totalFindings} (${report.manifestValidation.errors} errors, ${report.manifestValidation.warnings} warnings)
- Total Missing Entries: ${report.totalMissingEntries}
- Total Orphan Records: ${report.totalOrphanRecords}
- Orphan Routes: ${report.manifestValidation.orphanRoutes}
- Orphan Capabilities: ${report.manifestValidation.orphanCapabilities}
- Unregistered Personas: ${report.manifestValidation.unregisteredPersonas}
- Duplicate Routes: ${report.manifestValidation.duplicateRoutes}
- EXEC™ Explainability: ${report.explainabilityScore}%
- Platform Discoverability: ${report.discoverabilityScore}%
- Platform Governance: ${report.platformGovernanceScore}%
- Active Knowledge Packs: ${report.activeKnowledgePacks}
- Config Version: ${report.configVersion}`;
}

export default function MetadataCopilot({ report }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    const userMsg = { role: "user", content: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const prompt = `You are EXEC™, the AI operating system for EXECLEAD.AI. The founder is asking about Platform Metadata Completion.

${buildTelemetryContext(report)}

FOUNDER QUESTION: ${question}

Answer concisely in markdown. Reference specific numbers from the telemetry above. Never use these phrases unless they are a first-class measured metric: "systemic overhead", "integration latency", "reconciliation discrepancy", "hidden weighting", "unknown penalty", "baseline adjustment". Every claim must trace to a named registry with a specific number.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, model: "automatic" });
      const text = typeof res === "string" ? res : JSON.stringify(res);
      setMessages((m) => [...m, { role: "assistant", content: text }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${e?.message || "Failed to get response"}` }]);
      toast({ title: "EXEC™ error", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/10">
        <Brain size={14} className="text-violet-400" />
        <h4 className="text-xs font-medium text-white/80 uppercase tracking-wider">Ask EXEC™</h4>
        <span className="text-[10px] text-white/30 ml-auto">Answers from live metadata telemetry</span>
      </div>
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={m.role === "user" ? "bg-violet-600/20 border border-violet-500/20 rounded-lg px-3 py-2 max-w-[85%] text-xs text-white/80" : "bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 max-w-[85%]"}>
                {m.role === "user" ? <p className="text-xs">{m.content}</p> : <ReactMarkdown className="text-xs prose prose-invert prose-sm max-w-none">{m.content}</ReactMarkdown>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-violet-400" />
                <span className="text-xs text-white/40">EXEC™ analyzing telemetry…</span>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5">
        {SUGGESTED.map((q) => (
          <button key={q} onClick={() => ask(q)} disabled={loading}
            className="text-[10px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-full px-2.5 py-1 transition-colors disabled:opacity-40">
            {q}
          </button>
        ))}
      </div>
      <div className="px-4 py-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") ask(input); }}
          placeholder="Ask EXEC™ about metadata governance…"
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40"
        />
        <button onClick={() => ask(input)} disabled={loading || !input.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg px-3 py-2 transition-colors flex-shrink-0">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}