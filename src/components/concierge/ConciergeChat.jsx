import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Sparkles, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { toast } from "@/components/ui/use-toast";

const SUGGESTIONS = [
  "What can I do on this platform?",
  "Add a journal entry about today's leadership wins",
  "Check my notifications",
  "Find executive networking events",
];

export default function ConciergeChat({ conversationId }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    setConversation(null);
    setMessages([]);
    setSending(false);

    base44.agents
      .getConversation(conversationId)
      .then((conv) => {
        setConversation(conv);
        setMessages(conv.messages || []);
      })
      .catch(() => {});

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      const last = (data.messages || [])[data.messages.length - 1];
      if (last && last.role === "assistant") setSending(false);
    });
    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending || !conversation) return;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content }]);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch (e) {
      setSending(false);
      toast({ title: "Failed to send message", variant: "error" });
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Executive Concierge</h2>
          <p className="text-white/40 text-sm mb-6">Your AI assistant for navigating the platform, taking quick notes, and getting things done.</p>
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <div key={s} className="px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white/50">{s}</div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-6">Start a new conversation from the sidebar to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {sending && (
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask the concierge to do something…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}