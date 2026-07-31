import React from "react";
import { motion } from "framer-motion";
import {
  Target, TrendingUp, Shield, Sparkles, Crown, Brain, Users,
  AlertTriangle, CheckCircle2, ArrowUpRight, FileText, Compass,
} from "lucide-react";

// Simulation Intelligence Report™ — shared, explainable results surface for
// Executive Simulator™, Executive Debate™, and Executive Council™.
// Pure presentational; receives the evaluateSimulation() result.
export default function SimulationIntelligenceReport({ result, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Evaluating demonstrated leadership…</p>
        <p className="text-white/30 text-xs mt-1">Scoring competencies, generating evidence, and preparing coaching feedback.</p>
      </div>
    );
  }
  if (!result) return null;

  const competencies = result.competencyEvaluations || [];
  const decisionDims = result.decisionIntelligence || [];
  const coaching = result.coachingFeedback || {};
  const readiness = result.readinessGain || {};
  const evidence = result.evidenceRecord || {};
  const council = result.councilReport;
  const debate = result.debateEvaluation;
  const avgScore = competencies.length
    ? Math.round(competencies.reduce((s, c) => s + (c.score || 0), 0) / competencies.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header / Decision Summary */}
      <div className="rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] via-white/[0.02] to-transparent p-5">
        <div className="flex items-center gap-2 mb-2">
          <Compass size={15} className="text-accent-orange" />
          <span className="text-[10px] uppercase tracking-wider text-accent-orange/80 font-semibold">{result.simulationType || "Executive Simulation Intelligence™"}</span>
          <span className="ml-auto text-2xl font-bold text-white">{avgScore}<span className="text-sm text-white/40">/100</span></span>
        </div>
        <p className="text-[13px] text-white/70 leading-relaxed">{result.decisionSummary}</p>
      </div>

      {/* Executive Readiness™ Gain */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Readiness Gain" value={`+${readiness.points || 0}`} sub="points" tone="accent" />
        <StatCard icon={CheckCircle2} label="Competencies Improved" value={readiness.competenciesImproved?.length || 0} sub="demonstrated" />
        <StatCard icon={Sparkles} label="Confidence Increase" value={`+${readiness.confidenceIncrease || 0}`} sub="points" />
        <StatCard icon={Crown} label="Simulation Impact" value={readiness.simulationImpact || "—"} sub="on your journey" />
      </div>

      {/* Competency Evaluation — explainable */}
      <Panel icon={Brain} title="Competency Evaluation" subtitle="Executive Competency Framework™ — every score is explained">
        <div className="space-y-3">
          {competencies.map((c, i) => (
            <motion.div key={c.competency} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-white/85">{c.competency}</span>
                <span className={`text-lg font-bold ${scoreColor(c.score)}`}>{c.score}<span className="text-xs text-white/30">/100</span></span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-accent-orange" style={{ width: `${c.score}%` }} />
              </div>
              <div className="flex flex-wrap gap-3 mb-2 text-[10px]">
                <Meta label="Confidence" value={`${c.confidence}%`} />
                <Meta label="Evidence Quality" value={`${c.evidenceQuality}%`} />
                <Meta label="Trend" value={c.improvementTrend} trend={c.improvementTrend} />
                <Meta label="Readiness Contribution" value={`+${c.readinessContribution}`} />
              </div>
              <p className="text-[11.5px] text-white/55 leading-relaxed"><span className="text-accent-orange/70 font-medium">Why: </span>{c.why}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      {/* Decision Intelligence™ */}
      <Panel icon={Target} title="Decision Intelligence™" subtitle="Multi-dimensional evaluation of the decision">
        <div className="space-y-2">
          {decisionDims.map((d) => (
            <div key={d.dimension} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
              <div className="w-16 shrink-0 text-center">
                <div className={`text-base font-bold ${scoreColor(d.score)}`}>{d.score}</div>
                <div className="text-[9px] text-white/30">/100</div>
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-medium text-white/80 mb-0.5">{d.dimension}</div>
                <p className="text-[11px] text-white/50 leading-snug">{d.why}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel icon={CheckCircle2} title="Strengths" tone="emerald">
          <ul className="space-y-2">
            {(result.strengths || []).map((s, i) => (
              <li key={i} className="text-[12px] text-white/65 flex items-start gap-2"><CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />{s}</li>
            ))}
          </ul>
        </Panel>
        <Panel icon={AlertTriangle} title="Growth Areas" tone="amber">
          <ul className="space-y-2">
            {(result.growthAreas || []).map((s, i) => (
              <li key={i} className="text-[12px] text-white/65 flex items-start gap-2"><ArrowUpRight size={13} className="text-amber-400 mt-0.5 shrink-0" />{s}</li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Coaching Feedback */}
      <Panel icon={Sparkles} title="EXEC™ Coaching Feedback" subtitle="Personalized, evidence-referenced">
        <p className="text-[13px] text-white/75 leading-relaxed mb-3">{coaching.message}</p>
        {coaching.recommendations?.length > 0 && (
          <div className="space-y-2 mb-3">
            {coaching.recommendations.map((r, i) => (
              <div key={i} className="rounded-lg bg-white/[0.03] border border-white/8 p-3 text-[12px] text-white/65 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-orange/15 text-accent-orange text-[10px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>{r}
              </div>
            ))}
          </div>
        )}
        {coaching.evidenceReferences?.length > 0 && (
          <div className="text-[10px] text-white/35">
            <span className="font-medium text-white/50">Evidence referenced: </span>{coaching.evidenceReferences.join(" · ")}
          </div>
        )}
      </Panel>

      {/* Council Report */}
      {council && council.personas?.length > 0 && (
        <Panel icon={Users} title="Executive Council Report™" subtitle="Multiple executive viewpoints">
          <div className="space-y-3 mb-4">
            {council.personas.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px] font-semibold text-white/85">{p.persona}</span>
                  <SentimentBadge sentiment={p.sentiment} />
                </div>
                <p className="text-[11.5px] text-white/55 leading-relaxed mb-2">{p.viewpoint}</p>
                {p.keyConcerns?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.keyConcerns.map((c, j) => <span key={j} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9.5px] text-amber-300/80">{c}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
          {council.unifiedSummary && (
            <div className="rounded-lg bg-accent-orange/[0.06] border border-accent-orange/20 p-3 text-[12px] text-white/70 leading-relaxed">{council.unifiedSummary}</div>
          )}
        </Panel>
      )}

      {/* Debate Evaluation */}
      {debate && debate.dimensions?.length > 0 && (
        <Panel icon={Brain} title="Debate Evaluation™" subtitle="Structured argument assessment">
          <div className="space-y-2 mb-3">
            {debate.dimensions.map((d) => (
              <div key={d.dimension} className="flex items-center gap-3 py-1.5">
                <span className="text-[12px] text-white/70 flex-1">{d.dimension}</span>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-accent-orange" style={{ width: `${d.score}%` }} /></div>
                <span className={`text-[12px] font-bold w-8 text-right ${scoreColor(d.score)}`}>{d.score}</span>
              </div>
            ))}
          </div>
          {debate.feedback && <p className="text-[11.5px] text-white/55 leading-relaxed">{debate.feedback}</p>}
        </Panel>
      )}

      {/* Evidence Record */}
      <Panel icon={Shield} title="Verified Evidence Generated" subtitle="Stored to Evidence Ledger™, Executive Portfolio™, Executive Identity Graph™">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <Meta label="Evidence Level" value={evidence.evidenceLevel || "—"} />
          <Meta label="Confidence" value={`${evidence.evidenceConfidence || 0}%`} />
          <Meta label="Reliability" value={`${evidence.evidenceReliability || 0}%`} />
          <Meta label="Journey Points" value={`+${evidence.journeyProgress || 0}`} />
        </div>
        {evidence.summary && <p className="text-[11.5px] text-white/55 leading-relaxed flex items-start gap-2"><FileText size={13} className="text-white/40 mt-0.5 shrink-0" />{evidence.summary}</p>}
      </Panel>
    </div>
  );
}

// ── Sub-components ──
function StatCard({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className={`rounded-xl border p-4 ${tone === "accent" ? "border-accent-orange/30 bg-accent-orange/[0.06]" : "border-white/8 bg-white/[0.02]"}`}>
      <Icon size={15} className={tone === "accent" ? "text-accent-orange" : "text-white/45"} />
      <div className={`text-xl font-bold mt-2 ${tone === "accent" ? "text-accent-orange" : "text-white"}`}>{value}</div>
      <div className="text-[10px] text-white/35">{label}</div>
      <div className="text-[9px] text-white/25">{sub}</div>
    </div>
  );
}

function Panel({ icon: Icon, title, subtitle, children, tone }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className={tone === "emerald" ? "text-emerald-400" : tone === "amber" ? "text-amber-400" : "text-accent-orange/80"} />
        <h3 className="text-[14px] font-semibold text-white">{title}</h3>
        {subtitle && <span className="text-[10px] text-white/30">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Meta({ label, value, trend }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-white/30">{label}:</span>
      <span className={trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-white/65"}>{value}</span>
    </div>
  );
}

function SentimentBadge({ sentiment }) {
  const map = { support: "emerald", caution: "amber", oppose: "rose" };
  const cls = { emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300", amber: "bg-amber-500/10 border-amber-500/20 text-amber-300", rose: "bg-rose-500/10 border-rose-500/20 text-rose-300" }[map[sentiment] || "amber"];
  return <span className={`px-2 py-0.5 rounded-full border text-[9px] font-medium ${cls}`}>{sentiment}</span>;
}

function scoreColor(score) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}