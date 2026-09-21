import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { evaluateSimulation, buildSimulationEvidenceRecord } from "@/lib/simulationIntelligenceEngine";
import {
  buildSituationRequest,
  buildChallengeRequest,
  buildFeedbackRequest,
} from "@/lib/executiveChallengeLoop";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Loader2, RotateCcw, RefreshCw, Flag, AlertTriangle, Eye, HelpCircle, Swords,
} from "lucide-react";

// EXEC™ Executive Challenge Loop™ — structured decision loop inside the
// existing Executive Simulator™. Reuses SimulationSession persistence,
// callAI, evaluateSimulation, and the Evidence Ledger™. No new scoring
// or readiness system.
const STEPS = ["Situation", "Decision", "Defend", "Challenge", "Response", "Feedback", "Retry"];

const FEEDBACK_SECTIONS = [
  { key: "what_you_did_well", label: "What you did well" },
  { key: "what_you_missed", label: "What you missed" },
  { key: "assumption_to_reconsider", label: "Assumption to reconsider" },
  { key: "trade_off", label: "Trade-off" },
  { key: "executive_implication", label: "Executive implication" },
  { key: "next_attempt", label: "Next attempt" },
];

export default function ExecutiveChallengeLoop({ profile, difficulty, session, seedScenario, onFinish, onExit }) {
  const [phase, setPhase] = useState("situation");
  const [situation, setSituation] = useState(null);
  const [decision, setDecision] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [log, setLog] = useState([]);
  const [attemptNo, setAttemptNo] = useState(1);
  const [revised, setRevised] = useState({ decision: "", reasoning: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finalizing, setFinalizing] = useState(false);

  // Persist one loop event to the existing SimulationSession record.
  // The transcript lives in messages_json — attempts are append-only,
  // revisions reference the original attempt.
  const persistEvent = useCallback(
    async (event) => {
      const next = [...log, event];
      setLog(next);
      if (!session?.id) return;
      try {
        await base44.entities.SimulationSession.update(session.id, {
          messages_json: JSON.stringify(next),
        });
      } catch (e) {
        console.error("[ChallengeLoop] persist failed:", e?.message);
      }
    },
    [log, session]
  );

  const generateSituation = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let s = null;
      if (seedScenario) {
        // Catalog scenario launch (Executive Scenario Library™) — the scenario
        // description is the situation narrative; the loop drives every step.
        s = {
          title: seedScenario.title,
          situation: seedScenario.description,
          known_facts: [],
          uncertainties: [],
        };
      } else {
        const req = buildSituationRequest({
          targetRole: profile?.target_role,
          targetCompany: profile?.target_company,
          difficulty,
        });
        const res = await callAI("simulator", req);
        s = res?.situation ? res : null;
      }
      if (!s) throw new Error("The situation could not be generated.");
      setSituation(s);
      await persistEvent({ type: "situation", payload: s });
      setPhase("situation");
    } catch (e) {
      setError(e?.message || String(e));
    }
    setLoading(false);
  }, [profile, difficulty, persistEvent, seedScenario]);

  useEffect(() => {
    generateSituation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runChallenge = async (attemptIdx, decText, rsnText) => {
    setLoading(true);
    setError("");
    try {
      const res = await callAI(
        "simulator",
        buildChallengeRequest({ situation, decision: decText, reasoning: rsnText, difficulty })
      );
      if (!res?.challenge) throw new Error("The challenge could not be generated.");
      setChallenge(res);
      await persistEvent({ type: "challenge", attempt: attemptIdx, payload: res });
      setPhase("challenge");
    } catch (e) {
      setError(e?.message || String(e));
      setPhase("defend");
    }
    setLoading(false);
  };

  const submitDecision = async () => {
    if (!decision.trim()) return;
    await persistEvent({ type: "decision", attempt: attemptNo, text: decision.trim() });
    setPhase("defend");
  };

  const submitReasoning = async () => {
    if (!reasoning.trim()) return;
    await persistEvent({ type: "reasoning", attempt: attemptNo, text: reasoning.trim() });
    await runChallenge(attemptNo, decision.trim(), reasoning.trim());
  };

  const submitResponse = async () => {
    if (!response.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await callAI(
        "simulator",
        buildFeedbackRequest({
          situation,
          attempt: {
            decision: decision.trim(),
            reasoning: reasoning.trim(),
            challenge,
            challengeResponse: response.trim(),
            attemptLabel: attemptNo > 1 ? `REVISION (attempt ${attemptNo})` : "FIRST ATTEMPT",
          },
        })
      );
      if (!res?.what_you_did_well) throw new Error("The feedback could not be generated.");
      setFeedback(res);
      await persistEvent({ type: "challenge_response", attempt: attemptNo, text: response.trim() });
      await persistEvent({ type: "feedback", attempt: attemptNo, payload: res });
      setPhase("feedback");
    } catch (e) {
      setError(e?.message || String(e));
    }
    setLoading(false);
  };

  const submitRevision = async () => {
    if (!revised.decision.trim()) return;
    const next = attemptNo + 1;
    setDecision(revised.decision.trim());
    setReasoning(revised.reasoning.trim() || "(reasoning unchanged from previous attempt)");
    setResponse("");
    setFeedback(null);
    await persistEvent({
      type: "decision",
      attempt: next,
      revision_of: attemptNo,
      text: revised.decision.trim(),
    });
    await persistEvent({
      type: "reasoning",
      attempt: next,
      revision_of: attemptNo,
      text: revised.reasoning.trim(),
    });
    setAttemptNo(next);
    setRevised({ decision: "", reasoning: "" });
    await runChallenge(next, revised.decision.trim(), revised.reasoning.trim() || reasoning.trim());
  };

  // Complete the loop → existing Executive Simulation Intelligence™
  // evaluation + Evidence Ledger™ + readiness signal. No new scoring
  // system — the exact path the interview simulator already uses.
  const finalize = async () => {
    setFinalizing(true);
    setError("");
    try {
      const transcript = log
        .map((e) => {
          const who = e.type === "situation" ? "SITUATION" : e.type === "feedback" || e.type === "challenge" ? "EXEC™" : "PARTICIPANT";
          const body = e.type === "situation" ? e.payload.situation : e.type === "challenge" ? e.payload.challenge : e.type === "feedback" ? JSON.stringify(e.payload) : e.text;
          return `[${e.attempt ? `Attempt ${e.attempt}` : "Scenario"}] ${who}: ${body}`;
        })
        .join("\n\n");
      const finalDecision = decision.trim();

      const report = await evaluateSimulation({
        type: "simulator",
        scenario: {
          title: `Executive Challenge Loop™ — ${situation.title}`,
          domain: "Executive Challenge Loop",
          difficulty: difficulty.toLowerCase(),
          description: situation.situation,
        },
        decision: `${finalDecision}${attemptNo > 1 ? " (revised after EXEC™ challenge)" : ""}`,
        explanation: transcript,
        leadershipPath: profile?.leadership_track,
        userContext: {
          target_role: profile?.target_role,
          target_company: profile?.target_company,
          leadership_track: profile?.leadership_track,
        },
        includeCouncil: true,
      });

      const avg = report.competencyEvaluations?.length
        ? Math.round(report.competencyEvaluations.reduce((s, c) => s + (c.score || 0), 0) / report.competencyEvaluations.length)
        : 0;

      if (session?.id) {
        await base44.entities.SimulationSession.update(session.id, {
          status: "completed",
          overall_score: avg,
          summary: report.decisionSummary,
          scores_json: JSON.stringify(report),
        });
      }

      try {
        const evidenceRecord = buildSimulationEvidenceRecord(report, {
          scenarioTitle: `Executive Challenge Loop™ — ${situation.title}`,
          simType: "Executive Simulator™",
        });
        if (evidenceRecord) {
          await base44.entities.EvidenceItem.create(evidenceRecord);
        }
      } catch (e) {
        console.error("[ChallengeLoop] evidence persist failed:", e.message);
      }

      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          sessions_completed: (profile.sessions_completed || 0) + 1,
        });
      }

      onFinish(report);
    } catch (e) {
      setError(e?.message || String(e));
      setFinalizing(false);
    }
  };

  const stepIndex = {
    situation: 0, defend: 1, decision: 1, challenge: 3, feedback: 4, retry: 6,
  }[phase] ?? 0;

  const renderStepIndicator = () => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <span className="text-white/20 text-[10px]">→</span>}
          <span className={`text-[10px] uppercase tracking-wider font-medium ${i === stepIndex ? "text-cyan-400" : i < stepIndex ? "text-white/40" : "text-white/20"}`}>
            {s}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  const Section = ({ icon: Icon, label, children, tone }) => (
    <div className={`rounded-xl border p-4 ${tone === "exec" ? "border-accent-orange/20 bg-accent-orange/[0.04]" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className={tone === "exec" ? "text-accent-orange" : "text-white/40"} />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">{label}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {renderStepIndicator()}
        <button onClick={onExit} disabled={loading || finalizing} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs border border-white/10 disabled:opacity-30 transition-colors">
          Exit Loop
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs text-red-300/80">{error}</div>
          <button onClick={() => { setError(""); if (!situation) generateSituation(); else if (phase === "defend") runChallenge(attemptNo, decision, reasoning); }} className="text-xs text-red-300 underline shrink-0">Retry</button>
        </div>
      )}

      {finalizing ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center">
          <Loader2 size={22} className="animate-spin text-accent-orange mx-auto mb-3" />
          <p className="text-white/50 text-sm">Evaluating your demonstrated decision-making…</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center">
              <Loader2 size={20} className="animate-spin text-cyan-400 mx-auto mb-3" />
              <p className="text-white/50 text-sm">{phase === "situation" ? "Preparing your executive situation…" : phase === "defend" ? "EXEC™ is reviewing your reasoning…" : "EXEC™ is responding…"}</p>
            </motion.div>
          )}

          {!loading && phase === "situation" && situation && (
            <motion.div key="situation" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-2">
                <Swords size={15} className="text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">{situation.title}</h2>
                <span className="ml-auto text-[10px] uppercase tracking-widest text-white/30">{difficulty} · Attempt {attemptNo}</span>
              </div>
              <Section icon={Eye} label="Situation">
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{situation.situation}</p>
              </Section>
              <Section icon={Eye} label="What you know">
                <ul className="space-y-1.5">
                  {(situation.known_facts || []).map((f, i) => (
                    <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-cyan-400/60 shrink-0">•</span>{f}</li>
                  ))}
                </ul>
              </Section>
              <Section icon={HelpCircle} label="What is uncertain">
                <ul className="space-y-1.5">
                  {(situation.uncertainties || []).map((u, i) => (
                    <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-amber-400/60 shrink-0">•</span>{u}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-white/30 mt-2">The objective is your decision process — the situation intentionally permits more than one defensible decision.</p>
              </Section>
              <Section icon={Flag} label="Your decision — what do you do?">
                <textarea value={decision} onChange={(e) => setDecision(e.target.value)} rows={4} placeholder="State the actual decision you would make…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none" />
                <button onClick={submitDecision} disabled={!decision.trim()} className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                  Commit Decision
                </button>
              </Section>
            </motion.div>
          )}

          {!loading && phase === "defend" && situation && (
            <motion.div key="defend" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Section icon={Flag} label="Your decision">
                <p className="text-sm text-white/80 whitespace-pre-line">{decision}</p>
              </Section>
              <Section icon={Brain} label="Defend your decision — why?">
                <p className="text-[11px] text-white/35 mb-2">Your reasoning, evidence, assumptions, priorities, risks, and trade-offs.</p>
                <textarea value={reasoning} onChange={(e) => setReasoning(e.target.value)} rows={6} placeholder="Explain why this is the right call…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none" />
                <button onClick={submitReasoning} disabled={!reasoning.trim()} className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Swords size={14} /> Submit to EXEC™
                </button>
              </Section>
            </motion.div>
          )}

          {!loading && phase === "challenge" && challenge && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Section icon={Swords} label="EXEC™ challenge" tone="exec">
                <div className="text-sm text-white/80 leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{challenge.challenge}</ReactMarkdown>
                </div>
                {(challenge.probes || []).length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                    {challenge.probes.map((p, i) => (
                      <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-accent-orange/70 shrink-0">?</span>{p}</li>
                    ))}
                  </ul>
                )}
              </Section>
              <Section icon={Brain} label="Your response">
                <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={5} placeholder="Respond to the challenge…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none" />
                <button onClick={submitResponse} disabled={!response.trim()} className="mt-3 w-full bg-accent-orange hover:bg-accent-orange/90 disabled:opacity-30 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                  Respond to EXEC™
                </button>
              </Section>
            </motion.div>
          )}

          {!loading && phase === "feedback" && feedback && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={13} className="text-white/40" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">EXEC™ feedback — attempt {attemptNo}{attemptNo > 1 ? " (revision)" : ""}</span>
                </div>
                <div className="space-y-3">
                  {FEEDBACK_SECTIONS.map(({ key, label }) => (
                    <div key={key}>
                      <div className="text-[10px] uppercase tracking-wider text-cyan-400/70 font-semibold mb-0.5">{label}</div>
                      <p className="text-sm text-white/75 leading-relaxed">{feedback[key] || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => setPhase("retry")} className="w-full bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium py-2.5 rounded-lg border border-white/10 flex items-center justify-center gap-2 transition-colors">
                  <RotateCcw size={14} /> Revise My Decision
                </button>
                <button onClick={finalize} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Flag size={14} /> Complete & Evaluate
                </button>
              </div>
              <p className="text-[11px] text-white/30 text-center">This is a development loop — revising your decision after the challenge is part of the exercise, not a penalty.</p>
            </motion.div>
          )}

          {!loading && phase === "retry" && (
            <motion.div key="retry" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Section icon={RefreshCw} label={`Revise your decision — attempt ${attemptNo + 1}`}>
                <p className="text-[11px] text-white/35 mb-2">Restate or revise your decision. Your prior attempt is preserved — this is about development, not scoring the first answer.</p>
                <textarea value={revised.decision} onChange={(e) => setRevised((r) => ({ ...r, decision: e.target.value }))} rows={4} placeholder="Your revised decision…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none" />
                <textarea value={revised.reasoning} onChange={(e) => setRevised((r) => ({ ...r, reasoning: e.target.value }))} rows={4} placeholder="Updated reasoning (optional — why the revision is better)…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none mt-2" />
                <button onClick={submitRevision} disabled={!revised.decision.trim()} className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Swords size={14} /> Submit Revision to EXEC™
                </button>
                <button onClick={() => setPhase("feedback")} className="mt-2 w-full text-white/40 hover:text-white/70 text-xs py-1 transition-colors">Back to feedback</button>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>
      )}

    </div>
  );
}