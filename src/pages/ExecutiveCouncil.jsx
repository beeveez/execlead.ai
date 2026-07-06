import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Users, Send, Loader2, RotateCcw, Lightbulb, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import CouncilPersonaCard from "@/components/council/CouncilPersonaCard";

const COUNCIL_PERSONAS = [
  { id: "cio", name: "CIO", title: "Chief Information Officer", icon: "💻", perspective: "Technology & Digital", focus: "IT strategy, digital transformation, technology investments, cybersecurity, enterprise architecture" },
  { id: "coo", name: "COO", title: "Chief Operating Officer", icon: "⚙️", perspective: "Operations", focus: "Operational excellence, supply chain, process optimization, organizational efficiency" },
  { id: "cfo", name: "CFO", title: "Chief Financial Officer", icon: "💰", perspective: "Finance", focus: "P&L management, capital allocation, financial strategy, cost optimization, ROI" },
  { id: "chro", name: "CHRO", title: "Chief HR Officer", icon: "👥", perspective: "People & Culture", focus: "Talent strategy, organizational design, leadership development, culture transformation" },
  { id: "country_manager", name: "Country Manager", title: "Country Manager", icon: "🌍", perspective: "Regional & Market", focus: "Market entry, regional strategy, local partnerships, cultural adaptation" },
  { id: "customer_exec", name: "Customer Exec", title: "Chief Customer Officer", icon: "🤝", perspective: "Customer & Revenue", focus: "Customer experience, revenue growth, retention, customer success, commercial strategy" },
  { id: "strategy_consultant", name: "Strategy Partner", title: "Strategy Consultant", icon: "♟️", perspective: "Strategy & M&A", focus: "Corporate strategy, M&A, competitive positioning, market analysis, growth strategy" },
];

const EXAMPLE_QUESTIONS = [
  "Should we migrate our on-premise infrastructure to the cloud?",
  "How do I position myself for a CIO role within 2 years?",
  "What's the best approach to integrate our recent acquisition?",
  "How should we restructure our technology organization?",
];

export default function ExecutiveCouncil() {
  const { profile } = useSubscription();
  const [selected, setSelected] = useState(COUNCIL_PERSONAS.map((p) => p.id));
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState("setup");
  const [perspectives, setPerspectives] = useState([]);
  const [consolidated, setConsolidated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    base44.entities.CouncilSession.list("-created_date", 5).then(setHistory).catch(() => {});
  }, []);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const consult = async () => {
    if (!question.trim() || selected.length < 2) return;
    setLoading(true);
    setStep("consulting");

    const personas = COUNCIL_PERSONAS.filter((p) => selected.includes(p.id));
    const context = profile ? `The executive is targeting: ${profile.target_role} at ${profile.target_company}. Industry: ${profile.industry || "Technology"}.` : "";

    const results = await Promise.all(
      personas.map(async (p) => {
        try {
          const res = await callAI("council", {
            prompt: `You are a ${p.title} (${p.name}) serving on an Executive Advisory Council.
Your focus areas: ${p.focus}

${context}

EXECUTIVE'S QUESTION: ${question}

Provide your perspective as the ${p.name}. Be specific, actionable, and draw on your executive expertise. Address the question from your functional area. Keep it to 3-4 paragraphs. Be direct and opinionated.`,
          });
          return { persona: p, perspective: res };
        } catch (e) {
          return { persona: p, perspective: "Unable to generate perspective at this time." };
        }
      })
    );
    setPerspectives(results);

    try {
      const allPerspectives = results.map((r) => `${r.persona.name}: ${r.perspective}`).join("\n\n");
      const res = await callAI("council", {
        prompt: `You are the Lead Advisor of an Executive Advisory Council. The following executives have provided their perspectives on a strategic question.

EXECUTIVE'S QUESTION: ${question}

${context}

COUNCIL PERSPECTIVES:
${allPerspectives}

Provide a CONSOLIDATED RECOMMENDATION that synthesizes the council's input. Include key themes, areas of agreement/disagreement, a clear recommendation, key risks, and next steps. Read like an executive advisory brief.`,
        response_json_schema: {
          type: "object",
          properties: {
            key_themes: { type: "string" },
            consensus: { type: "string" },
            recommendation: { type: "string" },
            risks: { type: "string" },
            next_steps: { type: "string" },
            confidence_level: { type: "number" },
          },
        },
      });
      setConsolidated(res);

      await base44.entities.CouncilSession.create({
        question,
        personas_json: JSON.stringify(personas.map((p) => p.id)),
        perspectives_json: JSON.stringify(results),
        consolidated_recommendation: JSON.stringify(res),
        overall_confidence: res.confidence_level || 0,
      });

      const updated = await base44.entities.CouncilSession.list("-created_date", 5);
      setHistory(updated);
    } catch (e) {}

    setLoading(false);
    setStep("result");
  };

  const reset = () => {
    setStep("setup");
    setQuestion("");
    setPerspectives([]);
    setConsolidated(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Users size={12} className="text-indigo-400" />
          Executive Council™
        </div>
        <h1 className="text-2xl font-bold text-white">Your AI Advisory Board</h1>
        <p className="text-white/40 text-sm mt-1">Receive perspectives from multiple executive personas before receiving a consolidated recommendation.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Select Council Members ({selected.length} selected)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {COUNCIL_PERSONAS.map((p) => {
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
                      <div className="text-white/30 text-xs">{p.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Your Strategic Question</h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What strategic question would you like to bring to the Council?"
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
              <Send size={16} /> Consult Council ({selected.length} members)
            </button>
            {selected.length < 2 && <p className="text-center text-xs text-white/30">Select at least 2 council members to proceed.</p>}
          </motion.div>
        )}

        {step === "consulting" && (
          <motion.div key="consulting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400 mb-4" />
            <h2 className="text-white font-medium mb-2">The Council is deliberating...</h2>
            <p className="text-white/30 text-sm">{selected.length} executives are preparing their perspectives.</p>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">Question</div>
              <p className="text-white/80 text-sm">{question}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Council Perspectives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {perspectives.map((p, i) => (
                  <CouncilPersonaCard key={p.persona.id} persona={p.persona} perspective={p.perspective} index={i} />
                ))}
              </div>
            </div>

            {consolidated && (
              <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb size={18} className="text-indigo-400" />
                  <h2 className="text-indigo-400 font-semibold uppercase tracking-wider text-sm">Consolidated Recommendation</h2>
                  {consolidated.confidence_level > 0 && (
                    <span className="ml-auto text-xs text-white/40">Confidence: <span className="text-white font-bold">{consolidated.confidence_level}%</span></span>
                  )}
                </div>

                {consolidated.key_themes && (
                  <div>
                    <h3 className="text-white/40 text-xs uppercase tracking-wider mb-1">Key Themes</h3>
                    <div className="text-white/70 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{consolidated.key_themes}</ReactMarkdown></div>
                  </div>
                )}
                {consolidated.consensus && (
                  <div>
                    <h3 className="text-white/40 text-xs uppercase tracking-wider mb-1">Consensus & Divergence</h3>
                    <div className="text-white/70 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{consolidated.consensus}</ReactMarkdown></div>
                  </div>
                )}
                {consolidated.recommendation && (
                  <div>
                    <h3 className="text-white/40 text-xs uppercase tracking-wider mb-1">Recommendation</h3>
                    <div className="text-white/80 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{consolidated.recommendation}</ReactMarkdown></div>
                  </div>
                )}
                {consolidated.risks && (
                  <div>
                    <h3 className="text-red-400/70 text-xs uppercase tracking-wider mb-1">Key Risks</h3>
                    <div className="text-white/60 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{consolidated.risks}</ReactMarkdown></div>
                  </div>
                )}
                {consolidated.next_steps && (
                  <div>
                    <h3 className="text-emerald-400/70 text-xs uppercase tracking-wider mb-1">Next Steps</h3>
                    <div className="text-white/70 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{consolidated.next_steps}</ReactMarkdown></div>
                  </div>
                )}
              </div>
            )}

            <button onClick={reset} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={16} /> New Consultation
            </button>

            {history.length > 1 && (
              <div>
                <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Recent Sessions</h2>
                <div className="space-y-2">
                  {history.slice(1).map((s) => (
                    <div key={s.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                      <ChevronRight size={14} className="text-white/20" />
                      <p className="text-white/60 text-sm truncate flex-1">{s.question}</p>
                      <span className="text-white/30 text-xs">{s.overall_confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}