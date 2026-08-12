import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, Target, CalendarCheck, PlayCircle, ArrowRight, Gauge,
  Clock, Lightbulb, CheckCircle2, Award, Loader2, MessageSquare,
} from 'lucide-react';
import { ASSESSMENT_CATEGORIES } from '@/lib/readinessAssessmentEngine';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const REFLECTION_PROMPT = 'What changed in the conversation when you communicated the issue in business-impact language rather than technical language?';
const ESTIMATED_TIME = '~10 minutes · focused practice';
const JOURNEY_POINTS = 50;

/**
 * First Success Experience™ v1.1 — measurable + persistent.
 * Creates the member's first recorded leadership behavior inside EXECLEAD.AI:
 * completion + reflection saved to the Executive Journey™ (with Journey Points)
 * and surfaced in Executive Success Stories™ as behavioral evidence.
 */
export default function FirstSuccessExperience({ results, targetRole, user, onViewReport, onTrySimulation }) {
  const { toast } = useToast();
  const { overall, classification, gap, forecast, roadmap, categoryResults } = results;
  const [step, setStep] = useState('action'); // 'action' | 'reflection' | 'completed'
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try { base44.analytics.track({ eventName: 'first_insight_viewed', properties: { overall, classification: classification?.key } }); } catch (e) {}
  }, [overall, classification?.key]);

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

  const whyThisMatters = `Strengthening ${weakest.label.toLowerCase()} directly closes your largest readiness gap and builds the executive behavior pattern your next role requires.`;

  const handleSaveReflection = async () => {
    setSaving(true);
    const uid = user?.id;
    const uname = user?.full_name || user?.email || 'Member';
    try {
      // 1. Save completion + reflection to the Executive Journey™ (Journey Points awarded).
      await base44.entities.JourneyEvent.create({
        user_id: uid,
        user_name: uname,
        event_type: 'first_leadership_action',
        module: 'first_success_experience',
        category: 'challenge',
        title: `First Leadership Action: ${weakest.label}`,
        description: action,
        points: JOURNEY_POINTS,
        milestone: true,
        metadata_json: JSON.stringify({
          action,
          estimated_time: ESTIMATED_TIME,
          reflection,
          reflection_prompt: REFLECTION_PROMPT,
          strongest_competency: strongest.label,
          growth_opportunity: weakest.label,
          readiness_score: overall,
          target_role: target,
        }),
        event_date: new Date().toISOString(),
      });

      // 2. Surface completion in Executive Success Stories™ as behavioral evidence.
      try {
        await base44.entities.ExecutiveSuccessStory.create({
          story_id: `SS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          user_id: uid,
          user_name: uname,
          title: 'First Recorded Leadership Behavior',
          summary: `Completed the first recommended leadership action — ${action}`,
          visibility: 'private',
          published: false,
          target_role: target,
          evidence_snapshot_json: JSON.stringify({
            type: 'first_leadership_behavior',
            action,
            reflection,
            reflection_prompt: REFLECTION_PROMPT,
            competency_focus: weakest.label,
            strongest_competency: strongest.label,
            readiness_score: overall,
            journey_points: JOURNEY_POINTS,
            source: 'first_success_experience',
            recorded_at: new Date().toISOString(),
          }),
          generated_date: new Date().toISOString(),
        });
      } catch (e) {}

      setStep('completed');
      try { base44.analytics.track({ eventName: 'first_leadership_action_completed', properties: { points: JOURNEY_POINTS, competency: weakest.label } }); } catch (e) {}
      toast({ title: 'Leadership behavior recorded', description: `+${JOURNEY_POINTS} Journey Points added to your Executive Journey.` });
    } catch (e) {
      toast({ title: 'Could not save your action', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

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

      {/* 7-day action — with Estimated Time + Why This Matters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <CalendarCheck size={15} className="text-indigo-400" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">Your Leadership Action — Next 7 Days</span>
        </div>
        <p className="text-sm text-white/85 leading-relaxed font-medium">{action}</p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-white/55 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <Clock size={11} className="text-white/45" /> {ESTIMATED_TIME}
          </span>
          {simulation && (
            <span className="text-[11px] text-white/45">Suggested practice: <span className="text-white/65">{simulation}</span></span>
          )}
        </div>
        <div className="flex items-start gap-2 mt-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
          <Lightbulb size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold mb-0.5">Why This Matters</div>
            <p className="text-xs text-white/65 leading-relaxed">{whyThisMatters}</p>
          </div>
        </div>
      </motion.div>

      {/* Step-dependent footer */}
      {step === 'action' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <button
            onClick={() => setStep('reflection')}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-500/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 mb-3"
          >
            <CheckCircle2 size={18} /> Mark as Completed
          </button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onTrySimulation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25"
            >
              <PlayCircle size={17} /> Try the Flagship Simulation <ArrowRight size={15} />
            </button>
            <button
              onClick={onViewReport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              View My Full Report <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      )}

      {step === 'reflection' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <MessageSquare size={15} className="text-indigo-400" />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">Reflection Prompt</span>
          </div>
          <p className="text-sm text-white/85 leading-relaxed font-medium mb-3">{REFLECTION_PROMPT}</p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            placeholder="Reflect on what shifted — in the room and in the outcome..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 transition-colors resize-none"
          />
          <div className="flex items-center justify-between gap-3 mt-4">
            <button
              onClick={() => setStep('action')}
              className="text-sm text-white/55 hover:text-white/80 font-medium px-3 py-2 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveReflection}
              disabled={saving || !reflection.trim()}
              className="inline-flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />}
              {saving ? 'Recording...' : `Save & Record (+${JOURNEY_POINTS} Journey Points)`}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'completed' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-5 mb-5 text-center">
          <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">Your first leadership behavior is recorded.</h3>
          <p className="text-sm text-white/65 mt-1.5 leading-relaxed">
            +{JOURNEY_POINTS} Journey Points added to your Executive Journey, and this action is now saved as behavioral evidence in your Executive Success Stories.
          </p>
        </motion.div>
      )}

      {step === 'completed' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
      )}

      <p className="text-[11px] text-white/35 text-center mt-5 leading-relaxed">
        This platform understands your leadership situation — and gave you a concrete next step.
      </p>
    </div>
  );
}