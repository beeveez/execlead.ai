// Competitive Intelligence & Positioning Center™ — manually curated internal
// research engine. Uses only publicly available, high-level information.
// Never guesses; uncertain fields are marked "Not Publicly Documented" / "Unknown".

export const FEATURE_ROWS = [
  { key: "executive_assessments", label: "Executive Assessments" },
  { key: "ai_coaching", label: "AI Coaching" },
  { key: "leadership_simulations", label: "Leadership Simulations" },
  { key: "executive_readiness", label: "Executive Readiness" },
  { key: "succession_planning", label: "Succession Planning" },
  { key: "talent_intelligence", label: "Talent Intelligence" },
  { key: "executive_identity", label: "Executive Identity" },
  { key: "leadership_analytics", label: "Leadership Analytics" },
  { key: "enterprise_dashboard", label: "Enterprise Dashboard" },
  { key: "ai_personalization", label: "AI Personalization" },
  { key: "multi_agent_ai", label: "Multi-Agent AI" },
  { key: "voice_coaching", label: "Voice Coaching" },
  { key: "scenario_based_learning", label: "Scenario-Based Learning" },
  { key: "evidence_based_development", label: "Evidence-Based Development" },
  { key: "executive_portfolio", label: "Executive Portfolio" },
  { key: "executive_success_stories", label: "Executive Success Stories" },
  { key: "trust_compliance", label: "Trust & Compliance" },
  { key: "sso", label: "SSO" },
  { key: "scim", label: "SCIM" },
  { key: "enterprise_apis", label: "Enterprise APIs" },
];

export const STATUS_META = {
  "Supported": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  "Planned": { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25", dot: "bg-indigo-400" },
  "Publicly Confirmed": { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", dot: "bg-sky-400" },
  "Unknown": { color: "text-white/40", bg: "bg-white/5", border: "border-white/10", dot: "bg-white/30" },
  "Not Publicly Documented": { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", dot: "bg-amber-400" },
};

// EXECLEAD.AI's own capability column — our product, curated honestly.
export const EXECLEAD_AI_MATRIX = {
  executive_assessments: "Supported",
  ai_coaching: "Supported",
  leadership_simulations: "Supported",
  executive_readiness: "Supported",
  succession_planning: "Supported",
  talent_intelligence: "Supported",
  executive_identity: "Supported",
  leadership_analytics: "Supported",
  enterprise_dashboard: "Supported",
  ai_personalization: "Supported",
  multi_agent_ai: "Supported",
  voice_coaching: "Supported",
  scenario_based_learning: "Supported",
  evidence_based_development: "Supported",
  executive_portfolio: "Supported",
  executive_success_stories: "Supported",
  trust_compliance: "Supported",
  sso: "Supported",
  scim: "Supported",
  enterprise_apis: "Planned",
};

const NPD = "Not Publicly Documented";
const PC = "Publicly Confirmed";

// Curated seed competitors. Conservative; uncertain fields marked explicitly.
export const COMPETITOR_SEED = [
  {
    company_name: "BetterUp", website: "betterup.com", headquarters: "San Francisco, USA", founded_year: 2011,
    category: "Legacy Coaching Platform", is_legacy: true, is_ai_native: false,
    primary_market: "Enterprise", company_size: "Not publicly documented", funding: "Not publicly documented",
    target_customers: "Large enterprises, HR and People leaders", industries: "Broad enterprise",
    geographic_focus: "Global (US-led)", confidence_level: "High",
    primary_value_proposition: "Behavioral change and employee wellbeing through coaching at scale.",
    core_capabilities: "1:1 coaching, coaching marketplace, behavioral assessments, content and learning.",
    ai_capabilities: "AI-assisted matching and insights (publicly marketed).",
    assessment_capabilities: "Behavioral/psychometric assessments (publicly marketed).",
    coaching_capabilities: "Large coaching marketplace; 1:1 and group coaching.",
    simulation_capabilities: NPD, analytics: "People analytics and measurement (publicly marketed).",
    enterprise_features: "Enterprise admin, reporting, integrations (publicly marketed).",
    integrations: "HRIS and productivity integrations (publicly marketed).",
    security_compliance: NPD, pricing_model: "Per-seat / per-coaching engagement (publicly marketed).",
    enterprise_sales_motion: "Top-down enterprise sales.", public_customers: NPD, partnerships: NPD,
    strengths: "Brand awareness, large coaching network, established enterprise footprint (internal assessment).",
    limitations: "Coaching-centric; limited executive simulations and succession tooling (internal assessment).",
    recent_announcements: NPD, public_sources: "Company website and public press (review periodically).",
    last_reviewed: "2026-08-01",
    feature_matrix: {
      executive_assessments: PC, ai_coaching: PC, leadership_simulations: NPD, executive_readiness: NPD,
      succession_planning: NPD, talent_intelligence: NPD, executive_identity: NPD, leadership_analytics: PC,
      enterprise_dashboard: PC, ai_personalization: PC, multi_agent_ai: NPD, voice_coaching: NPD,
      scenario_based_learning: NPD, evidence_based_development: NPD, executive_portfolio: NPD,
      executive_success_stories: NPD, trust_compliance: NPD, sso: PC, scim: NPD, enterprise_apis: NPD,
    },
    positioning: {
      primary_customer: "HR / People leaders in large enterprises",
      primary_problem_solved: "Employee wellbeing, engagement, and behavioral change at scale",
      core_differentiator: "Large coaching network + measurement",
      sales_messaging: "Behavioral change and wellbeing through coaching",
      enterprise_positioning: "Coaching platform for the workforce",
      ai_strategy: "AI for matching and insights",
      leadership_philosophy: "Behavioral science-led coaching",
      gtm_strategy: "Enterprise sales + partnerships",
      execlead_differentiation: "EXECLEAD.AI adds executive readiness, simulations, succession, and decision intelligence — not just coaching",
      competitive_opportunity: "Up-market into executive development and succession",
      competitive_risk: "Brand and footprint in workforce coaching",
    },
    battlecard: {
      executive_summary: "Established coaching platform focused on behavioral change and wellbeing at scale.",
      when_customers_choose: "When buyers want broad workforce coaching and wellbeing programs.",
      questions_to_ask: "Do you need executive readiness, succession, and decision intelligence — or workforce coaching? How do you measure leadership readiness today?",
      execlead_strengths: "Executive Readiness™, simulations, succession planning, decision intelligence, evidence-based identity.",
      differentiation: "EXECLEAD.AI is an Executive Leadership Operating System, not a coaching marketplace.",
      when_competitor_stronger: "When the primary need is broad workforce wellbeing coaching rather than executive development.",
    },
  },
  {
    company_name: "CoachHub", website: "coachhub.com", headquarters: "New York, USA", founded_year: 2018,
    category: "Legacy Coaching Platform", is_legacy: true, is_ai_native: false,
    primary_market: "Enterprise", company_size: "Not publicly documented", funding: "Not publicly documented",
    target_customers: "Mid-market and enterprises", industries: "Broad enterprise",
    geographic_focus: "Global (Europe + US)", confidence_level: "Medium",
    primary_value_proposition: "Digital coaching for teams and leaders with a global coach pool.",
    core_capabilities: "1:1 and group coaching, coaching marketplace, learning content.",
    ai_capabilities: "AI coaching assistant (publicly marketed).",
    assessment_capabilities: NPD, coaching_capabilities: "Global coach pool; 1:1 and group coaching.",
    simulation_capabilities: NPD, analytics: "Program analytics (publicly marketed).",
    enterprise_features: "Enterprise admin and reporting (publicly marketed).",
    integrations: "HRIS integrations (publicly marketed).", security_compliance: NPD,
    pricing_model: "Per-seat / per-program (publicly marketed).",
    enterprise_sales_motion: "Enterprise sales.", public_customers: NPD, partnerships: NPD,
    strengths: "Global coach pool, multilingual coaching (internal assessment).",
    limitations: "Coaching-centric; limited simulations, succession, executive identity (internal assessment).",
    recent_announcements: NPD, public_sources: "Company website and public press (review periodically).",
    last_reviewed: "2026-08-01",
    feature_matrix: {
      executive_assessments: NPD, ai_coaching: PC, leadership_simulations: NPD, executive_readiness: NPD,
      succession_planning: NPD, talent_intelligence: NPD, executive_identity: NPD, leadership_analytics: NPD,
      enterprise_dashboard: PC, ai_personalization: NPD, multi_agent_ai: NPD, voice_coaching: NPD,
      scenario_based_learning: NPD, evidence_based_development: NPD, executive_portfolio: NPD,
      executive_success_stories: NPD, trust_compliance: NPD, sso: PC, scim: NPD, enterprise_apis: NPD,
    },
    positioning: {
      primary_customer: "HR and L&D in mid-market and enterprises",
      primary_problem_solved: "Scalable digital coaching for leaders and teams",
      core_differentiator: "Global, multilingual coach pool",
      sales_messaging: "Digital coaching, anywhere",
      enterprise_positioning: "Coaching platform for teams and leaders",
      ai_strategy: "AI coaching assistant",
      leadership_philosophy: "Coaching-led development",
      gtm_strategy: "Enterprise sales",
      execlead_differentiation: "EXECLEAD.AI delivers executive readiness, simulations, and succession — beyond coaching delivery",
      competitive_opportunity: "Differentiate on executive outcomes vs. coaching delivery",
      competitive_risk: "Global coaching reach and multilingual coverage",
    },
    battlecard: {
      executive_summary: "Digital coaching platform with a global coach pool.",
      when_customers_choose: "When buyers want scalable multilingual coaching delivery.",
      questions_to_ask: "Do you need coaching delivery or a full executive readiness and succession system?",
      execlead_strengths: "Executive Readiness™, simulations, succession, decision intelligence.",
      differentiation: "Operating system for executive leadership vs. a coaching marketplace.",
      when_competitor_stronger: "When multilingual coaching delivery across many regions is the priority.",
    },
  },
  {
    company_name: "Valence", website: "valence.co", headquarters: "New York, USA", founded_year: 2019,
    category: "AI-Native Leadership Platform", is_legacy: false, is_ai_native: true,
    primary_market: "Enterprise / Mid-market", company_size: "Not publicly documented", funding: "Not publicly documented",
    target_customers: "People and team leaders", industries: "Broad enterprise",
    geographic_focus: "US-led", confidence_level: "Medium",
    primary_value_proposition: "AI-native team and leadership development.",
    core_capabilities: "Team development, leadership programs, AI-guided tools.",
    ai_capabilities: "AI-native coaching and facilitation (publicly marketed).",
    assessment_capabilities: NPD, coaching_capabilities: "AI-guided development tools (publicly marketed).",
    simulation_capabilities: NPD, analytics: NPD, enterprise_features: NPD, integrations: NPD,
    security_compliance: NPD, pricing_model: NPD, enterprise_sales_motion: NPD,
    public_customers: NPD, partnerships: NPD,
    strengths: "AI-native UX, team-development focus (internal assessment).",
    limitations: "Limited publicly documented enterprise, succession, and assessment depth (internal assessment).",
    recent_announcements: NPD, public_sources: "Company website (review periodically).",
    last_reviewed: "2026-08-01",
    feature_matrix: {
      executive_assessments: NPD, ai_coaching: PC, leadership_simulations: NPD, executive_readiness: NPD,
      succession_planning: NPD, talent_intelligence: NPD, executive_identity: NPD, leadership_analytics: NPD,
      enterprise_dashboard: NPD, ai_personalization: PC, multi_agent_ai: NPD, voice_coaching: NPD,
      scenario_based_learning: NPD, evidence_based_development: NPD, executive_portfolio: NPD,
      executive_success_stories: NPD, trust_compliance: NPD, sso: NPD, scim: NPD, enterprise_apis: NPD,
    },
    positioning: {
      primary_customer: "People and team leaders in enterprises",
      primary_problem_solved: "Team effectiveness and leadership development, AI-native",
      core_differentiator: "AI-native team development",
      sales_messaging: "AI for team and leadership development",
      enterprise_positioning: "AI-native development platform",
      ai_strategy: "AI-native by design",
      leadership_philosophy: "Team-centric development",
      gtm_strategy: "Product-led / enterprise",
      execlead_differentiation: "EXECLEAD.AI adds executive-level readiness, succession, simulations, and evidence-based identity",
      competitive_opportunity: "Lead on executive outcomes and enterprise governance",
      competitive_risk: "AI-native UX and team-development narrative",
    },
    battlecard: {
      executive_summary: "AI-native team and leadership development platform.",
      when_customers_choose: "When buyers want AI-native team development.",
      questions_to_ask: "Do you need team development or executive readiness and succession intelligence?",
      execlead_strengths: "Executive Readiness™, succession, simulations, decision intelligence, evidence-based identity.",
      differentiation: "Executive operating system vs. team development tooling.",
      when_competitor_stronger: "When team-level development (not executive) is the primary scope.",
    },
  },
  {
    company_name: "Rocky.ai", website: "rocky.ai", headquarters: "Zurich, Switzerland", founded_year: 2020,
    category: "AI-Native Leadership Platform", is_legacy: false, is_ai_native: true,
    primary_market: "Individuals / SMB", company_size: "Not publicly documented", funding: "Not publicly documented",
    target_customers: "Individuals, SMBs, coaches", industries: "Broad",
    geographic_focus: "Global (mobile-first)", confidence_level: "Medium",
    primary_value_proposition: "AI coaching companion for daily leadership habits.",
    core_capabilities: "AI chat coaching, voice coaching, habit and reflection prompts.",
    ai_capabilities: "Conversational AI coaching (publicly marketed).",
    assessment_capabilities: NPD, coaching_capabilities: "AI conversational coaching (publicly marketed).",
    simulation_capabilities: NPD, analytics: NPD, enterprise_features: NPD, integrations: NPD,
    security_compliance: NPD, pricing_model: "Freemium / subscription (publicly marketed).",
    enterprise_sales_motion: "Self-serve / SMB.", public_customers: NPD, partnerships: NPD,
    strengths: "Mobile-first AI coaching, voice, accessibility (internal assessment).",
    limitations: "SMB/individual focus; limited enterprise, succession, assessment depth (internal assessment).",
    recent_announcements: NPD, public_sources: "Company website and app stores (review periodically).",
    last_reviewed: "2026-08-01",
    feature_matrix: {
      executive_assessments: NPD, ai_coaching: PC, leadership_simulations: NPD, executive_readiness: NPD,
      succession_planning: NPD, talent_intelligence: NPD, executive_identity: NPD, leadership_analytics: NPD,
      enterprise_dashboard: NPD, ai_personalization: PC, multi_agent_ai: NPD, voice_coaching: PC,
      scenario_based_learning: NPD, evidence_based_development: NPD, executive_portfolio: NPD,
      executive_success_stories: NPD, trust_compliance: NPD, sso: NPD, scim: NPD, enterprise_apis: NPD,
    },
    positioning: {
      primary_customer: "Individuals, SMBs, and coaches",
      primary_problem_solved: "Accessible daily AI coaching",
      core_differentiator: "Mobile-first conversational AI coaching",
      sales_messaging: "Your AI coaching companion",
      enterprise_positioning: "Personal AI coach",
      ai_strategy: "Conversational AI, voice",
      leadership_philosophy: "Habit-based daily coaching",
      gtm_strategy: "Self-serve / mobile",
      execlead_differentiation: "EXECLEAD.AI is enterprise-grade: readiness, succession, simulations, governance",
      competitive_opportunity: "Up-market into enterprise executive development",
      competitive_risk: "Accessible AI coaching UX for individuals",
    },
    battlecard: {
      executive_summary: "Mobile-first AI coaching companion for individuals and SMBs.",
      when_customers_choose: "When individuals want affordable daily AI coaching.",
      questions_to_ask: "Do you need enterprise executive readiness and succession — or personal coaching?",
      execlead_strengths: "Enterprise-grade executive readiness, succession, simulations, governance, evidence-based identity.",
      differentiation: "Enterprise executive operating system vs. personal coaching app.",
      when_competitor_stronger: "When individual/SMB AI coaching is the need.",
    },
  },
];

export function buildOverviewStats(competitors) {
  const total = competitors.length;
  const legacy = competitors.filter((c) => c.is_legacy).length;
  const aiNative = competitors.filter((c) => c.is_ai_native).length;
  return {
    totalCompetitors: total,
    legacyPlatforms: legacy,
    aiNativePlatforms: aiNative,
    averageEnterpriseTarget: "Large enterprise (most tracked competitors target enterprise HR/People)",
    pricingIntelligence: "Most competitors use per-seat or per-engagement pricing; EXECLEAD.AI uses value-based enterprise licensing.",
    marketOpportunities: "Executive readiness, succession intelligence, leadership simulations, and evidence-based identity are underserved by coaching-centric competitors.",
    competitiveRisks: "Established coaching platforms have brand and footprint in workforce coaching.",
    execleadPosition: "EXECLEAD.AI is the only AI-native Executive Leadership Operating System uniting readiness, coaching, simulations, succession, and decision intelligence.",
    latestUpdates: "Review competitor public sources quarterly; this center is manually curated.",
  };
}

export function buildComparisonMatrix(competitors) {
  return FEATURE_ROWS.map((row) => {
    const cells = { feature: row.label };
    cells["EXECLEAD.AI"] = EXECLEAD_AI_MATRIX[row.key] || "Unknown";
    for (const c of competitors) {
      const m = c.feature_matrix_json ? safeParse(c.feature_matrix_json) : (c.feature_matrix || {});
      cells[c.company_name] = m[row.key] || "Unknown";
    }
    return cells;
  });
}

export function getMatrix(profile) {
  if (!profile) return {};
  if (profile.feature_matrix_json) return safeParse(profile.feature_matrix_json);
  return profile.feature_matrix || {};
}

export function getPositioning(profile) {
  if (!profile) return null;
  if (profile.positioning_json) return safeParse(profile.positioning_json);
  return profile.positioning || null;
}

export function getBattlecard(profile) {
  if (!profile) return null;
  if (profile.battlecard_json) return safeParse(profile.battlecard_json);
  return profile.battlecard || null;
}

export function generateBattlecard(profile) {
  return {
    executive_summary: profile.primary_value_proposition || "Not documented.",
    when_customers_choose: `When buyers want ${profile.primary_value_proposition?.toLowerCase() || "this offering"}.`,
    questions_to_ask: "Do you need executive readiness, succession, and decision intelligence — or this offering?",
    execlead_strengths: "Executive Readiness™, simulations, succession planning, decision intelligence, evidence-based identity.",
    differentiation: "EXECLEAD.AI is an Executive Leadership Operating System.",
    when_competitor_stronger: `When ${profile.company_name}'s primary focus is the buyer's main need.`,
  };
}

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

export function toEntityRecord(profile) {
  return {
    company_name: profile.company_name,
    website: profile.website, headquarters: profile.headquarters, founded_year: profile.founded_year,
    years_in_business: new Date().getFullYear() - (profile.founded_year || new Date().getFullYear()),
    category: profile.category, is_legacy: profile.is_legacy, is_ai_native: profile.is_ai_native,
    primary_market: profile.primary_market, company_size: profile.company_size, funding: profile.funding,
    target_customers: profile.target_customers, industries: profile.industries, geographic_focus: profile.geographic_focus,
    primary_value_proposition: profile.primary_value_proposition, core_capabilities: profile.core_capabilities,
    ai_capabilities: profile.ai_capabilities, assessment_capabilities: profile.assessment_capabilities,
    coaching_capabilities: profile.coaching_capabilities, simulation_capabilities: profile.simulation_capabilities,
    analytics: profile.analytics, enterprise_features: profile.enterprise_features, integrations: profile.integrations,
    security_compliance: profile.security_compliance, pricing_model: profile.pricing_model,
    enterprise_sales_motion: profile.enterprise_sales_motion, public_customers: profile.public_customers,
    partnerships: profile.partnerships, strengths: profile.strengths, limitations: profile.limitations,
    recent_announcements: profile.recent_announcements, public_sources: profile.public_sources,
    last_reviewed: profile.last_reviewed, confidence_level: profile.confidence_level,
    feature_matrix_json: JSON.stringify(profile.feature_matrix || {}),
    positioning_json: JSON.stringify(profile.positioning || {}),
    battlecard_json: JSON.stringify(profile.battlecard || {}),
  };
}