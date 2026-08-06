// Re-export the shared knowledge library so frontend imports (@/lib/knowledgeCenterData)
// and backend functions (base44/shared/knowledgeArticles) share one source of truth.
export * from '../../base44/shared/knowledgeArticles.js';