import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { QUESTION_CATEGORIES, SCORE_DIMENSIONS, AI_PERSONALITIES } from "@/lib/constants";
import { Swords, RotateCcw, Loader2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { callAI } from "@/lib/ai";
import { getFlatSkills } from "@/lib/resume";

const SCORE_KEYS = SCORE_DIMENSIONS.map(d => d.key);

export default function Challenge() {
  const [profile, setProfile] = useState(null);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("select");
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) setProfile(profiles[0]);
      const resumes = await base44.entities.ResumeVersion.list("-created_date", 1);
      if (resumes.length > 0) {
        try { setResumeData(JSON.parse(resumes[0].extracted_data)); } catch (e) {}
      }
    };
    load();
  }, []);

  const generateQuestion = async (cat) => {
    setCategory(cat);
    setGenerating(true);
    setStep("answer");
    try {
      const personality = AI_PERSONALITIES.find(p => p.id === profile?.ai_personality) || AI_PERSONALITIES[0];
      const res = await callAI("challenge", {
        prompt: `Generate ONE challenging executive interview question for the category "${cat}".
The candidate targets: ${profile?.target_role || "Senior Manager"} at ${profile?.target_company || "a major IT company"}.
${resumeData ? `CANDIDATE BACKGROUND: ${resumeData.career_history?.[0]?.job_title || "N/A"} at ${resumeData.career_history?.[0]?.employer || "N/A"}. Skills: ${getFlatSkills(resumeData).slice(0, 8).join(", ")}.` : ""}
Make it scenario-based and tailored to their actual experience. Return ONLY the question.`,
      });
      setQuestion(res);
    } catch (e) {
      setQuestion("Describe a time you drove significant business transformation. What was your approach, what resistance did you face, and how did you measure success?");
    }
    setGenerating(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const personality = AI_PERSONALITIES.find(p => p.id === profile?.ai_personality) || AI_PERSONALITIES[0];
      const res = await callAI("challenge", {
        prompt: `You are "${personality.name}" - ${personality.description}

EVALUATE this executive interview answer.

ROLE TARGET: ${profile?.target_role || "Senior Manager"} at ${profile?.target_company || "IT Company"}
QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}

TRUTH ENGINE: Analyze for false ownership, inflated metrics, fake savings, fake P&L, fake leadership, and unsupported claims.

Score across ALL 12 dimensions (0-100). For ai_feedback, explain WHY each score was given and recommend improvements. For truth_analysis, detail any exaggerations. For rewritten_answer, rewrite in truthful executive language.`,
        response_json_schema: {
          type: "object",
          properties: {
            ...Object.fromEntries(SCORE_KEYS.map(k => [k, { type: "number" }])),
            overall_score: { type: "number" },
            ai_feedback: { type: "string" },
            truth_analysis: { type: "string" },
            rewritten_answer: { type: "string" }
          }
        }
      });

      const challengeResult = await base44.entities.ChallengeResult.create({
        question, category, user_answer: answer,
        ...Object.fromEntries(SCORE_KEYS.map(k => [k, res[k]])),
        overall_score: res.overall_score,
        ai_feedback: res.ai_feedback,
        truth_analysis: res.truth_analysis,
        rewritten_answer: res.rewritten_answer,
        target_company: profile?.target_company,
        target_role: profile?.target_role,
        ai_personality: profile?.ai_personality || "executive_mentor",
      });

      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          challenges_completed: (profile.challenges_completed || 0) + 1,
          xp_points: (profile.xp_points || 0) + 50,
        });
      }

      setResult({ ...res, id: challengeResult.id });
      setStep("result");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const reset = () => {
    setStep("select");
    setCategory("");
    setQuestion("");
    setAnswer("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Swords size={12} className="text-indigo-400" />
          Executive Challenge
        </div>
        <h1 className="text-2xl font-bold text-white">Test Your Executive Readiness</h1>
        <p className="text-white/40 text-sm mt-1">Scored across {SCORE_DIMENSIONS.length} dimensions with Truth Engine analysis</p>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {QUESTION_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => generateQuestion(cat)} className="px-3 py-3 bg-white/[0.03] hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 rounded-lg text-sm text-white/50 hover:text-indigo-400 transition-all text-left">{cat}</button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "answer" && (
          <motion.div key="answer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 mb-4">
              <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-3">{category}</div>
              {generating ? (
                <div className="flex items-center gap-3 text-white/40"><Loader2 size={18} className="animate-spin" /> Generating executive question...</div>
              ) : (
                <p className="text-white text-lg font-medium leading-relaxed">{question}</p>
              )}
            </div>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your executive answer here... Be specific, use metrics, and demonstrate leadership thinking." rows={8} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={reset} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/40 hover:text-white/80 transition-colors">Cancel</button>
              <button onClick={submitAnswer} disabled={!answer.trim() || loading || generating} className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Swords size={16} /> Submit for Evaluation</>}
              </button>
            </div>
          </motion.div>
        )}

        {step === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Overall Score */}
            <div className="text-center py-4">
              <div className={`text-5xl font-bold mb-1 ${result.overall_score >= 70 ? "text-emerald-400" : result.overall_score >= 40 ? "text-amber-400" : "text-red-400"}`}>{result.overall_score}</div>
              <p className="text-white/30 text-sm">Overall Executive Score</p>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SCORE_DIMENSIONS.map(dim => {
                const val = result[dim.key] || 0;
                return (
                  <div key={dim.key} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold" style={{ color: dim.color }}>{val}</div>
                    <div className="text-white/30 text-xs mt-1">{dim.label}</div>
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: dim.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Feedback */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <h3 className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4">AI Coaching Feedback</h3>
              <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"><ReactMarkdown>{result.ai_feedback}</ReactMarkdown></div>
            </div>

            {/* Truth Engine */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={16} className="text-red-400" />
                <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wider">Truth Engine Analysis</h3>
              </div>
              <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"><ReactMarkdown>{result.truth_analysis}</ReactMarkdown></div>
            </div>

            {/* Rewritten Answer */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6">
              <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-4">Executive Rewrite</h3>
              <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"><ReactMarkdown>{result.rewritten_answer}</ReactMarkdown></div>
            </div>

            <button onClick={reset} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={16} /> Take Another Challenge
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}