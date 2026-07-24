/**
 * AI Model Management Center™ Engine
 * Provider registry, model catalog, release watch, benchmarks,
 * cost intelligence, deployment pipeline, governance, performance,
 * security, comparison, and roadmap data + computation functions.
 */

export const PROVIDERS = [
  { id: "openai", name: "OpenAI", status: "active", auth: "API Key", connectivity: "healthy", lastHealthCheck: "2026-07-24T12:00:00Z", models: 6, latency: 240, spend: 0, availability: 99.9, features: { streaming: true, vision: true, reasoning: true, toolCalling: true, structured: true, embeddings: true, fineTuning: true } },
  { id: "anthropic", name: "Anthropic", status: "active", auth: "API Key", connectivity: "healthy", lastHealthCheck: "2026-07-24T12:00:00Z", models: 4, latency: 320, spend: 0, availability: 99.8, features: { streaming: true, vision: true, reasoning: true, toolCalling: true, structured: true, embeddings: false, fineTuning: false } },
  { id: "google", name: "Google Gemini", status: "active", auth: "API Key", connectivity: "healthy", lastHealthCheck: "2026-07-24T12:00:00Z", models: 3, latency: 180, spend: 0, availability: 99.7, features: { streaming: true, vision: true, reasoning: true, toolCalling: true, structured: true, embeddings: true, fineTuning: true } },
  { id: "xai", name: "xAI", status: "active", auth: "API Key", connectivity: "degraded", lastHealthCheck: "2026-07-24T10:00:00Z", models: 2, latency: 410, spend: 0, availability: 98.5, features: { streaming: true, vision: false, reasoning: true, toolCalling: true, structured: false, embeddings: false, fineTuning: false } },
  { id: "azure", name: "Azure OpenAI", status: "active", auth: "Azure AD", connectivity: "healthy", lastHealthCheck: "2026-07-24T12:00:00Z", models: 4, latency: 260, spend: 0, availability: 99.9, features: { streaming: true, vision: true, reasoning: true, toolCalling: true, structured: true, embeddings: true, fineTuning: true } },
  { id: "aws", name: "AWS Bedrock", status: "active", auth: "AWS IAM", connectivity: "healthy", lastHealthCheck: "2026-07-24T12:00:00Z", models: 5, latency: 290, spend: 0, availability: 99.8, features: { streaming: true, vision: true, reasoning: true, toolCalling: true, structured: true, embeddings: true, fineTuning: true } },
  { id: "openrouter", name: "OpenRouter", status: "active", auth: "API Key", connectivity: "healthy", lastHealthCheck: "2026-07-24T12:00:00Z", models: 50, latency: 350, spend: 0, availability: 99.5, features: { streaming: true, vision: true, reasoning: true, toolCalling: true, structured: true, embeddings: false, fineTuning: false } },
];

export const MODEL_CATALOG = [
  { id: "gpt-6", provider: "OpenAI", name: "GPT-6", releaseDate: "2026-07-01", version: "6.0", capabilities: ["text","vision","reasoning","tools","structured"], contextWindow: 256000, inputPrice: 5.0, outputPrice: 15.0, status: "testing", approval: "pending", description: "Latest generation with enhanced reasoning" },
  { id: "gpt-5.5", provider: "OpenAI", name: "GPT-5.5", releaseDate: "2026-04-15", version: "5.5", capabilities: ["text","vision","reasoning","tools","structured"], contextWindow: 256000, inputPrice: 3.0, outputPrice: 10.0, status: "production", approval: "approved", description: "Primary production model for executive coaching" },
  { id: "gpt-5", provider: "OpenAI", name: "GPT-5", releaseDate: "2025-12-01", version: "5.0", capabilities: ["text","vision","reasoning","tools"], contextWindow: 128000, inputPrice: 2.5, outputPrice: 7.5, status: "deprecated", approval: "archived", description: "Previous generation — deprecated" },
  { id: "gpt-4o", provider: "OpenAI", name: "GPT-4o", releaseDate: "2024-05-13", version: "4.0", capabilities: ["text","vision","tools"], contextWindow: 128000, inputPrice: 2.5, outputPrice: 10.0, status: "retired", approval: "archived", description: "Retired — replaced by GPT-5 series" },
  { id: "o4-mini", provider: "OpenAI", name: "o4-mini", releaseDate: "2026-03-01", version: "4.1", capabilities: ["text","reasoning","tools"], contextWindow: 128000, inputPrice: 1.1, outputPrice: 4.4, status: "production", approval: "approved", description: "Cost-efficient reasoning model" },
  { id: "claude-opus-4-8", provider: "Anthropic", name: "Claude Opus 4.8", releaseDate: "2026-06-01", version: "4.8", capabilities: ["text","vision","reasoning","tools","structured"], contextWindow: 200000, inputPrice: 5.0, outputPrice: 25.0, status: "production", approval: "approved", description: "Top-tier reasoning and analysis" },
  { id: "claude-sonnet-5", provider: "Anthropic", name: "Claude Sonnet 5", releaseDate: "2026-05-15", version: "5.0", capabilities: ["text","vision","reasoning","tools","structured"], contextWindow: 200000, inputPrice: 3.0, outputPrice: 15.0, status: "production", approval: "approved", description: "Balanced performance and cost" },
  { id: "claude-opus-4-7", provider: "Anthropic", name: "Claude Opus 4.7", releaseDate: "2026-02-01", version: "4.7", capabilities: ["text","vision","reasoning","tools"], contextWindow: 200000, inputPrice: 5.0, outputPrice: 25.0, status: "deprecated", approval: "archived", description: "Previous generation — deprecated" },
  { id: "gemini-3-1-pro", provider: "Google Gemini", name: "Gemini 3.1 Pro", releaseDate: "2026-06-15", version: "3.1", capabilities: ["text","vision","reasoning","tools","structured"], contextWindow: 2000000, inputPrice: 1.25, outputPrice: 5.0, status: "production", approval: "approved", description: "Massive context window, cost-efficient" },
  { id: "gemini-3-flash", provider: "Google Gemini", name: "Gemini 3 Flash", releaseDate: "2026-05-01", version: "3.0", capabilities: ["text","vision","reasoning","tools"], contextWindow: 1000000, inputPrice: 0.15, outputPrice: 0.6, status: "production", approval: "approved", description: "Ultra-fast, ultra-cheap" },
  { id: "gemini-2-5-pro", provider: "Google Gemini", name: "Gemini 2.5 Pro", releaseDate: "2025-10-01", version: "2.5", capabilities: ["text","vision","tools"], contextWindow: 1000000, inputPrice: 1.25, outputPrice: 5.0, status: "deprecated", approval: "archived", description: "Previous generation — deprecated" },
  { id: "grok-4", provider: "xAI", name: "Grok 4", releaseDate: "2026-07-10", version: "4.0", capabilities: ["text","reasoning","tools"], contextWindow: 128000, inputPrice: 5.0, outputPrice: 15.0, status: "testing", approval: "pending", description: "New release — under evaluation" },
  { id: "grok-3", provider: "xAI", name: "Grok 3", releaseDate: "2026-02-01", version: "3.0", capabilities: ["text","reasoning","tools"], contextWindow: 128000, inputPrice: 2.0, outputPrice: 10.0, status: "production", approval: "approved", description: "xAI production model" },
];

export const RELEASE_WATCH = [
  { provider: "OpenAI", type: "new_model", modelName: "GPT-6", date: "2026-07-01", status: "review_required", impact: "high", description: "New flagship model with enhanced reasoning capabilities detected." },
  { provider: "xAI", type: "new_model", modelName: "Grok 4", date: "2026-07-10", status: "review_required", impact: "high", description: "New xAI model release detected. Requires benchmark and security validation." },
  { provider: "Google Gemini", type: "pricing_change", modelName: "Gemini 3 Flash", date: "2026-07-15", status: "notified", impact: "low", description: "Input token pricing reduced by 25%." },
  { provider: "Anthropic", type: "capability_update", modelName: "Claude Opus 4.8", date: "2026-07-18", status: "notified", impact: "medium", description: "Extended thinking capability improved — 40% better reasoning on complex tasks." },
  { provider: "OpenAI", type: "deprecation", modelName: "GPT-5", date: "2026-07-20", status: "action_required", impact: "medium", description: "GPT-5 scheduled for deprecation on 2026-10-01. Migration to GPT-5.5 required." },
  { provider: "Google Gemini", type: "context_window", modelName: "Gemini 3.1 Pro", date: "2026-07-22", status: "notified", impact: "medium", description: "Context window increased to 2M tokens." },
];

export const BENCHMARK_CATEGORIES = [
  "Executive Coaching", "Leadership Advice", "Interview Simulation", "Resume Analysis",
  "Career Coaching", "Executive Communication", "Strategic Thinking", "Boardroom Reasoning",
  "Technical Accuracy", "Prompt Adherence", "Structured Output", "Response Consistency",
  "Response Time", "Token Efficiency", "Cost Efficiency",
];

export const BENCHMARK_SCORES = {
  "GPT-6": { "Executive Coaching": 94, "Leadership Advice": 92, "Interview Simulation": 96, "Resume Analysis": 90, "Career Coaching": 93, "Executive Communication": 91, "Strategic Thinking": 95, "Boardroom Reasoning": 93, "Technical Accuracy": 88, "Prompt Adherence": 92, "Structured Output": 94, "Response Consistency": 90, "Response Time": 78, "Token Efficiency": 75, "Cost Efficiency": 60 },
  "GPT-5.5": { "Executive Coaching": 89, "Leadership Advice": 87, "Interview Simulation": 91, "Resume Analysis": 85, "Career Coaching": 88, "Executive Communication": 86, "Strategic Thinking": 88, "Boardroom Reasoning": 85, "Technical Accuracy": 84, "Prompt Adherence": 90, "Structured Output": 88, "Response Consistency": 87, "Response Time": 82, "Token Efficiency": 80, "Cost Efficiency": 72 },
  "Claude Opus 4.8": { "Executive Coaching": 92, "Leadership Advice": 94, "Interview Simulation": 88, "Resume Analysis": 93, "Career Coaching": 91, "Executive Communication": 95, "Strategic Thinking": 96, "Boardroom Reasoning": 97, "Technical Accuracy": 90, "Prompt Adherence": 93, "Structured Output": 92, "Response Consistency": 94, "Response Time": 72, "Token Efficiency": 68, "Cost Efficiency": 55 },
  "Claude Sonnet 5": { "Executive Coaching": 87, "Leadership Advice": 89, "Interview Simulation": 84, "Resume Analysis": 88, "Career Coaching": 86, "Executive Communication": 90, "Strategic Thinking": 88, "Boardroom Reasoning": 89, "Technical Accuracy": 85, "Prompt Adherence": 91, "Structured Output": 89, "Response Consistency": 90, "Response Time": 85, "Token Efficiency": 82, "Cost Efficiency": 68 },
  "Gemini 3.1 Pro": { "Executive Coaching": 85, "Leadership Advice": 83, "Interview Simulation": 86, "Resume Analysis": 82, "Career Coaching": 84, "Executive Communication": 83, "Strategic Thinking": 87, "Boardroom Reasoning": 84, "Technical Accuracy": 89, "Prompt Adherence": 86, "Structured Output": 88, "Response Consistency": 85, "Response Time": 90, "Token Efficiency": 88, "Cost Efficiency": 92 },
  "Gemini 3 Flash": { "Executive Coaching": 78, "Leadership Advice": 76, "Interview Simulation": 80, "Resume Analysis": 75, "Career Coaching": 77, "Executive Communication": 76, "Strategic Thinking": 79, "Boardroom Reasoning": 77, "Technical Accuracy": 82, "Prompt Adherence": 80, "Structured Output": 82, "Response Consistency": 79, "Response Time": 95, "Token Efficiency": 94, "Cost Efficiency": 96 },
  "Grok 4": { "Executive Coaching": 82, "Leadership Advice": 80, "Interview Simulation": 85, "Resume Analysis": 79, "Career Coaching": 81, "Executive Communication": 80, "Strategic Thinking": 84, "Boardroom Reasoning": 82, "Technical Accuracy": 86, "Prompt Adherence": 83, "Structured Output": 80, "Response Consistency": 78, "Response Time": 74, "Token Efficiency": 72, "Cost Efficiency": 58 },
  "Grok 3": { "Executive Coaching": 79, "Leadership Advice": 77, "Interview Simulation": 82, "Resume Analysis": 76, "Career Coaching": 78, "Executive Communication": 77, "Strategic Thinking": 81, "Boardroom Reasoning": 79, "Technical Accuracy": 83, "Prompt Adherence": 80, "Structured Output": 78, "Response Consistency": 76, "Response Time": 80, "Token Efficiency": 78, "Cost Efficiency": 70 },
};

export const DEPLOYMENT_STAGES = ["Detected", "Review", "Benchmark", "Security Validation", "Approval", "Staging", "Production", "Monitoring"];

export const DEPLOYMENT_HISTORY = [
  { model: "GPT-5.5", provider: "OpenAI", date: "2026-04-20", stage: "Production", status: "completed", deployedBy: "Platform Admin", strategy: "Blue-Green", notes: "Replaced GPT-5 as primary production model" },
  { model: "Claude Opus 4.8", provider: "Anthropic", date: "2026-06-10", stage: "Production", status: "completed", deployedBy: "Platform Admin", strategy: "Canary", notes: "Gradual rollout over 7 days" },
  { model: "Gemini 3.1 Pro", provider: "Google Gemini", date: "2026-06-20", stage: "Production", status: "completed", deployedBy: "Platform Admin", strategy: "Standard", notes: "Deployed for large-context use cases" },
  { model: "GPT-6", provider: "OpenAI", date: "2026-07-05", stage: "Benchmark", status: "in_progress", deployedBy: "—", strategy: "—", notes: "Benchmark suite in progress" },
  { model: "Grok 4", provider: "xAI", date: "2026-07-12", stage: "Review", status: "in_progress", deployedBy: "—", strategy: "—", notes: "Awaiting security validation" },
];

export const GOVERNANCE_RECORDS = [
  { model: "GPT-5.5", action: "deploy", requester: "Platform Admin", approver: "Founder", date: "2026-04-20", status: "approved", risk: "low", justification: "Superior performance over GPT-5 with acceptable cost increase", expiry: "2027-04-20" },
  { model: "Claude Opus 4.8", action: "deploy", requester: "Platform Admin", approver: "Founder", date: "2026-06-10", status: "approved", risk: "medium", justification: "Best-in-class reasoning for executive coaching", expiry: "2027-06-10" },
  { model: "GPT-6", action: "evaluate", requester: "Operations Team", approver: "Pending", date: "2026-07-02", status: "pending", risk: "medium", justification: "New release — requires full benchmark and security validation before production", expiry: "2026-08-02" },
  { model: "Grok 4", action: "evaluate", requester: "Operations Team", approver: "Pending", date: "2026-07-11", status: "pending", risk: "high", justification: "New xAI model — security and reliability validation required", expiry: "2026-08-11" },
  { model: "GPT-5", action: "deprecate", requester: "Platform Admin", approver: "Founder", date: "2026-07-20", status: "approved", risk: "low", justification: "Replaced by GPT-5.5 — migration plan in place", expiry: "2026-10-01" },
];

export const ROADMAP = [
  { item: "OpenAI GPT-6.5", type: "upcoming_release", eta: "Q4 2026", status: "rumored", impact: "high", notes: "Expected 15% improvement in reasoning tasks" },
  { item: "Anthropic Claude Opus 5", type: "upcoming_release", eta: "Q1 2027", status: "announced", impact: "high", notes: "Next-gen flagship with multimodal reasoning" },
  { item: "Google Gemini 4", type: "upcoming_release", eta: "Q4 2026", status: "rumored", impact: "medium", notes: "Expected context window improvements" },
  { item: "xAI Grok 5", type: "beta_program", eta: "Q1 2027", status: "beta", impact: "medium", notes: "Internal evaluation pending" },
  { item: "On-Premise LLM Support", type: "migration_plan", eta: "Q2 2027", status: "planning", impact: "high", notes: "Enterprise customers requesting self-hosted models" },
  { item: "Multi-Model A/B Testing", type: "innovation", eta: "Q3 2026", status: "in_development", impact: "medium", notes: "Automated A/B testing framework for model comparison" },
  { item: "GPT-5 Deprecation", type: "deprecation_timeline", eta: "2026-10-01", status: "scheduled", impact: "medium", notes: "Complete migration to GPT-5.5 required" },
];

export const AI_SECURITY_METRICS = [
  { id: "prompt_injection", label: "Prompt Injection Detection", status: "active", score: 92, count: 3, description: "AI guardrails detecting and blocking injection attempts" },
  { id: "abnormal_requests", label: "Abnormal Requests", status: "monitoring", score: 85, count: 12, description: "Unusual request patterns flagged for review" },
  { id: "pii_exposure", label: "PII Exposure Detection", status: "active", score: 95, count: 0, description: "No PII leakage detected in AI responses" },
  { id: "prompt_leakage", label: "Prompt Leakage", status: "active", score: 88, count: 1, description: "System prompt content protection" },
  { id: "jailbreak_attempts", label: "Jailbreak Attempts", status: "monitoring", score: 90, count: 5, description: "Attempts to bypass AI safety guardrails" },
  { id: "abuse_detection", label: "Abuse Detection", status: "active", score: 87, count: 8, description: "Automated abuse pattern detection" },
];

export const STATIC_RECOMMENDATIONS = [
  { title: "GPT-6 outperforms GPT-5.5 by 5% in Executive Coaching", type: "performance", priority: "high", action: "Consider promoting GPT-6 to staging after security validation" },
  { title: "Claude Opus 4.8 demonstrates 18% lower hallucination rate", type: "quality", priority: "medium", action: "Route complex reasoning tasks to Claude Opus 4.8" },
  { title: "Gemini 3 Flash offers 24% lower operational cost", type: "cost", priority: "high", action: "Migrate high-volume, low-complexity tasks to Gemini 3 Flash" },
  { title: "Delay Grok 4 deployment pending security validation", type: "security", priority: "critical", action: "Complete security review before any production use" },
  { title: "Recommended Production Model: GPT-5.5", type: "recommendation", priority: "info", action: "Current production model performing within acceptable thresholds" },
  { title: "GPT-5 deprecation on 2026-10-01 — migration required", type: "deprecation", priority: "high", action: "Complete migration of all GPT-5 workloads to GPT-5.5" },
];

export function computeOverallBenchmark(modelName) {
  const scores = BENCHMARK_SCORES[modelName];
  if (!scores) return 0;
  return Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / BENCHMARK_CATEGORIES.length);
}

export function getBenchmarkLeaderboard() {
  return Object.keys(BENCHMARK_SCORES)
    .map((model) => {
      const scores = BENCHMARK_SCORES[model];
      const overall = computeOverallBenchmark(model);
      const catalog = MODEL_CATALOG.find((m) => m.name === model);
      return { model, provider: catalog?.provider || "—", status: catalog?.status || "—", scores, overall };
    })
    .sort((a, b) => b.overall - a.overall);
}

export function getComparisonData(models) {
  const axes = ["Executive Coaching", "Reasoning", "Speed", "Cost Efficiency", "Reliability", "Overall"];
  return axes.map((axis) => {
    const point = { axis };
    models.forEach((model) => {
      const scores = BENCHMARK_SCORES[model];
      if (!scores) { point[model] = 0; return; }
      if (axis === "Reasoning") point[model] = Math.round((scores["Strategic Thinking"] + scores["Boardroom Reasoning"] + scores["Technical Accuracy"]) / 3);
      else if (axis === "Speed") point[model] = scores["Response Time"];
      else if (axis === "Reliability") point[model] = Math.round((scores["Prompt Adherence"] + scores["Structured Output"] + scores["Response Consistency"]) / 3);
      else if (axis === "Overall") point[model] = computeOverallBenchmark(model);
      else point[model] = scores[axis] || 0;
    });
    return point;
  });
}

export function computeCostIntelligence(usageLogs) {
  const logs = usageLogs || [];
  const totalCost = logs.reduce((s, l) => s + (l.cost_estimated || 0), 0);
  const monthlyBudget = 5000;

  const byProvider = {};
  const byModule = {};
  const byDate = {};
  let totalTokens = 0;
  const uniqueUsers = new Set();

  logs.forEach((l) => {
    const provider = l.provider || "unknown";
    const module = l.module || "unknown";
    const date = l.created_date ? new Date(l.created_date).toISOString().split("T")[0] : "unknown";
    byProvider[provider] = (byProvider[provider] || 0) + (l.cost_estimated || 0);
    byModule[module] = (byModule[module] || 0) + (l.cost_estimated || 0);
    byDate[date] = (byDate[date] || 0) + (l.cost_estimated || 0);
    totalTokens += (l.tokens_estimated || 0);
    if (l.created_by_id) uniqueUsers.add(l.created_by_id);
  });

  const providerSpend = Object.entries(byProvider).map(([provider, amount]) => ({ provider, amount: Math.round(amount * 100) / 100 })).sort((a, b) => b.amount - a.amount);
  const moduleSpend = Object.entries(byModule).map(([module, amount]) => ({ module, amount: Math.round(amount * 100) / 100 })).sort((a, b) => b.amount - a.amount);
  const dailySpend = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    monthlyBudget,
    budgetUtilization: Math.round((totalCost / monthlyBudget) * 100),
    providerSpend,
    moduleSpend,
    dailySpend,
    totalTokens,
    avgCostPerUser: uniqueUsers.size > 0 ? Math.round((totalCost / uniqueUsers.size) * 100) / 100 : 0,
    avgCostPerSession: logs.length > 0 ? Math.round((totalCost / logs.length) * 10000) / 10000 : 0,
    requestCount: logs.length,
    uniqueUsers: uniqueUsers.size,
  };
}

export function computeModelPerformance(usageLogs) {
  const logs = usageLogs || [];
  const successful = logs.filter((l) => l.status === "success");
  const failed = logs.filter((l) => l.status === "error" || l.status === "timeout");
  const timeouts = logs.filter((l) => l.status === "timeout");
  const rateLimited = logs.filter((l) => l.status === "rate_limited");
  const avgLatency = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / logs.length) : 0;
  const totalTokens = logs.reduce((s, l) => s + (l.input_tokens || 0) + (l.output_tokens || 0), 0);

  const byModel = {};
  logs.forEach((l) => {
    const model = l.model || "unknown";
    if (!byModel[model]) byModel[model] = { model, count: 0, errors: 0, latencySum: 0, tokens: 0 };
    byModel[model].count++;
    if (l.status === "error" || l.status === "timeout") byModel[model].errors++;
    byModel[model].latencySum += l.response_time_ms || 0;
    byModel[model].tokens += (l.input_tokens || 0) + (l.output_tokens || 0);
  });

  const modelStats = Object.values(byModel).map((m) => ({
    ...m,
    avgLatency: m.count > 0 ? Math.round(m.latencySum / m.count) : 0,
    failureRate: m.count > 0 ? Math.round((m.errors / m.count) * 100) : 0,
    successRate: m.count > 0 ? Math.round(((m.count - m.errors) / m.count) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  return {
    avgLatency,
    successRate: logs.length > 0 ? Math.round((successful.length / logs.length) * 100) : 0,
    failureRate: logs.length > 0 ? Math.round((failed.length / logs.length) * 100) : 0,
    timeoutCount: timeouts.length,
    rateLimitedCount: rateLimited.length,
    totalTokens,
    requestCount: logs.length,
    modelStats,
  };
}

export function getModelStatusSummary() {
  const production = MODEL_CATALOG.filter((m) => m.status === "production").length;
  const testing = MODEL_CATALOG.filter((m) => m.status === "testing").length;
  const deprecated = MODEL_CATALOG.filter((m) => m.status === "deprecated").length;
  const retired = MODEL_CATALOG.filter((m) => m.status === "retired").length;
  const pending = MODEL_CATALOG.filter((m) => m.approval === "pending").length;
  return { production, testing, deprecated, retired, pending, total: MODEL_CATALOG.length };
}

export function getAIHealthScore(performance, cost) {
  const successFactor = performance.successRate || 0;
  const latencyFactor = Math.max(0, 100 - (performance.avgLatency || 0) / 10);
  const budgetFactor = Math.max(0, 100 - (cost.budgetUtilization || 0));
  const failurePenalty = (performance.failureRate || 0) * 2;
  return Math.round((successFactor * 0.4 + latencyFactor * 0.3 + budgetFactor * 0.3) - failurePenalty);
}