import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, Send, X, Minus, MapPin, Trash2, Search, Layers, Maximize2 } from "lucide-react";
import {
  EXEC_GLOBAL_COMMANDS,
} from "@/lib/execConciergeConfig";
import ExecMessageBubble from "./ExecMessageBubble";
import ExecConciergeBadge from "./ExecConciergeBadge";
import ExecTypingIndicator from "./ExecTypingIndicator";
import ExecConciergeExpanded from "./ExecConciergeExpanded";
import ExecDebugPanel from "./ExecDebugPanel";
import ExecHealthPanel from "./ExecHealthPanel";
import ConciergeDiagnosticsPanel from "./ConciergeDiagnosticsPanel";
import EvidenceCompletenessPanel from "./EvidenceCompletenessPanel";
import ContextualActions from "./ContextualActions";
import { computeEvidenceCoverage } from "@/lib/evidenceCompletenessEngine";
import { generateContextualActions, getDashboardLabel } from "@/lib/contextualActionEngine";

export default function ExecConcierge() {
  const { user } = useAuth();
  const {
    isOpen,
    open,
    close,
    toggle,
    messages,
    loading,
    sendMessage,
    clearConversation,
    pageContext,
    userContext,
    recommendations,
    workspacePersona,
    activeWorkspace,
    contextSwitchAt,
  } = useExecConcierge();
  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showDiagnostics]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = (text) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    sendMessage(content);
  };

  const handleCommand = (cmd) => {
    base44.analytics.track({
      eventName: "exec_concierge_command",
      properties: { command: cmd.label },
    });
    if (cmd.action === "search") {
      setShowCommands(false);
      setTimeout(() => inputRef.current?.focus(), 100);
      setInput("Find me ");
      return;
    }
    if (cmd.path) {
      setShowCommands(false);
      navigate(cmd.path);
    }
  };

  const handleTask = (path) => {
    base44.analytics.track({
      eventName: "exec_concierge_task",
      properties: { path },
    });
    navigate(path);
  };

  const handleRecommendation = (rec) => {
    if (rec.action === "run_diagnostics") {
      setShowDiagnostics(true);
    } else if (rec.path) {
      navigate(rec.path);
    }
    try {
      base44.analytics.track({
        eventName: "exec_concierge_recommendation",
        properties: { label: rec.label, action: rec.action || "navigate" },
      });
    } catch (e) {}
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
    sendMessage(action.message);
  };

  const evidenceCoverage = useMemo(() => computeEvidenceCoverage(userContext), [userContext]);

  // EXEC™ Contextual Action Engine™ — generates dashboard-aware next actions
  const contextualActions = useMemo(
    () => generateContextualActions({
      pathname: location.pathname,
      pageContext,
      userContext,
    }),
    [location.pathname, pageContext, userContext]
  );
  const dashboardLabel = contextualActions.dashboardType
    ? getDashboardLabel(contextualActions.dashboardType)
    : null;

  const handleContextualAction = useCallback((action) => {
    base44.analytics.track({
      eventName: "exec_contextual_action",
      properties: { action: action.label, category: action.category, dashboard: contextualActions.dashboardType },
    });
    if (action.path) {
      navigate(action.path);
    } else if (action.action === "run_diagnostics") {
      setShowDiagnostics(true);
    } else if (action.action) {
      // Automation/reporting actions — send as a message to EXEC™
      sendMessage(`EXEC™ Action: ${action.label}`);
    }
  }, [navigate, contextualActions.dashboardType, sendMessage]);

  const showWelcome = !loading && !showDiagnostics && messages.length <= 1;
  const lastMessage = messages[messages.length - 1];
  const groundedSuggestions = !loading && lastMessage?.role === "assistant"
    ? lastMessage.suggestedQuestions || []
    : [];
  const showSuggestions = groundedSuggestions.length > 0;
  // Workspace-aware quick actions and tasks
  const quickActions = workspacePersona?.quickActions || [];
  const tasks = workspacePersona?.tasks || [];
  const personaSubtitle = workspacePersona?.subtitle || "AI Executive Assistant";
  const personaTagline = workspacePersona?.tagline || "";
  const personaColor = workspacePersona?.color || "#f59e0b";

  return (
    <>
      {/* Expanded Focus Mode overlay — shares the same conversation state */}
      <AnimatePresence>
        {isOpen && isExpanded && (
          <ExecConciergeExpanded
            onCollapse={() => setIsExpanded(false)}
            onClose={close}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && !isExpanded && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={open}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 border-0 bg-transparent p-0 flex items-center justify-center transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-exec-gold/60 rounded-md"
            aria-label="Open EXEC AI Assistant"
            title="EXEC™ AI Concierge — Ask anything about your leadership journey"
          >
            <ExecConciergeBadge size="lg" className="shadow-[0_0_14px_hsl(var(--brand-exec-gold)/0.25)]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-0 bottom-0 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] z-50 bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-border flex-shrink-0">
              <ExecConciergeBadge size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm">EXEC™</h3>
                <p className="text-xs text-muted-foreground truncate">{personaSubtitle}</p>
              </div>
              {personaTagline && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium max-w-[130px] truncate" style={{ background: `${personaColor}15`, border: `1px solid ${personaColor}30`, color: personaColor }}>
                  <Layers size={10} className="flex-shrink-0" />
                  <span className="truncate">{personaTagline}</span>
                </div>
              )}
              {pageContext && pageContext.module !== "Home" && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-600 dark:text-amber-400 max-w-[120px] truncate">
                  <MapPin size={10} className="flex-shrink-0" />
                  <span className="truncate">{pageContext.module}</span>
                </div>
              )}
              <button
                onClick={() => setShowCommands((s) => !s)}
                className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                  showCommands ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-foreground"
                }`}
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
                onClick={() => setIsExpanded(true)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Expand to focus mode"
                title="Expand to Focus Mode"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Minimize"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={close}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {user && userContext && (
              <EvidenceCompletenessPanel coverage={evidenceCoverage} onNavigate={handleTask} />
            )}

            {activeWorkspace === "developer" && (
              <>
                <ExecHealthPanel />
                <ExecDebugPanel
                  workspacePersona={workspacePersona}
                  activeWorkspace={activeWorkspace}
                  pageContext={pageContext}
                  pathname={location.pathname}
                  messages={messages}
                  contextSwitchAt={contextSwitchAt}
                />
              </>
            )}

            {/* Global Commands — always accessible */}
            {showCommands && (
              <div className="px-4 py-3 border-b border-border bg-muted/50 flex-shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Global Commands
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {EXEC_GLOBAL_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => handleCommand(cmd)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-card hover:bg-accent border border-border text-xs font-medium text-foreground transition-colors text-left"
                    >
                      <cmd.icon size={13} className="text-amber-500 flex-shrink-0" />
                      <span className="truncate">{cmd.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {messages.map((m, i) => (
                <ExecMessageBubble key={i} message={m} />
              ))}
              {loading && <ExecTypingIndicator />}

              {showDiagnostics && (
                <ConciergeDiagnosticsPanel
                  workspacePersona={workspacePersona}
                  activeWorkspace={activeWorkspace}
                  pathname={location.pathname}
                  onClose={() => setShowDiagnostics(false)}
                />
              )}

              {showWelcome && !loading && !showDiagnostics && (
                <>
                  {user ? (
                    <>
                      {/* EXEC™ Contextual Action Engine™ — replaces generic "What would you like me to do?" */}
                      {contextualActions.allActions.length > 0 ? (
                        <ContextualActions
                          actions={contextualActions}
                          dashboardLabel={dashboardLabel}
                          onAction={handleContextualAction}
                        />
                      ) : (
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
                          {tasks.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                Quick Actions
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {tasks.map((task) => (
                                  <button
                                    key={task.label}
                                    onClick={() => handleTask(task.path)}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-muted hover:bg-accent border border-border text-[11px] font-medium text-foreground transition-colors"
                                  >
                                    <task.icon size={11} style={{ color: personaColor }} />
                                    {task.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-accent border border-border text-xs font-medium text-foreground transition-colors"
                        >
                          <action.icon size={14} style={{ color: personaColor }} />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {showSuggestions && (
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