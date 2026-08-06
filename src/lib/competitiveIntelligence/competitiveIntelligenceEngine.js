// Enterprise Market Intelligence Platform™ V2 — evidence-based internal research.
// Public information only. Never invents capabilities or pricing.

export const FEATURE_ROWS = [
  { key: "executive_readiness", label: "Executive Readiness™" },
  { key: "leadership_dna", label: "Leadership DNA™" },
  { key: "executive_simulator", label: "Executive Simulator™" },
  { key: "executive_council", label: "Executive Council™" },
  { key: "ai_debate", label: "AI Debate™" },
  { key: "career_studio", label: "Career Studio™" },
  { key: "promotion_readiness", label: "Promotion Readiness™" },
  { key: "succession_planning", label: "Succession Planning™" },
  { key: "leadership_analytics", label: "Leadership Analytics™" },
  { key: "executive_identity", label: "Executive Identity™" },
  { key: "executive_portfolio", label: "Executive Portfolio™" },
  { key: "decision_intelligence", label: "Decision Intelligence™" },
  { key: "executive_assessments", label: "Executive Assessments™" },
  { key: "ai_coaching", label: "AI Coaching™" },
  { key: "enterprise_dashboard", label: "Enterprise Dashboard™" },
  { key: "trust_center", label: "Trust Center™" },
  { key: "security", label: "Security" },
  { key: "sso", label: "SSO" },
  { key: "scim", label: "SCIM" },
  { key: "api", label: "API" },
  { key: "marketplace", label: "Marketplace" },
  { key: "knowledge_management", label: "Knowledge Management" },
  { key: "evidence_ledger", label: "Evidence Ledger™" },
];

export const STATUS_META = {
  "Supported": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  "Publicly Confirmed": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  "Planned": { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25", dot: "bg-indigo-400" },
  "Partially Supported": { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", dot: "bg-sky-400" },
  "Unknown": { color: "text-white/40", bg: "bg-white/5", border: "border-white/10", dot: "bg-white/30" },
  "Not Publicly Documented": { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", dot: "bg-amber-400" },
};

export const EXECLEAD_AI_MATRIX = {
  executive_readiness: "Supported", leadership_dna: "Supported", executive_simulator: "Supported",
  executive_council: "Supported", ai_debate: "Supported", career_studio: "Supported",
  promotion_readiness: "Supported", succession_planning: "Supported", leadership_analytics: "Supported",
  executive_identity: "Supported", executive_portfolio: "Supported", decision_intelligence: "Supported",
  executive_assessments: "Supported", ai_coaching: "Supported", enterprise_dashboard: "Supported",
  trust_center: "Supported", security: "Supported", sso: "Supported", scim: "Supported", api: "Planned",
  marketplace: "Supported", knowledge_management: "Supported", evidence_ledger: "Supported",
};

const NPD = "Not Publicly Documented";

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
    feature_matrix: { ai_coaching: "Supported", executive_assessments: "Supported", leadership_analytics: "Supported", enterprise_dashboard: "Supported", sso: "Supported", marketplace: "Supported" },
    positioning: { who_buys: "CHROs and People leaders", why: "Workforce coaching at scale", primary_problem: "Behavioral change and wellbeing", ideal_customer: "Large enterprises", core_differentiator: "Coaching marketplace scale", enterprise_position: "Workforce wellbeing partner", ai_strategy: "AI-assisted matching", go_to_market: "Top-down enterprise sales", leadership_philosophy: "Behavioral change", commercial_motion: "Per-seat", execlead_advantage: "Executive operating system vs. coaching delivery", potential_risks: "Brand + workforce coaching footprint", opportunity_areas: "Executive development up-market", category_competitor_owns: "Workforce coaching & wellbeing", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "Coaching delivery", unique: "Executive Readiness™, simulations, succession", compete_directly: "Only for executive outcomes", ignore_market: "Broad workforce wellbeing", unmet_need: "Unified executive readiness & succession intelligence", execlead_differentiation: "Operating system vs. coaching marketplace", competitive_opportunity: "Executive outcomes differentiation", competitive_risk: "Brand and workforce coaching footprint" },
    battlecard: { executive_summary: "Established coaching platform for behavioral change and wellbeing at scale.", ideal_customer: "Large enterprises seeking workforce coaching", buying_signals: "RFPs for wellbeing/coaching programs", discovery_questions: "Do you need executive readiness, succession, and decision intelligence — or workforce coaching?", typical_objections: "We already have a coaching vendor", execlead_differentiation: "Executive Readiness™, simulations, succession, decision intelligence, evidence-based identity.", competitive_risks: "Brand awareness, large coaching network", when_execlead_wins: "When the buyer needs executive readiness, succession, simulations", when_competitor_wins: "When the primary need is broad workforce wellbeing coaching", recommended_demo: "Executive Readiness Assessment™, Leadership Simulations™", proof_points: "Executive Readiness™ scores, Success Stories, Trust Center™", executive_messaging: "Executive operating system, not a coaching marketplace", closing_strategy: "Pivot from coaching to executive outcomes and succession intelligence", when_customers_choose: "When buyers want broad workforce coaching and wellbeing programs", questions_to_ask: "Do you need executive readiness, succession, and decision intelligence — or workforce coaching?", execlead_strengths: "Executive Readiness™, simulations, succession, decision intelligence, evidence-based identity.", differentiation: "EXECLEAD.AI is an Executive Leadership Operating System, not a coaching marketplace." },
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
    positioning: { who_buys: "HR and L&D", why: "Scalable multilingual coaching", primary_problem: "Coaching delivery at scale", ideal_customer: "Mid-market and enterprises", core_differentiator: "Global multilingual coach pool", enterprise_position: "Digital coaching delivery", ai_strategy: "AI coaching assistant", go_to_market: "Enterprise sales", leadership_philosophy: "Coaching-led development", commercial_motion: "Per-seat", execlead_advantage: "Executive operating system vs. coaching marketplace", potential_risks: "Global multilingual coaching reach", opportunity_areas: "Executive outcomes differentiation", category_competitor_owns: "Digital coaching delivery", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "Coaching delivery", unique: "Executive Readiness™, simulations, succession", compete_directly: "Only for executive outcomes", ignore_market: "Coaching delivery only", unmet_need: "Executive readiness & succession intelligence", execlead_differentiation: "Operating system vs. coaching marketplace", competitive_opportunity: "Executive outcomes differentiation", competitive_risk: "Global multilingual coaching reach" },
    battlecard: { executive_summary: "Digital coaching platform with a global coach pool.", ideal_customer: "Mid-market and enterprises", buying_signals: "Coaching RFPs", discovery_questions: "Coaching delivery or a full executive readiness and succession system?", typical_objections: "We need multilingual coaching", execlead_differentiation: "Operating system for executive leadership vs. a coaching marketplace.", competitive_risks: "Global multilingual coaching reach", when_execlead_wins: "When executive readiness, succession, and simulations are the priority", when_competitor_wins: "When multilingual coaching delivery across regions is the priority", recommended_demo: "Executive Readiness Assessment™, Simulations", proof_points: "Readiness scores, Success Stories", executive_messaging: "Executive operating system, not coaching delivery", closing_strategy: "Focus on executive outcomes and succession", when_customers_choose: "When buyers want scalable multilingual coaching delivery", questions_to_ask: "Do you need coaching delivery or a full executive readiness and succession system?", execlead_strengths: "Executive Readiness™, simulations, succession, decision intelligence.", differentiation: "Operating system for executive leadership vs. a coaching marketplace." },
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
    feature_matrix: { ai_coaching: "Supported", leadership_analytics: "Supported" },
    positioning: { who_buys: "People and team leaders", why: "AI-native team development", primary_problem: "Team development", ideal_customer: "Enterprises and mid-market", core_differentiator: "AI-native UX", enterprise_position: "AI-native team development", ai_strategy: "AI-native facilitation", go_to_market: "Product-led", leadership_philosophy: "AI-guided team growth", commercial_motion: "Subscription", execlead_advantage: "Executive operating system vs. team tooling", potential_risks: "AI-native UX narrative", opportunity_areas: "Enterprise governance & executive outcomes", category_competitor_owns: "AI-native team development", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "AI coaching", unique: "Executive Readiness™, succession, simulations", compete_directly: "Only for executive outcomes", ignore_market: "Team-level development only", unmet_need: "Executive-level readiness & succession", execlead_differentiation: "Executive operating system vs. team tooling", competitive_opportunity: "Enterprise governance & executive outcomes", competitive_risk: "AI-native UX narrative" },
    battlecard: { executive_summary: "AI-native team and leadership development platform.", ideal_customer: "People leaders and team managers", buying_signals: "Team development initiatives", discovery_questions: "Team development or executive readiness and succession?", typical_objections: "We want AI-native tools", execlead_differentiation: "Executive operating system vs. team development tooling.", competitive_risks: "AI-native UX narrative", when_execlead_wins: "When executive readiness and succession are needed", when_competitor_wins: "When team-level development is the primary scope", recommended_demo: "Executive Readiness Assessment™, Simulations", proof_points: "Readiness scores, Success Stories", executive_messaging: "Executive operating system, not team tooling", closing_strategy: "Lead with executive outcomes and governance", when_customers_choose: "When buyers want AI-native team development", questions_to_ask: "Do you need team development or executive readiness and succession intelligence?", execlead_strengths: "Executive Readiness™, succession, simulations, decision intelligence.", differentiation: "Executive operating system vs. team development tooling." },
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
    feature_matrix: { ai_coaching: "Supported", career_studio: "Supported" },
    positioning: { who_buys: "Individuals and SMBs", why: "Affordable daily AI coaching", primary_problem: "Personal coaching access", ideal_customer: "Individuals, SMBs", core_differentiator: "Mobile-first AI coaching", enterprise_position: "Personal coaching", ai_strategy: "Conversational AI coaching", go_to_market: "Self-serve / mobile", leadership_philosophy: "Daily habits", commercial_motion: "Freemium", execlead_advantage: "Enterprise executive operating system vs. personal app", potential_risks: "Accessible AI coaching UX", opportunity_areas: "Enterprise executive development", category_competitor_owns: "Personal AI coaching", category_execlead_should_own: "AI Executive Leadership Operating System", overlap: "AI coaching", unique: "Enterprise readiness, succession, simulations, governance", compete_directly: "No (different buyer)", ignore_market: "Personal/SMB coaching apps", unmet_need: "Enterprise-grade executive development", execlead_differentiation: "Enterprise executive operating system vs. personal app", competitive_opportunity: "Enterprise executive development", competitive_risk: "Accessible AI coaching UX for individuals" },
    battlecard: { executive_summary: "Mobile-first AI coaching companion for individuals and SMBs.", ideal_customer: "Individuals and SMBs", buying_signals: "Personal coaching apps", discovery_questions: "Enterprise executive readiness or personal coaching?", typical_objections: "We want an affordable app", execlead_differentiation: "Enterprise-grade executive readiness, succession, simulations, governance.", competitive_risks: "Accessible AI coaching UX", when_execlead_wins: "When enterprise executive development is the need", when_competitor_wins: "When individual/SMB AI coaching is the need", recommended_demo: "Executive Readiness Assessment™, Enterprise governance", proof_points: "Readiness scores, Trust Center™", executive_messaging: "Enterprise executive operating system, not a personal app", closing_strategy: "Differentiate enterprise scope from personal coaching", when_customers_choose: "When individuals want affordable daily AI coaching", questions_to_ask: "Do you need enterprise executive readiness and succession — or personal coaching?", execlead_strengths: "Enterprise-grade executive readiness, succession, simulations, governance.", differentiation: "Enterprise executive operating system vs. personal coaching app." },
  },
  basic("Torch", "torch.io", "San Francisco, USA", 2015, "Legacy Coaching Platform", "Enterprise", "Leadership coaching and development for mid-market and enterprise.", { ai_coaching: NPD, executive_assessments: "Partially Supported", sso: "Supported" }, "Medium"),
  basic("Sounding Board", "soundingboard.com", "San Francisco, USA", 2013, "Legacy Coaching Platform", "Enterprise", "Coaching and leadership development platform.", { ai_coaching: NPD, executive_assessments: "Partially Supported", sso: "Supported" }, "Medium"),
  basic("Pluma", "pluma.co", "São Paulo, Brazil", 2016, "Legacy Coaching Platform", "Enterprise / SMB", "Coaching and leadership development for individuals and teams.", {}, "Low"),
  basic("Microsoft Viva", "learn.microsoft.com/viva", "Redmond, USA", 2021, "HCM-Embedded Learning", "Enterprise", "Employee learning app within Microsoft Viva.", { sso: "Supported", api: "Supported", enterprise_dashboard: "Supported" }, "High"),
  basic("Workday", "workday.com", "Pleasanton, USA", 2005, "HCM-Embedded Learning", "Enterprise", "HCM with talent and skills intelligence.", { leadership_analytics: "Supported", sso: "Supported", api: "Supported", succession_planning: "Partially Supported" }, "High"),
  basic("Cornerstone", "cornerstoneondemand.com", "Santa Monica, USA", 1999, "Learning Platform", "Enterprise", "Learning and talent management platform.", { sso: "Supported", api: "Supported", enterprise_dashboard: "Supported", security: "Supported" }, "High"),
  basic("Degreed", "degreed.com", "Pleasanton, USA", 2012, "Learning Platform", "Enterprise", "Skills and learning aggregation platform.", { leadership_analytics: "Supported", sso: "Supported", api: "Supported" }, "High"),
  basic("LinkedIn Learning", "learning.linkedin.com", "Sunnyvale, USA", 2015, "Learning Platform", "Enterprise / SMB", "Online learning library for professional skills.", { marketplace: "Supported", sso: "Supported", api: "Supported", leadership_analytics: "Supported" }, "High"),
  basic("Udemy Business", "business.udemy.com", "San Francisco, USA", 2010, "Learning Platform", "Enterprise / SMB", "Business learning marketplace.", { marketplace: "Supported", sso: "Supported" }, "High"),
  basic("Coursera Business", "coursera.org/business", "Mountain View, USA", 2012, "Learning Platform", "Enterprise", "Enterprise learning from university and industry content.", { marketplace: "Supported", sso: "Supported" }, "High"),
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

export function buildEvidenceMap(evidence) {
  const m = {};
  (evidence || []).forEach((e) => {
    const k = `${(e.competitor || "").toLowerCase()}::${e.capability}`;
    if (!m[k]) m[k] = [];
    m[k].push(e);
  });
  return m;
}

export function buildComparisonMatrix(competitors, evidence) {
  const evMap = buildEvidenceMap(evidence);
  return FEATURE_ROWS.map((row) => {
    const cells = { feature: row.label, key: row.key };
    cells["EXECLEAD.AI"] = { status: EXECLEAD_AI_MATRIX[row.key] || "Unknown", evidence: 0 };
    for (const c of competitors) {
      const m = getMatrix(c);
      const ev = evMap[`${c.company_name.toLowerCase()}::${row.key}`] || [];
      cells[c.company_name] = { status: m[row.key] || NPD, evidence: ev.length };
    }
    return cells;
  });
}

export function buildDashboard(competitors, evidence) {
  const total = competitors.length;
  const legacy = competitors.filter((c) => c.is_legacy).length;
  const aiNative = competitors.filter((c) => c.is_ai_native).length;
  const categories = {};
  competitors.forEach((c) => { categories[c.category] = (categories[c.category] || 0) + 1; });
  let leadFeatures = 0, gapFeatures = 0;
  const featureGaps = [];
  for (const row of FEATURE_ROWS) {
    const ours = EXECLEAD_AI_MATRIX[row.key];
    const anyCompSupported = competitors.some((c) => ["Supported", "Publicly Confirmed"].includes(getMatrix(c)[row.key]));
    if (ours === "Supported" && !anyCompSupported) leadFeatures++;
    if (ours !== "Supported" && anyCompSupported) { gapFeatures++; featureGaps.push(row.label); }
  }
  const differentiationScore = Math.round((leadFeatures / FEATURE_ROWS.length) * 100);
  const competitiveHealthScore = Math.min(100, differentiationScore + 20);
  const verifiedEvidence = (evidence || []).filter((e) => e.status === "verified").length;
  const enterpriseFeatures = ["sso", "scim", "security", "enterprise_dashboard", "trust_center"];
  const execleadEnterprise = enterpriseFeatures.filter((k) => EXECLEAD_AI_MATRIX[k] === "Supported").length;
  const avgCompEnterprise = competitors.length ? Math.round(competitors.reduce((a, c) => a + enterpriseFeatures.filter((k) => ["Supported", "Publicly Confirmed"].includes(getMatrix(c)[k])).length, 0) / competitors.length) : 0;
  return {
    competitiveHealthScore, marketCoverage: `${Object.keys(categories).length} segments tracked`, trackedCompetitors: total,
    legacyPlatforms: legacy, aiNativePlatforms: aiNative, categories,
    evidenceItems: (evidence || []).length, verifiedEvidence,
    differentiationScore, featureGapAlerts: featureGaps,
    enterpriseReadinessComparison: `EXECLEAD.AI ${execleadEnterprise}/${enterpriseFeatures.length} vs competitor avg ${avgCompEnterprise}/${enterpriseFeatures.length}`,
    marketTrendSummary: "Leadership development is consolidating toward AI-native, outcome-based executive operating systems; coaching and learning delivery are commoditizing.",
  };
}

export function generatePositioning(profile) {
  return {
    who_buys: profile.target_customers || NPD, why: profile.primary_value_proposition || NPD,
    primary_problem: NPD, ideal_customer: profile.target_customers || NPD,
    core_differentiator: profile.strengths || NPD, enterprise_position: profile.category || NPD,
    ai_strategy: profile.ai_capabilities || NPD, go_to_market: profile.enterprise_sales_motion || NPD,
    leadership_philosophy: NPD, commercial_motion: profile.pricing_model_type || NPD,
    execlead_advantage: "AI-native Executive Leadership Operating System: readiness, simulations, succession, decision intelligence.",
    potential_risks: profile.strengths || "Established market presence.", opportunity_areas: "Executive outcomes and enterprise governance.",
    category_competitor_owns: profile.category || NPD, category_execlead_should_own: "AI Executive Leadership Operating System",
    overlap: "Coaching and/or learning delivery.", unique: "Executive Readiness™, Succession Intelligence, Leadership Simulations, Decision Intelligence, Executive Identity™.",
    compete_directly: "Only when the buyer needs executive-level outcomes.", ignore_market: "Broad workforce wellbeing coaching and personal coaching apps.",
    unmet_need: "Unified, evidence-based executive readiness and succession intelligence.",
  };
}

export function getPositioning(profile) {
  if (!profile) return null;
  const base = generatePositioning(profile);
  if (profile.positioning_json) return { ...base, ...safeParse(profile.positioning_json) };
  return { ...base, ...(profile.positioning || {}) };
}

export function generateBattlecard(profile) {
  const vp = profile.primary_value_proposition || NPD;
  return {
    executive_summary: vp, ideal_customer: profile.target_customers || NPD, buying_signals: NPD,
    discovery_questions: "Do you need executive readiness, succession planning, and decision intelligence — or workforce coaching/learning? How do you measure leadership readiness today?",
    typical_objections: "We already have a coaching/learning vendor.",
    execlead_differentiation: "EXECLEAD.AI is an AI-native Executive Leadership Operating System: readiness, simulations, succession, decision intelligence.",
    competitive_risks: profile.strengths ? `Competitor strength: ${profile.strengths}` : "Established market presence.",
    when_execlead_wins: "When the buyer needs executive readiness, succession intelligence, and simulations — not just coaching or learning delivery.",
    when_competitor_wins: `When the buyer's primary need is ${(vp || "this competitor's core offering").toLowerCase()}.`,
    recommended_demo: "Executive Readiness Assessment™, Leadership Simulations™, Executive ROI Calculator™.",
    proof_points: "Executive Readiness™ scores, Executive Success Stories, Trust Center™.",
    executive_messaging: "Executive operating system, not a coaching or learning delivery tool.",
    closing_strategy: "Lead with Executive Readiness™, ROI Calculator, and enterprise governance. Avoid feature-by-feature comparison.",
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