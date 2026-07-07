import { base44 } from "@/api/base44Client";

// ============================================================
// COMPANY INTELLIGENCE — AI ENRICHMENT & NATURAL LANGUAGE SEARCH
// ============================================================

const ENRICHMENT_SCHEMA = {
  type: "object",
  properties: {
    mission: { type: "string" },
    vision: { type: "string" },
    core_values: { type: "array", items: { type: "string" } },
    leadership_principles: { type: "array", items: { type: "string" } },
    corporate_culture: { type: "string" },
    business_model: { type: "string" },
    technology_stack: { type: "array", items: { type: "string" } },
    major_products: { type: "array", items: { type: "string" } },
    services: { type: "array", items: { type: "string" } },
    competitors: { type: "array", items: { type: "string" } },
    global_presence: { type: "string" },
    organizational_structure: { type: "string" },
    interview_style: { type: "string" },
    executive_expectations: { type: "array", items: { type: "string" } },
    leadership_competencies: { type: "array", items: { type: "string" } },
    executive_behaviors: { type: "array", items: { type: "string" } },
    digital_transformation_strategy: { type: "string" },
    ai_strategy: { type: "string" },
    cloud_strategy: { type: "string" },
    sustainability_initiatives: { type: "string" },
    diversity_inclusion: { type: "string" },
    common_interview_questions: { type: "array", items: { type: "string" } },
    executive_case_studies: { type: "array", items: { type: "string" } },
    executive_resume_insights: { type: "string" },
    board_expectations: { type: "string" },
    transformation_initiatives: { type: "array", items: { type: "string" } },
    major_acquisitions: { type: "array", items: { type: "string" } },
    technology_landscape: { type: "string" },
    competitive_position: { type: "string" },
    risk_profile: { type: "string" },
    hiring_practices: { type: "string" },
    leadership_style: { type: "string" },
    executive_level_focus: { type: "string" },
    salary_benchmarks: { type: "string" },
    benefits: { type: "array", items: { type: "string" } },
    growth_potential: { type: "string" },
    career_opportunities: { type: "string" },
    promotion_expectations: { type: "string" },
    learning_recommendations: { type: "array", items: { type: "string" } },
    career_paths: { type: "array", items: { type: "string" } },
    recommended_certifications: { type: "array", items: { type: "string" } },
    recommended_books: { type: "array", items: { type: "string" } },
    strategic_priorities: { type: "string" },
    description: { type: "string" },
    leadership_team: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
        },
      },
    },
  },
};

/**
 * Enrich a company with full executive intelligence using AI + web search.
 * Returns the enriched data object ready to merge into the Company entity.
 */
export async function enrichCompany(company) {
  const prompt = `You are an executive intelligence analyst. Provide a comprehensive executive intelligence profile for ${company.name}.

Known data:
- Industry: ${company.industry || "Unknown"}
- Headquarters: ${company.headquarters || "Unknown"}
- CEO: ${company.ceo || "Unknown"}
- Company Type: ${company.company_type || "Unknown"}
- Employees: ${company.employee_count || "Unknown"}
- Stock Symbol: ${company.stock_symbol || "N/A"}

Use your knowledge and web search to provide accurate, current, and detailed information for every field. For executive interview questions, provide 5-8 real questions that ${company.name} would ask executive candidates. For case studies, reference real initiatives. Be specific and actionable — this is used by executives preparing for interviews and strategic decisions at or about ${company.name}.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: "gemini_3_flash",
    add_context_from_internet: true,
    response_json_schema: ENRICHMENT_SCHEMA,
  });

  // Extract leadership_team and convert to JSON string
  const { leadership_team, ...fields } = result;
  const enriched = { ...fields };
  if (leadership_team?.length) {
    enriched.leadership_team_json = JSON.stringify(leadership_team);
  }

  return enriched;
}

/**
 * Check if a company has been enriched (has executive intelligence fields populated).
 */
export function isEnriched(company) {
  return !!(company?.mission && company?.interview_style && company?.ai_strategy);
}

// ============================================================
// NATURAL LANGUAGE SEARCH
// ============================================================

const NL_SEARCH_SCHEMA = {
  type: "object",
  properties: {
    matched_company_names: {
      type: "array",
      items: { type: "string" },
      description: "Exact company names from the provided list that match the query",
    },
    reasoning: { type: "string", description: "Brief explanation of the matching logic" },
  },
};

/**
 * Natural language search across the company database.
 * Uses AI to interpret queries like "top AI companies" or "companies hiring CIOs".
 * @param {string} query - Natural language search query
 * @param {Array} allCompanies - All company records from the database
 * @returns {Array} - Matching company records
 */
export async function naturalLanguageSearch(query, allCompanies) {
  if (!query?.trim() || !allCompanies?.length) return [];

  const companyList = allCompanies
    .map((c) => `- ${c.name} (${c.industry || "Unknown"}, ${c.country || "Unknown"}, ${c.tags?.join("/") || c.category || ""})`)
    .join("\n");

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a company intelligence search engine. A user searched for: "${query}"

Here is the database of companies:
${companyList}

Return the company names (exact match from the list above) that best match the user's natural language query. Consider industry, technology, hiring practices, AI strategy, cloud provider, culture, and any other relevant attributes. Return up to 20 matches. Only return company names that exist in the list above.`,
    model: "gemini_3_flash",
    add_context_from_internet: true,
    response_json_schema: NL_SEARCH_SCHEMA,
  });

  const matchedNames = result?.matched_company_names || [];
  const nameSet = new Set(matchedNames.map((n) => n.toLowerCase().trim()));
  return allCompanies.filter((c) => nameSet.has(c.name.toLowerCase().trim()));
}

/**
 * Quick local search — filters companies by text match across key fields.
 * Used for instant search (no AI call needed).
 */
export function localSearch(companies, query) {
  if (!query?.trim()) return companies;
  const q = query.toLowerCase();
  return companies.filter((c) => {
    return (
      c.name?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q) ||
      c.headquarters?.toLowerCase().includes(q) ||
      c.ceo?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q)) ||
      c.technology_stack?.some((t) => t.toLowerCase().includes(q)) ||
      c.cloud_provider?.toLowerCase().includes(q)
    );
  });
}