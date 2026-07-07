// Dynamic Company Marketplace engine
// Derives marketplace collections from the Company Intelligence database.
// Every approved company automatically becomes a marketplace collection
// with 14 resource types — no manual sync required.

export const COMPANY_CATEGORIES = [
  "Technology", "Cloud", "Consulting", "Financial Services", "Healthcare",
  "Government", "Manufacturing", "Retail", "Telecommunications", "Energy",
  "Education", "Logistics", "Airlines", "Automotive", "Media",
];

export const SEARCH_DIMENSIONS = [
  { key: "name", label: "Company Name" },
  { key: "industry", label: "Industry" },
  { key: "technology_stack", label: "Technology" },
  { key: "country", label: "Country" },
  { key: "leadership_style", label: "Leadership Style" },
  { key: "cloud_provider", label: "Cloud Provider" },
  { key: "executive_level_focus", label: "Executive Role" },
];

export const RESOURCE_TYPES = [
  {
    key: "leadership_playbooks",
    label: "Leadership Playbooks",
    icon: "📋",
    description: "Leadership principles & behavioral frameworks",
    module: "Company Intelligence",
    countFrom: (c) => (c.leadership_principles?.length || 0) + (c.executive_behaviors?.length || 0) + (c.leadership_competencies?.length || 0),
    route: (c) => `/companies/${c.id}`,
  },
  {
    key: "executive_learning_paths",
    label: "Executive Learning Paths",
    icon: "🎓",
    description: "Curated courses, books & learning journeys",
    module: "Executive Academy",
    countFrom: (c) => (c.learning_recommendations?.length || 0) + (c.recommended_courses?.length || 0) + (c.recommended_books?.length || 0),
    route: () => `/academy`,
  },
  {
    key: "interview_packs",
    label: "Interview Packs",
    icon: "🎯",
    description: "Company interview questions & expectations",
    module: "Executive Simulator",
    countFrom: (c) => (c.common_interview_questions?.length || 0) + (c.interview_style ? 3 : 0),
    route: (c) => `/simulator?company=${encodeURIComponent(c.name)}`,
  },
  {
    key: "resume_templates",
    label: "Resume Templates",
    icon: "📄",
    description: "Executive resume insights & expectations",
    module: "Resume Intelligence",
    countFrom: (c) => (c.executive_resume_insights ? 5 : 0),
    route: (c) => `/resume?company=${encodeURIComponent(c.name)}`,
  },
  {
    key: "executive_coach_context",
    label: "Executive Coach Context",
    icon: "🤖",
    description: "AI coach trained on company leadership culture",
    module: "AI Executive Coach",
    countFrom: (c) => [c.leadership_style, c.corporate_culture, c.mission, c.vision].filter(Boolean).length,
    route: (c) => `/coach?company=${encodeURIComponent(c.name)}`,
  },
  {
    key: "executive_simulator_scenarios",
    label: "Executive Simulator Scenarios",
    icon: "🎮",
    description: "Scenarios from transformation initiatives",
    module: "Executive Simulator",
    countFrom: (c) => (c.transformation_initiatives?.length || 0) + (c.executive_case_studies?.length || 0),
    route: (c) => `/simulator?company=${encodeURIComponent(c.name)}`,
  },
  {
    key: "leadership_dna_benchmarks",
    label: "Leadership DNA Benchmarks",
    icon: "🧬",
    description: "Competency benchmarks & expectations",
    module: "Leadership DNA",
    countFrom: (c) => (c.leadership_competencies?.length || 0) + (c.executive_expectations?.length || 0),
    route: () => `/leadership-dna`,
  },
  {
    key: "organization_intelligence",
    label: "Organization Intelligence",
    icon: "🏢",
    description: "Structure, culture, strategy & positioning",
    module: "Company Intelligence",
    countFrom: (c) => [c.organizational_structure, c.business_model, c.global_presence, c.competitive_position, c.risk_profile, c.hiring_practices].filter(Boolean).length,
    route: (c) => `/companies/${c.id}`,
  },
  {
    key: "ai_transformation_guides",
    label: "AI Transformation Guides",
    icon: "🚀",
    description: "AI, digital & cloud transformation strategies",
    module: "Company Intelligence",
    countFrom: (c) => [c.ai_strategy, c.digital_transformation_strategy, c.cloud_strategy].filter(Boolean).length,
    route: (c) => `/companies/${c.id}`,
  },
  {
    key: "executive_case_studies",
    label: "Executive Case Studies",
    icon: "📖",
    description: "Real-world case studies & acquisitions",
    module: "Company Intelligence",
    countFrom: (c) => (c.executive_case_studies?.length || 0) + (c.major_acquisitions?.length || 0),
    route: (c) => `/companies/${c.id}`,
  },
  {
    key: "presentation_templates",
    label: "Presentation Templates",
    icon: "📊",
    description: "Board-ready presentation frameworks",
    module: "Career Studio",
    countFrom: (c) => (c.board_expectations ? 4 : 0),
    route: () => `/career-studio`,
  },
  {
    key: "executive_frameworks",
    label: "Executive Frameworks",
    icon: "🏗️",
    description: "Strategic frameworks & career path models",
    module: "Company Intelligence",
    countFrom: (c) => (c.career_paths?.length || 0) + (c.strategic_priorities ? 2 : 0) + (c.core_values?.length || 0),
    route: (c) => `/companies/${c.id}`,
  },
  {
    key: "executive_certificates",
    label: "Executive Certificates",
    icon: "📜",
    description: "Recommended certifications for career paths",
    module: "Executive Academy",
    countFrom: (c) => (c.recommended_certifications?.length || 0),
    route: () => `/academy`,
  },
  {
    key: "marketplace_bundles",
    label: "Marketplace Bundles",
    icon: "📦",
    description: "Complete executive bundle for this organization",
    module: "Marketplace",
    countFrom: () => 1,
    route: null,
  },
];

const BRAND_COLORS = ["#6366f1", "#06b6d4", "#a855f7", "#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];

export function getBrandColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (name || "").charCodeAt(i) + ((hash << 5) - hash);
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
}

export function normalizeCategory(company) {
  const cat = (company.category || "").toLowerCase();
  const ind = (company.industry || "").toLowerCase();
  for (const c of COMPANY_CATEGORIES) {
    const key = c.toLowerCase();
    if (cat.includes(key) || ind.includes(key)) return c;
  }
  // Synonym matching
  const synonyms = {
    "Financial Services": ["finance", "bank", "insurance", "investment"],
    "Technology": ["software", "it ", "tech", "saas"],
    "Telecommunications": ["telecom", "telco"],
    "Automotive": ["auto", "vehicle", "car"],
  };
  for (const [catName, keys] of Object.entries(synonyms)) {
    if (keys.some(k => cat.includes(k) || ind.includes(k))) return catName;
  }
  return "Other";
}

export function getCollectionPricing(company) {
  const hasRanking = !!(company.fortune_ranking || company.forbes_ranking || company.global_ranking);
  const isFree = !hasRanking;
  return {
    isFree,
    isPaid: !isFree,
    enterpriseIncluded: true,
    price: isFree ? 0 : 49,
  };
}

export function isCollectionOwned(company, ownedCollectionNames, isEnterprise) {
  if (isEnterprise) return true;
  return ownedCollectionNames?.has(company.name) || false;
}

export function isFeatured(company) {
  return (
    (company.quality_score || 0) >= 80 ||
    !!company.fortune_ranking ||
    company.profile_status === "strategic_partner" ||
    company.profile_status === "official_partner" ||
    !!company.featured
  );
}

export function isNew(company) {
  if (!company.created_date) return false;
  const days = (Date.now() - new Date(company.created_date).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 30;
}

export function getTotalResources(company) {
  return RESOURCE_TYPES.reduce((sum, rt) => sum + (rt.countFrom(company) || 0), 0);
}

export function buildCollection(company, ownedCollectionNames, isEnterprise) {
  const pricing = getCollectionPricing(company);
  const owned = isCollectionOwned(company, ownedCollectionNames, isEnterprise);
  return {
    ...company,
    _category: normalizeCategory(company),
    _pricing: pricing,
    _owned: owned,
    _featured: isFeatured(company),
    _isNew: isNew(company),
    _resourceCount: getTotalResources(company),
    _brandColor: getBrandColor(company.name),
  };
}

export function searchCollections(collections, query) {
  if (!query?.trim()) return collections;
  const q = query.toLowerCase();
  return collections.filter((c) => {
    const fields = [
      c.name,
      c.industry,
      c.country,
      c.leadership_style,
      c.cloud_provider,
      c.executive_level_focus,
      ...(c.technology_stack || []),
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return fields.some((f) => f.includes(q));
  });
}

export function filterCollections(collections, filters) {
  return collections.filter((c) => {
    if (filters.category && filters.category !== "All" && c._category !== filters.category) return false;
    if (filters.industry && filters.industry !== "All" && c.industry !== filters.industry) return false;
    if (filters.country && filters.country !== "All" && c.country !== filters.country) return false;
    if (filters.resourceType && filters.resourceType !== "All") {
      const rt = RESOURCE_TYPES.find((r) => r.key === filters.resourceType);
      if (rt && (rt.countFrom(c) || 0) === 0) return false;
    }
    if (filters.access === "owned" && !c._owned) return false;
    if (filters.access === "not_owned" && c._owned) return false;
    if (filters.price === "free" && !c._pricing.isFree) return false;
    if (filters.price === "paid" && !c._pricing.isPaid) return false;
    if (filters.price === "enterprise" && !c._pricing.enterpriseIncluded) return false;
    return true;
  });
}

export function getUniqueValues(collections, field) {
  const vals = new Set();
  collections.forEach((c) => { if (c[field]) vals.add(c[field]); });
  return ["All", ...Array.from(vals).sort()];
}