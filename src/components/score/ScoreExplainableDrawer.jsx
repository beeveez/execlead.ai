import React, { useMemo, useState } from "react";
import { X, Target, TrendingUp, ChevronRight, Sparkles, Loader2, Calculator, Clock, Gauge, GitBranch, Link2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { computeScoreExplanation, buildWhyNot100Context } from "@/lib/scoreExplainableEngine";
import ContributionDiagnostics from "./ContributionDiagnostics";

export default function ScoreExplainableDrawer({ scoreId, snapshot, user, onClose }) {
  const [activeContribution, setActiveContribution] = useState(null);
  const [whyNotResponse, setWhyNotResponse] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);
  const explanation = useMemo(() => computeScoreExplanation(scoreId, snapshot), [scoreId, snapshot]);

  if (!explanation) return null;

  const handleWhyNot100 = async () => {
    setWhyLoading(true);
    setWhyNotResponse(null);
    try {
      const context = buildWhyNot100Context(scoreId, snapshot);
      const prompt = `You are EXEC™, the AI operating system for EXECLEAD.AI. The founder clicked "Why not 100%?" on the ${explanation.label} score.

LIVE SCORING TELEMETRY (use this data exclusively — never generalize):
${context}

FOUNDER QUESTION: Why is ${explanation.label} not 100%?

Answer concisely in markdown. Explain exactly which contributions are below target and how many points each contributes to the remaining gap. Cite specific scores, weights, and effort estimates from the telemetry. End with the top 3 actions to reach 100%. Do not use generic language — every claim must reference a number from the telemetry above.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, model: "automatic" });
      setWhyNotResponse(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setWhyNotResponse(`Error: ${e?.message || "Failed to get response"}`);
    } finally {
      setWhyLoading(false);
    }
  };

  const maxGap = Math.max(...explanation.contributions.map((c) => c.gapContribution), 1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0a0a0f] border-l border-white/10 flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg">{explanation.label}</h2>
              <p className="text-white/40 text-xs mt-0.5">{explanation.module} · Explainable Progress™</p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Current Score</div>
              <div className="text-2xl font-bold text-white">{explanation.currentScore}%</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Target</div>
              <div className="text-2xl font-bold text-white/70">{explanation.target}%</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Remaining</div>
              <div className="text-2xl font-bold" style={{ color: explanation.remaining > 0 ? "#f59e0b" : "#10b981" }}>
                {explanation.remaining > 0 ? `${explanation.remaining}%` : "✓"}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Scoring formula */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator size={14} className="text-indigo-400" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Scoring Formula</span>
            </div>
            <p className="text-xs text-white/60 font-mono leading-relaxed">{explanation.formula}</p>
          </div>

          {/* Points + projection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={12} className="text-emerald-400" />
                <span className="text-[10px] text-white/40 uppercase">Completed</span>
              </div>
              <div className="text-lg font-bold text-white">{explanation.completedPoints}<span className="text-xs text-white/30">/{explanation.target}</span></div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} className="text-amber-400" />
                <span className="text-[10px] text-white/40 uppercase">Remaining</span>
              </div>
              <div className="text-lg font-bold text-white">{explanation.remainingPoints}<span className="text-xs text-white/30"> pts</span></div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={12} className="text-blue-400" />
                <span className="text-[10px] text-white/40 uppercase">Projected</span>
              </div>
              <div className="text-sm font-bold text-white">{explanation.projectedCompletion}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Gauge size={12} className="text-violet-400" />
                <span className="text-[10px] text-white/40 uppercase">Confidence</span>
              </div>
              <div className="text-sm font-bold" style={{ color: explanation.confidence === "High" ? "#10b981" : explanation.confidence === "Medium" ? "#f59e0b" : "#ef4444" }}>{explanation.confidence}</div>
            </div>
          </div>

          {/* Engineering effort */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-2">
              <GitBranch size={13} className="text-indigo-400" />
              <span className="text-xs text-white/60">Engineering Effort Remaining</span>
            </div>
            <span className="text-sm font-bold text-white">{explanation.engineeringEffort}</span>
          </div>

          {/* Contribution Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-indigo-400" />
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Contribution Breakdown™</h3>
              <span className="text-[10px] text-white/30 ml-auto">Click any contribution for diagnostics</span>
            </div>
            <div className="space-y-2">
              {explanation.contributions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveContribution(c.id)}
                  className="w-full flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/70 font-medium truncate group-hover:text-indigo-300 transition-colors">{c.label}</span>
                      <span className="text-xs font-mono text-white/60">{c.score}/100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${(c.gapContribution / maxGap) * 100}%`,
                            backgroundColor: c.gap > 20 ? "#ef4444" : c.gap > 10 ? "#f59e0b" : "#3b82f6",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-white/40 w-10 text-right">{c.gapContribution}%</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Total Remaining Gap</span>
              <span className="text-sm font-bold text-amber-400">{explanation.remaining}%</span>
            </div>
          </div>

          {/* Why not 100%? */}
          <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
            <button
              onClick={handleWhyNot100}
              disabled={whyLoading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 transition-colors"
            >
              {whyLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span className="text-sm font-medium">Why not 100%?</span>
            </button>
            <p className="text-[10px] text-white/30 text-center mt-1.5">EXEC™ answers using live scoring telemetry — never generic AI text</p>
            {whyNotResponse && (
              <div className="mt-3 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{whyNotResponse}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Deep link */}
          <a href={explanation.deepLink} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
            <Link2 size={12} /> Open {explanation.module}
          </a>
        </div>
      </div>

      {/* Contribution Diagnostics */}
      {activeContribution && (
        <ContributionDiagnostics
          scoreId={scoreId}
          contributionId={activeContribution}
          snapshot={snapshot}
          user={user}
          onClose={() => setActiveContribution(null)}
        />
      )}
    </div>
  );
}