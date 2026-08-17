import { base44 } from '@/api/base44Client';
import { ROUTE_REGISTRY } from '@/lib/routeRegistry';
import { DEFAULT_FEATURES, normalizeFeature } from '@/lib/featureCatalog';

export const KNOWLEDGE_REGISTRY_DEFINITIONS = [
  { id: 'platform-overview', name: 'EXECLEAD.AI Platform', route: '/', workspace: 'public', owner: 'Platform', aliases: ['execlead.ai', 'founder', 'founded', 'who built', 'mission', 'vision', 'what problem'], articles: ['what-is-execlead','why-execlead-vs-chatgpt','who-is-execlead-for','execlead-mission','execlead-vision','founder-why-built','investor-why-now','investor-business-model','media-what-problem'] },
  { id: 'executive-readiness', name: 'Executive Readiness™', route: '/executive-readiness', workspace: 'executive', owner: 'Executive Intelligence', aliases: ['executive readiness', 'readiness score', 'readiness calculated'], articles: ['what-is-executive-readiness','how-readiness-calculated','how-often-score-updated','what-evidence-improves-readiness'] },
  { id: 'executive-coach', name: 'Executive Coach™', route: '/coach', featureId: 'executive_coach', workspace: 'executive', owner: 'Executive Experience', aliases: ['executive coach', 'executive coaching', 'ai coaching'], articles: ['what-is-executive-coach','can-ai-replace-coaching'] },
  { id: 'decision-lab', name: 'Decision Lab™', route: '/decision-lab', workspace: 'executive', owner: 'Executive Intelligence', aliases: ['decision lab'], articles: ['how-does-decision-lab-work'] },
  { id: 'executive-simulator', name: 'Executive Simulator™', route: '/simulator', featureId: 'executive_simulator', workspace: 'executive', owner: 'Executive Experience', aliases: ['executive simulator', 'executive simulation', 'simulations'], articles: ['what-is-executive-simulator'] },
  { id: 'launch-defense', name: 'Launch Defense Center™', route: '/launch-defense', workspace: 'executive', owner: 'Executive Experience', aliases: ['launch defense'], articles: ['what-is-launch-defense'] },
  { id: 'executive-identity', name: 'Executive Identity™', route: '/executive-identity-graph', workspace: 'executive', owner: 'Identity', aliases: ['executive identity'], articles: ['what-is-executive-identity'] },
  { id: 'executive-portfolio', name: 'Executive Portfolio™', route: '/executive-portfolio', workspace: 'executive', owner: 'Career', aliases: ['executive portfolio'], articles: ['what-is-executive-portfolio'] },
  { id: 'leadership-dna', name: 'Leadership DNA™', route: '/leadership-dna', featureId: 'leadership_dna', workspace: 'executive', owner: 'Executive Intelligence', aliases: ['leadership dna'], articles: ['what-is-leadership-dna'] },
  { id: 'executive-journey', name: 'Executive Journey™', route: '/journey', workspace: 'executive', owner: 'Executive Experience', aliases: ['executive journey'], articles: ['what-is-executive-journey'] },
  { id: 'company-intelligence', name: 'Company Intelligence™', route: '/companies', featureId: 'company_intelligence', workspace: 'executive', owner: 'Career', aliases: ['company intelligence'], articles: ['what-is-company-intelligence'] },
  { id: 'enterprise-talent-intelligence', name: 'Enterprise Talent Intelligence™', route: '/enterprise/intelligence', workspace: 'enterprise', owner: 'Enterprise', aliases: ['enterprise talent intelligence', 'enterprise assessment'], articles: ['enterprise-talent-intelligence','can-enterprises-customize-readiness'] },
  { id: 'succession-planning', name: 'Succession Planning™', route: '/succession-planning', featureId: 'succession_planning', workspace: 'enterprise', owner: 'Enterprise', aliases: ['succession planning'], articles: ['succession-planning-works'] },
  { id: 'trust-center', name: 'Trust Center™', route: '/trust-center', workspace: 'public', owner: 'Trust & Security', aliases: ['trust center', 'secure', 'security', 'privacy', 'responsible ai'], articles: ['what-is-trust-center','how-secure-is-my-data','how-is-privacy-handled','what-is-responsible-ai'] },
  { id: 'pricing-billing', name: 'Pricing & Billing', route: '/pricing', workspace: 'public', owner: 'Commercial', aliases: ['pricing', 'billing', 'change plans', 'cancel plan'], articles: ['how-pricing-works','how-billing-works','can-i-change-plans'] },
  { id: 'support', name: 'Support', route: '/help', workspace: 'public', owner: 'Customer Success', aliases: ['support', 'get help'], articles: ['how-to-get-support'] },
  { id: 'developer-api', name: 'Developer API', route: '/developer-portal', workspace: 'developer', owner: 'Platform Engineering', aliases: ['api', 'developer api'], articles: ['is-there-an-api'] },
  { id: 'platform-roadmap', name: 'Platform Roadmap', route: '/release-readiness', workspace: 'developer', owner: 'Product', aliases: ['roadmap'], articles: ['platform-roadmap'] },
  { id: 'founding-private-beta', name: 'Founding Private Beta™', route: '/beta', workspace: 'public', owner: 'Beta Operations', aliases: ['private beta', 'founding beta', 'founding members'], articles: ['what-is-the-beta','what-are-founding-members'], status: 'private_beta' },
  { id: 'platform-architecture', name: 'Platform Architecture', route: '/platform', workspace: 'public', owner: 'Platform Engineering', aliases: ['platform architecture', 'architecture'], articles: ['what-architecture'] },
  { id: 'executive-success-stories', name: 'Executive Success Stories™', route: '/executive-success-stories', workspace: 'executive', owner: 'Executive Experience', aliases: ['executive success stories', 'success stories'], articles: [] },
  { id: 'executive-knowledge-center', name: 'Executive Knowledge Center™', route: '/knowledge', workspace: 'public', owner: 'AI Engineering', aliases: ['knowledge center', 'executive knowledge center'], articles: [] },
  { id: 'executive-rankings', name: 'Executive Rankings', route: '/executive/rankings', workspace: 'executive', owner: 'Executive Experience', aliases: ['executive rankings', 'rankings', 'leaderboard'], articles: [] },
  { id: 'commercial-command-center', name: 'Commercial Command Center™', route: '/commercial-command-center', workspace: 'operations', owner: 'Commercial', aliases: ['commercial command center', 'commercial operations'], articles: [] },
];

const currentStatuses = new Set(['implemented', 'private_beta']);
const dateOnly = (value) => value ? new Date(value).toISOString().slice(0, 10) : null;
function freshness(value) {
  if (!value) return 'unknown';
  const days = (Date.now() - new Date(value).getTime()) / 86400000;
  return days <= 30 ? 'current' : days <= 90 ? 'recent' : 'stale';
}
function resolveStatus(definition, routeExists) {
  if (definition.status) return definition.status;
  const feature = normalizeFeature(DEFAULT_FEATURES.find((item) => item.id === definition.featureId));
  if (feature?.status === 'deprecated' || feature?.status === 'archived') return 'deprecated';
  if (feature?.status === 'development') return 'planned';
  if (feature?.status === 'beta' || feature?.status === 'preview') return 'private_beta';
  return routeExists ? 'implemented' : 'unknown';
}

export function buildKnowledgeRegistry(articles = []) {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  const verifiedAt = new Date().toISOString();
  return KNOWLEDGE_REGISTRY_DEFINITIONS.map((definition) => {
    const routeExists = ROUTE_REGISTRY.some((route) => route.url === definition.route);
    const status = resolveStatus(definition, routeExists);
    const mapped = definition.articles.map((slug) => bySlug.get(slug)).filter(Boolean);
    const latest = mapped.map((article) => article.last_updated || article.review_date || article.updated_date).filter(Boolean).sort().pop();
    const fresh = freshness(latest);
    const knowledgeGap = currentStatuses.has(status) && mapped.length === 0;
    const conflict = currentStatuses.has(status) && !routeExists;
    const verificationStatus = conflict ? 'conflict' : knowledgeGap ? 'knowledge_gap' : routeExists && mapped.length ? 'verified' : 'unverified';
    const confidence = verificationStatus === 'verified' ? (fresh === 'stale' ? 70 : 95) : conflict ? 20 : knowledgeGap ? 45 : 0;
    return {
      capability_id: definition.id, capability_name: definition.name,
      description: mapped[0]?.short_answer || definition.name,
      status, workspace: definition.workspace, route: definition.route,
      knowledge_article_ids: mapped.map((article) => article.id),
      knowledge_article_slugs: mapped.map((article) => article.slug),
      source: routeExists ? `Route Registry: ${definition.route}` : 'Platform audit',
      source_type: routeExists ? 'production_route' : 'platform_config',
      verification_status: verificationStatus, freshness_status: fresh,
      last_verified: verifiedAt, last_updated: dateOnly(latest), owner: definition.owner,
      confidence, version: '1.0', related_capabilities: [],
      related_articles: mapped.flatMap((article) => article.related_articles || []),
      knowledge_gap: knowledgeGap,
      discrepancy_note: conflict ? 'Capability status conflicts with the current Route Registry.' : '',
      aliases: definition.aliases,
    };
  });
}

export function auditKnowledgeRegistry(entries, articles = []) {
  const current = entries.filter((entry) => currentStatuses.has(entry.status));
  const verified = current.filter((entry) => entry.verification_status === 'verified');
  const gaps = entries.filter((entry) => entry.knowledge_gap);
  const stale = entries.filter((entry) => entry.freshness_status === 'stale');
  const conflicts = entries.filter((entry) => entry.verification_status === 'conflict');
  const mappedSlugs = new Set(entries.flatMap((entry) => entry.knowledge_article_slugs));
  const orphanArticles = articles.filter((article) => !mappedSlugs.has(article.slug));
  const coverage = Math.round((verified.length / Math.max(1, current.length)) * 100);
  const accuracy = Math.round((current.filter((entry) => entry.verification_status !== 'conflict').length / Math.max(1, current.length)) * 100);
  const freshnessScore = Math.round((verified.filter((entry) => ['current','recent'].includes(entry.freshness_status)).length / Math.max(1, verified.length)) * 100);
  const overall = Math.round(coverage * 0.4 + accuracy * 0.35 + freshnessScore * 0.25);
  return { registered: entries.length, verified: verified.length, gaps, stale, conflicts, orphanArticles, scores: { entryCoverage: coverage, entryAccuracy: accuracy, dataFreshness: freshnessScore, overall } };
}

export function buildKnowledgeAuditFindings(audit) {
  return [
    ...audit.gaps.map((entry) => ({ code: 'KNOWLEDGE_GAP', level: 'warning', registry: 'Knowledge Registry', target: entry.capability_id, message: `${entry.capability_name} is implemented but has no approved Knowledge Article.` })),
    ...audit.stale.map((entry) => ({ code: 'STALE_KNOWLEDGE', level: 'warning', registry: 'Knowledge Registry', target: entry.capability_id, message: `${entry.capability_name} knowledge is stale.` })),
    ...audit.conflicts.map((entry) => ({ code: 'KNOWLEDGE_CONFLICT', level: 'error', registry: 'Knowledge Registry', target: entry.capability_id, message: entry.discrepancy_note })),
    ...audit.orphanArticles.map((article) => ({ code: 'UNMAPPED_ARTICLE', level: 'info', registry: 'Knowledge Registry', target: article.slug, message: `Approved article "${article.question}" has no Knowledge Registry mapping.` })),
  ];
}

export function findKnowledgeRegistryEntry(question, entries) {
  const query = (question || '').toLowerCase();
  return entries.map((entry) => ({ entry, score: (entry.aliases || []).reduce((best, alias) => query.includes(alias) ? Math.max(best, alias.length) : best, 0) }))
    .filter((match) => match.score > 0).sort((a, b) => b.score - a.score)[0]?.entry || null;
}

export function isRegistryEntryAnswerable(entry) {
  return !!entry && currentStatuses.has(entry.status) && entry.verification_status === 'verified' && entry.confidence >= 70 && entry.knowledge_article_slugs.length > 0;
}

export async function persistKnowledgeRegistry(entries) {
  const existing = await base44.entities.KnowledgeRegistryEntry.list('-updated_date', 200);
  const byCapability = new Map(existing.map((entry) => [entry.capability_id, entry]));
  const updates = entries.filter((entry) => byCapability.has(entry.capability_id)).map(({ aliases, ...entry }) => ({ id: byCapability.get(entry.capability_id).id, ...entry }));
  const creates = entries.filter((entry) => !byCapability.has(entry.capability_id)).map(({ aliases, ...entry }) => entry);
  if (updates.length) await base44.entities.KnowledgeRegistryEntry.bulkUpdate(updates);
  if (creates.length) await base44.entities.KnowledgeRegistryEntry.bulkCreate(creates);
  return { created: creates.length, updated: updates.length };
}