import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, X, Trash2, Search, Minimize2, MapPin, Layers } from "lucide-react";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import { EXEC_GLOBAL_COMMANDS } from "@/lib/execConciergeConfig";
import ExecMessageBubble from "./ExecMessageBubble";
import ExecConciergeBadge from "./ExecConciergeBadge";
import ExecTypingIndicator from "./ExecTypingIndicator";

/**
 * ExecConciergeExpanded — Focus Mode workspace.
 * Large, desktop-optimized full-viewport overlay that shares the same
 * conversation state (context) as the compact concierge. Pure presentation
 * layer; no AI logic, prompts, or persistence changes.
 */
export default function ExecConciergeExpanded({ onCollapse, onClose }) {
  const {
    messages,
    loading,
    sendMessage,
    clearConversation,
    pageContext,
    workspacePersona,
  } = useExecConcierge();

  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showCommands]);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, []);

  const handleSend = (text) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    sendMessage(content);
  };

  const lastMessage = messages[messages.length - 1];
  const groundedSuggestions =
    !loading && lastMessage?.role === "assistant"
      ? lastMessage.suggestedQuestions || []
      : [];

  const personaSubtitle = workspacePersona?.subtitle || "AI Executive Assistant";
  const personaTagline = workspacePersona?.tagline || "";
  const personaColor = workspacePersona?.color || "#f59e0b";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-border flex-shrink-0">
        <ExecConciergeBadge size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm sm:text-base">EXEC™</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{personaSubtitle}</p>
        </div>
        {personaTagline && (
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium max-w-[140px] truncate" style={{ background: `${personaColor}15`, border: `1px solid ${personaColor}30`, color: personaColor }}>
            <Layers size={10} className="flex-shrink-0" />
            <span className="truncate">{personaTagline}</span>
          </div>
        )}
        {pageContext && pageContext.module !== "Home" && (
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-600 dark:text-amber-400 max-w-[130px] truncate">
            <MapPin size={10} className="flex-shrink-0" />
            <span className="truncate">{pageContext.module}</span>
          </div>
        )}
        <span className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          <Minimize2 size={10} /> Focus Mode
        </span>
        <button
          onClick={() => setShowCommands((s) => !s)}
          className={`p-2 rounded-lg hover:bg-muted transition-colors ${showCommands ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-foreground"}`}
          aria-label="Toggle commands"
          title="Global commands"
        >
          <Search size={18} />
        </button>
        <button
          onClick={clearConversation}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={onCollapse}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Return to compact mode"
          title="Return to compact mode"
        >
          <Minimize2 size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Command palette */}
      {showCommands && (
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-muted/50 flex-shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Global Commands</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 max-w-5xl mx-auto">
            {EXEC_GLOBAL_COMMANDS.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => {
                  if (cmd.path) { setShowCommands(false); }
                  if (cmd.action === "search") { setShowCommands(false); setTimeout(() => inputRef.current?.focus(), 100); setInput("Find me "); return; }
                  if (cmd.path) { setShowCommands(false); }
                }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-card hover:bg-accent border border-border text-xs font-medium text-foreground transition-colors text-left"
              >
                <cmd.icon size={13} className="text-amber-500 flex-shrink-0" />
                <span className="truncate">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-background">
        <div className="max-w-5xl mx-auto w-full space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ExecConciergeBadge size="lg" className="mb-4" />
              <p className="text-lg font-semibold text-foreground mb-1">EXEC™ Focus Mode</p>
              <p className="text-sm text-muted-foreground max-w-md">Ask anything about your leadership journey. Your full conversation history appears here in a spacious, readable workspace.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <ExecMessageBubble key={i} message={m} />
          ))}
          {loading && <ExecTypingIndicator />}
          {groundedSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {groundedSuggestions.map((q) => (
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
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-border bg-card flex-shrink-0">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-2 bg-muted border border-border rounded-xl px-4 py-3">
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
  );
}