import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import {
  QUESTIONS, ASSESSMENT_CATEGORIES, buildAssessmentSet, computeFullResults, ASSESSMENT_STORAGE_KEY, LEADERSHIP_TRACKS,
} from '@/lib/readinessAssessmentEngine';
import LeadershipTrackSelector from '@/components/readiness-assessment/LeadershipTrackSelector';
import ExecutiveReadinessReport from '@/components/readiness-assessment/ExecutiveReadinessReport';
import FirstSuccessExperience from '@/components/readiness-assessment/FirstSuccessExperience';
import {
  Loader2, ChevronLeft, ChevronRight, Sparkles, Award, Check, Gauge, PauseCircle,
} from 'lucide-react';
import EnterpriseAssessmentCenter from '@/components/readiness-assessment/EnterpriseAssessmentCenter';
import { completeEnterpriseOnboarding } from '@/lib/onboarding/onboardingOrchestrator';
import CalibrationCompleteScreen from '@/components/onboarding/CalibrationCompleteScreen';

export default function ExecutiveReadinessAssessment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const assignedTrack = urlParams.get('track');
  const assignedOnboarding = urlParams.get('assigned') === '1';
  const [phase, setPhase] = useState(assignedOnboarding && assignedTrack ? 'quiz' : 'launchpad');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [persisting, setPersisting] = useState(false);
  const [calibrationTransition, setCalibrationTransition] = useState(null);
  const [savedAssessment, setSavedAssessment] = useState(null);
  const [history, setHistory] = useState([]);
  const [track, setTrack] = useState(assignedTrack || null);
  const [targetRole, setTargetRole] = useState(null);
  const [savingTrack, setSavingTrack] = useState(false);

  // Adaptive Question Engine™ — 16 universal + 4 path-specific questions.
  const questions = useMemo(() => buildAssessmentSet(track), [track]);

  // Enterprise Executive Assessment Center™ — load context for the launchpad.
  const [enterprise, setEnterprise] = useState(false);
  const [orgName, setOrgName] = useState(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (me?.data?.leadership_track) {
          setTrack(me.data.leadership_track);
          setTargetRole(me.data.target_executive_role || null);
        }
        let org = me?.data?.organization || null;
        let ent = false;
        try {
          const memberships = await base44.entities.OrgMembership.filter({ user_id: me?.id || user?.id });
          if (memberships && memberships.length > 0) { ent = true; org = org || 'Enterprise Workspace'; }
        } catch (e) {}
        setEnterprise(ent);
        setOrgName(org);
      } catch (e) {}
      try {
        const saved = JSON.parse(localStorage.getItem(ASSESSMENT_STORAGE_KEY) || 'null');
        if (saved && saved.answers && Object.keys(saved.answers).length > 0) setHasSavedProgress(true);
      } catch (e) {}
    })();
  }, []);

  // Goal → leadership track mapping for self-service members.
  const GOAL_MAP = {
    'Become a Director': { track: 'business', role: 'Director' },
    'Become a Senior Director': { track: 'business', role: 'Senior Director' },
    'Become a VP': { track: 'business', role: 'Vice President' },
    'Become a CIO': { track: 'technology', role: 'CIO' },
    'Become a CTO': { track: 'technology', role: 'CTO' },
    'Become a CHRO': { track: 'hr', role: 'CHRO' },
    'Become a COO': { track: 'business', role: 'COO' },
    'Become a CEO': { track: 'business', role: 'CEO' },
  };

  const beginAssessment = () => {
    if (!track) { setPhase('track'); return; }
    setPhase('quiz');
  };
  const browsePaths = () => setPhase('track');
  const chooseGoal = (goal) => {
    const m = GOAL_MAP[goal] || { track: 'business', role: goal };
    selectTrack(m.track, m.role);
  };

  // Restore in-progress answers
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ASSESSMENT_STORAGE_KEY) || 'null');
      if (saved && saved.answers) {
        setAnswers(saved.answers);
        setIdx(Math.min(saved.idx || 0, questions.length - 1));
      }
    } catch (e) {}
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (phase === 'quiz') localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answers, idx }));
  }, [answers, idx, phase]);

  // Load the member's assessment history for the living report (What Changed, timeline, snapshots).
  useEffect(() => {
    if (phase !== 'results') return;
    (async () => {
      try {
        const recs = await base44.entities.ReadinessAssessment.filter({ user_id: user?.id }, '-completed_date', 20);
        setHistory(recs || []);
      } catch (e) {}
    })();
  }, [phase, user?.id]);

  const q = questions[idx];
  const total = questions.length;
  const progress = Math.round(((idx) / total) * 100);
  const remainingMin = Math.max(0, Math.ceil((total - idx) * 0.5));
  const selected = answers[q?.id];

  const select = (optionIndex) => {
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
  };

  const next = () => { if (idx < total - 1) setIdx(idx + 1); };
  const prev = () => { if (idx > 0) setIdx(idx - 1); };

  const pause = () => { toast({ title: 'Progress saved', description: 'Your answers are auto-saved — resume your assessment anytime.' }); };

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
    try { base44.analytics.track({ eventName: 'leadership_path_selected', properties: { path: trackKey } }); } catch (e) {}
    setPhase('quiz');
  };

  const finish = useCallback(async () => {
    const r = computeFullResults(answers, track);
    // Personalize the promotion forecast with the selected target role.
    if (targetRole) r.forecast.targetLevel = targetRole;
    setResults(r);
    if (!assignedOnboarding) setPhase('first-insight');
    try { base44.analytics.track({ eventName: 'assessment_completed', properties: { path: track, overall: r.overall, universal: r.universalScore, role_specific: r.roleScore } }); } catch (e) {}
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
      if (assignedOnboarding) setCalibrationTransition(await completeEnterpriseOnboarding(user, r));
    } catch (e) {
      toast({ title: 'Could not save assessment', description: e.message, variant: 'destructive' });
    } finally { setPersisting(false); }
  }, [answers, assignedOnboarding, user, toast, targetRole, track]);

  const restart = () => { setAnswers({}); setIdx(0); setPhase('track'); setResults(null); localStorage.removeItem(ASSESSMENT_STORAGE_KEY); };

  if (calibrationTransition) {
    return <CalibrationCompleteScreen {...calibrationTransition} enterpriseProgram={user?.assessment_program_name || 'Q3 Director Readiness Program™'} onComplete={() => navigate('/dashboard')} />;
  }

  // ── FIRST SUCCESS EXPERIENCE — personalized insight in under 5 minutes ──
  if (phase === 'first-insight' && results) {
    return (
      <FirstSuccessExperience
        results={results}
        targetRole={targetRole}
        user={user}
        assignedAt={savedAssessment?.completed_at}
        onViewReport={() => setPhase('results')}
        onTrySimulation={() => navigate('/simulator')}
      />
    );
  }

  // ── RESULTS — the signature Executive Readiness Report™ ──
  if (phase === 'results' && results) {
    const previousRecord = history[0]?.id === savedAssessment?.id ? history[1] : history[0];
    return (
      <ExecutiveReadinessReport
        results={results}
        savedAssessment={savedAssessment}
        persisting={persisting}
        onRestart={restart}
        targetRole={targetRole}
        history={history}
        previousRecord={previousRecord}
      />
    );
  }

  // ── ENTERPRISE EXECUTIVE ASSESSMENT CENTER™ LAUNCHPAD ──
  if (phase === 'launchpad') {
    return (
      <EnterpriseAssessmentCenter
        user={user}
        enterprise={enterprise}
        orgName={orgName}
        hasSavedProgress={hasSavedProgress}
        track={track}
        onBegin={beginAssessment}
        onChooseGoal={chooseGoal}
        onBrowsePaths={browsePaths}
      />
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
      <div className="flex items-center justify-between mb-5">
        <div className="text-[10px] text-white/30">{progress}% complete</div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30">~{remainingMin} min remaining</span>
          <button onClick={pause} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"><PauseCircle size={11} /> Save & resume later</button>
        </div>
      </div>

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