import React, { useState, useEffect } from "react";
import { Mic, Send, Loader2, Play, RotateCcw, CheckCircle2 } from "lucide-react";
import { INTERVIEW_PERSONAS, SCORING_DIMENSIONS } from "@/lib/launchDefenseEngine";

/**
 * InterviewSimulator™ — practice against an AI interviewer persona. The AI asks
 * naturally, generates follow-ups, occasionally challenges or interrupts, and
 * scores every answer. Completes a session with an overall score.
 */
export default function InterviewSimulator({ ld, initialContext }) {
  const { questions, scenarios, scoreAnswer, saveAttempt, saveSession } = ld;
  const [persona, setPersona] = useState("Investor");
  const [scenarioId, setScenarioId] = useState("");
  const [active, setActive] = useState(false);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionScores, setSessionScores] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialContext?.scenarioId) setScenarioId(initialContext.scenarioId);
    if (initialContext?.persona) setPersona(initialContext.persona);
  }, [initialContext]);

  const start = () => {
    let pool = questions;
    if (scenarioId) {
      const sc = scenarios.find((s) => s.id === scenarioId);
      if (sc?.question_ids?.length) {
        const byId = new Set(sc.question_ids);
        pool = questions.filter((q) => byId.has(q.question_id));
      }
    }
    if (!pool.length) pool = questions;
    const picked = pool.slice(0, Math.min(5, pool.length));
    setQueue(picked);
    setIdx(0);
    setMessages([{ role: "interviewer", text: `I'm your ${persona} today. Let's begin. ${picked[0]?.question || "Tell me about yourself."}` }]);
    setSessionScores([]);
    setDone(false);
    setActive(true);
  };

  const submit = async () => {
    if (!answer.trim() || !queue[idx]) return;
    const current = queue[idx];
    setMessages((m) => [...m, { role: "user", text: answer }]);
    const ans = answer;
    setAnswer("");
    setBusy(true);
    const res = await scoreAnswer(ans, { question: current.question, persona, category: current.category });
    await saveAttempt({
      question_id: current.question_id, question: current.question, category: current.category,
      persona, answer: ans, scores_json: JSON.stringify(res.scores || {}), feedback: res.feedback || "", overall_score: res.overall || 0,
    });
    setSessionScores((s) => [...s, res.overall || 0]);

    const nextIdx = idx + 1;
    const challenge = Math.random() < 0.3 ? " Interesting. But let me push back — what's the concrete evidence for that? " : "";
    if (nextIdx < queue.length) {
      setMessages((m) => [...m, { role: "interviewer", text: `${challenge}${queue[nextIdx].question}` }]);
      setIdx(nextIdx);
    } else {
      const avg = Math.round([...sessionScores, res.overall || 0].reduce((a, b) => a + b, 0) / (sessionScores.length + 1));
      const sc = scenarios.find((s) => s.id === scenarioId);
      await saveSession({
        scenario_id: scenarioId || "ad-hoc",
        scenario_name: sc?.name || "Ad-hoc Practice",
        persona,
        questions_json: JSON.stringify(queue.map((q) => q.question)),
        scores_json: JSON.stringify({ avg }),
        overall_score: avg,
        questions_answered: queue.length,
        weak_areas: SCORING_DIMENSIONS.filter((d) => (res.scores?.[d.key] || 0) < 60).map((d) => d.label),
      });
      setMessages((m) => [...m, { role: "interviewer", text: `That concludes our session. Thank you. Your overall score: ${avg}/100.` }]);
      setDone(true);
    }
    setBusy(false);
  };

  if (!active) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4"><Mic size={18} className="text-rose-400" /><h3 className="text-white font-semibold text-sm">Interview Simulator™</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">Interviewer Persona</label>
            <select value={persona} onChange={(e) => setPersona(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {INTERVIEW_PERSONAS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">Scenario (optional)</label>
            <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="">Ad-hoc Practice</option>
              {scenarios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={start} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors">
          <Play size={14} /> Start Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Mic size={16} className="text-rose-400" /><span className="text-sm font-semibold text-white">{persona} · {done ? "Complete" : `Question ${idx + 1}/${queue.length}`}</span></div>
        <button onClick={() => setActive(false)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-white/60 text-xs"><RotateCcw size={12} /> Restart</button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "bg-indigo-500/20 text-white" : "bg-white/5 text-white/80"}`}>{m.text}</div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-xs text-white/40"><Loader2 size={12} className="animate-spin" /> Coach is evaluating…</div>}
      </div>

      {!done && (
        <div className="flex gap-2">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2} placeholder="Type your answer…" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-rose-500/40 resize-none" />
          <button onClick={submit} disabled={busy || !answer.trim()} className="self-end inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-sm"><Send size={14} /></button>
        </div>
      )}
      {done && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle2 size={16} /> Session saved to your Practice History.</div>
      )}
    </div>
  );
}