import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { safeParse } from "@/lib/feedbackConfig";
import { canAccessPM, generateBugId, generateFeatureId } from "@/lib/productManagement";

const REFRESH_INTERVAL = 30000;

const DEFAULT_FILTERS = {
  search: "", status: "", priority: "", category: "", module: "",
  organization: "", developer: "", dateFrom: "", dateTo: "",
};

export function useProductManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [releases, setReleases] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const timerRef = useRef(null);
  const prevIdsRef = useRef(null);

  const canManage = canAccessPM(user?.role);

  const loadAll = useCallback(async () => {
    try {
      // Use allSettled so a failed analytics call doesn't block the feedback list
      const [insightsResult, feedbackResult, releasesResult] = await Promise.allSettled([
        base44.functions.invoke("getProductInsights", {}),
        base44.entities.Feedback.list("-created_date", 500),
        base44.entities.ProductRelease.list("-release_date", 100),
      ]);

      const feedbackRes = feedbackResult.status === "fulfilled" ? feedbackResult.value : [];
      const releasesRes = releasesResult.status === "fulfilled" ? releasesResult.value : [];
      const insightsRes = insightsResult.status === "fulfilled" ? (insightsResult.value?.data || insightsResult.value) : null;
      const insightsError = insightsResult.status === "rejected" ? insightsResult.reason?.message : null;

      // Real-time alerts: detect new critical bugs / high-priority features since last refresh
      if (prevIdsRef.current !== null) {
        const prevIds = prevIdsRef.current;
        const newItems = (feedbackRes || []).filter(f => !prevIds.has(f.id));
        const newCritical = newItems.filter(f => f.severity === "critical" || f.enterprise_priority_level === "production_down");
        if (newCritical.length > 0) {
          toast({
            title: `🚨 ${newCritical.length} new critical feedback`,
            description: newCritical[0].title,
            variant: "destructive",
          });
        } else if (newItems.length > 0) {
          const newFeatures = newItems.filter(f => f.type === "feature" && f.severity === "high");
          if (newFeatures.length > 0) {
            toast({ title: "💡 High-priority feature requested", description: newFeatures[0].title });
          }
        }
      }
      prevIdsRef.current = new Set((feedbackRes || []).map(f => f.id));

      setInsights(insightsRes);
      setFeedback(feedbackRes || []);
      setReleases(releasesRes || []);
      // Only set a hard error if the feedback list itself failed to load
      setError(feedbackResult.status === "rejected" ? (feedbackResult.reason?.message || "Failed to load feedback") : null);
      if (insightsError && feedbackResult.status === "fulfilled") {
        // Insights failed but feedback loaded — non-fatal, KPIs will be limited
        console.warn("Product insights unavailable:", insightsError);
      }
    } catch (e) {
      setError(e.message || "Failed to load product data");
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  }, []);

  useEffect(() => {
    loadAll();
    timerRef.current = setInterval(loadAll, REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [loadAll]);

  const refresh = useCallback(() => loadAll(), [loadAll]);

  const updateFilter = useCallback((patch) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // ---- Memoized filtered list ----
  const filteredFeedback = useMemo(() => {
    return feedback.filter(f => {
      if (filters.status && f.status !== filters.status) return false;
      if (filters.priority && f.severity !== filters.priority && f.ai_priority !== filters.priority) return false;
      if (filters.category && f.category !== filters.category) return false;
      if (filters.module && (f.affected_module || f.ai_responsible_module) !== filters.module) return false;
      if (filters.organization && f.organization_name !== filters.organization) return false;
      if (filters.developer && f.assigned_developer !== filters.developer) return false;
      if (filters.dateFrom && new Date(f.created_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(f.created_date) > new Date(filters.dateTo)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const tags = safeParse(f.tags_json, []);
        const haystack = `${f.feedback_id} ${f.title} ${f.description} ${f.customer_name} ${f.organization_name} ${f.assigned_developer} ${tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [feedback, filters]);

  // ---- Actions ----
  const updateFeedback = useCallback(async (id, patch) => {
    const updated = await base44.entities.Feedback.update(id, patch);
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
    return updated;
  }, []);

  const appendLifecycle = (feedbackItem, newStage, label) => {
    const history = safeParse(feedbackItem.lifecycle_history_json, []);
    history.push({ stage: newStage, label, date: new Date().toISOString() });
    return JSON.stringify(history);
  };

  const convertToBug = useCallback(async (item) => {
    const bugId = generateBugId();
    const patch = {
      type: "bug",
      status: "acknowledged",
      affected_module: item.affected_module || item.ai_responsible_module || item.category || "Other",
      lifecycle_history_json: appendLifecycle(item, "categorized", "Converted to Bug"),
    };
    return updateFeedback(item.id, patch);
  }, [updateFeedback]);

  const convertToFeature = useCallback(async (item) => {
    const patch = {
      type: "feature",
      status: "acknowledged",
      roadmap_stage: item.roadmap_stage || "backlog",
      lifecycle_history_json: appendLifecycle(item, "categorized", "Converted to Feature"),
    };
    return updateFeedback(item.id, patch);
  }, [updateFeedback]);

  const assignDeveloper = useCallback(async (id, name) => {
    const item = feedback.find(f => f.id === id);
    const patch = {
      assigned_developer: name,
      status: item?.status === "new" ? "acknowledged" : item?.status,
      lifecycle_history_json: item ? appendLifecycle(item, "assigned", `Assigned to ${name}`) : undefined,
    };
    return updateFeedback(id, patch);
  }, [updateFeedback, feedback]);

  const updateRoadmapStage = useCallback(async (id, stage) => {
    const item = feedback.find(f => f.id === id);
    const patch = {
      roadmap_stage: stage,
      status: stage === "in_development" ? "in_progress" : stage === "testing" ? "testing" : stage === "released" ? "resolved" : item?.status,
      lifecycle_history_json: item ? appendLifecycle(item, stage, `Moved to ${stage}`) : undefined,
    };
    return updateFeedback(id, patch);
  }, [updateFeedback, feedback]);

  const addInternalNote = useCallback(async (id, noteText, field = "engineering_notes") => {
    const item = feedback.find(f => f.id === id);
    if (!item) return;
    const existing = item[field] || "";
    const updated = existing ? `${existing}\n\n--- ${new Date().toLocaleString()} ---\n${noteText}` : `--- ${new Date().toLocaleString()} ---\n${noteText}`;
    return updateFeedback(id, { [field]: updated });
  }, [updateFeedback, feedback]);

  const sendCustomerUpdate = useCallback(async (id, message, statusLabel) => {
    const item = feedback.find(f => f.id === id);
    if (!item) return;
    const comms = safeParse(item.customer_communications_json, []);
    comms.push({ message, status: statusLabel, date: new Date().toISOString(), sent_by: user?.full_name || user?.email });
    await updateFeedback(id, {
      customer_communications_json: JSON.stringify(comms),
      customer_notified_status: statusLabel,
      lifecycle_history_json: appendLifecycle(item, "notified", `Customer notified: ${statusLabel}`),
    });
    // Notify the customer
    try {
      await base44.entities.Notification.create({
        type: "feedback",
        title: `Update on your feedback: ${item.feedback_id}`,
        message: message || `Your feedback status is now: ${statusLabel}`,
        action_url: "/feedback",
        icon: "💬",
        user_id: item.created_by_id,
      });
    } catch (e) { /* optional */ }
  }, [updateFeedback, feedback, user]);

  const analyzeFeedback = useCallback(async (id) => {
    setAnalyzingId(id);
    try {
      const res = await base44.functions.invoke("runProductAI", { mode: "analyze", feedback_id: id });
      const analysis = res.data || res;
      if (analysis.success) {
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, ...analysis.analysis } : f));
      }
      return analysis;
    } finally {
      setAnalyzingId(null);
    }
  }, []);

  const generateInsights = useCallback(async () => {
    setLoadingAI(true);
    try {
      const res = await base44.functions.invoke("runProductAI", { mode: "insights" });
      const data = res.data || res;
      if (data.success) setAiInsights(data);
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const createRelease = useCallback(async (data) => {
    const record = await base44.entities.ProductRelease.create({
      ...data,
      created_by_name: user?.full_name || user?.email,
      created_by_id: user?.id,
    });
    setReleases(prev => [record, ...prev]);
    return record;
  }, [user]);

  const updateRelease = useCallback(async (id, patch) => {
    const updated = await base44.entities.ProductRelease.update(id, patch);
    setReleases(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    return updated;
  }, []);

  const linkFeedbackToRelease = useCallback(async (releaseId, releaseVersion, feedbackItem, type) => {
    // type: "feature" or "bug"
    const field = type === "feature" ? "completed_features_json" : "bug_fixes_json";
    const release = releases.find(r => r.id === releaseId);
    if (!release) return;
    const items = safeParse(release[field], []);
    if (!items.some(i => i.id === feedbackItem.id)) {
      items.push({ id: feedbackItem.id, title: feedbackItem.title, feedback_id: feedbackItem.feedback_id });
      await updateRelease(releaseId, { [field]: JSON.stringify(items) });
    }
    // Update the feedback item
    await updateFeedback(feedbackItem.id, {
      fix_version: releaseVersion,
      roadmap_stage: "released",
      release_date: release.release_date || new Date().toISOString(),
    });
  }, [releases, updateRelease, updateFeedback]);

  return {
    user, canManage,
    loading, error, lastRefresh, refresh,
    insights, feedback, releases,
    aiInsights, loadingAI, generateInsights,
    analyzingId, analyzeFeedback,
    filters, setFilters: updateFilter, resetFilters, filteredFeedback,
    updateFeedback, convertToBug, convertToFeature, assignDeveloper,
    updateRoadmapStage, addInternalNote, sendCustomerUpdate,
    createRelease, updateRelease, linkFeedbackToRelease,
  };
}