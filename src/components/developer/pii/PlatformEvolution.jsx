import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, TrendingUp, Target, Clock, Sparkles, ArrowRight } from "lucide-react";

/**
 * Platform Evolution™ — AI-predicted trajectory
 * Shows Yesterday → Today → Next Target → Expected timeline.
 * AI analyzes domain scores, weaknesses, and recommendations to
 * predict the next realistic milestone and estimated time to reach it.
 */
export default function PlatformEvolution({ piq }) {
  const [yesterday, setYesterday] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch yesterday's score from PlatformStateEvent history
  useEffect(() => {
    let cancelled = false;
    const fetchYesterday = async () => {
      try {
        const events = await base44.entities.PlatformStateEvent.list("-created_date", 50);
        const now = new Date();
        const yesterdayCutoff = new Date(now);
        yesterdayCutoff.setDate(yesterdayCutoff.getDate() - 1);
        yesterdayCutoff.setHours(0, 0, 0, 0);

        // Find the most recent event from before today
        const yEvent = events.find((e) => new Date(e.created_date) < yesterdayCutoff);
        if (!cancelled) {
          setYesterday(yEvent?.health ?? null);
        }
      } catch {
        if (!cancelled) setYesterday(null);
      }
    };
    fetchYesterday();
    return () => { cancelled = true; };
  }, []);

  // AI prediction of next target and expected timeline
  useEffect(() => {
    let cancelled = false;
    const predict = async () => {
      setLoading(true);
      try {
        const domainSummary = piq.domains
          .map((d) => `${d.label.replace("™", "")}: ${d.score}%`)
          .join(", ");
        const weaknessSummary = piq.weaknesses
          .map((d) => `${d.label.replace("™", "")} (${d.score}%)`)
          .join(", ");
        const recSummary = piq.recommendations
          .slice(0, 5)
          .map((r) => r.recommendation)
          .join("; ");

        const prompt = `You are EXEC™, the platform's cognitive engine. Predict the platform's evolution trajectory.

Current Platform Intelligence Quotient (PIQ): ${piq.piqScore}
Current Maturity: ${piq.maturity.short} — ${piq.maturity.name}
Estimated available gain from fixing all weaknesses: +${piq.estGain} pts

Domain Scores:
${domainSummary}

Weakest Domains:
${weaknessSummary}

Top Recommendations:
${recSummary}

Based on the current trajectory, domain scores, and available improvements, predict:
1. next_target: The next realistic PIQ milestone the platform should aim for (must be higher than current ${piq.piqScore}, realistic given the estimated gain of +${piq.estGain} pts, and should target a maturity level threshold like 81 for L4 or 96 for L5).
2. expected_days: Estimated days to reach that target at the current rate of improvement.
3. rationale: One sentence explaining why this target and timeline are realistic.

Return as JSON.`;

        const res = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              next_target: { type: "number" },
              expected_days: { type: "number" },
              rationale: { type: "string" },
            },
          },
        });
        if (!cancelled) setPrediction(res);
      } catch {
        // Fallback: derive target from next maturity level threshold
        if (!cancelled) {
          const target = piq.piqScore >= 96 ? 100 : piq.piqScore >= 81 ? 96 : 81;
          setPrediction({
            next_target: target,
            expected_days: Math.max(1, Math.ceil((target - piq.piqScore) / Math.max(1, piq.estGain / 10))),
            rationale: `Targeting ${target} to reach the next maturity level.`,
          });
        }
      }
      if (!cancelled) setLoading(false);
    };
    predict();
    return () => { cancelled = true; };
  }, [piq.piqScore, piq.estGain]);

  const todayScore = piq.piqScore;
  const yesterdayScore = yesterday ?? todayScore - 2;
  const dailyDelta = todayScore - yesterdayScore;
  const nextTarget = prediction?.next_target ?? todayScore + 7;
  const expectedDays = prediction?.expected_days ?? 3;
  const targetGap = nextTarget - todayScore;
  const progressPct = Math.min(100, Math.round((todayScore / nextTarget) * 100));

  return (
    <div className="rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/8 via-violet-500/5 to-transparent p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <Brain size={14} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Platform Evolution™</h3>
          <p className="text-[10px] text-white/40">AI-predicted intelligence trajectory</p>
        </div>
        <span className="ml-auto text-[10px] text-indigo-400/60 flex items-center gap-1">
          <Sparkles size={10} /> EXEC™ Forecast
        </span>
      </div>

      {/* Evolution Timeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Yesterday */}
        <EvolutionCard
          label="Yesterday"
          value={yesterday != null ? yesterdayScore : "—"}
          icon={Clock}
          color="#64748b"
          sublabel={dailyDelta !== 0 ? `${dailyDelta > 0 ? "+" : ""}${dailyDelta} vs today` : "No change"}
          sublabelColor={dailyDelta > 0 ? "text-emerald-400" : dailyDelta < 0 ? "text-red-400" : "text-white/30"}
        />

        {/* Today */}
        <EvolutionCard
          label="Today"
          value={todayScore}
          icon={TrendingUp}
          color={piq.maturity.color}
          sublabel={piq.maturity.short}
          sublabelColor="text-white/60"
          highlighted
        />

        {/* Next Target */}
        <EvolutionCard
          label="Next Target"
          value={loading ? "…" : nextTarget}
          icon={Target}
          color="#a78bfa"
          sublabel={loading ? "AI predicting" : `+${targetGap} pts`}
          sublabelColor="text-violet-400"
        />

        {/* Expected */}
        <EvolutionCard
          label="Expected"
          value={loading ? "…" : `${expectedDays}d`}
          icon={Sparkles}
          color="#22d3ee"
          sublabel={loading ? "…" : expectedDays <= 2 ? "Imminent" : expectedDays <= 7 ? "This sprint" : "Multi-sprint"}
          sublabelColor="text-cyan-400"
        />
      </div>

      {/* Progress bar: Today → Next Target */}
      {!loading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5">
            <span>Trajectory to {nextTarget}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* AI Rationale */}
      {!loading && prediction?.rationale && (
        <div className="mt-3 flex items-start gap-2 text-[11px] text-white/50 bg-white/[0.02] rounded-lg p-2.5 border border-white/5">
          <Brain size={11} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <span>{prediction.rationale}</span>
        </div>
      )}
    </div>
  );
}

function EvolutionCard({ label, value, icon: Icon, color, sublabel, sublabelColor, highlighted }) {
  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        highlighted
          ? "bg-white/[0.05] border-white/15"
          : "bg-white/[0.02] border-white/5"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={11} style={{ color }} />
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white" style={{ color: highlighted ? color : undefined }}>
        {value}
      </div>
      <div className={`text-[10px] mt-0.5 ${sublabelColor}`}>{sublabel}</div>
    </div>
  );
}