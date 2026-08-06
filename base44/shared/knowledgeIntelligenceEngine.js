// Knowledge Intelligence™ Engine — pure compute over KnowledgeInteraction + KnowledgeArticle.
// Shared by getKnowledgeIntelligence (dashboard) and generateKnowledgeIntelligenceReport (weekly).
import { COVERAGE_AREAS } from './knowledgeCoverage.js';

const DAY = 86400000;
const now = Date.now();
const within7d = (ts) => ts >= now - 7 * DAY;
const within90d = (ts) => ts >= now - 90 * DAY;

function norm(q) {
  return (q || '').toLowerCase().trim().replace(/[?.!]+$/g, '').slice(0, 120);
}
function parseSlugs(s) {
  try { return JSON.parse(s || '[]'); } catch (e) { return []; }
}
function rank(map) {
  return Object.entries(map)
    .map(([k, v]) => ({ key: k, count: v }))
    .sort((a, b) => b.count - a.count);
}
function topN(arr, n) { return arr.slice(0, n); }
function avg(nums) { if (!nums.length) return 0; return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length); }

export function computeKnowledgeIntelligence(interactions = [], articles = []) {
  const arts = articles.filter((a) => a.published !== false);
  const artBySlug = new Map(arts.map((a) => [a.slug, a]));

  // --- Coverage ---
  const catCounts = {};
  arts.forEach((a) => { catCounts[a.category] = (catCounts[a.category] || 0) + 1; });
  const coverageAreas = COVERAGE_AREAS.map((area) => {
    const count = catCounts[area.category] || 0;
    const coverage = Math.min(100, Math.round((count / area.target) * 100));
    return { ...area, count, coverage };
  });
  const overallCoverage = Math.round(coverageAreas.reduce((s, a) => s + a.coverage, 0) / coverageAreas.length);

  // --- Freshness ---
  const updatedTs = arts.map((a) => new Date(a.last_updated || a.updated_date || a.created_date).getTime()).filter(Boolean);
  const updatedLast90 = updatedTs.filter(within90d).length;
  const freshnessPct = arts.length ? Math.round((updatedLast90 / arts.length) * 100) : 0;

  // --- Search analytics ---
  const searches = interactions.filter((i) => i.interaction_type === 'search' || i.interaction_type === 'no_result');
  const zeroResult = interactions.filter((i) => i.interaction_type === 'no_result');
  const aiAsks = interactions.filter((i) => i.interaction_type === 'ai_ask');

  const qCounts = {};
  const qSessions = {};
  const last7q = {};
  searches.forEach((i) => {
    const q = norm(i.query);
    if (!q) return;
    qCounts[q] = (qCounts[q] || 0) + 1;
    qSessions[q] = qSessions[q] || new Set();
    qSessions[q].add(i.session_id);
    if (within7d(new Date(i.occurred_at || i.created_date).getTime())) last7q[q] = (last7q[q] || 0) + 1;
  });

  const topQueries = topN(rank(qCounts), 10);
  const trending = topN(rank(last7q), 8);
  const repeated = topN(Object.entries(qSessions).map(([k, s]) => ({ key: k, count: s.size })).filter((x) => x.count > 1).sort((a, b) => b.count - a.count), 8);
  const zeroMap = {};
  zeroResult.forEach((i) => { const q = norm(i.query); if (q) zeroMap[q] = (zeroMap[q] || 0) + 1; });
  const zeroResultRank = topN(rank(zeroMap), 10);

  // Audience-segmented searches (by recorded audience)
  const audGroups = { Enterprise: [], Investors: [], Media: [] };
  searches.forEach((i) => {
    const a = i.audience;
    if (a && audGroups[a] !== undefined) {
      const q = norm(i.query);
      if (q) audGroups[a].push(q);
    }
  });
  const byAudience = {};
  Object.entries(audGroups).forEach(([k, arr]) => {
    const m = {}; arr.forEach((q) => (m[q] = (m[q] || 0) + 1));
    byAudience[k] = topN(rank(m), 6);
  });

  // Click-through: sessions that searched then viewed an article
  const searchSessions = new Set(searches.map((i) => i.session_id));
  const viewSessions = new Set(interactions.filter((i) => i.interaction_type === 'article_view').map((i) => i.session_id));
  let clicked = 0;
  searchSessions.forEach((s) => { if (viewSessions.has(s)) clicked++; });
  const clickRate = searchSessions.size ? Math.round((clicked / searchSessions.size) * 100) : 0;
  const zeroResultRate = searches.length ? Math.round((zeroResult.length / searches.length) * 100) : 0;

  // Top categories by views
  const catViews = {};
  interactions.filter((i) => i.interaction_type === 'article_view' && i.category).forEach((i) => (catViews[i.category] = (catViews[i.category] || 0) + 1));

  // --- Article performance ---
  const perf = {};
  arts.forEach((a) => {
    perf[a.slug] = { slug: a.slug, question: a.question, category: a.category, audience: (a.audience || [])[0] || 'General User', views: 0, uniqueReaders: new Set(), helpful: 0, notHelpful: 0, relatedClicks: 0, trustRefs: 0, aiCitations: 0, lastUpdated: a.last_updated || a.updated_date };
  });
  interactions.forEach((i) => {
    if (!i.slug || !perf[i.slug]) return;
    const p = perf[i.slug];
    if (i.interaction_type === 'article_view') { p.views++; p.uniqueReaders.add(i.session_id); }
    else if (i.interaction_type === 'vote') { if (i.helpful) p.helpful++; else p.notHelpful++; }
    else if (i.interaction_type === 'related_click') p.relatedClicks++;
    else if (i.interaction_type === 'trust_ref') p.trustRefs++;
  });
  // AI citations
  aiAsks.forEach((i) => parseSlugs(i.cited_slugs_json).forEach((s) => { if (perf[s]) perf[s].aiCitations++; }));
  const articlePerf = Object.values(perf).map((p) => ({ ...p, uniqueReaders: p.uniqueReaders.size })).sort((a, b) => b.views - a.views);

  // --- Gaps ---
  const lowConfidence = aiAsks.filter((i) => (i.confidence || 0) < 55).map((i) => ({ query: norm(i.query), confidence: i.confidence || 0 }));
  const lowRated = Object.values(perf).filter((p) => p.notHelpful >= 2 && p.notHelpful > p.helpful).map((p) => ({ slug: p.slug, question: p.question, notHelpful: p.notHelpful, helpful: p.helpful }));
  const missingCoverage = coverageAreas.filter((a) => a.coverage < 100).sort((a, b) => a.coverage - b.coverage);

  // --- AI confidence ---
  const confidences = aiAsks.map((i) => i.confidence || 0).filter((c) => c > 0);
  const aiAvgConfidence = avg(confidences);
  const aiLowCount = aiAsks.filter((i) => (i.confidence || 0) < 55).length;

  // --- Enterprise insights ---
  const entViews = articlePerf.filter((p) => p.audience === 'Enterprise' || p.category === 'Enterprise').slice(0, 8);
  const procurementTerms = ['procure', 'quote', 'contract', 'vendor', 'pricing', 'invoice', 'cpq'];
  const procMap = {};
  searches.filter((i) => procurementTerms.some((t) => norm(i.query).includes(t))).forEach((i) => { const q = norm(i.query); if (q) procMap[q] = (procMap[q] || 0) + 1; });
  const procurementQueries = topN(rank(procMap), 6);
  const securityViews = articlePerf.filter((p) => p.category === 'Security').reduce((s, p) => s + p.views, 0);
  const privacyViews = articlePerf.filter((p) => p.category === 'Privacy').reduce((s, p) => s + p.views, 0);
  const complianceViews = articlePerf.filter((p) => /compl/i.test(p.category)).reduce((s, p) => s + p.views, 0);
  const trustRefs = interactions.filter((i) => i.interaction_type === 'trust_ref').length;

  // --- Commercial intelligence (proxy via referrer) ---
  const ref = (i) => (i.referrer_path || '').toLowerCase();
  const preConversionViews = interactions.filter((i) => i.interaction_type === 'article_view' && (ref(i).includes('pricing') || ref(i).includes('beta') || ref(i).includes('trust-center'))).length;
  const fromPricing = {}; const fromTrust = {};
  interactions.filter((i) => i.interaction_type === 'article_view').forEach((i) => {
    if (!i.slug) return;
    if (ref(i).includes('pricing')) fromPricing[i.slug] = (fromPricing[i.slug] || 0) + 1;
    if (ref(i).includes('trust-center')) fromTrust[i.slug] = (fromTrust[i.slug] || 0) + 1;
  });
  const topFromPricing = topN(rank(fromPricing), 5).map((x) => ({ slug: x.key, views: x.count, question: artBySlug.get(x.key)?.question }));
  const topFromTrust = topN(rank(fromTrust), 5).map((x) => ({ slug: x.key, views: x.count, question: artBySlug.get(x.key)?.question }));

  // --- Content recommendations ---
  const recommendations = [];
  zeroResultRank.slice(0, 6).forEach((q) => {
    recommendations.push({ title: q.key, priority: q.count >= 3 ? 'High' : 'Medium', expectedImpact: `Addresses ${q.count} unanswered searches`, estimatedDemand: q.count, source: 'zero-result searches' });
  });
  lowConfidence.slice(0, 3).forEach((q) => {
    if (q.confidence > 0) recommendations.push({ title: q.query, priority: 'High', expectedImpact: 'Improves Ask EXEC™ confidence', estimatedDemand: 1, source: 'low-confidence AI response' });
  });
  missingCoverage.slice(0, 4).forEach((a) => {
    recommendations.push({ title: `New ${a.label} article`, priority: a.coverage < 50 ? 'High' : 'Medium', expectedImpact: `Raises ${a.label} coverage from ${a.coverage}%`, estimatedDemand: a.target - a.count, source: 'coverage gap' });
  });

  // --- Helpful rate ---
  const totalHelpful = articlePerf.reduce((s, p) => s + p.helpful, 0);
  const totalNot = articlePerf.reduce((s, p) => s + p.notHelpful, 0);
  const helpfulness = (totalHelpful + totalNot) ? Math.round((totalHelpful / (totalHelpful + totalNot)) * 100) : 100;

  // --- Knowledge Health Score™ ---
  const components = {
    coverage: overallCoverage,
    freshness: freshnessPct,
    helpfulness,
    searchSuccess: 100 - zeroResultRate,
    aiConfidence: aiAvgConfidence || 0,
  };
  const healthScore = Math.round(
    components.coverage * 0.30 +
    components.freshness * 0.15 +
    components.helpfulness * 0.20 +
    components.searchSuccess * 0.20 +
    components.aiConfidence * 0.15
  );

  return {
    health: { score: healthScore, trend: 0, components },
    coverage: { overall: overallCoverage, areas: coverageAreas },
    freshness: { totalArticles: arts.length, updatedLast90Days: updatedLast90, pct: freshnessPct },
    search: {
      total: searches.length,
      zeroResultCount: zeroResult.length,
      zeroResultRate,
      clickRate,
      topQueries,
      trending,
      zeroResult: zeroResultRank,
      repeated,
      byAudience,
      topCategories: topN(rank(catViews), 8),
    },
    articles: articlePerf,
    gaps: { zeroResult: zeroResultRank, lowConfidence: lowConfidence.slice(0, 8), lowRated, missingCoverage },
    aiConfidence: { avg: aiAvgConfidence, lowCount: aiLowCount, total: aiAsks.length },
    enterprise: { topArticles: entViews, procurementQueries, securityViews, privacyViews, complianceViews, trustRefs },
    commercial: { preConversionViews, topFromPricing, topFromTrust },
    recommendations: recommendations.slice(0, 12),
  };
}