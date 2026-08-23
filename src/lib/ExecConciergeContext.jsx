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
import {
  computeRecommendationIntelligence,
  answerRecommendationQuestion,
  attributionFromOutcomeIntelligence,
} from "@/lib/recommendationIntelligenceEngine";
import {
  buildDecisionExplanation,
  computeAITrustScore,
  answerTransparencyQuestion,
} from "@/lib/decisionTransparencyEngine";
import { analyzeAllGaps } from "@/lib/evidenceGapEngine";
import { loadLatestStory, formatStoryContextForPrompt, buildStoryContext } from "@/lib/executiveStoryIntelligence";
import { generateBio, detectBioFormat, isStoryBioRequest, isStorySummaryRequest, formatExplainability } from "@/lib/executiveBioGenerator";
import { loadLatestIdentity, formatIdentityContextForPrompt } from "@/lib/executiveIdentityGraphEngine";
import { isIdentityCommand, answerIdentityCommand, generateBrand as generateIdentityBrand } from "@/lib/executiveIdentityPresentations";
import { newCorrelationId, logStage, getExecHealth, getExecEvents, getLastFailure } from "@/lib/execReliabilityEngine";
import { isCompanyKnowledgeQuestion, isInformationalPricingQuestion, retrieveKnowledgeArticles, answerFromKnowledge, answerFounderQuestionFromApprovedKnowledge, answerInformationalPricingQuestion, formatKnowledgeAuthorityMessage, buildNoResultMessage, getGroundedFollowUpQuestions } from "@/lib/knowledgeAuthorityGuard";
import { trackKnowledgeAiAsk } from "@/lib/knowledgeIntelligenceClient";
import { guardExecDecisionResponse } from "@/lib/execDecisionTruthfulnessGuard";
import { classifyExecQuestion, EXEC_QUESTION_CATEGORIES } from "@/lib/execQuestionClassifier";
import { getStrategicComparisonResponse } from "@/lib/execStrategicComparison";

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

// Recommendation Intelligence™ questions — answered locally from tracked
// recommendation effectiveness + model calibration.
const REC_Q_KEYWORDS = [
  "recommendation works best",
  "works best for me",
  "biggest impact",
  "recommendation had the biggest",
  "largest impact",
  "recommendations were ineffective",
  "ineffective recommendation",
  "predicted gains",
  "prediction accuracy",
  "how accurate",
  "calibration",
  "model calibration",
];
function isRecommendationQuestion(text) {
  const t = (text || "").toLowerCase();
  return REC_Q_KEYWORDS.some((k) => t.includes(k));
}

// AI Decision Transparency™ questions — "Why did the AI recommend this?"
const TRANSPARENCY_Q_KEYWORDS = [
  "why did you recommend",
  "why recommend",
  "why this recommendation",
  "what evidence supports",
  "evidence supports",
  "how confident are you",
  "how confident",
  "what alternatives",
  "what alternative",
  "alternatives exist",
  "why not another",
  "why not a different",
];
function isTransparencyQuestion(text) {
  const t = (text || "").toLowerCase();
  return TRANSPARENCY_Q_KEYWORDS.some((k) => t.includes(k));
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
  const [latestStory, setLatestStory] = useState(null);
  const [latestIdentity, setLatestIdentity] = useState(null);
  const [healthTick, setHealthTick] = useState(0);
  const refreshHealth = useCallback(() => setHealthTick((t) => t + 1), []);
  const health = useMemo(() => getExecHealth(), [healthTick]);
  const execEvents = useMemo(() => getExecEvents(30), [healthTick]);
  const lastFailure = useMemo(() => getLastFailure(), [healthTick]);
  const userContextRef = useRef(null);
  const latestStoryRef = useRef(null);
  const latestIdentityRef = useRef(null);
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

  // Load the member's latest Executive Success Story so EXEC™ can ground every
  // professional summary, biography, and portfolio in verified evidence.
  useEffect(() => {
    if (!user?.id) { setLatestStory(null); latestStoryRef.current = null; return; }
    loadLatestStory(user.id).then((s) => { setLatestStory(s); latestStoryRef.current = s; });
  }, [user?.id]);

  // Load the member's canonical Executive Identity Graph™ so EXEC™ can ground
  // executive brand, differentiator, and elevator-pitch requests in one identity.
  useEffect(() => {
    if (!user?.id) { setLatestIdentity(null); latestIdentityRef.current = null; return; }
    loadLatestIdentity(user.id).then((id) => { setLatestIdentity(id); latestIdentityRef.current = id; });
  }, [user?.id]);

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
      const correlationId = newCorrelationId();
      logStage({ correlationId, stage: "message_received", status: "success", extra: { length: content.length } });
      logStage({ correlationId, stage: "auth", status: user ? "success" : "failure", extra: { userId: user?.id || null } });
      logStage({ correlationId, stage: "workspace", status: "success", extra: { workspace: activeWorkspace } });
      logStage({ correlationId, stage: "persona", status: workspacePersona ? "success" : "failure", extra: { persona: workspacePersona?.id || null } });
      const newMessages = [...messages, { role: "user", content }];
      setMessages(newMessages);
      setLoading(true);
      base44.analytics.track({
        eventName: "exec_concierge_message_sent",
        properties: { length: content.length },
      });

      const questionCategory = classifyExecQuestion(content);

      // Informational pricing is deterministic and fail-closed. It must never
      // enter Knowledge Authority generation, the generic prompt, or AI review.
      if (questionCategory === EXEC_QUESTION_CATEGORIES.INFORMATIONAL_PRICING || isInformationalPricingQuestion(content)) {
        const unavailableMessage = "I’m unable to retrieve the current pricing information right now. Please check the official pricing information or try again.";
        try {
          const pricingAnswer = await answerInformationalPricingQuestion(content);
          const finalPricingAnswer = typeof pricingAnswer === "string" && pricingAnswer.trim()
            ? pricingAnswer
            : unavailableMessage;
          setMessages((prev) => [...prev, { role: "assistant", content: finalPricingAnswer }]);
          base44.analytics.track({
            eventName: "exec_pricing_information_answered",
            properties: { available: finalPricingAnswer !== unavailableMessage },
          });
        } catch {
          setMessages((prev) => [...prev, { role: "assistant", content: unavailableMessage }]);
          base44.analytics.track({ eventName: "exec_pricing_information_answered", properties: { available: false } });
        }
        setLoading(false);
        return;
      }

      const strategicComparison = getStrategicComparisonResponse(content);
      if (questionCategory === "Strategic Comparison" && strategicComparison) {
        const { response } = await runQualityGate(content, strategicComparison);
        const guardedResponse = guardExecDecisionResponse(content, response);
        setMessages((prev) => [...prev, { role: "assistant", content: guardedResponse }]);
        setLoading(false);
        return;
      }

      // Executive Outcome Intelligence™ + Recommendation Intelligence™ — answer
      // outcome/recommendation questions locally from observed results (no AI
      // credit), then fall through to the AI.
      if (
        isOutcomeQuestion(content) ||
        isRecommendationQuestion(content) ||
        isTransparencyQuestion(content)
      ) {
        try {
          const records = await base44.entities.ExecutiveOutcome.filter({}, "-outcome_date", 50);
          const readiness = computeReadinessFromEvidence();
          const outcomeIntel = computeOutcomeIntelligence(records, readiness);
          if (isOutcomeQuestion(content)) {
            const answer = answerOutcomeQuestion(content, outcomeIntel);
            if (answer && !answer.startsWith("I can answer:")) {
              setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
              setLoading(false);
              return;
            }
          }
          const recIntel = computeRecommendationIntelligence(
            attributionFromOutcomeIntelligence(outcomeIntel)
          );
          if (isRecommendationQuestion(content)) {
            const answer = answerRecommendationQuestion(content, recIntel);
            if (answer && !answer.startsWith("I can answer:")) {
              setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
              setLoading(false);
              return;
            }
          }
          if (isTransparencyQuestion(content)) {
            const gaps = analyzeAllGaps(readiness);
            const top = recIntel.topPerformers?.[0] || recIntel.byActivityType?.[0];
            const explanation = top
              ? buildDecisionExplanation({
                  activityType: top.activityType,
                  competency: top.competency,
                  recIntel,
                  outcomeIntel,
                  readiness,
                  gapAnalysis: gaps,
                })
              : null;
            const trustScore = computeAITrustScore({ recIntel, outcomeIntel, readiness });
            const answer = answerTransparencyQuestion(content, explanation, trustScore);
            if (answer && !answer.startsWith("I can answer:")) {
              setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
              setLoading(false);
              return;
            }
          }
        } catch {
          // fall through to the AI on any error
        }
      }

      // Executive Story Intelligence™ — answer story/biography requests locally
      // from the member's verified Success Story with full explainability, then
      // fall through to the AI for everything else.
      const lowerContent = content.toLowerCase();
      const story = latestStoryRef.current;
      if (story && (isStorySummaryRequest(lowerContent) || isStoryBioRequest(lowerContent))) {
        try {
          let answerText;
          if (isStorySummaryRequest(lowerContent)) {
            const sctx = buildStoryContext(story);
            const ex = {
              storySource: story.title,
              verifiedEvidence: {
                evidenceRecords: sctx.evidenceCount,
                coachingSessions: sctx.sessionCounts?.coachSessions || 0,
                simulations: sctx.sessionCounts?.simulations || 0,
                decisionLabs: sctx.sessionCounts?.decisionLabs || 0,
                outcomes: sctx.sessionCounts?.outcomes || 0,
                achievements: (story.achievements || []).length,
              },
              readinessChange: sctx.readiness,
              aiInsights: sctx.aiInsights,
              confidence: sctx.storyConfidence,
              lastUpdated: story.generated_date,
              version: story.version,
            };
            answerText = `**${story.title}**\n\n${story.summary}\n\n**Executive Readiness™:** ${sctx.readiness.beginning ?? '—'} → ${sctx.readiness.current ?? '—'} (+${sctx.readiness.improvement || 0})  \n**Journey Stage:** ${sctx.journeyStage || '—'}  \n**Evidence:** ${sctx.evidenceCount} verified records  \n**Story Confidence:** ${sctx.storyConfidence}%\n\n---\n${formatExplainability(ex)}`;
          } else {
            const fmt = detectBioFormat(content);
            const result = await generateBio(story, fmt);
            answerText = `${result.text}\n\n---\n${formatExplainability(result.explainability)}`;
          }
          setMessages((prev) => [...prev, { role: "assistant", content: answerText }]);
          setLoading(false);
          base44.analytics.track({ eventName: "exec_story_intelligence_used", properties: { type: isStorySummaryRequest(lowerContent) ? "summary" : detectBioFormat(content) } });
          return;
        } catch {
          // fall through to the AI on any error
        }
      }

      // Executive Identity Graph™ — answer identity / brand / elevator-pitch
      // questions locally from the member's canonical verified identity.
      const ident = latestIdentityRef.current;
      if (ident && isIdentityCommand(content)) {
        try {
          let brandObj = null;
          try { brandObj = ident.brand_json ? JSON.parse(ident.brand_json) : null; } catch {}
          let answer = answerIdentityCommand(content, ident, brandObj);
          if (answer === null && content.toLowerCase().includes("elevator pitch")) {
            const b = await generateIdentityBrand(ident);
            answer = b?.elevator_pitch ? `**Executive Elevator Pitch**\n\n${b.elevator_pitch}` : null;
          }
          if (answer) {
            setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
            setLoading(false);
            base44.analytics.track({ eventName: "exec_identity_graph_used", properties: {} });
            return;
          }
        } catch {
          // fall through to the AI
        }
      }

      // ── Knowledge Authority Guard™ ── company/platform questions are answered
      // exclusively from approved Knowledge Articles (never general LLM reasoning).
      // Falls back to a transparent "no approved article" message when evidence is
      // missing. Every grounded answer is audit-logged via trackKnowledgeAiAsk.
      if (isCompanyKnowledgeQuestion(content)) {
        try {
          const { ranked, all } = await retrieveKnowledgeArticles(content, 5);
          const protectedFounderAnswer = answerFounderQuestionFromApprovedKnowledge(content, all);
          let result;
          if (protectedFounderAnswer) {
            const founderSource = all.find((article) => article.slug === "founder-why-built");
            result = { noResult: false, answer: protectedFounderAnswer, sources: founderSource ? [founderSource] : [], confidence: 100, confidenceLabel: "Approved", freshness: founderSource?.last_updated || null, citedSlugs: founderSource ? [founderSource.slug] : [], related: [] };
            trackKnowledgeAiAsk({ query: content, confidence: 100, sourcesCount: result.sources.length, noResult: false, citedSlugs: result.citedSlugs });
          } else if (ranked.length === 0) {
            const suggestions = (all || []).slice().sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 4);
            result = { noResult: true, sources: [], confidence: 0, confidenceLabel: "Unknown", freshness: null, citedSlugs: [], relatedSuggestions: suggestions };
            trackKnowledgeAiAsk({ query: content, confidence: 0, sourcesCount: 0, noResult: true, citedSlugs: [] });
          } else {
            result = await answerFromKnowledge(content, ranked, all);
            trackKnowledgeAiAsk({ query: content, confidence: result.confidence, sourcesCount: result.sources.length, noResult: false, citedSlugs: result.citedSlugs });
          }
          const answerText = result.noResult ? buildNoResultMessage(result.relatedSuggestions) : formatKnowledgeAuthorityMessage(result);
          const suggestedQuestions = getGroundedFollowUpQuestions(result, content);
          setMessages((prev) => [...prev, { role: "assistant", content: answerText, suggestedQuestions }]);
          setLoading(false);
          base44.analytics.track({ eventName: "exec_knowledge_authority_used", properties: { noResult: result.noResult, confidence: result.confidence, sources: result.sources.length } });
          refreshHealth();
          return;
        } catch (e) {
          // fall through to the standard EXEC™ path on any error
        }
      }

      try {
        const prompt = buildExecPrompt(
          newMessages,
          user,
          matchPageContext(location.pathname),
          userContextRef.current || userContext,
          workspacePersona,
          learnedPreferencesRef.current,
          formatStoryContextForPrompt(latestStoryRef.current),
          formatIdentityContextForPrompt(latestIdentityRef.current)
        );
        logStage({ correlationId, stage: "executive_context", status: userContextRef.current ? "success" : "failure", extra: { hasContext: !!userContextRef.current } });
        const res = await callAI("exec_concierge", {
          prompt,
          correlationId,
          responseCategory: questionCategory,
          contextPolicy: "none",
        });
        const initialResponse =
          typeof res === "string"
            ? res
            : res?.response || res?.text || "I apologize, I couldn't generate a response. Please try again.";
        logStage({ correlationId, stage: "response_parse", status: "success" });
        const { response, review, revised } = await runQualityGate(content, initialResponse);
        const guardedResponse = guardExecDecisionResponse(content, response);
        logStage({ correlationId, stage: "quality_gate", status: "success", extra: { passed: review.passed, revised } });
        base44.analytics.track({
          eventName: "exec_response_quality_review",
          properties: {
            passed: review.passed,
            revised,
            failed_checks: review.checks.filter((c) => !c.passed).map((c) => c.id),
          },
        });
        setMessages((prev) => [...prev, { role: "assistant", content: guardedResponse }]);

        // Preference Learning™ — extract signals from the updated conversation
        const updatedConversation = [...newMessages, { role: "assistant", content: guardedResponse }];
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
        logStage({ correlationId, stage: "render", status: "success" });
        refreshHealth();
      } catch (err) {
        // Root-cause traceable failure. Log the exact failing stage + error
        // for the Developer Workspace; show users a friendly message only.
        const errMsg = err?.message || String(err);
        logStage({ correlationId, stage: "render", status: "failure", error: errMsg });
        refreshHealth();
        base44.analytics.track({ eventName: "exec_concierge_failure", properties: { correlationId, error: errMsg } });
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
    health,
    execEvents,
    lastFailure,
    refreshHealth,
  };

  return (
    <ExecConciergeContext.Provider value={value}>{children}</ExecConciergeContext.Provider>
  );
}