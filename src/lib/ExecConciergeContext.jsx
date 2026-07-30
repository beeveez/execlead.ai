import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { callAI } from "@/lib/ai";
import { runQualityGate } from "@/lib/responseQualityEngine";
import { buildExecutiveRuntimeProfile } from "@/lib/executiveRuntimeProfile";
import {
  matchPageContext,
  generateBriefing,
  EXEC_WELCOME_MESSAGE,
  buildExecPrompt,
} from "@/lib/execConciergeConfig";
import { resolveWorkspacePersona } from "@/lib/execWorkspacePersonas";
import {
  extractPreferences,
  loadPreferences,
  savePreferences,
  clearPreferences,
} from "@/lib/preferenceLearning";
import {
  extractLongTermMemory,
  mergeLongTermMemory,
  hasLongTermRecall,
} from "@/lib/executiveMemoryEngine";
import { computeOutcomeIntelligence, answerOutcomeQuestion } from "@/lib/executiveOutcomeIntelligenceEngine";
import { computeReadinessFromEvidence } from "@/lib/readinessEvidenceEngine";

const ExecConciergeContext = createContext(null);

// Keywords that signal an Executive Outcome Intelligence™ question — answered
// locally from observed outcomes (structured: outcome · evidence · confidence ·
// next action) instead of consuming an AI credit. Kept specific to avoid
// hijacking normal conversation; answerOutcomeQuestion does the real matching.
const OUTCOME_Q_KEYWORDS = [
  "readiness improve",
  "readiness improved",
  "readiness grow",
  "why did my readiness",
  "coaching session",
  "coaching helped",
  "sessions helped",
  "helped me most",
  "help me most",
  "biggest improvement",
  "recommendation produced",
  "what recommendation",
  "improving fastest",
  "improved fastest",
  "competency is improving",
  "which competency",
  "what should i repeat",
  "should i repeat",
  "what should repeat",
  "isn't working",
  "isnt working",
  "recommendation isn",
  "recommendation isnt",
  "which recommendation",
  "ineffective",
  "not working",
];
function isOutcomeQuestion(text) {
  const t = (text || "").toLowerCase();
  return OUTCOME_Q_KEYWORDS.some((k) => t.includes(k));
}

export function useExecConcierge() {
  const ctx = useContext(ExecConciergeContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      toggle: () => {},
      messages: [],
      loading: false,
      sendMessage: async () => {},
      clearConversation: () => {},
      pageContext: null,
      userContext: null,
      recommendations: [],
      hasGreeted: false,
      workspacePersona: null,
      activeWorkspace: null,
      contextSwitchAt: null,
      learnedPreferences: null,
      executiveMemory: null,
      hasExecutiveMemory: false,
      hasLongTermRecall: false,
    };
  }
  return ctx;
}

function storageKey(prefix, user, workspace) {
  return `${prefix}_${user?.id || "anon"}_${workspace || "default"}`;
}

function computeRecommendations(data, user) {
  const recs = [];
  const rep = data?.reputation;
  const profile = data?.profile;

  if (!rep || rep.reputation_score === undefined) {
    recs.push({ label: "Calculate Executive Reputation™", path: "/reputation", priority: "high" });
  } else {
    if (rep.reputation_score < 500) {
      recs.push({ label: "Improve Executive Reputation™", path: "/reputation", priority: "high" });
    }
    if (rep.reputation_tier === "new_member" || rep.reputation_tier === "contributor") {
      recs.push({ label: "Earn your next reputation badge", path: "/reputation", priority: "medium" });
    }
  }

  if (profile) {
    if (!profile.identity_verified) {
      recs.push({ label: "Verify your identity", path: "/identity-verification", priority: "high" });
    }
    if ((profile.interview_readiness || 0) < 50) {
      recs.push({ label: "Prepare for interviews", path: "/career-studio", priority: "medium" });
    }
    if ((profile.leadership_maturity || 0) < 50) {
      recs.push({ label: "Complete Leadership DNA™", path: "/leadership-dna", priority: "medium" });
    }
    if (!profile.founding_member && profile.subscription_plan === "free") {
      recs.push({ label: "Upgrade your membership", path: "/compare-plans", priority: "low" });
    }
  }

  recs.push({ label: "Continue Leadership Journey", path: "/dashboard", priority: "low" });
  return recs.slice(0, 4);
}

export function ExecConciergeProvider({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageContext, setPageContext] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [contextSwitchAt, setContextSwitchAt] = useState(null);
  const [learnedPreferences, setLearnedPreferences] = useState(null);
  const [executiveMemory, setExecutiveMemory] = useState(null);
  const userContextRef = useRef(null);
  const greetedWorkspaceRef = useRef(null);
  const executiveMemoryRef = useRef(null);
  const learnedPreferencesRef = useRef(null);

  // Track current page context
  useEffect(() => {
    setPageContext(matchPageContext(location.pathname));
  }, [location.pathname]);

  // Resolve workspace-aware persona (reactive to workspace + page changes)
  const workspacePersona = useMemo(
    () => resolveWorkspacePersona(activeWorkspace, location.pathname),
    [activeWorkspace, location.pathname]
  );

  // Track context switch timestamp for debug panel
  useEffect(() => {
    setContextSwitchAt(new Date().toISOString());
  }, [activeWorkspace, location.pathname]);

  // Workspace-specific recommendations — NEVER cross-contaminate between workspaces
  const recommendations = useMemo(() => {
    if (!workspacePersona?.recommendations) return [];
    return workspacePersona.recommendations(userContext);
  }, [workspacePersona, userContext]);

  // Restore open state on mount
  useEffect(() => {
    if (localStorage.getItem("exec_open") === "true") setIsOpen(true);
  }, []);

  // Load conversation + greeting state when user or workspace changes (per-workspace memory isolation)
  useEffect(() => {
    const mKey = storageKey("exec_messages", user, activeWorkspace);
    const gKey = storageKey("exec_greeted", user, activeWorkspace);
    try {
      const saved = localStorage.getItem(mKey);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
    setHasGreeted(localStorage.getItem(gKey) === "true");
    greetedWorkspaceRef.current = null;
    userContextRef.current = null;
    setUserContext(null);
    setLearnedPreferences(loadPreferences(user?.id, activeWorkspace));
  }, [user?.id, activeWorkspace]);

  // Keep refs in sync with state — prevents stale closures in sendMessage
  useEffect(() => {
    executiveMemoryRef.current = executiveMemory;
  }, [executiveMemory]);

  useEffect(() => {
    learnedPreferencesRef.current = learnedPreferences;
  }, [learnedPreferences]);

  // Persist messages whenever they change (per-workspace)
  useEffect(() => {
    localStorage.setItem(storageKey("exec_messages", user, activeWorkspace), JSON.stringify(messages));
  }, [messages, user?.id, activeWorkspace]);

  // Fetch user context (memoized per user) — builds the Executive Runtime Profile™
  // (single canonical source of truth for every EXEC™ response).
  const fetchUserContext = useCallback(async () => {
    if (!user?.id) return null;
    if (userContextRef.current) return userContextRef.current;
    try {
      const ctx = await buildExecutiveRuntimeProfile(user, activeWorkspace);
      userContextRef.current = ctx;
      setUserContext(ctx);
      return ctx;
    } catch {
      const fallback = {};
      userContextRef.current = fallback;
      setUserContext(fallback);
      return fallback;
    }
  }, [user?.id, activeWorkspace]);

  // Load cross-session Executive Memory™ — persists user preferences, goals, and
  // history across conversations via the ExecutiveMemory entity. Recall survives
  // session/browser restarts, unlike localStorage conversation state.
  const loadExecutiveMemory = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const records = await base44.entities.ExecutiveMemory.filter({ user_id: userId }, "-updated_date", 1);
      if (records && records.length > 0) {
        executiveMemoryRef.current = records[0];
        setExecutiveMemory(records[0]);
        return records[0];
      }
    } catch {
      // entity not yet available — cross-session memory is best-effort
    }
    return null;
  }, []);

  const saveExecutiveMemory = useCallback(
    async (updates) => {
      if (!user?.id) return;
      try {
        const current = executiveMemoryRef.current;
        if (current?.id) {
          const updated = await base44.entities.ExecutiveMemory.update(current.id, updates);
          executiveMemoryRef.current = updated;
          setExecutiveMemory(updated);
        } else {
          const created = await base44.entities.ExecutiveMemory.create({ user_id: user.id, ...updates });
          executiveMemoryRef.current = created;
          setExecutiveMemory(created);
        }
      } catch {
        // silent — memory persistence is best-effort and must not block the conversation
      }
    },
    [user?.id]
  );

  // Proactively resolve user context on authentication — the Personalization™
  // diagnostics and recommendation engines read this before the concierge drawer
  // is ever opened, so we cannot defer it to initConversation().
  useEffect(() => {
    if (user?.id) {
      fetchUserContext();
      loadExecutiveMemory(user.id);
    }
  }, [user?.id, fetchUserContext, loadExecutiveMemory]);

  const initConversation = useCallback(async () => {
    if (user) {
      setLoading(true);
      const ctx = await fetchUserContext();
      setLoading(false);
      const firstName = user.full_name?.split(" ")[0];
      const briefing = generateBriefing(firstName, ctx, matchPageContext(location.pathname), workspacePersona);
      setMessages([{ role: "assistant", content: briefing }]);
      greetedWorkspaceRef.current = activeWorkspace;
    } else {
      setMessages([{ role: "assistant", content: workspacePersona?.anonymousGreeting || EXEC_WELCOME_MESSAGE }]);
      greetedWorkspaceRef.current = activeWorkspace;
    }
    base44.analytics.track({ eventName: "exec_concierge_opened", properties: { workspace: activeWorkspace } });
  }, [user, fetchUserContext, location.pathname, workspacePersona, activeWorkspace]);

  // Greet on first open (per user + per workspace)
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      localStorage.setItem(storageKey("exec_greeted", user, activeWorkspace), "true");
      initConversation();
    }
  }, [isOpen, hasGreeted, initConversation, user, activeWorkspace]);

  // Regenerate greeting when active workspace changes (after initial greeting)
  useEffect(() => {
    if (!user || !activeWorkspace || !hasGreeted) return;
    if (greetedWorkspaceRef.current === activeWorkspace) return;
    greetedWorkspaceRef.current = activeWorkspace;
    const firstName = user.full_name?.split(" ")[0];
    const briefing = generateBriefing(
      firstName,
      userContextRef.current,
      matchPageContext(location.pathname),
      workspacePersona
    );
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: briefing }, ...prev.slice(1)];
      }
      return [{ role: "assistant", content: briefing }];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace, hasGreeted, user?.id]);

  const open = useCallback(() => {
    setIsOpen(true);
    localStorage.setItem("exec_open", "true");
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem("exec_open", "false");
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem("exec_open", String(next));
      return next;
    });
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const content = (text ?? "").trim();
      if (!content || loading) return;
      const newMessages = [...messages, { role: "user", content }];
      setMessages(newMessages);
      setLoading(true);
      base44.analytics.track({
        eventName: "exec_concierge_message_sent",
        properties: { length: content.length },
      });

      // Executive Outcome Intelligence™ — answer outcome questions locally
      // from observed results (no AI credit), then fall through to the AI.
      if (isOutcomeQuestion(content)) {
        try {
          const records = await base44.entities.ExecutiveOutcome.filter({}, "-outcome_date", 50);
          const intel = computeOutcomeIntelligence(records, computeReadinessFromEvidence());
          const answer = answerOutcomeQuestion(content, intel);
          if (answer && !answer.startsWith("I can answer:")) {
            setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
            setLoading(false);
            return;
          }
        } catch {
          // fall through to the AI on any error
        }
      }

      try {
        const prompt = buildExecPrompt(
          newMessages,
          user,
          matchPageContext(location.pathname),
          userContextRef.current || userContext,
          workspacePersona,
          learnedPreferencesRef.current
        );
        const res = await callAI("exec_concierge", { prompt });
        const initialResponse =
          typeof res === "string"
            ? res
            : res?.response || res?.text || "I apologize, I couldn't generate a response. Please try again.";
        const { response, review, revised } = await runQualityGate(content, initialResponse);
        base44.analytics.track({
          eventName: "exec_response_quality_review",
          properties: {
            passed: review.passed,
            revised,
            failed_checks: review.checks.filter((c) => !c.passed).map((c) => c.id),
          },
        });
        setMessages((prev) => [...prev, { role: "assistant", content: response }]);

        // Preference Learning™ — extract signals from the updated conversation
        const updatedConversation = [...newMessages, { role: "assistant", content: response }];
        const extracted = extractPreferences(updatedConversation);
        if (extracted.signals.length > 0 || extracted.topics.length > 0) {
          const merged = savePreferences(user?.id, activeWorkspace, {
            ...extracted,
            newMessageCount: 2,
          });
          setLearnedPreferences(merged);
        }
        // Persist cross-session Executive Memory™ — preferences AND long-term
        // memory consolidated in a single save to avoid race conditions.
        const memUpdates = {
          preferences_json: JSON.stringify({
            topics: extracted.topics,
            signals: extracted.signals,
            ...learnedPreferencesRef.current,
          }),
          last_context_gathered_at: new Date().toISOString(),
        };

        // Long-Term Memory Consolidation™ — extract goals, aspirations, and
        // achievements from the conversation and merge into persistent memory.
        const ltMemory = extractLongTermMemory(updatedConversation);
        if (ltMemory.goals.length > 0 || ltMemory.aspirations.length > 0 || ltMemory.achievements.length > 0) {
          const merged = mergeLongTermMemory(executiveMemoryRef.current, ltMemory);
          Object.assign(memUpdates, merged);
        }
        saveExecutiveMemory(memUpdates);
      } catch {
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
    },
    [messages, loading, user, location.pathname, userContext, workspacePersona, saveExecutiveMemory]
    );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setHasGreeted(false);
    userContextRef.current = null;
    clearPreferences(user?.id, activeWorkspace);
    setLearnedPreferences(null);
    localStorage.removeItem(storageKey("exec_greeted", user, activeWorkspace));
    localStorage.removeItem(storageKey("exec_messages", user, activeWorkspace));
  }, [user, activeWorkspace]);

  const value = {
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
    hasGreeted,
    initConversation,
    workspacePersona,
    activeWorkspace,
    contextSwitchAt,
    learnedPreferences,
    executiveMemory,
    hasExecutiveMemory: !!executiveMemory,
    hasLongTermRecall: hasLongTermRecall(executiveMemory),
  };

  return (
    <ExecConciergeContext.Provider value={value}>{children}</ExecConciergeContext.Provider>
  );
}