import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Sparkles, RefreshCw } from "lucide-react";

/**
 * EXEC™ Executive Summary
 * Generates a CTO-level narrative briefing of the platform's intelligence state.
 * EXEC™ AI synthesizes PIQ score, domain strengths/weaknesses, recommendations,
 * foundation certification status, and metadata gaps into a single readable summary
 * that tells a technical executive exactly what matters, what to fix, and what happens next.
 */
export default function ExecutiveSummary({ piq }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const domainSummary = piq.domains
        .map((d) => `${d.label.replace("™", "")}: ${d.score}%`)
        .join(", ");
      const weaknessSummary = piq.weaknesses
        .map((d) => `${d.label.replace("™", "")} (${d.score}%)`)
        .join(", ");
      const strengthSummary = piq.strengths
        .map((d) => `${d.label.replace("™", "")} (${d.score}%)`)
        .join(", ");
      const recSummary = piq.recommendations
        .slice(0, 5)
        .map((r) => r.recommendation)
        .join("; ");
      const metadataMissing = piq.metadataMissingEntries != null ? piq.metadataMissingEntries : "unknown";

      const prompt = `You are EXEC™, the platform's cognitive engine. Write an Executive Summary briefing for a CTO or platform founder.

Platform Intelligence Data:
- Platform IQ™ (PIQ): ${piq.piqScore} / 100
- Maturity Level: ${piq.maturity.short} — ${piq.maturity.name}
- AI Readiness: ${piq.aiReadiness}%
- Foundation Readiness: ${piq.foundationReadiness}%
- Foundation Certified: ${piq.foundationCertified ? "Yes" : "No (blocked)"}
- EXEC™ Confidence: ${piq.execConfidence}%
- Estimated available gain: +${piq.estGain} pts

Domain Scores:
${domainSummary}

Top Strengths:
${strengthSummary}

Weakest Domains:
${weaknessSummary}

Missing metadata entries: ${metadataMissing}

Top Recommendations:
${recSummary}

Write a concise executive briefing (4-6 sentences) that a CTO can read in 10 seconds. Rules:
1. Start with a one-sentence operational status (e.g., "The platform is operational." or "The platform requires attention before release.").
2. Acknowledge what is strong (knowledge architecture, registry sync, etc.).
3. Identify the largest limiting factor and quantify the opportunity (e.g., "Completing metadata registration is projected to increase Platform IQ by X points").
4. State foundation certification status and what blocks it.
5. Estimate time to certification or next milestone (e.g., "Estimated time to certification: 2 hours").
6. Be direct, professional, and specific — no fluff, no hedging.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            briefing: { type: "string" },
            status_label: {
              type: "string",
              description: "Short status: operational, attention_required, or critical",
            },
            projected_gain: { type: "number" },
            time_to_certification: { type: "string" },
          },
        },
      });
      setSummary(res);
    } catch {
      // Fallback: deterministic briefing from available data
      const weakest = piq.weaknesses[0];
      const status = piq.piqScore >= 75 ? "operational" : "attention_required";
      setSummary({
        briefing: `The platform is ${status}. ${
          piq.strengths.length > 0
            ? `${piq.strengths[0].label.replace("™", "")} is strong at ${piq.strengths[0].score}%.`
            : "Core systems are functional."
        } ${weakest ? `${weakest.label.replace("™", "")} remains the largest limiting factor at ${weakest.score}%.` : ""} ${
          piq.foundationCertified
            ? "Foundation Certification is active."
            : "Foundation Certification remains blocked by metadata completeness."
        } Completing remaining improvements is projected to increase Platform IQ by ${piq.estGain} points.`,
        status_label: status,
        projected_gain: piq.estGain,
        time_to_certification: piq.foundationCertified ? "Certified" : "2-4 hours",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    generateSummary();
  }, [piq.piqScore]);

  const statusConfig = {
    operational: { color: "#10b981", label: "Operational" },
    attention_required: { color: "#f59e0b", label: "Attention Required" },
    critical: { color: "#ef4444", label: "Critical" },
  };
  const status = statusConfig[summary?.status_label] || statusConfig.operational;

  return (
    <div className="rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/8 via-violet-500/5 to-transparent p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <Brain size={14} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Executive Summary</h3>
          <p className="text-[10px] text-white/40">EXEC™ cognitive briefing</p>
        </div>
        {summary && (
          <span
            className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-md border"
            style={{ color: status.color, borderColor: `${status.color}40`, backgroundColor: `${status.color}10` }}
          >
            {status.label}
          </span>
        )}
        <button
          onClick={generateSummary}
          disabled={loading}
          className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
          title="Regenerate summary"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-3">
          <Sparkles size={14} className="text-indigo-400 animate-pulse" />
          <p className="text-white/40 text-sm">EXEC™ is analyzing platform intelligence...</p>
        </div>
      ) : summary ? (
        <div>
          <p className="text-sm text-white/75 leading-relaxed">{summary.briefing}</p>
          {(summary.projected_gain != null || summary.time_to_certification) && (
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/5">
              {summary.projected_gain != null && summary.projected_gain > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Projected Gain</span>
                  <span className="text-sm font-bold text-violet-400">+{summary.projected_gain} pts</span>
                </div>
              )}
              {summary.time_to_certification && !piq.foundationCertified && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Est. to Certification</span>
                  <span className="text-sm font-bold text-cyan-400">{summary.time_to_certification}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}