import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { callAI } from "@/lib/ai";
import { buildExecutiveRuntimeProfile, formatRuntimeProfileForPrompt } from "@/lib/executiveRuntimeProfile";

const SUGGESTED_QUESTIONS = [
  "Why did my Readiness score drop?",
  "What should I do to reach People Manager faster?",
  "Why is Commercial Acumen my biggest gap?",
  "What changed since my last login?",
];

const SYSTEM_PROMPT = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI. The user is viewing their Executive Command Center™ (Dashboard) and asking questions about their live dashboard data.

Your job is to make the dashboard conversational — explain WHY metrics are what they are, what changed, and what to do next.

RULES:
1. Use ONLY the live data provided in the EXECUTIVE RUNTIME PROFILE section — never fabricate metrics
2. Be concise: 3-5 sentences for most answers
3. Explain the WHY behind each metric — don't just repeat the number
4. Link each explanation back to the relevant dashboard widget using markdown links:
   - [Daily Briefing](#briefing) — summary, recommendation, metrics
   - [Executive Health](#health) — composite score, 8 dimensions, trends
   - [Executive Momentum](#momentum) — 30-day activity trends
   - [Executive Timeline](#timeline) — career projection
5. For deeper detail, link to pages: /executive-readiness, /journey, /leadership-dna, /intelligence, /reputation, /career-studio, /simulator, /challenge
6. When explaining a drop or change, identify the likely cause from available data
7. When recommending actions, be specific and reference expected impact
8. Use markdown formatting (bold key terms, bullet points when needed)
9. Sound like an executive advisor — clear, data-driven, actionable
10. If data is missing or unavailable, say so honestly and explain what would improve the answer`;

export default function DashboardConcierge() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load runtime profile when panel first opens
  useEffect(() => {
    if (!isOpen || !user?.id || context) return;
    setLoadingContext(true);
    buildExecutiveRuntimeProfile(user, activeWorkspace)
      .then((p) => setContext(p))
      .catch(() => setContext({}))
      .finally(() => setLoadingContext(false));
  }, [isOpen, user?.id, activeWorkspace, context]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Focus input + Escape to close
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleAsk = useCallback(
    async (question) => {
      const q = (question ?? input).trim();
      if (!q || loading) return;
      setInput("");
      const newMessages = [...messages, { role: "user", content: q }];
      setMessages(newMessages);
      setLoading(true);
      try {
        const contextStr = context
          ? formatRuntimeProfileForPrompt(context)
          : "Profile data unavailable. Answer based on general executive guidance.";
        const history = newMessages
          .map((m) => `${m.role === "user" ? "User" : "EXEC™"}: ${m.content}`)
          .join("\n\n");
        const prompt = `${SYSTEM_PROMPT}

EXECUTIVE RUNTIME PROFILE:
${contextStr}

CONVERSATION:
${history}

Answer the user's latest question. Reference relevant dashboard widgets or pages with markdown links.`;
        const res = await callAI("dashboard_concierge", { prompt });
        const response =
          typeof res === "string"
            ? res
            : res?.response || res?.text || "I apologize, I couldn't generate a response. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I apologize, I'm having trouble analyzing your dashboard right now. Please try again in a moment." },
        ]);
      }
      setLoading(false);
    },
    [input, loading, messages, context]
  );

  const markdownComponents = {
    a: ({ href, children }) => {
      const handleClick = (e) => {
        if (href?.startsWith("#")) {
          e.preventDefault();
          const el = document.getElementById(href.slice(1));
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("ring-2", "ring-indigo-400/60", "rounded-2xl");
            setTimeout(() => el.classList.remove("ring-2", "ring-indigo-400/60", "rounded-2xl"), 2000);
          }
        } else if (href?.startsWith("/")) {
          e.preventDefault();
          setIsOpen(false);
          navigate(href);
        }
      };
      return (
        <a href={href} onClick={handleClick} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-medium">
          {children}
        </a>
      );
    },
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
      >
        <Sparkles size={16} />
        Ask EXEC™ About My Dashboard
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0f] border-l border-white/10 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Ask EXEC™</div>
                    <div className="text-white/30 text-xs">Dashboard Intelligence</div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                      <p className="text-white/60 text-sm leading-relaxed">
                        Ask me anything about your dashboard. I can explain your metrics, identify what changed, and recommend your next move — all using your live data.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/30 text-xs uppercase tracking-wider px-1">Suggested Questions</p>
                      {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleAsk(q)}
                          disabled={loadingContext || loading}
                          className="w-full text-left bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/20 rounded-lg p-3 text-white/70 text-sm transition-all hover:text-white disabled:opacity-40"
                        >
                          {q}
                        </button>
                      ))}
                      {loadingContext && (
                        <div className="flex items-center gap-2 text-white/30 text-xs px-1 pt-1">
                          <Loader2 size={10} className="animate-spin" /> Loading your dashboard data...
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-white/[0.05] border border-white/5 text-white/80"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="text-sm">{msg.content}</p>
                        ) : (
                          <div className="text-sm [&_a]:text-indigo-400 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 [&_strong]:text-white">
                            <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.05] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-indigo-400" />
                      <span className="text-white/40 text-sm">Analyzing your dashboard...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    placeholder="Ask about your metrics..."
                    disabled={loading}
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
                  />
                  <button
                    onClick={() => handleAsk()}
                    disabled={loading || !input.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}