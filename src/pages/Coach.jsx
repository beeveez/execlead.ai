import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { AI_PERSONALITIES } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";
import { orchestrateJourney } from "@/lib/journeyOrchestratorEngine";
import { Send, Loader2, Bot, User, RotateCcw, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { getFlatSkills } from "@/lib/resume";
import { getCachedCompanyContext } from "@/lib/companyContext";
import ExecutiveStatusBar from "@/components/shared/ExecutiveStatusBar";
import ExecutiveTrustLayer from "@/components/trust/ExecutiveTrustLayer";
import { buildCoachTrust } from "@/lib/executiveTrustEngine";
import CoachingFocusCard from "@/components/coach/CoachingFocusCard";
import LeadershipReflection from "@/components/coach/LeadershipReflection";
import ExecutiveExercise from "@/components/coach/ExecutiveExercise";
import ScenarioPractice from "@/components/coach/ScenarioPractice";
import LeadershipHomework from "@/components/coach/LeadershipHomework";
import SavedInsights from "@/components/coach/SavedInsights";
import PreviousSessions from "@/components/coach/PreviousSessions";
import { useOutcomeIntelligence } from "@/hooks/useOutcomeIntelligence";
import { generateOutcomeCoachAdvice } from "@/lib/executiveOutcomeIntelligenceEngine";
import { computeRecommendationIntelligence, attributionFromOutcomeIntelligence, getProvenRecommendations } from "@/lib/recommendationIntelligenceEngine";

export default function Coach() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [personality, setPersonality] = useState(AI_PERSONALITIES[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [coachingFocus, setCoachingFocus] = useState(null);
  const bottomRef = useRef(null);
  const [resumeData, setResumeData] = useState(null);
  const { intelligence } = useOutcomeIntelligence();
  const intelligenceRef = useRef(null);
  useEffect(() => { intelligenceRef.current = intelligence; }, [intelligence]);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        const p = AI_PERSONALITIES.find(a => a.id === profiles[0].ai_personality);
        if (p) setPersonality(p);
      }
      const resumes = await base44.entities.ResumeVersion.list("-created_date", 1);
      if (resumes.length > 0) {
        try { setResumeData(JSON.parse(resumes[0].extracted_data)); } catch (e) {}
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    orchestrateJourney(user)
      .then((result) => setCoachingFocus(result.coachingFocus))
      .catch(() => setCoachingFocus(null));
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => `${m.role === "user" ? "USER" : personality.name.toUpperCase()}: ${m.content}`).join("\n\n");

      const companyCtx = getCachedCompanyContext();

      // Executive Outcome Intelligence™ — ground coaching in observed results.
      let outcomeCtx = "";
      const oi = intelligenceRef.current;
      if (oi && oi.summary.totalOutcomes > 0) {
        const improved = (oi.mostImprovedCompetencies || []).slice(0, 3)
          .map((c) => `${c.competency} (+${c.totalGain} across ${c.outcomes} outcome${c.outcomes === 1 ? "" : "s"})`)
          .join("; ");
        const advice = generateOutcomeCoachAdvice(oi).map((a) => `- ${a.text}`).join("\n");
        outcomeCtx = `EXECUTIVE OUTCOME INTELLIGENCE (observed results, cite when relevant):\n` +
          `Total outcomes: ${oi.summary.totalOutcomes} · Executive Momentum: ${oi.summary.executiveMomentum}/100 · Outcome Confidence: ${oi.summary.outcomeConfidence}%.\n` +
          `Most improved competencies: ${improved || "none yet"}.\n${advice}\n\n`;
      }

      // Recommendation Intelligence™ — prioritize proven recommendations.
      let provenCtx = "";
      if (oi) {
        const recIntel = computeRecommendationIntelligence(attributionFromOutcomeIntelligence(oi));
        const proven = getProvenRecommendations(recIntel);
        if (proven.length) {
          provenCtx = `RECOMMENDATION INTELLIGENCE (prioritize proven activities for this user):\n` +
            proven.map((p) => `- ${p.narrative}`).join("\n") + `\n\n`;
        }
      }

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${companyCtx ? companyCtx + "\n\n" : ""}${outcomeCtx}${provenCtx}AI DECISION TRANSPARENCY: Every recommendation you make must cite the evidence it relies on, your reasoning, your confidence level, and the expected impact. Never give advice without explaining why.\n\nYou are "${personality.name}" - ${personality.description}
Communication style: ${personality.communication_style}
Leadership style: ${personality.leadership_style}
Question style: ${personality.question_style}

You are coaching a professional targeting the role of "${profile?.target_role || 'Senior Manager'}" at "${profile?.target_company || 'a major IT services company'}".
${resumeData ? `CANDIDATE BACKGROUND: Currently ${resumeData.career_history?.[0]?.job_title || "N/A"} at ${resumeData.career_history?.[0]?.employer || "N/A"}. Skills: ${getFlatSkills(resumeData).slice(0, 8).join(", ")}. Tailor your coaching to their actual experience.` : ""}

TRUTH ENGINE ACTIVE: If the user makes any claims, analyze them for truthfulness. Challenge exaggerations, inflated metrics, false ownership, and vague claims. Always push for specifics and evidence.

CONVERSATION SO FAR:
${history}

USER: ${userMsg}

Respond as ${personality.name}. Be direct, insightful, and challenging. Push the user to think like an executive. If they give weak answers, call it out constructively. Use examples and frameworks when helpful.`,
      });

      setMessages(prev => [...prev, { role: "assistant", content: res }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "I apologize, there was an issue. Please try again." }]);
    }
    setLoading(false);
  };

  const selectPersonality = async (p) => {
    setPersonality(p);
    setMessages([]);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { ai_personality: p.id });
    }
  };

  const coachTrust = buildCoachTrust({ coachingFocus, intelligence });

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
      <ExecutiveStatusBar />
      <CoachingFocusCard focus={coachingFocus} />
      {coachTrust && <ExecutiveTrustLayer trust={coachTrust} />}

      {/* AI Coaching Conversation — primary experience */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={14} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-white/80">AI Coaching Conversation</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {AI_PERSONALITIES.map(p => (
            <button
              key={p.id}
              onClick={() => selectPersonality(p)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                personality.id === p.id
                  ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                  : "bg-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              <span>{p.icon}</span>
              {p.name}
            </button>
          ))}
        </div>
        <div className="h-[400px] overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">{personality.icon}</div>
              <h2 className="text-white font-semibold text-lg mb-1">{personality.name}</h2>
              <p className="text-white/30 text-sm max-w-md mx-auto mb-4">{personality.description}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "How do I prepare for a CIO interview?",
                  "Challenge my leadership experience",
                  "Help me with executive presence",
                  "Review my approach to P&L management"
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-indigo-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-indigo-500/15 text-white/90"
                  : "bg-white/[0.05] text-white/80"
              }`}>
                {msg.role === "user" ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="text-sm prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white/40" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Bot size={16} className="text-indigo-400" />
              </div>
              <div className="bg-white/[0.05] rounded-xl px-4 py-3">
                <Loader2 size={16} className="animate-spin text-indigo-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white/60 transition-colors"
              title="New conversation"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Ask ${personality.name} anything...`}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Coaching sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LeadershipReflection />
        <ExecutiveExercise coachingFocus={coachingFocus} />
      </div>

      <ScenarioPractice />

      <LeadershipHomework coachingFocus={coachingFocus} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SavedInsights />
        <PreviousSessions />
      </div>
    </div>
  );
}