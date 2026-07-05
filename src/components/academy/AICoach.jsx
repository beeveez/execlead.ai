import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { askCoach } from "@/lib/academyAi";
import { useSubscription } from "@/lib/SubscriptionContext";
import ReactMarkdown from "react-markdown";

export default function AICoach({ lesson }) {
  const { profile } = useSubscription();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const response = await askCoach(lesson, question, profile);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "I apologize, I couldn't process your question. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><MessageSquare size={16} className="text-indigo-400" /></div>
        <div><h3 className="text-white font-semibold text-sm">Ask AI Coach</h3><p className="text-white/30 text-xs">Your executive mentor</p></div>
      </div>
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {messages.length === 0 ? <p className="text-white/30 text-xs text-center py-4">Ask a question about this lesson...</p> : messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-indigo-500/15 text-white/80" : "bg-white/5 text-white/60"}`}>
              {m.role === "assistant" ? <ReactMarkdown className="prose prose-sm prose-invert max-w-none">{m.content}</ReactMarkdown> : m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white/5 rounded-lg px-3 py-2"><Loader2 size={14} className="animate-spin text-white/40" /></div></div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about this lesson..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50 transition-colors" />
        <button onClick={send} disabled={loading || !input.trim()} className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white p-2 rounded-lg transition-colors"><Send size={16} /></button>
      </div>
    </div>
  );
}