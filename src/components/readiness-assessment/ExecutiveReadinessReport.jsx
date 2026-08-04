import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award, Trophy, Crown, Sparkles, ArrowRight, RefreshCw, Home, Loader2,
  TrendingUp, Target, Shield, AlertTriangle, BookOpen, Swords, MessageSquare,
  Gauge, Compass, Rocket,
} from "lucide-react";
import { LEADERSHIP_TRACKS } from "@/lib/readinessAssessmentEngine";
import ReadinessRadar from "@/components/readiness-assessment/ReadinessRadar";
import GapAnalysisPanel from "@/components/readiness-assessment/GapAnalysisPanel";
import PromotionForecast from "@/components/readiness-assessment/PromotionForecast";
import Roadmap90Day from "@/components/readiness-assessment/Roadmap90Day";
import ReadinessShareReport from "@/components/readiness-assessment/ReadinessShareReport";
import CoachingPlan7Day from "@/components/readiness-assessment/CoachingPlan7Day";
import ExecutiveActionCenter from "@/components/readiness-assessment/ExecutiveActionCenter";
import { ExecutiveMomentum, WhatChanged, WhatIfScenarios } from "@/components/readiness-assessment/LivingSignals";
import ExecutiveMilestones from "@/components/readiness-assessment/ExecutiveMilestones";
import PatternInsights from "@/components/readiness-assessment/PatternInsights";
import ScoreExplanations from "@/components/readiness-assessment/ScoreExplanations";
import EvidenceTimeline from "@/components/readiness-assessment/EvidenceTimeline";
import {
  deriveMaturity, deriveConfidenceScore, deriveRiskIndicators, deriveExecutiveBenchmark,
  deriveIndustryBenchmark, deriveRecommendations, deriveJourneyPosition, deriveProgressForecast,
  deriveTargetRoleAlignment, deriveAIExecutiveSummary,
  deriveTopPriorities, deriveMomentum, deriveWhatChanged, deriveWhatIf, deriveMilestone,
  deriveScoreExplanations, derivePatternInsights, groupSnapshotsByQuarter,
} from "@/lib/readinessReportEngine";

const BADGE_ICON = { Award, Trophy, Crown, Sparkles };

function Section({ icon: Icon, title, kicker, children, className = "" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white/[0.02] border border-white/8 rounded-2xl p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Icon size={14} className="text-indigo-400" /></div>}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">{kicker}</div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export default function ExecutiveReadinessReport({ results, savedAssessment, persisting, onRestart, targetRole, history, previousRecord }) {
  const { overall, classification, gap, forecast, roadmap, gamification, universalScore, roleScore, hasAdaptive, leadership_track } = results;
  const trackLabel = LEADERSHIP_TRACKS.find((t) => t.key === leadership_track)?.label;
  const maturity = deriveMaturity(overall);
  const confidence = deriveConfidenceScore(results);
  const risks = deriveRiskIndicators(results);
  const execBench = deriveExecutiveBenchmark(overall);
  const indBench = deriveIndustryBenchmark(overall, results.leadership_track);
  const recs = deriveRecommendations(results);
  const journey = deriveJourneyPosition(results);
  const progress = deriveProgressForecast(results);
  const alignment = deriveTargetRoleAlignment(results, targetRole);
  const aiSummary = deriveAIExecutiveSummary(results, targetRole);
  const priorities = deriveTopPriorities(results);
  const momentum = deriveMomentum(results);
  const changes = deriveWhatChanged(results, previousRecord);
  const scenarios = deriveWhatIf(results);
  const milestone = deriveMilestone(results, targetRole);
  const explanations = deriveScoreExplanations(results);
  const insights = derivePatternInsights(results);
  const snapshots = groupSnapshotsByQuarter(history);

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 lg:py-10 space-y-5">
      {/* ── Score hero ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-accent-orange/12 to-transparent border border-accent-orange/20 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden">
        <div className="text-[11px] uppercase tracking-widest text-accent-orange mb-1">Executive Readiness Report™</div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring" }}
          className="text-6xl md:text-7xl font-bold text-white leading-none">{overall}<span className="text-3xl text-white/40">%</span></motion.div>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-accent-orange/15 border border-accent-orange/30 text-sm font-medium text-accent-orange">{classification.label}</div>
        {persisting && <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] text-white/50"><Loader2 size={12} className="animate-spin" /> Saving…</div>}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[11px] text-indigo-300"><Sparkles size={11} /> +{gamification.xp} Executive XP</span>
          {gamification.badges.map((b) => {
            const Icon = BADGE_ICON[b.icon] || Award;
            return <span key={b.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-[11px] text-amber-300"><Icon size={11} /> {b.label}</span>;
          })}
        </div>
      </motion.div>

      {/* ── Universal vs Role-Specific score breakdown ── */}
      {hasAdaptive && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Overall Executive Readiness™</div>
            <div className="text-3xl font-bold text-white">{overall}<span className="text-base text-white/40">%</span></div>
            <div className="text-[10px] text-white/40 mt-1">80% universal + 20% role-specific</div>
          </div>
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Universal Leadership Score™</div>
            <div className="text-3xl font-bold text-white">{universalScore}<span className="text-base text-white/40">%</span></div>
            <div className="h-1.5 bg-white/8 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400" style={{ width: `${universalScore}%` }} />
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{trackLabel ? `${trackLabel} Readiness™` : 'Role-Specific Readiness™'}</div>
            <div className="text-3xl font-bold text-white">{roleScore}<span className="text-base text-white/40">%</span></div>
            <div className="h-1.5 bg-white/8 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400" style={{ width: `${roleScore}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── EXEC™ AI Executive Concierge handoff ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0"><Sparkles size={18} className="text-emerald-400" /></div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-emerald-300 mb-1.5">EXEC™ AI Executive Concierge</div>
            <p className="text-sm text-white/75 leading-relaxed">{aiSummary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/coach" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-[11px] text-emerald-300 font-medium hover:bg-emerald-500/20 transition-colors"><MessageSquare size={12} /> Continue with EXEC™ <ArrowRight size={12} /></Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Executive Action Center + EXEC™ Pattern Insights ── */}
      <ExecutiveActionCenter priorities={priorities} />
      <PatternInsights insights={insights} />

      {/* ── Maturity + Target alignment + Confidence ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Section icon={Compass} kicker="Level" title="Leadership Maturity Level™">
          <div className="text-2xl font-bold text-white">{maturity.level}</div>
          <p className="text-[11px] text-white/45 leading-relaxed mt-1">{maturity.desc}</p>
        </Section>
        <Section icon={Target} kicker="Fit" title="Target Role Alignment™">
          <div className="text-2xl font-bold text-white">{alignment.alignment}%</div>
          <div className="text-[11px] text-white/45 mb-1.5">{alignment.role}</div>
          <p className="text-[11px] text-white/45 leading-relaxed">{alignment.note}</p>
        </Section>
        <Section icon={Gauge} kicker="Trust" title="Executive Confidence Score™">
          <div className="text-2xl font-bold text-white">{confidence}</div>
          <div className="h-1.5 bg-white/8 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${confidence}%` }} />
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">Based on profile balance & evidence breadth</p>
        </Section>
      </div>

      {/* ── Living signals: Momentum · What Changed · What If · Milestones ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ExecutiveMomentum momentum={momentum} />
        <WhatChanged changes={changes} />
      </div>
      <WhatIfScenarios scenarios={scenarios} />
      <ExecutiveMilestones milestone={milestone} />

      {/* ── Radar + Forecast + Gap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReadinessRadar categoryResults={results.categoryResults} />
        <div className="space-y-5">
          <PromotionForecast forecast={forecast} />
          <GapAnalysisPanel gap={gap} />
        </div>
      </div>

      {/* ── Strengths (top 5) & Opportunities (top 5) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section icon={TrendingUp} kicker="Top 5" title="Executive Strengths">
          <div className="space-y-2">
            {gap.strengths.map((s, i) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-[12px] text-white/75 flex items-center gap-2"><span className="text-emerald-400/60 font-mono text-[10px]">0{i + 1}</span> {s.label}</span>
                <span className="text-xs font-bold text-emerald-400">{s.score}</span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 5 - gap.strengths.length) }).map((_, i) => (
              <div key={`s${i}`} className="flex items-center justify-between text-white/25">
                <span className="text-[12px]">—</span><span className="text-xs">—</span>
              </div>
            ))}
          </div>
        </Section>
        <Section icon={AlertTriangle} kicker="Top 5" title="Growth Opportunities">
          <div className="space-y-2">
            {gap.opportunities.map((s, i) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-[12px] text-white/75 flex items-center gap-2"><span className="text-amber-400/60 font-mono text-[10px]">0{i + 1}</span> {s.label}</span>
                <span className="text-xs font-bold text-amber-400">{s.score}</span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 5 - gap.opportunities.length) }).map((_, i) => (
              <div key={`o${i}`} className="flex items-center justify-between text-white/25">
                <span className="text-[12px]">—</span><span className="text-xs">—</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Benchmarks ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section icon={Trophy} kicker="Peer Comparison" title="Executive Benchmark">
          <div className="flex items-end justify-between mb-2">
            <div><div className="text-2xl font-bold text-white">{execBench.percentile}th</div><div className="text-[10px] text-white/40">percentile</div></div>
            <div className="text-right"><div className="text-sm text-white/60">Peer avg {execBench.peerAverage}</div><div className={`text-xs font-semibold ${execBench.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{execBench.delta >= 0 ? "+" : ""}{execBench.delta} pts</div></div>
          </div>
          <p className="text-[11px] text-white/45 leading-relaxed">{execBench.label}</p>
        </Section>
        <Section icon={Compass} kicker="Track" title="Industry Benchmark">
          <div className="flex items-end justify-between mb-2">
            <div><div className="text-sm font-semibold text-white">{indBench.trackLabel}</div><div className="text-[10px] text-white/40">Industry avg {indBench.industryAverage}</div></div>
            <div className={`text-xs font-semibold ${indBench.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{indBench.delta >= 0 ? "+" : ""}{indBench.delta} pts</div>
          </div>
          <p className="text-[11px] text-white/45 leading-relaxed">{indBench.delta >= 0 ? "You are outperforming the industry average for your track." : "Focused development will move you above the industry average."}</p>
        </Section>
      </div>

      {/* ── Score Explanations ── */}
      <ScoreExplanations explanations={explanations} />

      {/* ── Risk indicators ── */}
      {risks.length > 0 && (
        <Section icon={Shield} kicker="Watch" title="Executive Risk Indicators™">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {risks.map((r) => (
              <div key={r.dimension} className="rounded-xl bg-white/[0.02] border border-white/8 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/75 font-medium">{r.dimension}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${r.severity === "Critical" ? "bg-rose-500/15 text-rose-400" : r.severity === "High" ? "bg-amber-500/15 text-amber-400" : "bg-yellow-500/15 text-yellow-400"}`}>{r.severity}</span>
                </div>
                <div className="text-[10px] text-white/40 leading-relaxed">{r.note}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Recommendations ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Section icon={BookOpen} kicker="Learn" title="Recommended Learning Paths™">
          <ul className="space-y-1.5">{recs.learningPaths.map((p) => <li key={p} className="text-[12px] text-white/65 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-indigo-400" /> {p}</li>)}</ul>
        </Section>
        <Section icon={Swords} kicker="Practice" title="Recommended Simulations™">
          <ul className="space-y-1.5">{recs.simulations.map((p) => <li key={p} className="text-[12px] text-white/65 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-400" /> {p}</li>)}</ul>
        </Section>
        <Section icon={MessageSquare} kicker="Mentor" title="Recommended AI Coach™">
          <div className="text-[13px] font-semibold text-white mb-1">{recs.coach}</div>
          <p className="text-[11px] text-white/45 leading-relaxed">Matched to your primary growth area for maximum coaching impact.</p>
        </Section>
      </div>

      {/* ── 90-Day Roadmap ── */}
      <Roadmap90Day roadmap={roadmap} />

      {/* ── 7-Day Coaching Plan ── */}
      <CoachingPlan7Day opportunity={gap.opportunities[0]?.label} />

      {/* ── Journey position + Progress forecast ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section icon={Compass} kicker="Journey" title="Executive Journey Position™">
          <div className="text-sm font-semibold text-white">{journey.level}</div>
          <div className="text-[11px] text-white/45 mb-2">{journey.xp.toLocaleString()} Executive XP</div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-gradient-to-r from-accent-orange to-amber-400" style={{ width: `${Math.min(100, (journey.xp / 5000) * 100)}%` }} />
          </div>
          <div className="text-[10px] text-white/40">{journey.pointsToNext.toLocaleString()} XP to {journey.nextLevel}</div>
        </Section>
        <Section icon={Rocket} kicker="Projection" title="Progress Forecast™">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[{ l: "30 days", v: progress.days30 }, { l: "60 days", v: progress.days60 }, { l: "90 days", v: progress.days90 }].map((p) => (
              <div key={p.l} className="rounded-lg bg-white/[0.03] border border-white/8 p-2">
                <div className="text-lg font-bold text-white">{p.v}%</div>
                <div className="text-[9px] text-white/40">{p.l}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-2 text-center">+{progress.projectedGain} pts projected if you follow your plan</p>
        </Section>
      </div>

      {/* ── Welcome to workspace ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500/12 to-transparent border border-indigo-500/20 rounded-2xl p-6 text-center">
        <div className="text-[11px] uppercase tracking-widest text-indigo-400 mb-1">You're Ready</div>
        <h3 className="text-lg font-bold text-white mb-1.5">Welcome to Your Executive Workspace</h3>
        <p className="text-sm text-white/55 max-w-lg mx-auto mb-4">Your 10-minute transformation is complete. Your workspace is now personalized to your goals — continue your Executive Leadership Journey.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-sm text-white font-semibold transition-colors">
          <Home size={14} /> Enter Executive Workspace <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* ── Evidence Timeline + Quarterly Snapshots ── */}
      <EvidenceTimeline history={history} snapshots={snapshots} />

      {/* ── Share ── */}
      <ReadinessShareReport results={results} shareSlug={savedAssessment?.share_slug} />

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button onClick={onRestart} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 font-medium transition-colors"><RefreshCw size={14} /> Retake Assessment</button>
        <Link to="/coach" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-sm text-white font-semibold transition-colors"><Sparkles size={14} /> Continue with AI Coach <ArrowRight size={14} /></Link>
        <Link to="/dashboard" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 font-medium transition-colors"><Home size={14} /> Go to Dashboard</Link>
      </div>
    </div>
  );
}