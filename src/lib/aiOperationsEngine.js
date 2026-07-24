/**
 * AI Operations Center™ Engine
 * Routing rules, voice infrastructure, marketplace, experiments,
 * governance, analytics, enterprise, and future platform data.
 */

export const ROUTING_RULES = [
  { feature: "Executive Coach", provider: "OpenAI", model: "GPT-5.5", optimization: "quality", failover: "Anthropic / Claude Sonnet 5", enabled: true, traffic: 100 },
  { feature: "Voice Interview", provider: "OpenAI", model: "GPT-5.5", optimization: "quality", failover: "Google / Gemini 3 Flash", enabled: true, traffic: 85 },
  { feature: "Resume Analysis", provider: "Google", model: "Gemini 3 Flash", optimization: "cost", failover: "OpenAI / GPT-5.5", enabled: true, traffic: 90 },
  { feature: "Company Research", provider: "Anthropic", model: "Claude Opus 4.8", optimization: "quality", failover: "OpenAI / GPT-5.5", enabled: true, traffic: 95 },
  { feature: "Executive Simulator", provider: "Anthropic", model: "Claude Opus 4.8", optimization: "quality", failover: "OpenAI / GPT-6", enabled: true, traffic: 80 },
  { feature: "Daily Challenge", provider: "Google", model: "Gemini 3 Flash", optimization: "cost", failover: "OpenAI / GPT-5.5", enabled: true, traffic: 100 },
  { feature: "Executive Debate", provider: "OpenAI", model: "GPT-6", optimization: "quality", failover: "Anthropic / Claude Opus 4.8", enabled: true, traffic: 60 },
  { feature: "Career Advisor", provider: "OpenAI", model: "o4-mini", optimization: "latency", failover: "Google / Gemini 3 Flash", enabled: true, traffic: 100 },
  { feature: "Executive Council", provider: "Anthropic", model: "Claude Sonnet 5", optimization: "quality", failover: "OpenAI / GPT-5.5", enabled: true, traffic: 90 },
  { feature: "Journal AI", provider: "Google", model: "Gemini 3 Flash", optimization: "cost", failover: "OpenAI / o4-mini", enabled: true, traffic: 100 },
];

export const VOICE_PROVIDERS = [
  { id: "browser-stt", name: "Browser Web Speech API", type: "STT", status: "active", latency: 200, accuracy: 92, cost: 0, provider: "Browser", description: "Native browser speech recognition" },
  { id: "browser-tts", name: "Browser SpeechSynthesis", type: "TTS", status: "active", latency: 50, quality: 78, cost: 0, provider: "Browser", description: "Native browser text-to-speech" },
  { id: "openai-whisper", name: "OpenAI Whisper", type: "STT", status: "available", latency: 500, accuracy: 96, cost: 0.006, provider: "OpenAI", description: "High-accuracy cloud speech recognition" },
  { id: "openai-tts", name: "OpenAI TTS", type: "TTS", status: "available", latency: 300, quality: 95, cost: 0.015, provider: "OpenAI", description: "Natural AI voice synthesis" },
  { id: "google-stt", name: "Google Speech-to-Text", type: "STT", status: "available", latency: 300, accuracy: 94, cost: 0.004, provider: "Google", description: "Google Cloud speech recognition" },
  { id: "google-tts", name: "Google Text-to-Speech", type: "TTS", status: "available", latency: 250, quality: 92, cost: 0.012, provider: "Google", description: "Google Cloud voice synthesis" },
  { id: "azure-stt", name: "Azure Speech", type: "STT", status: "available", latency: 250, accuracy: 95, cost: 0.005, provider: "Azure", description: "Microsoft Azure speech services" },
  { id: "azure-tts", name: "Azure Neural TTS", type: "TTS", status: "available", latency: 200, quality: 94, cost: 0.012, provider: "Azure", description: "Neural voice synthesis" },
];

export const AUDIO_PIPELINE = [
  { stage: "Capture", description: "Microphone audio capture via getUserMedia", status: "active", latency: 10 },
  { stage: "Processing", description: "Noise reduction and audio normalization", status: "active", latency: 30 },
  { stage: "Streaming", description: "Real-time audio stream to STT engine", status: "active", latency: 50 },
  { stage: "Transcription", description: "Speech-to-text conversion", status: "active", latency: 200 },
  { stage: "Storage", description: "Audio recording storage with encryption", status: "active", latency: 100 },
  { stage: "Playback", description: "Audio playback and download", status: "active", latency: 20 },
];

export const MARKETPLACE_ITEMS = [
  { id: "credit-500", name: "500 AI Credits", price: 9.99, type: "credit_pack", credits: 500, bonus: 0, popular: false },
  { id: "credit-1000", name: "1,000 AI Credits", price: 17.99, type: "credit_pack", credits: 1000, bonus: 100, popular: true },
  { id: "credit-5000", name: "5,000 AI Credits", price: 79.99, type: "credit_pack", credits: 5000, bonus: 1000, popular: false },
  { id: "credit-10000", name: "10,000 AI Credits", price: 149.99, type: "credit_pack", credits: 10000, bonus: 2500, popular: false },
  { id: "bundle-voice-intel", name: "Voice + Intelligence Bundle", price: 129.99, type: "bundle", credits: 1500, bonus: 300, description: "Voice AI Pack + Executive Intelligence Pack" },
  { id: "bundle-all-pro", name: "All-Pro Bundle", price: 199.99, type: "bundle", credits: 2800, bonus: 500, description: "All 5 active AI Compute Packs" },
  { id: "gift-500", name: "Gift 500 Credits", price: 9.99, type: "gift", credits: 500, bonus: 0, description: "Send credits to a colleague or friend" },
  { id: "promo-beta", name: "Beta Tester Bonus", price: 0, type: "promotion", credits: 250, bonus: 0, description: "Free credits for beta participants" },
  { id: "promo-referral", name: "Referral Reward", price: 0, type: "promotion", credits: 100, bonus: 0, description: "Earn credits for each successful referral" },
  { id: "enterprise-pool", name: "Enterprise Credit Pool", price: 499.99, type: "enterprise", credits: 50000, bonus: 5000, description: "Shared pool for enterprise teams" },
];

export const EXPERIMENTS = [
  { id: "exp-001", name: "GPT-6 vs GPT-5.5 — Executive Coaching", type: "model_test", status: "running", startDate: "2026-07-20", traffic: 10, winner: null, metric: "Coaching Quality Score" },
  { id: "exp-002", name: "Gemini 3 Flash — Resume Analysis Cost", type: "cost_test", status: "completed", startDate: "2026-07-15", traffic: 50, winner: "Gemini 3 Flash", metric: "Cost per Session (24% reduction)" },
  { id: "exp-003", name: "Claude Opus 4.8 — Boardroom Reasoning", type: "model_test", status: "running", startDate: "2026-07-22", traffic: 5, winner: null, metric: "Reasoning Accuracy" },
  { id: "exp-004", name: "Prompt v2.1 — Interview Coaching", type: "prompt_test", status: "completed", startDate: "2026-07-10", traffic: 100, winner: "v2.1", metric: "User Satisfaction (+12%)" },
  { id: "exp-005", name: "Whisper vs Browser STT — Accuracy", type: "voice_test", status: "running", startDate: "2026-07-23", traffic: 20, winner: null, metric: "Transcription Accuracy" },
  { id: "exp-006", name: "Canary: GPT-6 for Daily Challenge", type: "canary", status: "completed", startDate: "2026-07-18", traffic: 5, winner: "GPT-6", metric: "Response Quality (+7%)" },
];

export const GOVERNANCE_ITEMS = [
  { id: "gov-001", title: "GPT-6 Production Deployment", type: "deployment_approval", status: "pending", risk: "medium", requester: "Operations Team", approver: "Founder", date: "2026-07-22", description: "Approval required before promoting GPT-6 from testing to production" },
  { id: "gov-002", title: "Grok 4 Security Review", type: "security_review", status: "in_progress", risk: "high", requester: "Security Team", approver: "Platform Admin", date: "2026-07-12", description: "Security validation for Grok 4 before any production use" },
  { id: "gov-003", title: "Voice AI Pack Pricing Review", type: "cost_review", status: "approved", risk: "low", requester: "Operations Team", approver: "Founder", date: "2026-07-01", description: "Pricing review for Voice AI Pack — $49/mo approved" },
  { id: "gov-004", title: "Gemini 3 Flash Cost Optimization", type: "cost_review", status: "approved", risk: "low", requester: "AI Operations", approver: "Platform Admin", date: "2026-07-15", description: "Route low-complexity tasks to Gemini 3 Flash for 24% cost reduction" },
  { id: "gov-005", title: "Prompt v2.1 Rollout", type: "deployment_approval", status: "approved", risk: "low", requester: "AI Operations", approver: "Founder", date: "2026-07-10", description: "Updated interview coaching prompt — 12% satisfaction improvement" },
];

export const FUTURE_PLATFORM = [
  { name: "Video Interview™", description: "AI-powered video interview with facial expression and body language analysis", eta: "Q4 2026", category: "Video", priority: "high" },
  { name: "Executive Avatar™", description: "AI-generated executive avatar for personalized coaching sessions", eta: "Q4 2026", category: "Video", priority: "medium" },
  { name: "Digital Twin™ Enhancement", description: "Enhanced executive digital twin with multimodal capabilities", eta: "Q4 2026", category: "Intelligence", priority: "high" },
  { name: "AI Mentor™", description: "Personalized AI mentor that learns and adapts to your leadership style", eta: "Q1 2027", category: "Intelligence", priority: "high" },
  { name: "Meeting Simulator™", description: "Simulate board meetings, town halls, and executive presentations", eta: "Q1 2027", category: "Simulation", priority: "medium" },
  { name: "Negotiation Coach™", description: "AI-powered negotiation simulator with real-time strategy feedback", eta: "Q1 2027", category: "Simulation", priority: "medium" },
  { name: "Boardroom Simulator™", description: "Full boardroom scenario simulation with stakeholder dynamics", eta: "Q1 2027", category: "Simulation", priority: "high" },
  { name: "Public Speaking Coach™", description: "AI-powered public speaking and presentation coaching with voice analysis", eta: "Q2 2027", category: "Voice", priority: "medium" },
  { name: "Multimodal Coaching™", description: "Combine voice, video, and text analysis for comprehensive coaching", eta: "Q2 2027", category: "Intelligence", priority: "high" },
  { name: "Private Enterprise Models™", description: "On-premise and private cloud LLM support for enterprise customers", eta: "Q2 2027", category: "Enterprise", priority: "high" },
];

export const ENTERPRISE_AI_POLICIES = [
  { org: "Acme Corporation", policy: "Unlimited AI (Fair Use)", monthlyCredits: "Unlimited", deptBudgets: true, byoAi: false, privateLlms: false, approvalWorkflow: true },
  { org: "Global Tech Inc", policy: "Shared Pool: 500K credits/mo", monthlyCredits: "500,000", deptBudgets: true, byoAi: true, privateLlms: false, approvalWorkflow: true },
  { org: "Pacific Holdings", policy: "Shared Pool: 200K credits/mo", monthlyCredits: "200,000", deptBudgets: false, byoAi: false, privateLlms: false, approvalWorkflow: true },
  { org: "Innovation Labs", policy: "Enterprise + BYO AI", monthlyCredits: "100,000 + BYO", deptBudgets: true, byoAi: true, privateLlms: true, approvalWorkflow: true },
];

export const AI_CAPABILITIES_STATUS = [
  { capability: "Executive Coach", status: "production", provider: "OpenAI", model: "GPT-5.5", health: 99, latency: 240 },
  { capability: "Voice Interview", status: "production", provider: "OpenAI", model: "GPT-5.5", health: 98, latency: 320 },
  { capability: "Resume AI", status: "production", provider: "Google", model: "Gemini 3 Flash", health: 100, latency: 180 },
  { capability: "Company Intelligence", status: "production", provider: "Anthropic", model: "Claude Opus 4.8", health: 99, latency: 350 },
  { capability: "Executive Simulator", status: "production", provider: "Anthropic", model: "Claude Opus 4.8", health: 97, latency: 380 },
  { capability: "Executive Debate", status: "beta", provider: "OpenAI", model: "GPT-6", health: 95, latency: 410 },
  { capability: "Video Interview", status: "planned", provider: "—", model: "—", health: 0, latency: 0 },
];

export function computeAIAnalytics(usageLogs) {
  const logs = usageLogs || [];
  const totalTokens = logs.reduce((s, l) => s + (l.input_tokens || 0) + (l.output_tokens || 0), 0);
  const totalCost = logs.reduce((s, l) => s + (l.cost_estimated || 0), 0);
  const errors = logs.filter((l) => l.status === "error" || l.status === "timeout");
  const successes = logs.filter((l) => l.status === "success");
  const avgLatency = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / logs.length) : 0;

  const byModel = {};
  logs.forEach((l) => {
    const model = l.model || "unknown";
    if (!byModel[model]) byModel[model] = { model, count: 0, tokens: 0, cost: 0, errors: 0, latencySum: 0 };
    byModel[model].count++;
    byModel[model].tokens += (l.input_tokens || 0) + (l.output_tokens || 0);
    byModel[model].cost += l.cost_estimated || 0;
    if (l.status === "error" || l.status === "timeout") byModel[model].errors++;
    byModel[model].latencySum += l.response_time_ms || 0;
  });

  const modelPerformance = Object.values(byModel).map((m) => ({
    ...m,
    avgLatency: m.count > 0 ? Math.round(m.latencySum / m.count) : 0,
    errorRate: m.count > 0 ? Math.round((m.errors / m.count) * 100) : 0,
    successRate: m.count > 0 ? Math.round(((m.count - m.errors) / m.count) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const byProvider = {};
  logs.forEach((l) => {
    const provider = l.provider || "unknown";
    if (!byProvider[provider]) byProvider[provider] = { provider, count: 0, tokens: 0, cost: 0 };
    byProvider[provider].count++;
    byProvider[provider].tokens += (l.input_tokens || 0) + (l.output_tokens || 0);
    byProvider[provider].cost += l.cost_estimated || 0;
  });
  const providerPerformance = Object.values(byProvider).sort((a, b) => b.cost - a.cost);

  return {
    totalRequests: logs.length,
    totalTokens,
    totalCost: Math.round(totalCost * 100) / 100,
    errorRate: logs.length > 0 ? Math.round((errors.length / logs.length) * 100) : 0,
    successRate: logs.length > 0 ? Math.round((successes.length / logs.length) * 100) : 0,
    avgLatency,
    errorCount: errors.length,
    modelPerformance,
    providerPerformance,
  };
}

export function computeProfitability(usageLogs) {
  const analytics = computeAIAnalytics(usageLogs);
  const packRevenue = 5000;
  const creditRevenue = 1500;
  const totalRevenue = packRevenue + creditRevenue;
  const aiCost = analytics.totalCost;
  const grossProfit = totalRevenue - aiCost;
  const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  const costByProvider = analytics.providerPerformance.map((p) => ({ provider: p.provider, cost: Math.round(p.cost * 100) / 100, percentage: aiCost > 0 ? Math.round((p.cost / aiCost) * 100) : 0 }));
  const costByModel = analytics.modelPerformance.map((m) => ({ model: m.model, cost: Math.round(m.cost * 100) / 100 }));

  return {
    totalRevenue,
    packRevenue,
    creditRevenue,
    aiCost,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMargin,
    costByProvider,
    costByModel,
    forecastedRevenue: Math.round(totalRevenue * 1.15 * 100) / 100,
    forecastedCost: Math.round(aiCost * 1.12 * 100) / 100,
    roi: aiCost > 0 ? Math.round((grossProfit / aiCost) * 100) : 0,
  };
}