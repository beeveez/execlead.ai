/**
 * Performance & Load Testing Framework™ Engine
 * 12-section performance validation standard with score, targets,
 * load tests, stress tests, database, AI, cache, UX, benchmarks,
 * optimization, analytics, and release gate.
 */

export const PERFORMANCE_DOMAINS = [
  { id: "response-time", name: "Response Time", score: 92, weight: 15, target: "< 300ms", actual: "245ms", description: "API response time" },
  { id: "ai-response", name: "AI Response Time", score: 88, weight: 20, target: "< 5s", actual: "4.2s", description: "Average AI response time" },
  { id: "database", name: "Database Latency", score: 95, weight: 15, target: "< 50ms", actual: "18ms", description: "Database query latency" },
  { id: "cache", name: "Cache Hit Rate", score: 94, weight: 10, target: "> 90%", actual: "94%", description: "Cache hit rate" },
  { id: "error-rate", name: "Error Rate", score: 98, weight: 10, target: "< 1%", actual: "0.2%", description: "Platform error rate" },
  { id: "ux", name: "UX Performance", score: 90, weight: 15, target: "LCP < 2.5s", actual: "LCP 1.8s", description: "Web Vitals performance" },
  { id: "throughput", name: "API Throughput", score: 96, weight: 15, target: "> 400 req/s", actual: "450 req/s", description: "API requests per second" },
];

export const SCORE_TREND = [
  { day: "Jul 19", score: 85 },
  { day: "Jul 20", score: 86 },
  { day: "Jul 21", score: 88 },
  { day: "Jul 22", score: 89 },
  { day: "Jul 23", score: 90 },
  { day: "Jul 24", score: 91 },
  { day: "Jul 25", score: 93 },
];

export const PLATFORM_HEALTH = {
  platformHealth: 96,
  responseTime: 245,
  aiResponseTime: 4.2,
  databaseLatency: 18,
  cacheHitRate: 94,
  apiThroughput: 450,
  memoryUsage: 68,
  cpuUsage: 45,
  diskUsage: 52,
  concurrentUsers: 125,
  networkLatency: 12,
  errorRate: 0.2,
};

export const PERFORMANCE_TARGETS = [
  { metric: "Page Load", target: "< 2 seconds", actual: "1.2s", status: "pass", unit: "s" },
  { metric: "Workspace Switch", target: "< 500 ms", actual: "320ms", status: "pass", unit: "ms" },
  { metric: "Navigation", target: "< 250 ms", actual: "180ms", status: "pass", unit: "ms" },
  { metric: "Command Palette", target: "< 150 ms", actual: "95ms", status: "pass", unit: "ms" },
  { metric: "Search", target: "< 200 ms", actual: "145ms", status: "pass", unit: "ms" },
  { metric: "Dashboard Refresh", target: "< 1 second", actual: "0.8s", status: "pass", unit: "s" },
  { metric: "API Response", target: "< 300 ms", actual: "245ms", status: "pass", unit: "ms" },
  { metric: "AI Response (Typical)", target: "< 5 seconds", actual: "4.2s", status: "pass", unit: "s" },
  { metric: "AI Response (Maximum)", target: "< 10 seconds", actual: "8.5s", status: "warn", unit: "s" },
];

export const LOAD_TESTS = [
  { users: 50, responseTime: 145, errorRate: 0, memory: 32, cpu: 25, database: 12, api: 145, cache: 96, aiQueue: 3, status: "pass", date: "2026-07-25 10:00" },
  { users: 100, responseTime: 185, errorRate: 0, memory: 41, cpu: 32, database: 15, api: 185, cache: 95, aiQueue: 5, status: "pass", date: "2026-07-25 10:15" },
  { users: 250, responseTime: 220, errorRate: 0.1, memory: 52, cpu: 40, database: 18, api: 220, cache: 94, aiQueue: 8, status: "pass", date: "2026-07-25 10:30" },
  { users: 500, responseTime: 280, errorRate: 0.2, memory: 65, cpu: 52, database: 25, api: 280, cache: 92, aiQueue: 14, status: "warn", date: "2026-07-25 10:45" },
  { users: 1000, responseTime: 420, errorRate: 0.5, memory: 82, cpu: 75, database: 45, api: 420, cache: 87, aiQueue: 32, status: "warn", date: "2026-07-25 11:00" },
];

export const STRESS_TESTS = [
  { id: "ST-001", name: "Traffic Spike", description: "Sudden 500% traffic increase", users: 500, duration: "5 min", status: "completed", result: "pass", peakResponseTime: 380, peakErrorRate: 0.4, notes: "Auto-scaling activated. Recovered in 45 seconds." },
  { id: "ST-002", name: "Large AI Requests", description: "Long prompts with 10K+ tokens", users: 50, duration: "10 min", status: "completed", result: "pass", peakResponseTime: 8200, peakErrorRate: 0, notes: "AI response time peaked at 8.2s. Within 10s maximum target." },
  { id: "ST-003", name: "Concurrent Resume Uploads", description: "100 simultaneous resume uploads", users: 100, duration: "3 min", status: "completed", result: "pass", peakResponseTime: 3200, peakErrorRate: 0, notes: "Queue processing handled all uploads. Avg time: 3.2s per file." },
  { id: "ST-004", name: "Bulk Company Searches", description: "500 concurrent company search queries", users: 500, duration: "2 min", status: "completed", result: "warn", peakResponseTime: 450, peakErrorRate: 0.3, notes: "Cache hit rate dropped to 78%. Search index scaled successfully." },
  { id: "ST-005", name: "Multiple Executive Simulations", description: "50 concurrent executive simulation sessions", users: 50, duration: "8 min", status: "completed", result: "pass", peakResponseTime: 5200, peakErrorRate: 0, notes: "AI queue handled all 50 sessions. Avg response: 5.2s." },
  { id: "ST-006", name: "Simultaneous AI Coaching", description: "100 concurrent AI coaching sessions", users: 100, duration: "5 min", status: "completed", result: "warn", peakResponseTime: 7800, peakErrorRate: 0.2, notes: "AI queue length peaked at 35. 2 retries recorded." },
  { id: "ST-007", name: "Database Stress", description: "Heavy database queries with joins", users: 200, duration: "5 min", status: "completed", result: "pass", peakResponseTime: 85, peakErrorRate: 0, notes: "Database latency peaked at 85ms. Indexes performed well." },
  { id: "ST-008", name: "Cache Saturation", description: "Cache miss storm with cold keys", users: 300, duration: "3 min", status: "completed", result: "pass", peakResponseTime: 380, peakErrorRate: 0.1, notes: "Cache hit rate dropped to 65% during peak. Recovered after rebuild." },
];

export const DATABASE_METRICS = {
  avgQueryTime: 18,
  slowQueries: 3,
  connectionPool: { used: 45, max: 100, utilization: 45 },
  indexUsage: 87,
  deadlocks: 0,
  entityGrowth: 15,
  healthScore: 95,
};

export const SLOW_QUERIES = [
  { query: "Company.findAll with complex join", time: 340, calls: 125, type: "read", recommendation: "Add composite index on company_industry, company_size" },
  { query: "SecurityEvent.filter by created_date range", time: 280, calls: 89, type: "read", recommendation: "Add index on created_date, severity" },
  { query: "UsageLog.aggregate by model", time: 420, calls: 34, type: "read", recommendation: "Pre-aggregate daily metrics into a summary table" },
];

export const DATABASE_HEALTH = {
  queryTime: 18,
  queriesPerSecond: 450,
  activeConnections: 45,
  maxConnections: 100,
  slowQueryThreshold: 200,
  indexUsage: 87,
  deadlocks: 0,
  entityGrowth: 15,
  healthScore: 95,
};

export const AI_PERFORMANCE = {
  totalRequests: 1250,
  avgTokens: 2850,
  avgCost: 0.035,
  avgResponseTime: 4.2,
  queueLength: 12,
  retries: 15,
  failures: 3,
  providerLatency: 3.8,
  cacheUsage: 94,
  knowledgeCacheHitRate: 78,
};

export const AI_PROVIDER_PERFORMANCE = [
  { provider: "OpenAI", model: "GPT-5.5", requests: 650, avgLatency: 3.8, avgCost: 0.035, cacheHit: 92, errors: 1 },
  { provider: "Anthropic", model: "Claude Opus 4.8", requests: 320, avgLatency: 4.5, avgCost: 0.06, cacheHit: 85, errors: 1 },
  { provider: "Google", model: "Gemini 3 Flash", requests: 180, avgLatency: 2.2, avgCost: 0.008, cacheHit: 96, errors: 0 },
  { provider: "OpenAI", model: "o4-mini", requests: 100, avgLatency: 2.8, avgCost: 0.015, cacheHit: 88, errors: 1 },
];

export const CACHE_METRICS = {
  hitRate: 94,
  missRate: 6,
  memoryUsage: 68,
  evictions: 120,
  rebuildTime: 2.5,
  hotKeys: 8,
  coldKeys: 15,
  totalKeys: 12450,
  size: "2.4 GB",
};

export const CACHE_HOT_KEYS = [
  { key: "company:search:*", requests: 45000, hitRate: 98, size: "128 MB" },
  { key: "user:profile:*", requests: 32000, hitRate: 96, size: "45 MB" },
  { key: "ai:response:*", requests: 28000, hitRate: 78, size: "850 MB" },
  { key: "dashboard:metrics", requests: 22000, hitRate: 99, size: "12 MB" },
  { key: "academy:courses:*", requests: 18000, hitRate: 95, size: "28 MB" },
  { key: "executive:briefing:*", requests: 15000, hitRate: 91, size: "340 MB" },
  { key: "company:list:all", requests: 12000, hitRate: 97, size: "56 MB" },
  { key: "pricing:catalog", requests: 8000, hitRate: 100, size: "3 MB" },
];

export const UX_METRICS = {
  lcp: 1.8, lcpTarget: 2.5, lcpScore: 92,
  fcp: 0.9, fcpTarget: 1.8, fcpScore: 95,
  tti: 2.2, ttiTarget: 3.8, ttiScore: 90,
  cls: 0.05, clsTarget: 0.1, clsScore: 95,
  interactionDelay: 120, interactionDelayTarget: 200, interactionDelayScore: 93,
  accessibility: 92,
  uxScore: 91,
};

export const AUTOMATED_BENCHMARKS = [
  { name: "API Benchmark", status: "pass", result: "245ms", target: "< 300ms", duration: "30s", category: "API" },
  { name: "Database Benchmark", status: "pass", result: "18ms", target: "< 50ms", duration: "45s", category: "Database" },
  { name: "AI Benchmark", status: "pass", result: "4.2s", target: "< 5s", duration: "60s", category: "AI" },
  { name: "Cache Benchmark", status: "pass", result: "2.5ms", target: "< 5ms", duration: "10s", category: "Cache" },
  { name: "Search Benchmark", status: "pass", result: "145ms", target: "< 200ms", duration: "20s", category: "Search" },
  { name: "Dashboard Benchmark", status: "pass", result: "0.8s", target: "< 1s", duration: "15s", category: "Dashboard" },
  { name: "Navigation Benchmark", status: "pass", result: "180ms", target: "< 250ms", duration: "12s", category: "Navigation" },
  { name: "Workspace Benchmark", status: "pass", result: "320ms", target: "< 500ms", duration: "15s", category: "Workspace" },
];

export const OPTIMIZATION_RECOMMENDATIONS = [
  { id: "opt-001", title: "Add index on Company table for search queries", category: "Database", impact: "Search -40%", effort: "Low", priority: "high", status: "in_progress" },
  { id: "opt-002", title: "Increase cache TTL for company search results", category: "Caching", impact: "Cache hit +5%", effort: "Low", priority: "medium", status: "planned" },
  { id: "opt-003", title: "Batch AI requests for executive intelligence", category: "AI", impact: "AI cost -20%", effort: "Medium", priority: "high", status: "planned" },
  { id: "opt-004", title: "Optimize hero section images with WebP format", category: "Images", impact: "LCP -300ms", effort: "Low", priority: "medium", status: "completed" },
  { id: "opt-005", title: "Reduce bundle size with route-level lazy loading", category: "Bundle", impact: "Page load -500ms", effort: "Medium", priority: "high", status: "completed" },
  { id: "opt-006", title: "Implement streaming responses for AI", category: "AI", impact: "AI perceived -2s", effort: "Medium", priority: "high", status: "planned" },
  { id: "opt-007", title: "Move background jobs to async processing", category: "Background", impact: "API response -100ms", effort: "Medium", priority: "medium", status: "planned" },
  { id: "opt-008", title: "Add CDN for static assets", category: "CDN", impact: "Static load -60%", effort: "Low", priority: "medium", status: "completed" },
];

export const PERFORMANCE_ANALYTICS = {
  peakUsage: { time: "14:00 UTC", users: 380, requests: 5200 },
  avgUsage: { users: 125, requests: 1800 },
  topSlowPages: [
    { page: "/academy/course/:slug", loadTime: 1.8, visits: 1250, status: "warn" },
    { page: "/companies", loadTime: 1.5, visits: 890, status: "pass" },
    { page: "/dashboard", loadTime: 1.2, visits: 3400, status: "pass" },
    { page: "/coach", loadTime: 2.1, visits: 670, status: "warn" },
    { page: "/simulator", loadTime: 1.9, visits: 450, status: "warn" },
  ],
  topSlowAPIs: [
    { endpoint: "POST /api/ai/coach", time: "4.2s", calls: 850, status: "pass" },
    { endpoint: "POST /api/simulator/run", time: "3.8s", calls: 420, status: "pass" },
    { endpoint: "GET /api/companies/search", time: "320ms", calls: 2100, status: "warn" },
    { endpoint: "POST /api/resume/analyze", time: "3.5s", calls: 180, status: "pass" },
    { endpoint: "GET /api/dashboard/metrics", time: "280ms", calls: 3400, status: "pass" },
  ],
  mostExpensiveAICalls: [
    { feature: "Executive Simulator", cost: 0.06, calls: 420, totalCost: 25.20 },
    { feature: "Executive Coach", cost: 0.035, calls: 850, totalCost: 29.75 },
    { feature: "Voice Interview", cost: 0.035, calls: 180, totalCost: 6.30 },
    { feature: "Company Research", cost: 0.06, calls: 320, totalCost: 19.20 },
    { feature: "Resume Analysis", cost: 0.008, calls: 180, totalCost: 1.44 },
  ],
};

export const RELEASE_GATE_CHECKS = [
  { id: "page-load", name: "Page Load < 2 seconds", status: "pass", detail: "Current: 1.2s (target: < 2s)" },
  { id: "api", name: "API Response < 300ms", status: "pass", detail: "Current: 245ms (target: < 300ms)" },
  { id: "error-rate", name: "Error Rate < 1%", status: "pass", detail: "Current: 0.2% (target: < 1%)" },
  { id: "ai-queue", name: "AI Queue Not Saturated", status: "pass", detail: "Queue length: 12 (threshold: 50)" },
  { id: "db-health", name: "Database Health Not Critical", status: "pass", detail: "Database health: 95% (threshold: > 80%)" },
  { id: "cache-health", name: "Cache Health Not Critical", status: "pass", detail: "Cache hit rate: 94% (threshold: > 80%)" },
  { id: "score", name: "Performance Score ≥ 95%", status: "warn", detail: "Current score: 93% (threshold: 95%)" },
];

export const RELEASE_GATE_MIN_SCORE = 95;

export function computePerformanceScore(domains = PERFORMANCE_DOMAINS) {
  const totalWeight = domains.reduce((s, d) => s + d.weight, 0);
  const weighted = domains.reduce((s, d) => s + (d.score * d.weight), 0);
  return Math.round(weighted / totalWeight);
}

export function getPerformanceGateStatus(checks = RELEASE_GATE_CHECKS, minScore = RELEASE_GATE_MIN_SCORE) {
  const currentScore = computePerformanceScore();
  const fails = checks.filter((c) => c.status === "fail");
  const scoreCheck = checks.find((c) => c.id === "score");
  const meetsThreshold = currentScore >= minScore;
  return {
    pass: fails.length === 0 && meetsThreshold,
    failCount: fails.length,
    warnCount: checks.filter((c) => c.status === "warn").length,
    passCount: checks.filter((c) => c.status === "pass").length,
    thresholdMet: meetsThreshold,
    currentScore,
    minScore,
  };
}