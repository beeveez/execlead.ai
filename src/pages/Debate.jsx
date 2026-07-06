import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { AI_PERSONALITIES, QUESTION_CATEGORIES } from "@/lib/constants";
import { Swords, Send, Loader2, Bot, User, RotateCcw, Flame, ShieldAlert } from "lucide-react";
import { callAI } from "@/lib/ai";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const MIN_ROUNDS = 5;

export default function Debate() {
  const [profile, setProfile] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("setup");
  const [round, setRound] = useState(0);
  const [finalScore, setFinalScore] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        const p = AI_PERSONALITIES.find(a => a.id === profiles[0].ai_personality);
        if (p) setPersonality(p);
      }
    };
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startDebate = async (cat) => {
    setCategory(cat);
    setGenerating(true);
    setStep("debate");
    try {
      const p = personality || AI_PERSONALITIES[0];
      const res = await callAI("debate", {
        prompt: `You are "${p.name}" - ${p.description}
Communication style: ${p.communication_style}
Leadership style: ${p.leadership_style}

The candidate is targeting: ${profile?.target_role || "Senior Manager"} at ${profile?.target_company || "a major IT company"}.

Generate ONE provocative executive debate topic in the category "${cat}". State a strong position that an executive might take, and challenge the candidate to defend or refute it. Be bold and opinionated. Keep it to 2-3 sentences.`,
      });
      setTopic(res);
      setMessages([{ role: "assistant", content: res }]);
      setRound(1);
    } catch (e) {
      setTopic("Cloud migration is always the right strategic decision for enterprise IT. Defend or refute this position.");
      setMessages([{ role: "assistant", content: "Cloud migration is always the right strategic decision for enterprise IT. Defend or refute this position." }]);
      setRound(1);
    }
    setGenerating(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const p = personality || AI_PERSONALITIES[0];
    const history = messages.map(m => `${m.role === "user" ? "CANDIDATE" : p.name.toUpperCase()}: ${m.content}`).join("\n\n");
    const currentRound = round + 1;

    try {
      if (currentRound <= MIN_ROUNDS) {
        const res = await callAI("debate", {
          prompt: `You are "${p.name}" in an executive DEBATE.
Communication style: ${p.communication_style}
Question style: ${p.question_style}

Topic: ${topic}
Round: ${currentRound} of at least ${MIN_ROUNDS}

TRUTH ENGINE: Scrutinize the candidate's claims. If they exaggerate, lack evidence, or make unsupported assertions, call it out.

DEBATE RULES: Never agree easily. Push back. Demand evidence, metrics, and business impact. Challenge their assumptions. Only concede a point if they provide truly compelling executive reasoning.

CONVERSATION:
${history}

CANDIDATE: ${userMsg}

Continue the debate. This is round ${currentRound}. Push deeper. Ask for specifics. Be challenging but professional.`,
        });
        setMessages(prev => [...prev, { role: "assistant", content: res }]);
        setRound(currentRound);
      } else {
        // Final evaluation after 5+ rounds
        const res = await callAI("debate", {
          prompt: `You are "${p.name}" evaluating an executive debate that has lasted ${currentRound} rounds.

Topic: ${topic}
Full conversation:
${history}

CANDIDATE's final response: ${userMsg}

Provide your final debate evaluation as JSON.`,
          response_json_schema: {
            type: "object",
            properties: {
              closing_statement: { type: "string" },
              conviction_score: { type: "number" },
              strategic_thinking_score: { type: "number" },
              evidence_score: { type: "number" },
              executive_presence_score: { type: "number" },
              truthfulness_score: { type: "number" },
              overall_score: { type: "number" },
              verdict: { type: "string" }
            }
          }
        });
        setMessages(prev => [...prev, { role: "assistant", content: res.closing_statement }]);
        setFinalScore(res);
        setStep("result");
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "I challenge you to provide more specific evidence for that claim." }]);
    }
    setLoading(false);
  };

  const endEarly = async () => {
    if (round < 2) return;
    setLoading(true);
    const p = personality || AI_PERSONALITIES[0];
    const history = messages.map(m => `${m.role === "user" ? "CANDIDATE" : p.name.toUpperCase()}: ${m.content}`).join("\n\n");
    try {
      const res = await callAI("debate", {
        prompt: `Evaluate this executive debate (${round} rounds).
Topic: ${topic}
Conversation:
${history}

Provide your final debate evaluation as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            closing_statement: { type: "string" },
            conviction_score: { type: "number" },
            strategic_thinking_score: { type: "number" },
            evidence_score: { type: "number" },
            executive_presence_score: { type: "number" },
            truthfulness_score: { type: "number" },
            overall_score: { type: "number" },
            verdict: { type: "string" }
          }
        }
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.closing_statement }]);
      setFinalScore(res);
      setStep("result");
    } catch (e) {}
    setLoading(false);
  };

  const reset = () => {
    setStep("setup");
    setCategory("");
    setTopic("");
    setMessages([]);
    setRound(0);
    setFinalScore(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Swords size={12} className="text-red-400" />
          Executive Debate Mode
        </div>
        <h1 className="text-2xl font-bold text-white">Defend Your Position</h1>
        <p className="text-white/40 text-sm mt-1">The AI will challenge you for at least {MIN_ROUNDS} rounds. No weak answers accepted.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {personality && (
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-6">
                <span className="text-2xl">{personality.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white">{personality.name}</div>
                  <div className="text-xs text-white/30">Debating as: {personality.subtitle}</div>
                </div>
              </div>
            )}
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Choose a Debate Topic</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {QUESTION_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => startDebate(cat)}
                  disabled={generating}
                  className="px-3 py-3 bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-lg text-sm text-white/50 hover:text-red-400 transition-all text-left"
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "debate" && (
          <motion.div key="debate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col" style={{ height: "calc(100vh - 16rem)" }}>
            {/* Round indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                <span className="text-sm text-white/40">Round <span className="text-white font-bold">{round}</span> / {MIN_ROUNDS} minimum</span>
              </div>
              {round >= 2 && (
                <button
                  onClick={endEarly}
                  disabled={loading}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  End Debate & Score
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {generating ? (
                <div className="flex items-center justify-center py-12 gap-3 text-white/40">
                  <Loader2 size={20} className="animate-spin" />
                  Generating debate topic...
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-red-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === "user" ? "bg-indigo-500/15 text-white/90" : "bg-white/[0.05] text-white/80"}`}>
                      {msg.role === "user" ? <p className="text-sm">{msg.content}</p> : <div className="text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-white/40" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Bot size={16} className="text-red-400" />
                  </div>
                  <div className="bg-white/[0.05] rounded-xl px-4 py-3">
                    <Loader2 size={16} className="animate-spin text-red-400" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <button onClick={reset} className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white/60 transition-colors" title="New debate">
                <RotateCcw size={18} />
              </button>
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Defend your position..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                />
                <button onClick={sendMessage} disabled={!input.trim() || loading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-400 disabled:opacity-30">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "result" && finalScore && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center py-6">
              <div className={`text-5xl font-bold mb-2 ${finalScore.overall_score >= 70 ? "text-emerald-400" : finalScore.overall_score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                {finalScore.overall_score}
              </div>
              <p className="text-white/40 text-sm">Debate Overall Score</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: "Conviction", value: finalScore.conviction_score },
                { label: "Strategic Thinking", value: finalScore.strategic_thinking_score },
                { label: "Evidence", value: finalScore.evidence_score },
                { label: "Executive Presence", value: finalScore.executive_presence_score },
                { label: "Truthfulness", value: finalScore.truthfulness_score },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white">{s.value || 0}</div>
                  <div className="text-white/30 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={16} className="text-indigo-400" />
                <h3 className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Verdict</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{finalScore.verdict}</p>
            </div>

            <button onClick={reset} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-3 rounded-lg transition-colors">
              Start a New Debate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}