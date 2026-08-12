import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, Minus, Sparkles, ArrowUpRight,
  Lightbulb, Loader2, Brain, Target,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  computeBehavioralReadinessCorrelation, BEHAVIOR_BUCKETS,
} from '@/lib/behavioralReadinessCorrelation';

/**
 * Behavioral Readiness Correlation™ — surfaces evidence-based leadership growth
 * science on the Executive Journey: correlates completed leadership behaviors
 * with Executive Readiness progression and ranks the member's highest-impact
 * leadership behaviors.
 */
export default function BehavioralReadinessCorrelation() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        const uid = me?.id;
        if (!uid) { setLoading(false); return; }
        const [assessments, behaviors, signals, sims] = await Promise.all([
          base44.entities.ReadinessAssessment.filter({ user_id: uid }, '-created_date', 50).catch(() => []),
          base44.entities.BehavioralEvidenceRecord.filter({ user_id: uid }, '-recorded_at', 200).catch(() => []),
          base44.entities.CompetencyProgressSignal.filter({ user_id: uid }, '-recorded_at', 200).catch(() => []),
          base44.entities.SimulationSession.filter({ created_by_id: uid }, '-created_date', 50).catch(() => []),
        ]);
        if (!active) return;
        setReport(computeBehavioralReadinessCorrelation({ assessments, behaviors, signals, simulations: sims }));
      } catch (e) {}
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-accent-orange" />
          <h3 className="text-white font-semibold text-sm">Behavioral Readiness Correlation</h3>
        </div>
        <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-white/40" /></div>
      </div>
    );
  }

  if (!report || !report.hasData) {
    return (
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={15} className="text-accent-orange" />
          <h3 className="text-white font-semibold text-sm">Behavioral Readiness Correlation</h3>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 text-center">
          <Brain size={22} className="text-white/30 mx-auto mb-2" />
          <p className="text-xs text-white/55 leading-relaxed max-w-md mx-auto">
            This correlation builds as you complete 7-day leadership actions, record reflections, and re-assess your Executive Readiness. Complete your first action to start generating growth signals.
          </p>
        </div>
      </div>
    );
  }

  const DeltaIcon = report.readinessDelta > 0 ? TrendingUp : report.readinessDelta < 0 ? TrendingDown : Minus;
  const deltaColor = report.readinessDelta > 0 ? 'text-emerald-400' : report.readinessDelta < 0 ? 'text-red-400' : 'text-white/40';

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-accent-orange" />
            <h3 className="text-white font-semibold text-sm">Behavioral Readiness Correlation</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">Evidence-Based</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] text-white/45">Initial Readiness</div>
            <div className="text-xl font-bold text-white">{report.initialScore}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] text-white/45">Latest Readiness</div>
            <div className="text-xl font-bold text-white">{report.latestScore}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] text-white/45">Readiness Change</div>
            <div className={`text-xl font-bold flex items-center gap-1 ${deltaColor}`}>
              <DeltaIcon size={14} /> {report.readinessDelta > 0 ? '+' : ''}{report.readinessDelta}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] text-white/45">Actions / Sims</div>
            <div className="text-xl font-bold text-white">{report.actionsCount} <span className="text-xs text-white/40 font-normal">/ {report.simulationsCount}</span></div>
          </div>
        </div>
      </div>

      {/* Your Highest-Impact Leadership Behaviors */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-accent-orange" />
          <h3 className="text-white font-semibold text-sm">Your Highest-Impact Leadership Behaviors</h3>
        </div>
        <div className="space-y-2.5">
          {BEHAVIOR_BUCKETS.map((b) => {
            const impact = report.behaviorImpacts.find((x) => x.key === b.key) || { count: 0, impactScore: 0 };
            const rank = report.highestImpactBehaviors.findIndex((x) => x.key === b.key);
            const isTop = rank === 0 && impact.count > 0;
            return (
              <div key={b.key} className={`rounded-xl border p-3 ${isTop ? 'border-emerald-500/25 bg-emerald-500/[0.05]' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {isTop ? <ArrowUpRight size={13} className="text-emerald-400 flex-shrink-0" /> : <Target size={13} className="text-white/40 flex-shrink-0" />}
                    <span className="text-sm text-white/85 font-medium truncate">{b.label}</span>
                    {impact.count === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/40 flex-shrink-0">No evidence yet</span>}
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${isTop ? 'text-emerald-400' : impact.count > 0 ? 'text-white/70' : 'text-white/30'}`}>
                    {impact.count > 0 ? `${impact.impactScore}/100` : '—'}
                  </span>
                </div>
                {impact.count > 0 && (
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${impact.impactScore}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${isTop ? 'bg-emerald-400' : 'bg-accent-orange/70'}`}
                    />
                  </div>
                )}
                {impact.count > 0 && (
                  <div className="text-[10px] text-white/40 mt-1.5">{impact.count} recorded {impact.count === 1 ? 'action' : 'actions'} · {impact.avgReflectionDepth}/100 reflection depth</div>
                )}
              </div>
            );
          })}
        </div>
        {!report.hasMultipleAssessments && (
          <p className="text-[10px] text-white/40 mt-3 leading-relaxed">
            Impact signals are behavior-derived. Re-assess your Executive Readiness to unlock full readiness-correlation scoring.
          </p>
        )}
      </div>

      {/* Leadership Growth Correlation Report */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={15} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Leadership Growth Correlation Report</h3>
        </div>

        {/* Behaviors most associated with readiness improvement */}
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-semibold mb-2">Behaviors Most Associated With Readiness Improvement</div>
          {report.highestImpactBehaviors.length ? (
            <div className="space-y-1.5">
              {report.highestImpactBehaviors.slice(0, 3).map((b, i) => (
                <div key={b.key} className="flex items-center justify-between text-xs">
                  <span className="text-white/75">{i + 1}. {b.label}</span>
                  <span className="text-emerald-400 font-medium">{b.impactScore}/100</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-white/40">Complete leadership actions to identify your strongest behavioral drivers.</p>}
        </div>

        {/* Competencies responding fastest to practice */}
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider text-indigo-300/80 font-semibold mb-2">Competencies Responding Fastest To Practice</div>
          {report.fastestCompetencies.length ? (
            <div className="space-y-1.5">
              {report.fastestCompetencies.slice(0, 3).map((c) => (
                <div key={c.competency} className="flex items-center justify-between text-xs">
                  <span className="text-white/75">{c.competency}</span>
                  <span className="text-indigo-300 font-medium">{c.growthRate}/100 · {c.evidenceCount} signals</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-white/40">Competency progression signals appear as you complete actions.</p>}
        </div>

        {/* Behaviors with low or no measurable impact */}
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider text-amber-400/80 font-semibold mb-2">Behaviors With Low Or No Measurable Impact</div>
          {report.lowImpactBehaviors.length ? (
            <div className="flex flex-wrap gap-1.5">
              {report.lowImpactBehaviors.map((b) => (
                <span key={b.key} className="text-[11px] px-2 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/55">
                  {b.label}{b.count === 0 ? ' · no evidence' : ''}
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-white/40">All tracked behaviors show measurable impact.</p>}
        </div>

        {/* Recommended next actions */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Recommended Next Actions</div>
          <div className="space-y-1.5">
            {report.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                <Lightbulb size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}