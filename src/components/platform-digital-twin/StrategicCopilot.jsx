import React, { useState, useRef } from 'react';
import { Brain, Send, Loader2, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SectionShell, Badge } from './Shared';
import { COPILOT_SUGGESTED_QUESTIONS, buildCopilotPrompt } from '@/lib/platformDigitalTwin/copilot';
import { base44 } from '@/api/base44Client';

export default function StrategicCopilot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const ask = async (q) => {
    const question = q || input;
    if (!question.trim() || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildCopilotPrompt(question) });
      setMessages((m) => [...m, { role: 'assistant', content: res }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'I could not analyze that right now. Please try again.' }]);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <SectionShell title="Strategic Copilot™" subtitle="AI chief-architect grounded in the Platform Registry, ADRs, dependency graph & digital twin" icon={Brain}>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        {messages.length === 0 && (
          <div className="mb-4">
            <div className="text-[10px] text-white/40 uppercase mb-2">Suggested questions</div>
            <div className="flex flex-wrap gap-2">
              {COPILOT_SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => ask(q)} className="text-left text-xs px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-colors">{q}</button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0"><Brain size={14} className="text-indigo-400" /></div>}
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-indigo-500/15 text-white/90' : 'bg-white/[0.05] text-white/80'}`}>
                {m.role === 'user' ? m.content : <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>}
              </div>
              {m.role === 'user' && <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><User size={14} className="text-white/40" /></div>}
            </div>
          ))}
          {loading && <div className="flex gap-2"><div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Brain size={14} className="text-indigo-400" /></div><div className="bg-white/[0.05] rounded-xl px-3 py-2"><Loader2 size={14} className="animate-spin text-indigo-400" /></div></div>}
          <div ref={scrollRef} />
        </div>
        <div className="flex gap-2 mt-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder="Ask the Strategic Copilot anything…" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
          <button onClick={() => ask()} disabled={loading || !input.trim()} className="px-3 bg-indigo-500/15 text-indigo-300 rounded-lg hover:bg-indigo-500/25 disabled:opacity-40"><Send size={16} /></button>
        </div>
        <p className="text-[10px] text-white/30 mt-2"><Badge color="violet">Grounded</Badge> All answers cite the Platform Registry, ADRs, and Digital Twin data.</p>
      </div>
    </SectionShell>
  );
}