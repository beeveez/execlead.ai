import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useExecContext } from "@/hooks/useExecContext";
import { useAuth } from "@/lib/AuthContext";
import { callAI } from "@/lib/ai";
import { Sparkles, Send, X, Minus, MapPin } from "lucide-react";
import {
  EXEC_WELCOME_MESSAGE,
  EXEC_QUICK_ACTIONS,
  EXEC_TASKS,
  getSuggestedQuestions,
  generateBriefing,
  buildExecPrompt,
} from "@/lib/execConciergeConfig";
import ExecMessageBubble from "./ExecMessageBubble";
import ExecTypingIndicator from "./ExecTypingIndicator";

const STORAGE_KEY = "exec_concierge_open";
const GREETED_KEY = "exec_concierge_greeted";

export default function ExecConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { user } = useAuth();
  const { pageContext, userContext, fetchUserContext } = useExecContext();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setIsOpen(true);
    if (localStorage.getItem(GREETED_KEY) === "true") setHasGreeted(true);
  }, []);

  const initConversation = useCallback(async () => {
    if (user) {
      setLoading(true);
      const context = await fetchUserContext();
      setLoading(false);
      const firstName = user.full_name?.split(" ")[0];
      const briefing = generateBriefing(firstName, context, pageContext);
      setMessages([{ role: "assistant", content: briefing }]);
    } else {
      setMessages([{ role: "assistant", content: EXEC_WELCOME_MESSAGE }]);
    }
    base44.analytics.track({ eventName: "exec_concierge_opened" });
  }, [user, fetchUserContext, pageContext]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      localStorage.setItem(GREETED_KEY, "true");
      initConversation();
    }
  }, [isOpen, hasGreeted, initConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const handleSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);

    base44.analytics.track({
      eventName: "exec_concierge_message_sent",
      properties: { length: content.length },
    });

    try {
      const prompt = buildExecPrompt(newMessages, user, pageContext, userContext);
      const res = await callAI("exec_concierge", { prompt });
      const response =
        typeof res === "string"
          ? res
          : res?.response || res?.text || "I apologize, I couldn't generate a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);

      if (/professional|executive|enterprise|founding/i.test(response) && /recommend|suggest|right for you|best fit|ideal/i.test(response)) {
        base44.analytics.track({ eventName: "exec_concierge_plan_recommended" });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, I'm having trouble responding right now. Please try again in a moment, or [contact our team](/contact).",
        },
      ]);
    }
    setLoading(false);
  };

  const handleQuickAction = (action) => {
    base44.analytics.track({
      eventName: "exec_concierge_quick_action",
      properties: { action: action.label },
    });
    if (action.focusOnly) {
      inputRef.current?.focus();
      return;
    }
    handleSend(action.message);
  };

  const handleTask = (path) => {
    base44.analytics.track({
      eventName: "exec_concierge_task",
      properties: { path },
    });
    navigate(path);
  };

  const handleRecommendation = (rec) => {
    base44.analytics.track({
      eventName: "exec_concierge_recommendation",
      properties: { label: rec.label },
    });
    if (rec.path) navigate(rec.path);
  };

  const showWelcome = !loading && messages.length <= 1;
  const showSuggestions =
    !loading && messages.length > 1 && messages[messages.length - 1].role === "assistant";
  const recommendations = userContext?.recommendations || [];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 flex items-center justify-center"
            aria-label="Open EXEC AI Concierge"
          >
            <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20" />
            <Sparkles size={24} className="text-white relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-0 bottom-0 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] z-50 bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-border flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm">EXEC™</h3>
                <p className="text-xs text-muted-foreground">AI Executive Concierge</p>
              </div>
              {pageContext && pageContext.module !== "Home" && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-600 dark:text-amber-400 max-w-[120px] truncate">
                  <MapPin size={10} className="flex-shrink-0" />
                  <span className="truncate">{pageContext.module}</span>
                </div>
              )}
              <button
                onClick={toggleOpen}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Minimize chat"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  localStorage.setItem(STORAGE_KEY, "false");
                }}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {messages.map((m, i) => (
                <ExecMessageBubble key={i} message={m} />
              ))}
              {loading && <ExecTypingIndicator />}

              {showWelcome && !loading && (
                <>
                  {user ? (
                    <>
                      {recommendations.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                            Recommended Next Steps
                          </p>
                          {recommendations.map((rec) => (
                            <button
                              key={rec.label}
                              onClick={() => handleRecommendation(rec)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted hover:bg-accent border border-border text-sm text-foreground transition-colors text-left"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  rec.priority === "high"
                                    ? "bg-red-500"
                                    : rec.priority === "medium"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                                }`}
                              />
                              {rec.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                          Quick Actions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {EXEC_TASKS.map((task) => (
                            <button
                              key={task.label}
                              onClick={() => handleTask(task.path)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-muted hover:bg-accent border border-border text-[11px] font-medium text-foreground transition-colors"
                            >
                              <task.icon size={11} className="text-amber-500" />
                              {task.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {EXEC_QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-accent border border-border text-xs font-medium text-foreground transition-colors"
                        >
                          <action.icon size={14} className="text-amber-500" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {getSuggestedQuestions(messages.length).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="px-3 py-1.5 rounded-lg bg-muted hover:bg-accent border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-card flex-shrink-0">
              <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask EXEC™ anything…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:opacity-40 text-white transition-all"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}