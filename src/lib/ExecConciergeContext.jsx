import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { callAI } from "@/lib/ai";
import {
  matchPageContext,
  generateBriefing,
  EXEC_WELCOME_MESSAGE,
  buildExecPrompt,
} from "@/lib/execConciergeConfig";
import { resolveWorkspacePersona } from "@/lib/execWorkspacePersonas";

const ExecConciergeContext = createContext(null);

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
      hasGreeted: false,
      workspacePersona: null,
      activeWorkspace: null,
    };
  }
  return ctx;
}

function storageKey(prefix, user) {
  return `${prefix}_${user?.id || "anon"}`;
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
  const userContextRef = useRef(null);

  // Track current page context
  useEffect(() => {
    setPageContext(matchPageContext(location.pathname));
  }, [location.pathname]);

  // Resolve workspace-aware persona (reactive to workspace + page changes)
  const workspacePersona = useMemo(
    () => resolveWorkspacePersona(activeWorkspace, location.pathname),
    [activeWorkspace, location.pathname]
  );

  // Restore open state on mount
  useEffect(() => {
    if (localStorage.getItem("exec_open") === "true") setIsOpen(true);
  }, []);

  // Load conversation + greeting state when the user changes
  useEffect(() => {
    const mKey = storageKey("exec_messages", user);
    const gKey = storageKey("exec_greeted", user);
    try {
      const saved = localStorage.getItem(mKey);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
    setHasGreeted(localStorage.getItem(gKey) === "true");
    userContextRef.current = null;
    setUserContext(null);
  }, [user?.id]);

  // Persist messages whenever they change
  useEffect(() => {
    localStorage.setItem(storageKey("exec_messages", user), JSON.stringify(messages));
  }, [messages, user?.id]);

  // Fetch user context (memoized per user)
  const fetchUserContext = useCallback(async () => {
    if (!user?.id) return null;
    if (userContextRef.current) return userContextRef.current;
    try {
      const res = await base44.functions.invoke("manageReputation", {
        action: "get_status",
        user_id: user.id,
      });
      const data = res.data || res;
      // Fetch journey data for journey-aware EXEC™
      let journey = null;
      try {
        const journeyRes = await base44.functions.invoke("manageJourney", { action: "compute" });
        journey = journeyRes.data;
      } catch (e) {}
      const ctx = {
        reputation: data?.reputation,
        profile: data?.profile,
        journey,
        recommendations: computeRecommendations(data, user),
      };
      userContextRef.current = ctx;
      setUserContext(ctx);
      return ctx;
    } catch {
      const fallback = { recommendations: computeRecommendations(null, user) };
      userContextRef.current = fallback;
      setUserContext(fallback);
      return fallback;
    }
  }, [user?.id]);

  const initConversation = useCallback(async () => {
    if (user) {
      setLoading(true);
      const ctx = await fetchUserContext();
      setLoading(false);
      const firstName = user.full_name?.split(" ")[0];
      const briefing = generateBriefing(firstName, ctx, matchPageContext(location.pathname), workspacePersona);
      setMessages([{ role: "assistant", content: briefing }]);
    } else {
      setMessages([{ role: "assistant", content: workspacePersona?.anonymousGreeting || EXEC_WELCOME_MESSAGE }]);
    }
    base44.analytics.track({ eventName: "exec_concierge_opened", properties: { workspace: activeWorkspace } });
  }, [user, fetchUserContext, location.pathname, workspacePersona, activeWorkspace]);

  // Greet on first open (per user)
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      localStorage.setItem(storageKey("exec_greeted", user), "true");
      initConversation();
    }
  }, [isOpen, hasGreeted, initConversation, user]);

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
      try {
        const prompt = buildExecPrompt(
          newMessages,
          user,
          matchPageContext(location.pathname),
          userContextRef.current || userContext,
          workspacePersona
        );
        const res = await callAI("exec_concierge", { prompt });
        const response =
          typeof res === "string"
            ? res
            : res?.response || res?.text || "I apologize, I couldn't generate a response. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: response }]);
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
    [messages, loading, user, location.pathname, userContext, workspacePersona]
    );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setHasGreeted(false);
    userContextRef.current = null;
    localStorage.removeItem(storageKey("exec_greeted", user));
    localStorage.removeItem(storageKey("exec_messages", user));
  }, [user]);

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
    hasGreeted,
    initConversation,
    workspacePersona,
    activeWorkspace,
  };

  return (
    <ExecConciergeContext.Provider value={value}>{children}</ExecConciergeContext.Provider>
  );
}