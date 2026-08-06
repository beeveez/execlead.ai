import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'execlead_knc_session';

function getSessionId() {
  try {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s) {
      s = 'k_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch (e) {
    return 'k_' + Math.random().toString(36).slice(2, 10);
  }
}

// Fire-and-forget — never blocks the UI, never throws to callers.
export function trackKnowledge(event) {
  try {
    const payload = {
      ...event,
      session_id: getSessionId(),
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer_path: typeof document !== 'undefined' ? (document.referrer || '') : '',
      occurred_at: new Date().toISOString(),
    };
    base44.functions.invoke('trackKnowledgeInteraction', payload).catch(() => {});
  } catch (e) {}
}

export function trackKnowledgeSearch(query, resultCount, audience) {
  if (!query || query.trim().length < 2) return;
  trackKnowledge({ interaction_type: 'search', query, result_count: resultCount || 0, audience: audience || '', source: 'search' });
  if (!resultCount) trackKnowledge({ interaction_type: 'no_result', query, audience: audience || '', source: 'search' });
}
export function trackKnowledgeView(slug, category) {
  if (!slug) return;
  trackKnowledge({ interaction_type: 'article_view', slug, category, source: 'detail' });
}
export function trackKnowledgeVote(slug, helpful) {
  trackKnowledge({ interaction_type: 'vote', slug, helpful: !!helpful, source: 'detail' });
}
export function trackKnowledgeRelated(slug) {
  trackKnowledge({ interaction_type: 'related_click', slug, source: 'detail' });
}
export function trackKnowledgeTrustRef(slug) {
  trackKnowledge({ interaction_type: 'trust_ref', slug, source: 'detail' });
}
export function trackKnowledgeAiAsk({ query, confidence, sourcesCount, noResult, citedSlugs }) {
  trackKnowledge({
    interaction_type: 'ai_ask',
    query,
    confidence: confidence || 0,
    ai_sources_count: sourcesCount || 0,
    ai_no_result: !!noResult,
    cited_slugs_json: citedSlugs || null,
    source: 'ask',
  });
}