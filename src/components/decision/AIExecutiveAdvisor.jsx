import React, { useState, useRef, useEffect } from 'react';
import AIService from '@/lib/aiService';
import { guardExecDecisionResponse } from '@/lib/execDecisionTruthfulnessGuard';
import { buildAdvisorPrompt } from '@/lib/decisionIntelligenceEngine';
import { Send, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  'Should I take PMP?',
  'Should I change jobs?',
  'Am I ready for Director?',
  'What blocks my promotion?',
  'Is an MBA worth it for me?',
  'What credentials should I pursue next?',
];

export default function AIExecutiveAdvisor({ twin }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAsk = async (question) => {
    const q = question || input.trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const prompt = buildAdvisorPrompt(twin, q);
      const response = await AIService.ask({ prompt, options: { model: 'automatic' } });
      const answer = typeof response === 'string' ? response : response?.output || response?.response || JSON.stringify(response);
      setMessages(prev => [...prev, { role: 'assistant', content: guardExecDecisionResponse(q, answer) }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error analyzing your Digital Twin™. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-violet-400" />
        <p className="text-xs text-white/40">Ask any career or leadership question — your AI Executive Advisor™ analyzes your Digital Twin™ data to provide evidence-based recommendations.</p>
      </div>

      {/* Chat Container */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl flex flex-col" style={{ minHeight: '400px', maxHeight: '600px' }}>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-xs text-white/30 mb-4">Ask a question to get started</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-[11px] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-500/15 text-white/90 text-xs'
                  : 'bg-white/[0.03] border border-white/5 text-white/80'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="text-xs prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-1 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_strong]:text-white">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-xs">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-violet-400" />
                <span className="text-xs text-white/40">Analyzing your Digital Twin™...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
            placeholder="Ask your AI Executive Advisor™..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !input.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}