import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { SESSION_TYPES, INTERVIEWER_PROFILES, AI_PERSONALITIES, DIFFICULTY_LEVELS, SESSION_DURATIONS } from "@/lib/constants";
import { Brain, Send, Loader2, Bot, User, Play, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function Simulator() {
  const [profile, setProfile] = useState(null);
  const [step, setStep] = useState("setup");
  const [sessionType, setSessionType] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState(45);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [session, setSession] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) setProfile(profiles[0]);
    };
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async () => {
    if (!sessionType || !interviewer) return;
    setLoading(true);
    const typeLabel = SESSION_TYPES.find(s => s.id === sessionType)?.label || sessionType;
    const personality = AI_PERSONALITIES.find(p => p.id === profile?.ai_personality) || AI_PERSONALITIES[0];

    try {
      const s = await base44.entities.SimulationSession.create({
        session_type: sessionType,
        target_company: profile?.target_company || "IT Company",
        target_role: profile?.target_role || "Senior Manager",
        interviewer_profile: interviewer,
        ai_personality: personality.id,
        status: "in_progress",
      });
      setSession(s);

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a "${interviewer}" at "${profile?.target_company || 'a major IT company'}" conducting a "${typeLabel}" (${duration} minutes, ${difficulty} difficulty).

Your personality: ${personality.name} - ${personality.description}
Communication style: ${personality.communication_style}
Question style: ${personality.question_style}

The candidate is interviewing for: ${profile?.target_role || "Senior Manager"}.

Start the session. Introduce yourself, set the context, and ask your first question. Stay in character. Difficulty: ${difficulty}.`,
      });

      setMessages([{ role: "assistant", content: res }]);
      setStep("running");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const personality = AI_PERSONALITIES.find(p => p.id === profile?.ai_personality) || AI_PERSONALITIES[0];
    const typeLabel = SESSION_TYPES.find(s => s.id === sessionType)?.label || sessionType;
    const history = messages.map(m => `${m.role === "user" ? "CANDIDATE" : interviewer.toUpperCase()}: ${m.content}`).join("\n\n");

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a "${interviewer}" at "${profile?.target_company}" conducting a "${typeLabel}" (${difficulty} difficulty).
Personality: ${personality.name} - ${personality.description}
Communication style: ${personality.communication_style}

TRUTH ENGINE: Scrutinize claims. Challenge exaggerations. Demand specifics.

CONVERSATION:
${history}

CANDIDATE: ${userMsg}

Continue the session. Ask follow-ups, challenge when needed, stay in character. Difficulty: ${difficulty}.`,
      });
      setMessages(prev => [...prev, { role: "assistant", content: res }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Could you elaborate on that? I want to understand your approach more clearly." }]);
    }
    setLoading(false);
  };

  const endSession = async () => {
    setLoading(true);
    const history = messages.map(m => `${m.role === "user" ? "CANDIDATE" : "INTERVIEWER"}: ${m.content}`).join("\n\n");
    const typeLabel = SESSION_TYPES.find(s => s.id === sessionType)?.label || sessionType;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Evaluate this complete ${typeLabel} session (${difficulty} difficulty).

FULL TRANSCRIPT:
${history}

Provide a comprehensive evaluation.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            executive_score: { type: "number" },
            leadership_score: { type: "number" },
            commercial_score: { type: "number" },
            communication_score: { type: "number" },
            strategic_score: { type: "number" },
            presence_score: { type: "number" },
            truthfulness_score: { type: "number" },
            summary: { type: "string" },
            strengths: { type: "array", "items": { "type": "string" } },
            improvements: { type: "array", "items": { "type": "string" } },
            verdict: { type: "string" }
          }
        }
      });

      setSummary(res);
      setStep("summary");

      if (session) {
        await base44.entities.SimulationSession.update(session.id, {
          status: "completed",
          overall_score: res.overall_score,
          summary: res.summary,
          scores_json: JSON.stringify(res),
        });
      }
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          sessions_completed: (profile.sessions_completed || 0) + 1,
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const reset = () => {
    setStep("setup");
    setSessionType("");
    setInterviewer("");
    setDifficulty("Intermediate");
    setDuration(45);
    setMessages([]);
    setSummary(null);
    setSession(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Brain size={12} className="text-cyan-400" />
          Executive Simulator
        </div>
        <h1 className="text-2xl font-bold text-white">Real Executive Scenarios</h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Session Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {SESSION_TYPES.map(s => (
                  <button key={s.id} onClick={() => setSessionType(s.id)} className={`px-4 py-3 rounded-lg text-left transition-all ${sessionType === s.id ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30" : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70 border border-white/5"}`}>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs opacity-50 mt-0.5">{s.duration} min</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Interviewer Profile</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {INTERVIEWER_PROFILES.map(p => (
                  <button key={p} onClick={() => setInterviewer(p)} className={`px-4 py-3 rounded-lg text-sm text-left transition-all ${interviewer === p ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30" : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70 border border-white/5"}`}>{p}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Difficulty</h2>
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTY_LEVELS.map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`px-4 py-2.5 rounded-lg text-sm transition-all ${difficulty === d ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30" : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70 border border-white/5"}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Duration (minutes)</h2>
                <div className="grid grid-cols-5 gap-2">
                  {SESSION_DURATIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`px-2 py-2.5 rounded-lg text-sm transition-all ${duration === d ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30" : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70 border border-white/5"}`}>{d}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={startSession} disabled={!sessionType || !interviewer || loading} className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Play size={18} /> Start Simulation</>}
            </button>
          </motion.div>
        )}

        {step === "running" && (
          <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col" style={{ height: "calc(100vh - 14rem)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span className="text-cyan-400 font-medium">{interviewer}</span>
                <span>·</span>
                <span>{difficulty}</span>
                <span>·</span>
                <span>{duration} min</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-cyan-400" /></div>}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === "user" ? "bg-cyan-500/15 text-white/90" : "bg-white/[0.05] text-white/80"}`}>
                    {msg.role === "user" ? <p className="text-sm">{msg.content}</p> : <div className="text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>}
                  </div>
                  {msg.role === "user" && <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><User size={16} className="text-white/40" /></div>}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Bot size={16} className="text-cyan-400" /></div>
                  <div className="bg-white/[0.05] rounded-xl px-4 py-3"><Loader2 size={16} className="animate-spin text-cyan-400" /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2">
              <button onClick={endSession} disabled={loading} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <Square size={14} /> End
              </button>
              <div className="flex-1 relative">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="Respond to the interviewer..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" />
                <button onClick={sendMessage} disabled={!input.trim() || loading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400 disabled:opacity-30"><Send size={18} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "summary" && summary && (
          <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center py-6">
              <div className={`text-5xl font-bold mb-2 ${summary.overall_score >= 70 ? "text-emerald-400" : summary.overall_score >= 40 ? "text-amber-400" : "text-red-400"}`}>{summary.overall_score}</div>
              <p className="text-white/40 text-sm">Overall Score</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Executive", value: summary.executive_score },
                { label: "Leadership", value: summary.leadership_score },
                { label: "Commercial", value: summary.commercial_score },
                { label: "Communication", value: summary.communication_score },
                { label: "Strategic", value: summary.strategic_score },
                { label: "Presence", value: summary.presence_score },
                { label: "Truthfulness", value: summary.truthfulness_score },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white">{s.value || 0}</div>
                  <div className="text-white/30 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3">Summary</h3>
              <p className="text-white/60 text-sm leading-relaxed">{summary.summary}</p>
            </div>
            {summary.strengths?.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6">
                <h3 className="text-emerald-400 font-semibold mb-3">Strengths</h3>
                <ul className="space-y-2">{summary.strengths.map((s, i) => (<li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span> {s}</li>))}</ul>
              </div>
            )}
            {summary.improvements?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-6">
                <h3 className="text-amber-400 font-semibold mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">{summary.improvements.map((s, i) => (<li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> {s}</li>))}</ul>
              </div>
            )}
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6">
              <h3 className="text-indigo-400 font-semibold mb-3">Verdict</h3>
              <p className="text-white/70 text-sm">{summary.verdict}</p>
            </div>
            <button onClick={reset} className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-medium py-3 rounded-lg transition-colors">Run Another Simulation</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}