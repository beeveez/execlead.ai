import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, MessageSquare, NotebookPen, Save, Loader2, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

const FEATURES = [
  { id: 'summarize', label: 'Summarize Article', icon: FileText, color: 'text-blue-400' },
  { id: 'explain', label: 'Explain This Article', icon: Sparkles, color: 'text-indigo-400' },
  { id: 'notes', label: 'Generate Executive Notes', icon: NotebookPen, color: 'text-amber-400' },
  { id: 'ask', label: 'Ask EXEC™', icon: MessageSquare, color: 'text-emerald-400' },
  { id: 'save', label: 'Save to Notebook', icon: Save, color: 'text-purple-400' },
];

export default function ArticleAIPanel({ article }) {
  const [activeFeature, setActiveFeature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [question, setQuestion] = useState('');

  const callAI = async (prompt) => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are EXEC™, an AI executive leadership advisor. ${prompt}\n\nArticle Title: ${article.title}\nArticle Category: ${article.category}\n\nArticle Content:\n${article.content}`,
      });
      setResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      setResult('Unable to generate a response at this time. Please try again later.');
    }
    setLoading(false);
  };

  const handleFeature = (featureId) => {
    if (featureId === 'save') {
      const saved = JSON.parse(localStorage.getItem('exec_notebook') || '[]');
      if (!saved.find(a => a.id === article.id)) {
        saved.push({ id: article.id, title: article.title, slug: article.slug, savedAt: new Date().toISOString() });
        localStorage.setItem('exec_notebook', JSON.stringify(saved));
      }
      toast({ title: 'Saved to Executive Notebook', description: `"${article.title}" has been saved.` });
      return;
    }
    setActiveFeature(featureId);
    setResult('');
    setQuestion('');

    if (featureId === 'summarize') {
      callAI('Summarize this article in 3-4 concise sentences for an executive audience. Focus on the core message and actionable insight.');
    } else if (featureId === 'explain') {
      callAI('Explain this article in simple terms for someone new to the topic. Break down the key concepts, use analogies where helpful, and highlight what matters most for a technology professional.');
    } else if (featureId === 'notes') {
      callAI('Generate structured executive study notes for this article. Include: 1) Core thesis, 2) Key arguments, 3) Supporting evidence, 4) Counterpoints or risks, 5) Discussion questions for a leadership team. Format as markdown.');
    }
  };

  const handleAsk = () => {
    if (!question.trim()) return;
    callAI(`Answer this question about the article: "${question}"\n\nProvide a thoughtful, executive-level response that draws directly from the article content.`);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/15 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">AI Article Assistant™</h3>
      </div>

      {/* Feature Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FEATURES.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFeature(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeFeature === f.id
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.05] hover:text-white/70'
            }`}
          >
            <f.icon size={12} className={f.color} /> {f.label}
          </button>
        ))}
      </div>

      {/* Ask EXEC Input */}
      <AnimatePresence>
        {activeFeature === 'ask' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask a question about this article..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
              />
              <button onClick={handleAsk} disabled={!question.trim() || loading} className="px-3 py-2 bg-indigo-500/15 border border-indigo-500/20 rounded-lg text-indigo-300 hover:bg-indigo-500/25 disabled:opacity-40">
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Panel */}
      <AnimatePresence>
        {(loading || result) && activeFeature && activeFeature !== 'save' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 relative">
              {loading ? (
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Loader2 size={14} className="animate-spin" /> EXEC™ is analyzing the article...
                </div>
              ) : (
                <>
                  <button onClick={() => { setActiveFeature(null); setResult(''); }} className="absolute top-3 right-3 text-white/20 hover:text-white/50">
                    <X size={14} />
                  </button>
                  <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap pr-6">{result}</div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}