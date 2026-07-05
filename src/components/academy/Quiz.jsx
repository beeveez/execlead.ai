import React, { useState } from "react";
import { Check, X, Loader2, Brain } from "lucide-react";
import { evaluateEssay } from "@/lib/academyAi";
import { useSubscription } from "@/lib/SubscriptionContext";
import ReactMarkdown from "react-markdown";

export default function Quiz({ knowledgeCheck, onComplete }) {
  const { profile } = useSubscription();
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [essay, setEssay] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  if (!knowledgeCheck) return null;
  const isMCQ = knowledgeCheck.options && knowledgeCheck.options.length > 0;

  const handleMCQ = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    onComplete(idx === knowledgeCheck.answerIndex ? 100 : 0);
  };

  const handleEssay = async () => {
    if (!essay.trim() || evaluating) return;
    setEvaluating(true);
    try {
      const result = await evaluateEssay(knowledgeCheck.question, essay, knowledgeCheck.guidance, profile);
      setFeedback(result);
      onComplete(80);
    } catch (e) { setFeedback("Unable to evaluate your response. Please try again."); }
    setEvaluating(false);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4"><Brain size={16} className="text-amber-400" /><h3 className="text-white font-semibold text-sm">Knowledge Check</h3></div>
      <p className="text-white/70 text-sm mb-4">{knowledgeCheck.question}</p>
      {isMCQ ? (
        <div className="space-y-2">
          {knowledgeCheck.options.map((opt, i) => {
            const isCorrect = i === knowledgeCheck.answerIndex;
            const isSelected = i === selected;
            return (
              <button key={i} onClick={() => handleMCQ(i)} disabled={answered} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border ${answered && isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : answered && isSelected ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"}`}>
                <span className="flex items-center gap-2">{answered && isCorrect && <Check size={14} />}{answered && isSelected && !isCorrect && <X size={14} />}{opt}</span>
              </button>
            );
          })}
          {answered && <div className="bg-white/[0.03] rounded-lg p-3 mt-3"><p className="text-white/50 text-xs"><span className="font-semibold text-white/70">Explanation: </span>{knowledgeCheck.explanation}</p></div>}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea value={essay} onChange={e => setEssay(e.target.value)} placeholder="Write your response..." rows={5} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50 resize-none" />
          <button onClick={handleEssay} disabled={!essay.trim() || evaluating} className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30">
            {evaluating ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />} Get AI Feedback
          </button>
          {feedback && <div className="bg-white/[0.03] rounded-lg p-3"><p className="text-white/50 text-xs mb-1"><span className="font-semibold text-white/70">AI Feedback:</span></p><ReactMarkdown className="text-white/60 text-sm prose prose-sm prose-invert max-w-none">{feedback}</ReactMarkdown></div>}
        </div>
      )}
    </div>
  );
}