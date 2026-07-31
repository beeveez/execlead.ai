import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import {
  QUESTIONS, ASSESSMENT_CATEGORIES, computeFullResults, ASSESSMENT_STORAGE_KEY, LEADERSHIP_TRACKS,
} from '@/lib/readinessAssessmentEngine';
import LeadershipTrackSelector from '@/components/readiness-assessment/LeadershipTrackSelector';
import {
  Loader2, ChevronLeft, ChevronRight, Sparkles, Award, Trophy, Crown, Check, ArrowRight, RefreshCw, Gauge, Home,
} from 'lucide-react';
import ReadinessRadar from '@/components/readiness-assessment/ReadinessRadar';
import GapAnalysisPanel from '@/components/readiness-assessment/GapAnalysisPanel';
import PromotionForecast from '@/components/readiness-assessment/PromotionForecast';
import Roadmap90Day from '@/components/readiness-assessment/Roadmap90Day';
import ReadinessShareReport from '@/components/readiness-assessment/ReadinessShareReport';

const BADGE_ICON = { Award, Trophy, Crown, Sparkles };

export default function ExecutiveReadinessAssessment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phase, setPhase] = useState('track');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [persisting, setPersisting] = useState(false);
  const [savedAssessment, setSavedAssessment] = useState(null);
  const [track, setTrack] = useState(null);
  const [targetRole, setTargetRole] = useState(null);
  const [savingTrack, setSavingTrack] = useState(false);

  // Preselect track from profile so returning users skip straight to the assessment.
  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (me?.data?.leadership_track) {
          setTrack(me.data.leadership_track);
          setTargetRole(me.data.target_executive_role || null);
          setPhase('quiz');
        }
      } catch (e) {}
    })();
  }, []);

  // Restore in-progress answers
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ASSESSMENT_STORAGE_KEY) || 'null');
      if (saved && saved.answers) {
        setAnswers(saved.answers);
        setIdx(Math.min(saved.idx || 0, QUESTIONS.length - 1));
      }
    } catch (e) {}
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (phase === 'quiz') localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answers, idx }));
  }, [answers, idx, phase]);

  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;
  const progress = Math.round(((idx) / total) * 100);
  const selected = answers[q?.id];

  const select = (optionIndex) => {
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
  };

  const next = () => { if (idx < total - 1) setIdx(idx + 1); };
  const prev = () => { if (idx > 0) setIdx(idx - 1); };

  const selectTrack = async (trackKey, roleLabel) => {
    setSavingTrack(true);
    setTrack(trackKey);
    setTargetRole(roleLabel);
    try {
      // Persist to the user profile so the Executive Context Engine™ personalizes the whole platform.
      await base44.auth.updateMe({ leadership_track: trackKey, target_executive_role: roleLabel });
    } catch (e) {
      toast({ title: 'Could not save leadership track', description: e.message, variant: 'destructive' });
    } finally { setSavingTrack(false); }
    setPhase('quiz');
  };

  const finish = useCallback(async () => {
    const r = computeFullResults(answers);
    // Personalize the promotion forecast with the selected target role.
    if (targetRole) r.forecast.targetLevel = targetRole;
    setResults(r);
    setPhase('results');
    localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    setPersisting(true);
    try {
      const record = {
        assessment_id: `RA-${Date.now().toString().slice(-6)}`,
        user_id: user?.id,
        overall_score: r.overall,
        classification: r.classification.key,
        classification_label: r.classification.label,
        category_scores_json: JSON.stringify(r.categoryResults),
        strengths_json: JSON.stringify(r.gap.strengths.map((s) => ({ label: s.label, score: s.score }))),
        growth_opportunities_json: JSON.stringify(r.gap.opportunities.map((s) => ({ label: s.label, score: s.score }))),
        confidence: r.gap.confidence,
        promotion_forecast_json: JSON.stringify(r.forecast),
        roadmap_json: JSON.stringify(r.roadmap),
        xp_awarded: r.gamification.xp,
        badges_json: JSON.stringify(r.gamification.badges),
        leadership_track: track,
        target_executive_role: targetRole,
        answers_json: JSON.stringify(answers),
        completed_at: new Date().toISOString(),
      };
      const created = await base44.entities.ReadinessAssessment.create(record);
      setSavedAssessment(created);
    } catch (e) {
      toast({ title: 'Could not save assessment', description: e.message, variant: 'destructive' });
    } finally { setPersisting(false); }
  }, [answers, user?.id, toast, targetRole, track]);

  const restart = () => { setAnswers({}); setIdx(0); setPhase('track'); setResults(null); localStorage.removeItem(ASSESSMENT_STORAGE_KEY); };

  // ── RESULTS ──
  if (phase === 'results' && results) {
    const { overall, classification, gap, forecast, roadmap, gamification } = results;
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 lg:py-10 space-y-5">
        {/* Score hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-accent-orange/12 to-transparent border border-accent-orange/20 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden">
          <div className="text-[11px] uppercase tracking-widest text-accent-orange mb-1">Executive Readiness</div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring' }} className="text-6xl md:text-7xl font-bold text-white leading-none">
            {overall}<span className="text-3xl text-white/40">%</span>
          </motion.div>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-accent-orange/15 border border-accent-orange/30 text-sm font-medium text-accent-orange">{classification.label}</div>
          {persisting && <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] text-white/50"><Loader2 size={12} className="animate-spin" /> Saving…</div>}

          {/* Gamification */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[11px] text-indigo-300"><Sparkles size={11} /> +{gamification.xp} Executive XP</span>
            {gamification.badges.map((b) => {
              const Icon = BADGE_ICON[b.icon] || Award;
              return <span key={b.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-[11px] text-amber-300"><Icon size={11} /> {b.label}</span>;
            })}
          </div>
        </motion.div>

        {/* AI Coach message */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0"><Sparkles size={16} className="text-emerald-400" /></div>
            <div>
              <div className="text-xs font-semibold text-white mb-1">EXEC Concierge™</div>
              <p className="text-sm text-white/70 leading-relaxed">
                Congratulations. Based on your assessment, you're already performing at approximately <span className="text-white font-medium">{overall}% of {forecast.targetLevel.split('→').pop().trim()} expectations</span>. Your strongest capability is <span className="text-emerald-400 font-medium">{gap.strengths[0]?.label}</span>. Your biggest opportunity is <span className="text-amber-400 font-medium">{gap.opportunities[0]?.label || 'continuous practice'}</span>. Let's build your personalized promotion roadmap.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ReadinessRadar categoryResults={results.categoryResults} />
          <div className="space-y-5">
            <PromotionForecast forecast={forecast} />
            <GapAnalysisPanel gap={gap} />
          </div>
        </div>

        <Roadmap90Day roadmap={roadmap} />

        <ReadinessShareReport results={results} shareSlug={savedAssessment?.share_slug} />

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button onClick={restart} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 font-medium transition-colors"><RefreshCw size={14} /> Retake Assessment</button>
          <Link to="/coach" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-sm text-white font-semibold transition-colors"><Sparkles size={14} /> Continue with AI Coach <ArrowRight size={14} /></Link>
          <Link to="/dashboard" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 font-medium transition-colors"><Home size={14} /> Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  // ── TRACK SELECTION ──
  if (phase === 'track') {
    return <LeadershipTrackSelector onSelect={selectTrack} saving={savingTrack} />;
  }

  // ── QUIZ ──
  const cat = ASSESSMENT_CATEGORIES.find((c) => c.key === q.category);
  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center"><Gauge size={18} className="text-accent-orange" /></div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Executive Readiness Assessment™</h1>
            <div className="text-[11px] text-white/40">10 minutes · 20 questions · auto-saved</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">Question</div>
          <div className="text-sm font-semibold text-white">{idx + 1} / {total}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-1">
        <motion.div className="h-full bg-gradient-to-r from-accent-orange to-amber-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>
      <div className="text-[10px] text-white/30 mb-5">{progress}% complete</div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}30` }}>{cat.label}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-wider">{q.type === 'scenario' ? 'Scenario' : 'Likert'}</span>
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-white leading-snug mb-5">{q.question}</h2>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const active = selected === i;
              return (
                <button key={i} onClick={() => select(i)} className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${active ? 'bg-accent-orange/10 border-accent-orange/40' : 'bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/[0.04]'}`}>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${active ? 'border-accent-orange bg-accent-orange' : 'border-white/25'}`}>
                    {active && <Check size={11} className="text-[#0a0a0f]" />}
                  </span>
                  <span className={`text-sm leading-snug ${active ? 'text-white' : 'text-white/70'}`}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6">
        <button onClick={prev} disabled={idx === 0} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={15} /> Back
        </button>
        {idx < total - 1 ? (
          <button onClick={next} disabled={selected == null} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-sm text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={finish} disabled={selected == null || persisting} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-500/90 text-sm text-white font-semibold transition-colors disabled:opacity-40">
            {persisting ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />} See My Results
          </button>
        )}
      </div>
    </div>
  );
}