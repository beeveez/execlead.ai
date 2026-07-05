import React, { useState } from "react";
import { X, Target, Loader2, Send } from "lucide-react";
import { evaluateChallenge } from "@/lib/academyAi";
import { useSubscription } from "@/lib/SubscriptionContext";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function ExecutiveChallenge({ challenge, course, onClose }) {
  const { profile } = useSubscription();
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!response.trim() || loading) return;
    setLoading(true);
    try {
      const result = await evaluateChallenge(challenge, response, profile);
      setFeedback(result);
    } catch (e) { setFeedback("Unable to evaluate your response. Please try again."); }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0d0d14] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Target size={18} className="text-amber-400" /><h3 className="text-lg font-bold text-white">Executive Challenge</h3></div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 mb-4">
            <h4 className="text-amber-400 font-semibold text-sm mb-1">{challenge.title}</h4>
            <p className="text-white/50 text-sm">{challenge.description}</p>
          </div>
          <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="How would you handle this? Write your response as if you were in the situation..." rows={6} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-amber-500/50 resize-none mb-3" />
          <button onClick={submit} disabled={!response.trim() || loading} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-white font-medium py-2.5 rounded-lg transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Get Executive Feedback
          </button>
          {feedback && <div className="mt-4 bg-white/[0.03] rounded-lg p-4"><h4 className="text-white/70 font-semibold text-sm mb-2">AI Coach Feedback</h4><ReactMarkdown className="text-white/60 text-sm prose prose-sm prose-invert max-w-none">{feedback}</ReactMarkdown></div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}