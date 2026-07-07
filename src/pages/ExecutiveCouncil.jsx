import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Users, Send, Loader2, RotateCcw, Gavel, Eye, MessageSquare, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNCIL_PERSONAS, DEFAULT_BOARD, EXAMPLE_QUESTIONS } from "@/lib/councilData";
import { buildCouncilContext, runCouncil } from "@/lib/councilEngine";
import CouncilPersonaCard from "@/components/council/CouncilPersonaCard";
import VotingSummary from "@/components/council/VotingSummary";
import DebateView from "@/components/council/DebateView";
import DecisionBrief from "@/components/council/DecisionBrief";
import CouncilHistory from "@/components/council/CouncilHistory";

const PHASES = [
  { key: "perspectives", label: "Executives forming perspectives", desc: "Each board member responds independently" },
  { key: "debate", label: "Board debating", desc: "Executives challenge each other's positions" },
  { key: "brief", label: "Compiling decision brief", desc: "Generating board-quality recommendation" },
];

const RESULT_TABS = [
  { id: "summary", label: "Board Summary", icon: Eye },
  { id: "perspectives", label: "Perspectives", icon: Users },
  { id: "debate", label: "Debate", icon: MessageSquare },
  { id: "brief", label: "Decision Brief", icon: FileText },
];

function safeParse(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
}

export default function ExecutiveCouncil() {
  const { profile, organization } = useSubscription();
  const [selected, setSelected] = useState(DEFAULT_BOARD);
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState("setup");
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    base44.entities.CouncilSession.list("-created_date", 20).then(setHistory).catch(() => {});
  }, []);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const context = buildCouncilContext(profile, organization);
  const personas = COUNCIL_PERSONAS.filter((p) => selected.includes(p.id));
  const visiblePersonas = showAll ? COUNCIL_PERSONAS : COUNCIL_PERSONAS.slice(0, 12);

  const consult = async () => {
    if (!question.trim() || selected.length < 2) return;
    setLoading(true);
    setStep("consulting");
    setPhase(0);

    try {
      const councilResult = await runCouncil(personas, question, context, (p) => {
        const idx = PHASES.findIndex((ph) => ph.key === p);
        if (idx >= 0) setPhase(idx);
      });

      setResult(councilResult);

      const brief = councilResult.brief || {};
      await base44.entities.CouncilSession.create({
        question,
        personas_json: JSON.stringify(personas.map((p) => p.id)),
        perspectives_json: JSON.stringify(councilResult.perspectives),
        debate_json: JSON.stringify(councilResult.debate || {}),
        decision_brief_json: JSON.stringify(brief),
        overall_confidence: brief.confidence_level || 0,
        consensus_level: brief.consensus_level || "moderate",
        context_summary: context,
        action_items_json: JSON.stringify(brief.action_items || []),
        status: "completed",
      });

      const updated = await base44.entities.CouncilSession.list("-created_date", 20);
      setHistory(updated);
    } catch (e) {
      setResult(null);
    }

    setLoading(false);
    setStep("result");
  };

  const reopen = (session) => {
    const personasList = safeParse(session.personas_json, []).map((id) => COUNCIL_PERSONAS.find((p) => p.id === id)).filter(Boolean);
    setResult({
      perspectives: safeParse(session.perspectives_json, []),
      debate: safeParse(session.debate_json, {}),
      brief: safeParse(session.decision_brief_json, {}),
    });
    setQuestion(session.question);
    setSelected(personasList.map((p) => p.id));
    setActiveTab("summary");
    setStep("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setStep("setup");
    setQuestion("");
    setResult(null);
    setPhase(0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Gavel size={12} className="text-indigo-400" />
          Executive Council™ 3.0
        </div>
        <h1 className="text-2xl font-bold text-white">The AI Board of Directors</h1>
        <p className="text-white/40 text-sm mt-1">Submit a strategic question. The board deliberates, debates, and produces a board-quality decision brief.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* SETUP */}
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Persona selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Select Board Members ({selected.length} seated)</h2>
                <button onClick={() => setShowAll(!showAll)} className="text-xs text-indigo-400 hover:text-indigo-300">
                  {showAll ? "Show fewer" : `Show all ${COUNCIL_PERSONAS.length}`}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {visiblePersonas.map((p) => {
                  const active = selected.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${active ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{p.icon}</span>
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${active ? "bg-indigo-500 border-indigo-500" : "border-white/20"}`} />
                      </div>
                      <div className="text-white font-semibold text-sm">{p.name}</div>
                      <div className="text-white/30 text-xs leading-tight">{p.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Context preview */}
            {context && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Board Context (auto-applied)</div>
                <p className="text-xs text-white/40 leading-relaxed whitespace-pre-line">{context}</p>
              </div>
            )}

            {/* Question */}
            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Strategic Question for the Board</h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What strategic decision would you like the board to deliberate?"
                rows={4}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => setQuestion(q)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/40 hover:text-white/70 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={consult}
              disabled={!question.trim() || selected.length < 2}
              className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium rounded-xl transition-colors"
            >
              <Send size={16} /> Convene the Board ({selected.length} members)
            </button>
            {selected.length < 2 && <p className="text-center text-xs text-white/30">Select at least 2 board members to proceed.</p>}
          </motion.div>
        )}

        {/* CONSULTING */}
        {step === "consulting" && (
          <motion.div key="consulting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400 mb-6" />
            <div className="w-full max-w-sm space-y-3">
              {PHASES.map((ph, i) => (
                <div key={ph.key} className={`flex items-center gap-3 text-sm transition-all ${i <= phase ? "text-white/70" : "text-white/20"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i < phase ? "bg-emerald-500/20 text-emerald-400" : i === phase ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5"}`}>
                    {i < phase ? "✓" : i + 1}
                  </div>
                  <div>
                    <div className="font-medium">{ph.label}</div>
                    <div className="text-xs text-white/30">{ph.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {step === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Question header */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">Board Question</div>
              <p className="text-white/80 text-sm">{question}</p>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-[10px] text-white/30">
                {personas.map((p, i) => (
                  <span key={p.id}>{i > 0 && " · "}{p.icon} {p.name}</span>
                ))}
              </div>
            </div>

            {/* Result tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {RESULT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div>
              {activeTab === "summary" && (
                <div className="space-y-4">
                  <VotingSummary
                    perspectives={result.perspectives || []}
                    consensusLevel={result.brief?.consensus_level}
                    confidenceLevel={result.brief?.confidence_level}
                  />
                  {result.brief?.executive_summary && (
                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-5">
                      <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-2">Executive Summary</h3>
                      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{result.brief.executive_summary}</p>
                    </div>
                  )}
                  {result.brief?.recommendation && (
                    <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-xl p-5">
                      <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-2">Recommendation</h3>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{result.brief.recommendation}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "perspectives" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(result.perspectives || []).map((p, i) => (
                    <CouncilPersonaCard key={i} persona={p.persona} perspective={p} index={i} />
                  ))}
                </div>
              )}

              {activeTab === "debate" && <DebateView debate={result.debate} />}

              {activeTab === "brief" && <DecisionBrief brief={result.brief} />}
            </div>

            {/* Actions */}
            <button onClick={reset} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={16} /> Convene New Board Session
            </button>

            {/* History */}
            {history.length > 0 && <CouncilHistory sessions={history} onReopen={reopen} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}