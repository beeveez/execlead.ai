import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import ExecMessageBubble from "./ExecMessageBubble";

const SUGGESTIONS = [
  "What can I do on this platform?",
  "Add a journal entry about today's leadership wins",
  "Check my notifications",
  "Find executive networking events",
];

export default function ConciergeChat() {
  const { messages, loading, sendMessage } = useExecConcierge();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    sendMessage(content);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center max-w-md mx-auto py-8">
            <Sparkles size={28} className="text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Executive Concierge</h2>
            <div className="space-y-2">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} onClick={() => handleSend(suggestion)} className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white/50 hover:text-white/80 text-left">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => <ExecMessageBubble key={index} message={message} />)}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="text-white/40 animate-spin" />
              <span className="text-sm text-white/40">Working on it…</span>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/5 p-3 md:p-4">
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSend()}
            placeholder="Ask EXEC™ anything…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white transition-colors"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}