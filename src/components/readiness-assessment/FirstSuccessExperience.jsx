import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, CalendarCheck, PlayCircle, ArrowRight, Gauge } from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '@/lib/readinessAssessmentEngine';
import { base44 } from '@/api/base44Client';

/**
 * First Success Experience™ — the immediate post-assessment insight screen.
 * Goal: a meaningful, personalized leadership insight within the first 5 minutes.
 * Derives the strongest competency, highest-impact growth opportunity, and one
 * realistic 7-day action directly from the member's assessment results.
 */
export default function FirstSuccessExperience({ results, targetRole, onViewReport, onTrySimulation }) {
  const { overall, classification, gap, forecast, roadmap, categoryResults } = results;

  useEffect(() => {
    try { base44.analytics.track({ eventName: 'first_insight_viewed', properties: { overall, classification: classification?.key } }); } catch (e) {}
  }, [overall, classification?.key]);

  // Strongest competency = highest-scoring universal category.
  // Highest-impact growth opportunity = lowest-scoring universal category (biggest gap).
  const ranked = useMemo(() => {
    return ASSESSMENT_CATEGORIES
      .map((c) => ({ ...c, score: categoryResults?.[c.key] ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }, [categoryResults]);

  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const action = roadmap?.[0]?.coaching || 'Practice one deliberate leadership decision this week and review the outcome.';
  const simulation = roadmap?.[0]?.simulation;
  const target = targetRole || forecast?.targetLevel || 'your next executive role';

  const insight = useMemo(() => {
    return `Your strongest executive competency is ${strongest.label} (${strongest.score}/100), while your highest-impact growth opportunity is ${weakest.label} (${weakest.score}/100). As a ${classification.label}-level leader targeting ${target}, one focused practice cycle on ${weakest.label.toLowerCase()} is your fastest path to measurable readiness.`;
  }, [strongest, weakest, classification.label, target]);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[11px] text-emerald-400 font-semibold mb-3">
          <Sparkles size={12} /> Your First Executive Insight · Ready in 5 Minutes
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Here's what your assessment revealed.</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
            <Gauge size={14} className="text-accent-orange" />
            <span className="text-sm font-semibold text-white">{overall}/100</span>
            <span className="text-[11px] text-white/45">{classification.label}</span>
          </div>
          <div className="text-[11px] text-white/40">Targeting {target}</div>
        </div>
      </motion.div>

      {/* Personalized Executive Insight */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-accent-orange/20 bg-accent-orange/[0.04] p-5 md:p-6 mb-5">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles size={14} className="text-accent-orange" />
          <span className="text-[11px] uppercase tracking-wider text-accent-orange font-semibold">Personalized Executive Insight</span>
        </div>
        <p className="text-sm md:text-[15px] text-white/85 leading-relaxed">{insight}</p>
      </motion.div>

      {/* Strongest competency + highest-impact growth opportunity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-400" />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">Your Strongest Competency</span>
          </div>
          <div className="text-lg font-bold text-white">{strongest.label}</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{strongest.score}<span className="text-sm text-white/40 font-normal">/100</span></div>
          <p className="text-xs text-white/55 mt-2 leading-relaxed">{strongest.desc}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Target size={15} className="text-amber-400" />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Highest-Impact Growth Opportunity</span>
          </div>
          <div className="text-lg font-bold text-white">{weakest.label}</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{weakest.score}<span className="text-sm text-white/40 font-normal">/100</span></div>
          <p className="text-xs text-white/55 mt-2 leading-relaxed">Focus your development here first — this is where the largest readiness gain is available.</p>
        </motion.div>
      </div>

      {/* 7-day action */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <CalendarCheck size={15} className="text-indigo-400" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">Your Leadership Action — Next 7 Days</span>
        </div>
        <p className="text-sm text-white/85 leading-relaxed font-medium">{action}</p>
        {simulation && (
          <p className="text-xs text-white/45 mt-2">Suggested practice: <span className="text-white/65">{simulation}</span></p>
        )}
      </motion.div>

      {/* CTAs — simulation invite first, full report second */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={onTrySimulation}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25"
        >
          <PlayCircle size={18} /> Try the Flagship Simulation <ArrowRight size={16} />
        </button>
        <button
          onClick={onViewReport}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-6 py-3.5 rounded-xl transition-colors"
        >
          View My Full Report <ArrowRight size={16} />
        </button>
      </motion.div>

      <p className="text-[11px] text-white/35 text-center mt-5 leading-relaxed">
        This platform understands your leadership situation — and gave you a concrete next step.
      </p>
    </div>
  );
}