// Competitive Intelligence & Battlecard Center™ V2 — manually curated internal
// research engine. Public information only. Never invents capabilities/pricing.

export const FEATURE_ROWS = [
  { key: "executive_readiness", label: "Executive Readiness™" },
  { key: "ai_coaching", label: "AI Coaching" },
  { key: "leadership_assessments", label: "Leadership Assessments" },
  { key: "executive_simulations", label: "Executive Simulations" },
  { key: "decision_labs", label: "Decision Labs" },
  { key: "succession_planning", label: "Succession Planning" },
  { key: "promotion_readiness", label: "Promotion Readiness" },
  { key: "talent_intelligence", label: "Talent Intelligence" },
  { key: "executive_identity", label: "Executive Identity" },
  { key: "career_development", label: "Career Development" },
  { key: "learning_paths", label: "Learning Paths" },
  { key: "analytics", label: "Analytics" },
  { key: "executive_dashboards", label: "Executive Dashboards" },
  { key: "enterprise_reporting", label: "Enterprise Reporting" },
  { key: "sso", label: "SSO" },
  { key: "scim", label: "SCIM" },
  { key: "rbac", label: "RBAC" },
  { key: "api", label: "API" },
  { key: "marketplace", label: "Marketplace" },
  { key: "responsible_ai", label: "Responsible AI" },
  { key: "trust_center", label: "Trust Center" },
  { key: "compliance", label: "Compliance" },
  { key: "knowledge_management", label: "Knowledge Management" },
  { key: "evidence_based_development", label: "Evidence-Based Development" },
  { key: "ai_explainability", label: "AI Explainability" },
];

export const STATUS_META = {
  "Supported": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  "Planned": { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25", dot: "bg-indigo-400" },
  "Partially Supported": { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", dot: "bg-sky-400" },
  "Unknown": { color: "text-white/40", bg: "bg-white/5", border: "border-white/10", dot: "bg-white/30" },
  "Not Publicly Documented": { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", dot: "bg-amber-400" },
};

export const EXECLEAD_AI_MATRIX = {
  executive_readiness: "Supported", ai_coaching: "Supported", leadership_assessments: "Supported",
  executive_simulations: "Supported", decision_labs: "Supported", succession_planning: "Supported",
  promotion_readiness: "Supported", talent_intelligence: "Supported", executive_identity: "Supported",
  career_development: "Supported", learning_paths: "Supported", analytics: "Supported",
  executive_dashboards: "Supported", enterprise_reporting: "Supported", sso: "Supported",
  scim: "Supported", rbac: "Supported", api: "Planned", marketplace: "Supported",
  responsible_ai: "Supported", trust_center: "Supported", compliance: "Supported",
  knowledge_management: "Supported", evidence_based_development: "Supported", ai_explainability: "Supported",
};

const NPD = "Not Publicly Documented";

// Curated seed competitors (16). Conservative; uncertain fields marked explicitly.
export const COMPETITOR_SEED = [
  {
    company_name: "BetterUp", website: "betterup.com", headquarters: "San Francisco, USA", founded_year: 2011,
    category: "Legacy Coaching Platform", is_legacy: true, is_ai_native: false, primary_market: "Enterprise",
    funding_status: NPD, estimated_employee_count: NPD, target_customers: "Large enterprises, HR and People leaders",
    target_personas: "CHRO, HR, People leaders", industries: "Broad enterprise", geographic_focus: "Global (US-led)",
    primary_value_proposition: "Behavioral change and employee wellbeing through coaching at scale.",
    primary_products: "1:1 coaching, coaching marketplace, assessments, content.", core_capabilities: "Coaching marketplace, behavioral assessments, content.",
    ai_capabilities: "AI-assisted matching and insights (publicly marketed).", assessment_capabilities: "Behavioral assessments (publicly marketed).",
    coaching_capabilities: "Large coaching marketplace; 1:1 and group coaching.", simulation_capabilities: NPD, analytics: "People analytics (publicly marketed).",
    enterprise_features: "Enterprise admin, reporting, integrations.", integrations: "HRIS and productivity integrations.", deployment_model: "SaaS",
    security_compliance: NPD, pricing_model: "Per-seat / per-engagement", pricing_model_type: "Seat-Based", public_pricing: NPD,
    has_free_tier: false, has_trial: false, annual_discounts: NPD, enterprise_sales_motion: "Top-down enterprise sales.",
    public_customers: NPD, partnerships: NPD, strengths: "Brand awareness, large coaching network, enterprise footprint (internal assessment).",
    limitations: "Coaching-centric; limited executive simulations and succession tooling (internal assessment).",
    recent_announcements: NPD, strategic_notes: "Lead with executive outcomes vs. workforce coaching.", public_sources: "Company website and public press (review periodically).",
    last_reviewed: "2026-08-01", confidence_level: "High",
    feature_matrix: { ai_coaching: "Supported", leadership_assessments: "Supported", analytics: "Supported", executive_dashboards: "Supported", sso: "Supported", marketplace: "Supported", responsible_ai: "Partially Supported" },
    positioning: { category_competitor_owns: "Workforce coaching & wellbeing", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "Coaching delivery", unique: "Executive Readiness™, simulations, succession, decision intelligence", compete_directly: "Only for executive-level outcomes", ignore_market: "Broad workforce wellbeing coaching", unmet_need: "Unified executive readiness & succession intelligence", execlead_differentiation: "EXECLEAD.AI adds executive readiness, simulations, succession — not just coaching", competitive_opportunity: "Up-market into executive development", competitive_risk: "Brand and workforce coaching footprint" },
    battlecard: { executive_summary: "Established coaching platform for behavioral change and wellbeing at scale.", when_customers_choose: "When buyers want broad workforce coaching and wellbeing programs.", questions_to_ask: "Do you need executive readiness, succession, and decision intelligence — or workforce coaching?", execlead_strengths: "Executive Readiness™, simulations, succession, decision intelligence, evidence-based identity.", differentiation: "EXECLEAD.AI is an Executive Leadership Operating System, not a coaching marketplace.", when_competitor_stronger: "When the primary need is broad workforce wellbeing coaching." },
  },
  {
    company_name: "CoachHub", website: "coachhub.com", headquarters: "New York, USA", founded_year: 2018,
    category: "Legacy Coaching Platform", is_legacy: true, is_ai_native: false, primary_market: "Enterprise",
    funding_status: NPD, estimated_employee_count: NPD, target_customers: "Mid-market and enterprises", target_personas: "HR, L&D",
    industries: "Broad enterprise", geographic_focus: "Global (Europe + US)", primary_value_proposition: "Digital coaching for teams and leaders with a global coach pool.",
    primary_products: "1:1 and group coaching, AI coaching assistant.", core_capabilities: "Coaching marketplace, AI coaching assistant.", ai_capabilities: "AI coaching assistant (publicly marketed).",
    assessment_capabilities: NPD, coaching_capabilities: "Global coach pool; 1:1 and group coaching.", simulation_capabilities: NPD, analytics: "Program analytics (publicly marketed).",
    enterprise_features: "Enterprise admin and reporting.", integrations: "HRIS integrations.", deployment_model: "SaaS", security_compliance: NPD,
    pricing_model: "Per-seat / per-program", pricing_model_type: "Seat-Based", public_pricing: NPD, has_free_tier: false, has_trial: false,
    annual_discounts: NPD, enterprise_sales_motion: "Enterprise sales.", public_customers: NPD, partnerships: NPD,
    strengths: "Global, multilingual coach pool (internal assessment).", limitations: "Coaching-centric; limited simulations, succession (internal assessment).",
    recent_announcements: NPD, strategic_notes: "Differentiate on executive outcomes vs. coaching delivery.", public_sources: "Company website and public press (review periodically).",
    last_reviewed: "2026-08-01", confidence_level: "Medium",
    feature_matrix: { ai_coaching: "Supported", sso: "Supported", marketplace: "Supported" },
    positioning: { category_competitor_owns: "Digital coaching delivery", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "Coaching delivery", unique: "Executive Readiness™, simulations, succession", compete_directly: "Only for executive outcomes", ignore_market: "Coaching delivery only", unmet_need: "Executive readiness & succession intelligence", execlead_differentiation: "Operating system vs. coaching marketplace", competitive_opportunity: "Executive outcomes differentiation", competitive_risk: "Global multilingual coaching reach" },
    battlecard: { executive_summary: "Digital coaching platform with a global coach pool.", when_customers_choose: "When buyers want scalable multilingual coaching delivery.", questions_to_ask: "Do you need coaching delivery or a full executive readiness and succession system?", execlead_strengths: "Executive Readiness™, simulations, succession, decision intelligence.", differentiation: "Operating system for executive leadership vs. a coaching marketplace.", when_competitor_stronger: "When multilingual coaching delivery across regions is the priority." },
  },
  {
    company_name: "Valence", website: "valence.co", headquarters: "New York, USA", founded_year: 2019,
    category: "AI-Native Leadership Platform", is_legacy: false, is_ai_native: true, primary_market: "Enterprise / Mid-market",
    funding_status: NPD, estimated_employee_count: NPD, target_customers: "People and team leaders", target_personas: "People leaders, team managers",
    industries: "Broad enterprise", geographic_focus: "US-led", primary_value_proposition: "AI-native team and leadership development.",
    primary_products: "AI-guided team development tools.", core_capabilities: "Team development, leadership programs, AI-guided tools.", ai_capabilities: "AI-native coaching and facilitation (publicly marketed).",
    assessment_capabilities: NPD, coaching_capabilities: "AI-guided development tools.", simulation_capabilities: NPD, analytics: NPD, enterprise_features: NPD,
    integrations: NPD, deployment_model: "SaaS", security_compliance: NPD, pricing_model: NPD, pricing_model_type: "Not Publicly Documented", public_pricing: NPD,
    has_free_tier: false, has_trial: false, annual_discounts: NPD, enterprise_sales_motion: NPD, public_customers: NPD, partnerships: NPD,
    strengths: "AI-native UX, team-development focus (internal assessment).", limitations: "Limited publicly documented enterprise, succession, assessment depth (internal assessment).",
    recent_announcements: NPD, strategic_notes: "Lead on enterprise governance and executive outcomes.", public_sources: "Company website (review periodically).",
    last_reviewed: "2026-08-01", confidence_level: "Medium",
    feature_matrix: { ai_coaching: "Supported", learning_paths: "Supported", analytics: "Supported", ai_personalization: "Supported" },
    positioning: { category_competitor_owns: "AI-native team development", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "AI coaching", unique: "Executive Readiness™, succession, simulations, decision intelligence", compete_directly: "Only for executive outcomes", ignore_market: "Team-level development only", unmet_need: "Executive-level readiness & succession", execlead_differentiation: "Executive operating system vs. team tooling", competitive_opportunity: "Enterprise governance & executive outcomes", competitive_risk: "AI-native UX narrative" },
    battlecard: { executive_summary: "AI-native team and leadership development platform.", when_customers_choose: "When buyers want AI-native team development.", questions_to_ask: "Do you need team development or executive readiness and succession intelligence?", execlead_strengths: "Executive Readiness™, succession, simulations, decision intelligence.", differentiation: "Executive operating system vs. team development tooling.", when_competitor_stronger: "When team-level development is the primary scope." },
  },
  {
    company_name: "Rocky.ai", website: "rocky.ai", headquarters: "Zurich, Switzerland", founded_year: 2020,
    category: "AI-Native Leadership Platform", is_legacy: false, is_ai_native: true, primary_market: "Individuals / SMB",
    funding_status: NPD, estimated_employee_count: NPD, target_customers: "Individuals, SMBs, coaches", target_personas: "Individuals, coaches, SMB leaders",
    industries: "Broad", geographic_focus: "Global (mobile-first)", primary_value_proposition: "AI coaching companion for daily leadership habits.",
    primary_products: "AI chat coaching, voice coaching, habit prompts.", core_capabilities: "AI chat coaching, voice coaching, reflection prompts.", ai_capabilities: "Conversational AI coaching (publicly marketed).",
    assessment_capabilities: NPD, coaching_capabilities: "AI conversational coaching.", simulation_capabilities: NPD, analytics: NPD, enterprise_features: NPD,
    integrations: NPD, deployment_model: "Mobile app / SaaS", security_compliance: NPD, pricing_model: "Freemium / subscription", pricing_model_type: "Freemium", public_pricing: "Public freemium tiers (publicly marketed)",
    has_free_tier: true, has_trial: false, annual_discounts: NPD, enterprise_sales_motion: "Self-serve / SMB.", public_customers: NPD, partnerships: NPD,
    strengths: "Mobile-first AI coaching, voice, accessibility (internal assessment).", limitations: "SMB/individual focus; limited enterprise, succession depth (internal assessment).",
    recent_announcements: NPD, strategic_notes: "Up-market into enterprise executive development.", public_sources: "Company website and app stores (review periodically).",
    last_reviewed: "2026-08-01", confidence_level: "Medium",
    feature_matrix: { ai_coaching: "Supported", career_development: "Supported", ai_explainability: NPD },
    positioning: { category_competitor_owns: "Personal AI coaching", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "AI coaching", unique: "Enterprise readiness, succession, simulations, governance", compete_directly: "No (different buyer)", ignore_market: "Personal/SMB coaching apps", unmet_need: "Enterprise-grade executive development", execlead_differentiation: "Enterprise executive operating system vs. personal app", competitive_opportunity: "Enterprise executive development", competitive_risk: "Accessible AI coaching UX for individuals" },
    battlecard: { executive_summary: "Mobile-first AI coaching companion for individuals and SMBs.", when_customers_choose: "When individuals want affordable daily AI coaching.", questions_to_ask: "Do you need enterprise executive readiness and succession — or personal coaching?", execlead_strengths: "Enterprise-grade executive readiness, succession, simulations, governance.", differentiation: "Enterprise executive operating system vs. personal coaching app.", when_competitor_stronger: "When individual/SMB AI coaching is the need." },
  },
  // Basic profiles (high-level public info; detailed capabilities Not Publicly Documented)
  basic("Torch", "torch.io", "San Francisco, USA", 2015, "Legacy Coaching Platform", "Enterprise", "Leadership coaching and development for mid-market and enterprise.", { ai_coaching: NPD, leadership_assessments: "Partially Supported", learning_paths: "Supported", sso: "Supported" }, "Medium"),
  basic("Sounding Board", "soundingboard.com", "San Francisco, USA", 2013, "Legacy Coaching Platform", "Enterprise", "Coaching and leadership development platform.", { ai_coaching: NPD, leadership_assessments: "Partially Supported", learning_paths: "Supported", sso: "Supported" }, "Medium"),
  basic("Pluma", "pluma.co", "São Paulo, Brazil", 2016, "Legacy Coaching Platform", "Enterprise / SMB", "Coaching and leadership development for individuals and teams.", { ai_coaching: NPD, learning_paths: "Supported" }, "Low"),
  basic("Microsoft Viva Learning", "learn.microsoft.com/viva", "Redmond, USA", 2021, "HCM-Embedded Learning", "Enterprise", "Employee learning app within Microsoft Viva.", { learning_paths: "Supported", sso: "Supported", enterprise_reporting: "Supported", api: "Supported" }, "High"),
  basic("LinkedIn Learning", "learning.linkedin.com", "Sunnyvale, USA", 2015, "Learning Platform", "Enterprise / SMB", "Online learning library for professional skills.", { learning_paths: "Supported", analytics: "Supported", marketplace: "Supported", sso: "Supported", api: "Supported" }, "High"),
  basic("Cornerstone", "cornerstoneondemand.com", "Santa Monica, USA", 1999, "Learning Platform", "Enterprise", "Learning and talent management platform.", { learning_paths: "Supported", analytics: "Supported", sso: "Supported", api: "Supported", enterprise_reporting: "Supported", compliance: "Supported" }, "High"),
  basic("Workday Skills Cloud", "workday.com", "Pleasanton, USA", 2018, "HCM-Embedded Learning", "Enterprise", "Skills intelligence within Workday HCM.", { talent_intelligence: "Supported", analytics: "Supported", sso: "Supported", api: "Supported" }, "High"),
  basic("ServiceNow Learning", "servicenow.com", "Santa Clara, USA", 2020, "HCM-Embedded Learning", "Enterprise", "Learning and training within ServiceNow.", { learning_paths: "Supported", sso: "Supported", api: "Supported" }, "Medium"),
  basic("Degreed", "degreed.com", "Pleasanton, USA", 2012, "Learning Platform", "Enterprise", "Skills and learning aggregation platform.", { learning_paths: "Supported", analytics: "Supported", talent_intelligence: "Partially Supported", sso: "Supported", api: "Supported" }, "High"),
  basic("Udemy Business", "business.udemy.com", "San Francisco, USA", 2010, "Learning Platform", "Enterprise / SMB", "Business learning marketplace.", { learning_paths: "Supported", marketplace: "Supported", sso: "Supported" }, "High"),
  basic("Coursera for Business", "coursera.org/business", "Mountain View, USA", 2012, "Learning Platform", "Enterprise", "Enterprise learning from university and industry content.", { learning_paths: "Supported", marketplace: "Supported", sso: "Supported" }, "High"),
  basic("CrossKnowledge", "crossknowledge.com", "Paris, France", 1996, "Learning Platform", "Enterprise", "Digital learning content for leadership development.", { learning_paths: "Supported", sso: "Supported" }, "Medium"),
];

function basic(name, website, hq, founded, category, market, valueProp, matrix, confidence) {
  return {
    company_name: name, website, headquarters: hq, founded_year: founded, category, is_legacy: category !== "AI-Native Leadership Platform", is_ai_native: category === "AI-Native Leadership Platform",
    primary_market: market, target_customers: market, target_personas: NPD, industries: "Broad enterprise", geographic_focus: NPD,
    primary_value_proposition: valueProp, primary_products: NPD, core_capabilities: NPD, ai_capabilities: NPD, assessment_capabilities: NPD, coaching_capabilities: NPD,
    simulation_capabilities: NPD, analytics: NPD, enterprise_features: NPD, integrations: NPD, deployment_model: "SaaS", security_compliance: NPD,
    pricing_model: NPD, pricing_model_type: "Not Publicly Documented", public_pricing: NPD, has_free_tier: false, has_trial: false, annual_discounts: NPD,
    enterprise_sales_motion: NPD, public_customers: NPD, partnerships: NPD, strengths: NPD, limitations: NPD, recent_announcements: NPD,
    strategic_notes: NPD, public_sources: "Company website (review periodically).", last_reviewed: "2026-08-01", confidence_level: confidence,
    feature_matrix: matrix,
  };
}

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

export function getMatrix(profile) {
  if (!profile) return {};
  if (profile.feature_matrix_json) return safeParse(profile.feature_matrix_json);
  return profile.feature_matrix || {};
}

export function buildComparisonMatrix(competitors) {
  return FEATURE_ROWS.map((row) => {
    const cells = { feature: row.label };
    cells["EXECLEAD.AI"] = EXECLEAD_AI_MATRIX[row.key] || "Unknown";
    for (const c of competitors) {
      const m = getMatrix(c);
      cells[c.company_name] = m[row.key] || NPD;
    }
    return cells;
  });
}

export function buildDashboard(competitors) {
  const total = competitors.length;
  const legacy = competitors.filter((c) => c.is_legacy).length;
  const aiNative = competitors.filter((c) => c.is_ai_native).length;
  const categories = {};
  competitors.forEach((c) => { categories[c.category] = (categories[c.category] || 0) + 1; });
  // Differentiation score: % of features where EXECLEAD.AI is Supported and no competitor is Supported
  let leadFeatures = 0, gapFeatures = 0;
  const featureGaps = [];
  for (const row of FEATURE_ROWS) {
    const ours = EXECLEAD_AI_MATRIX[row.key];
    const anyCompSupported = competitors.some((c) => (getMatrix(c)[row.key] === "Supported"));
    if (ours === "Supported" && !anyCompSupported) leadFeatures++;
    if (ours !== "Supported" && anyCompSupported) { gapFeatures++; featureGaps.push(row.label); }
  }
  const differentiationScore = Math.round((leadFeatures / FEATURE_ROWS.length) * 100);
  const competitiveHealthScore = Math.min(100, differentiationScore + 20);
  const enterpriseFeatures = ["sso", "scim", "rbac", "enterprise_reporting", "compliance"];
  const execleadEnterprise = enterpriseFeatures.filter((k) => EXECLEAD_AI_MATRIX[k] === "Supported").length;
  const avgCompEnterprise = competitors.length ? Math.round(competitors.reduce((a, c) => a + enterpriseFeatures.filter((k) => getMatrix(c)[k] === "Supported").length, 0) / competitors.length) : 0;
  return {
    competitiveHealthScore, marketCoverage: `${Object.keys(categories).length} segments tracked`, trackedCompetitors: total,
    legacyPlatforms: legacy, aiNativePlatforms: aiNative, categories,
    recentProductLaunches: "Tracked in Market News & Product Updates™", recentFundingEvents: "Tracked in Market News™",
    pricingChanges: "Tracked in Pricing Intelligence™", featureGapAlerts: featureGaps,
    differentiationScore, enterpriseReadinessComparison: `EXECLEAD.AI ${execleadEnterprise}/${enterpriseFeatures.length} vs competitor avg ${avgCompEnterprise}/${enterpriseFeatures.length}`,
    marketTrendSummary: "Leadership development is consolidating toward AI-native, outcome-based executive operating systems; coaching and learning delivery are commoditizing.",
  };
}

export function generatePositioning(profile) {
  return {
    category_competitor_owns: profile.category || NPD,
    category_execlead_should_own: "AI Executive Leadership Operating System",
    overlap: "Coaching and/or learning delivery (where this competitor operates).",
    unique: "Executive Readiness™, Succession Intelligence, Leadership Simulations, Decision Intelligence, Executive Identity™.",
    compete_directly: "Only when the buyer needs executive-level outcomes.",
    ignore_market: "Broad workforce wellbeing coaching and personal coaching apps.",
    unmet_need: "Unified, evidence-based executive readiness and succession intelligence.",
  };
}

export function getPositioning(profile) {
  if (!profile) return null;
  if (profile.positioning_json) return { ...generatePositioning(profile), ...safeParse(profile.positioning_json) };
  return { ...generatePositioning(profile), ...(profile.positioning || {}) };
}

export function generateBattlecard(profile) {
  const vp = profile.primary_value_proposition || NPD;
  return {
    executive_summary: vp,
    ideal_customer_profile: profile.target_customers || NPD,
    primary_messaging: vp,
    strengths: profile.strengths || NPD,
    differentiators: "EXECLEAD.AI is an AI-native Executive Leadership Operating System: readiness, simulations, succession, decision intelligence.",
    when_execlead_wins: "When the buyer needs executive readiness, succession intelligence, and simulations — not just coaching or learning delivery.",
    when_competitor_stronger: `When the buyer's primary need is ${(vp || "this competitor's core offering").toLowerCase()}.`,
    discovery_questions: "Do you need executive readiness, succession planning, and decision intelligence — or workforce coaching/learning? How do you measure leadership readiness today?",
    positioning_guidance: "Lead with Executive Readiness™, the ROI Calculator, and enterprise governance. Avoid feature-by-feature comparison.",
    risk_areas: profile.strengths ? `Competitor strength: ${profile.strengths}` : "Established market presence.",
    recommended_demo_focus: "Executive Readiness Assessment™, Leadership Simulations™, Executive ROI Calculator™.",
    recommended_proof_points: "Executive Readiness™ scores, Executive Success Stories, Trust Center™.",
    objection_handling: "Acknowledge the competitor's coaching/learning strength; pivot to executive outcomes and evidence-based identity.",
    customer_personas: profile.target_personas || "CHRO, VP Talent, L&D, CFO, CEO",
  };
}

export function getBattlecard(profile) {
  if (!profile) return null;
  const base = generateBattlecard(profile);
  if (profile.battlecard_json) return { ...base, ...safeParse(profile.battlecard_json) };
  return { ...base, ...(profile.battlecard || {}) };
}

export function toEntityRecord(profile) {
  return {
    company_name: profile.company_name, website: profile.website, headquarters: profile.headquarters, founded_year: profile.founded_year,
    years_in_business: new Date().getFullYear() - (profile.founded_year || new Date().getFullYear()),
    category: profile.category, is_legacy: profile.is_legacy, is_ai_native: profile.is_ai_native,
    funding_status: profile.funding_status, estimated_employee_count: profile.estimated_employee_count,
    primary_market: profile.primary_market, target_customers: profile.target_customers, target_personas: profile.target_personas,
    industries: profile.industries, geographic_focus: profile.geographic_focus, primary_value_proposition: profile.primary_value_proposition,
    primary_products: profile.primary_products, core_capabilities: profile.core_capabilities, ai_capabilities: profile.ai_capabilities,
    assessment_capabilities: profile.assessment_capabilities, coaching_capabilities: profile.coaching_capabilities,
    simulation_capabilities: profile.simulation_capabilities, analytics: profile.analytics, enterprise_features: profile.enterprise_features,
    integrations: profile.integrations, deployment_model: profile.deployment_model, security_compliance: profile.security_compliance,
    pricing_model: profile.pricing_model, pricing_model_type: profile.pricing_model_type, public_pricing: profile.public_pricing,
    has_free_tier: !!profile.has_free_tier, has_trial: !!profile.has_trial, annual_discounts: profile.annual_discounts,
    pricing_last_verified: profile.pricing_last_verified, enterprise_sales_motion: profile.enterprise_sales_motion,
    public_customers: profile.public_customers, partnerships: profile.partnerships, strengths: profile.strengths, limitations: profile.limitations,
    recent_announcements: profile.recent_announcements, strategic_notes: profile.strategic_notes, public_sources: profile.public_sources,
    last_reviewed: profile.last_reviewed, confidence_level: profile.confidence_level,
    feature_matrix_json: JSON.stringify(profile.feature_matrix || {}),
    positioning_json: profile.positioning ? JSON.stringify(profile.positioning) : "{}",
    battlecard_json: profile.battlecard ? JSON.stringify(profile.battlecard) : "{}",
  };
}