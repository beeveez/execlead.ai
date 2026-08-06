import { base44 } from "@/api/base44Client";
import { trackKnowledgeAiAsk } from "@/lib/knowledgeIntelligenceClient";

// ============================================================
// Knowledge Authority Guard™
// ------------------------------------------------------------
// Routes company/platform questions to grounded answers built
// ONLY from approved KnowledgeArticle records. Never uses
// general LLM reasoning as the source of truth for company
// facts. Every grounded answer is audit-logged via
// trackKnowledgeAiAsk (question, articles used, confidence,
// fallback, timestamp).
// ============================================================

const COMPANY_TOKENS = [
  "execlead", "exec™", "the platform", "your platform", "this platform",
  "founder", "founded", "who built", "who created", "who owns", "who started",
  "pricing", "membership", "billing", "founding member", "founding beta", "private beta", "beta",
  "roadmap", "trust center", "responsible ai", "whitepaper", "white paper", "methodology",
  "soc 2", "soc2", "iso 27001", "gdpr", "certification", "certified", "compliance",
  "customer data", "where is data", "data stored", "ai models", "what model", "which model",
  "customers", "investors", "partners", "eelm", "elim", "eecf",
  "security", "privacy", "encryption",
];

const FEATURE_NAMES = [
  "executive readiness", "leadership dna", "decision lab", "launch defense",
  "executive simulations", "executive simulation", "executive coach", "executive council",
  "executive reputation", "executive trust", "executive passport", "executive identity",
  "executive journey", "executive intelligence", "executive academy", "legacy library",
  "career studio", "resume intelligence", "executive wallet", "executive digital twin",
];

const PERSONAL_STARTERS = [
  "how do i", "how should i", "what should i", "how can i", "what can i",
  "help me", "i want", "i need", "i'm trying", "i am trying",
  "my readiness", "my reputation", "my journey", "my score", "my profile",
  "my resume", "my identity", "my story", "my wallet", "my membership",
];

// Detects questions that must be grounded in approved knowledge.
// Personal/coaching intent is excluded so the guard never hijacks
// the user's own leadership conversation.
export function isCompanyKnowledgeQuestion(text) {
  const t = (text || "").toLowerCase().trim();
  if (!t || t.length < 4) return false;
  for (const p of PERSONAL_STARTERS) {
    if (t.startsWith(p)) return false;
  }
  for (const tok of COMPANY_TOKENS) {
    if (t.includes(tok)) return true;
  }
  const info = t.match(/^(how does|how do|what is|what are|where is|where can|what's|whats|is |are )\b/);
  if (info) {
    for (const f of FEATURE_NAMES) {
      if (t.includes(f)) return true;
    }
  }
  return false;
}

function scoreArticle(article, q) {
  const qLower = q.toLowerCase();
  const haystack = `${article.question || ""} ${article.short_answer || ""} ${article.detailed_answer || ""} ${article.title || ""} ${(article.tags || []).join(" ")} ${article.category || ""}`.toLowerCase();
  const terms = qLower.split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return 0;
  let score = 0;
  for (const t of terms) if (haystack.includes(t)) score += 1;
  if ((article.question || "").toLowerCase().includes(qLower)) score += 3;
  return score;
}

// Fetches published Knowledge Articles and ranks them by relevance.
// Returns { ranked, all }.
export async function retrieveKnowledgeArticles(query, limit = 5) {
  let articles = [];
  try {
    articles = await base44.entities.KnowledgeArticle.filter({ published: true }, "-last_updated", 50);
  } catch (e) {
    try {
      articles = await base44.entities.KnowledgeArticle.list("-last_updated", 50);
    } catch (e2) {
      articles = [];
    }
  }
  articles = (articles || []).filter((a) => a.published !== false && (a.status || "published") === "published");
  const ranked = articles
    .map((a) => ({ a, s: scoreArticle(a, query) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map((x) => x.a);
  return { ranked, all: articles };
}

// Generates a grounded answer from approved articles via InvokeLLM,
// returning { noResult, answer, sources, confidence, freshness, citedSlugs }.
export async function answerFromKnowledge(query, articles) {
  const ranked = (articles || []).slice(0, 5);
  if (ranked.length === 0) {
    return { noResult: true, answer: null, sources: [], confidence: 0, freshness: null, citedSlugs: [] };
  }
  const context = ranked
    .map((r, i) => `ARTICLE ${i + 1}\nSlug: ${r.slug}\nQuestion: ${r.question}\nShort Answer: ${r.short_answer || ""}\nDetailed: ${r.detailed_answer || ""}\nLast Updated: ${r.last_updated || ""}`)
    .join("\n\n");
  const prompt = `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI. Answer the user's question using ONLY the approved Knowledge Articles below. Never invent information. Never speculate. Do not use hedging language ("I believe", "it was likely", "it appears", "typically"). If the articles do not fully answer the question, say so briefly and recommend contacting the team or checking the Executive Knowledge Center™. Be concise (2-5 sentences), executive, and truthful.\n\nAPPROVED KNOWLEDGE ARTICLES:\n${context}\n\nUSER QUESTION: ${query}\n\nReturn JSON: { "answer": string, "source_slugs": string[] (slugs of the articles you actually used) }`;
  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        answer: { type: "string" },
        source_slugs: { type: "array", items: { type: "string" } },
      },
    },
  });
  const data = res.data || res;
  const answer = data.answer || "";
  const slugs = data.source_slugs || ranked.map((r) => r.slug);
  const sources = slugs.map((s) => ranked.find((a) => a.slug === s)).filter(Boolean);
  const finalSources = sources.length ? sources : ranked;
  const confidence = Math.min(100, 40 + finalSources.length * 20);
  const freshness = finalSources.map((s) => s.last_updated || s.updated_date).filter(Boolean).sort().pop();
  return { noResult: false, answer, sources: finalSources, confidence, freshness, citedSlugs: slugs };
}

// Formats the grounded result as a markdown concierge message with the
// Sources / Knowledge Confidence / Last Updated / Related Articles footer.
export function formatKnowledgeAuthorityMessage(result) {
  if (result.noResult) {
    return `I couldn't find an approved Knowledge Article that answers this question.\n\nRather than speculate, I prefer to provide only verified information about EXECLEAD.AI.\n\nYou may wish to [contact our team](/contact) or check future updates to the Executive Knowledge Center™.\n\n---\n*Knowledge Confidence: 0% · No approved article found*`;
  }
  const confLabel = result.confidence >= 75 ? "High" : result.confidence >= 50 ? "Medium" : "Low";
  let msg = result.answer || "";
  msg += `\n\n---\n**Knowledge Confidence:** ${result.confidence}% (${confLabel})`;
  msg += ` · **Sources:** ${result.sources.length} approved article${result.sources.length === 1 ? "" : "s"}`;
  if (result.freshness) {
    let d = result.freshness;
    try {
      d = new Date(result.freshness).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch (e) {}
    msg += ` · **Updated:** ${d}`;
  }
  if (result.sources.length) {
    msg += `\n\n**Sources Used:**\n${result.sources.map((s) => `- ${s.question}`).join("\n")}`;
  }
  return msg;
}