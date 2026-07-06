import { base44 } from "@/api/base44Client";

/**
 * Company Context Engine
 * ----------------------
 * Builds a rich intelligence brief from the user's target company profile and
 * caches it module-level so every AI call (via callAI) automatically adapts
 * coaching, simulations, debates, resume analysis, academy lessons, and the
 * executive council to that company's culture and leadership expectations.
 */

let _cachedContext = "";

export const setCachedCompanyContext = (ctx) => {
  _cachedContext = ctx || "";
};

export const getCachedCompanyContext = () => _cachedContext;

export const buildCompanyContext = (company) => {
  if (!company) return "";
  const parts = [`TARGET COMPANY INTELLIGENCE — ${company.name}`];
  const line = (label, val) => {
    if (val) parts.push(`${label}: ${val}`);
  };

  line("Industry", company.industry);
  line("Headquarters", company.headquarters);
  line("CEO", company.ceo);
  line("Company Size", company.company_size);
  line("Business Model", company.business_model);
  line("Corporate Culture", company.corporate_culture);
  line("Leadership Style", company.leadership_style);

  if (company.core_values?.length) parts.push(`Core Values: ${company.core_values.join("; ")}`);
  if (company.leadership_principles?.length) parts.push(`Leadership Principles: ${company.leadership_principles.join("; ")}`);
  if (company.leadership_competencies?.length) parts.push(`Leadership Competencies Expected: ${company.leadership_competencies.join("; ")}`);
  if (company.executive_expectations?.length) parts.push(`Executive Expectations: ${company.executive_expectations.join("; ")}`);

  line("Interview Style", company.interview_style);
  if (company.common_interview_questions?.length) parts.push(`Common Interview Questions: ${company.common_interview_questions.join(" | ")}`);

  if (company.technology_stack?.length) parts.push(`Technology Stack: ${company.technology_stack.join(", ")}`);
  line("AI Strategy", company.ai_strategy);
  line("Digital Transformation", company.digital_transformation_strategy);
  line("Cloud Strategy", company.cloud_strategy);
  if (company.competitors?.length) parts.push(`Competitors: ${company.competitors.join(", ")}`);
  line("Sustainability", company.sustainability_initiatives);
  line("Diversity & Inclusion", company.diversity_inclusion);

  if (company.learning_paths_json) {
    try {
      const lp = JSON.parse(company.learning_paths_json);
      if (lp.executive_interview_preparation) parts.push(`Interview Preparation: ${lp.executive_interview_preparation}`);
      if (lp.communication_style) parts.push(`Communication Style: ${lp.communication_style}`);
      if (lp.presentation_style) parts.push(`Presentation Style: ${lp.presentation_style}`);
      if (lp.executive_behaviors?.length) parts.push(`Executive Behaviors: ${lp.executive_behaviors.join("; ")}`);
      if (lp.recommended_certifications?.length) parts.push(`Recommended Certifications: ${lp.recommended_certifications.join(", ")}`);
    } catch (e) {}
  }

  parts.push(
    `PERSONALIZATION DIRECTIVE: Tailor your advice, scenarios, questions, examples, and feedback to ${company.name}'s culture, leadership principles, interview style, and strategic priorities. Reference their specific values, competencies, and expectations where relevant so the user sounds like an insider who understands ${company.name}.`
  );

  return parts.join("\n");
};

export const fetchTargetCompany = async (profile) => {
  const name = profile?.target_company;
  if (!name) return null;
  try {
    const list = await base44.entities.Company.filter({ name, status: "approved" }, "name", 5);
    return list[0] || null;
  } catch (e) {
    return null;
  }
};