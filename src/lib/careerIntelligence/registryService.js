/**
 * Career Intelligence Service™
 * ============================================================
 * Single service layer that resolves all registry selections
 * into a unified Career Intelligence Profile™.
 *
 * This is the bridge between the Master Registries and
 * Executive Coach™, Leadership DNA™, Executive Simulator™,
 * Resume Intelligence™, and Career Studio™.
 */
import { getCompanyById, getCompanyByName } from "./companyRegistry";
import { getRoleById, getRoleByTitle } from "./roleRegistry";
import { getIndustryById, getIndustryByName } from "./industryRegistry";
import { getCountryCareerData } from "./countryRegistry";
import { computeSalaryBenchmark, formatSalary } from "./salaryBenchmarkRegistry";

/**
 * Resolves the full Career Intelligence Profile™ from form data.
 * Looks up company, role, industry, country, and salary benchmarks.
 */
export function resolveCareerIntelligence(form) {
  if (!form) return null;

  const company = getCompanyByName(form.target_company) || null;
  const role = getRoleByTitle(form.target_role) || null;
  const industry = getIndustryByName(form.preferred_industry) || getIndustryByName(company?.industry) || null;
  const countryData = getCountryCareerData(form.target_country);

  const salaryBenchmark = role
    ? computeSalaryBenchmark(role.id, form.target_country, form.preferred_industry || company?.industry, form.expected_salary)
    : null;

  // EXEC™ Personalization Context — consumed by AI modules
  const execContext = {
    target_company: company?.name || form.target_company,
    target_role: role?.title || form.target_role,
    industry: industry?.name || form.preferred_industry,
    country: form.target_country,
    leadership_style: company?.leadership_style || "General Executive",
    interview_style: company?.interview_style || "Behavioral",
    technology_stack: company?.technology || [],
    executive_competencies: role?.competencies || company?.executive_competencies || [],
    recommended_certifications: [
      ...(role?.recommended_certifications || []),
      ...(company?.recommended_certifications || []),
    ].filter((v, i, a) => a.indexOf(v) === i), // dedupe
    recommended_learning_paths: [
      ...(role?.recommended_courses || []),
      ...(company?.recommended_learning_paths || []),
    ].filter((v, i, a) => a.indexOf(v) === i),
    promotion_path: role?.promotion_path || "",
    promotion_expectations: company?.promotion_expectations || "",
    leadership_behaviors: role?.leadership_behaviors || [],
    ai_persona: role?.ai_persona_mapping || "strategic_leader",
    industry_challenges: industry?.leadership_challenges || [],
    industry_growth: industry?.growth_outlook || "Moderate",
    market_demand: countryData.market_demand,
    remote_work_index: countryData.remote_work_index,
    leadership_culture: countryData.leadership_culture,
    salary_range: salaryBenchmark
      ? `${formatSalary(salaryBenchmark.min)} – ${formatSalary(salaryBenchmark.max)}`
      : "Not available",
    market_position: salaryBenchmark?.marketPosition || "Not specified",
  };

  // Career Intelligence Panel™ data
  const intelligence = {
    target_company: company?.name || form.target_company,
    target_role: role?.title || form.target_role,
    industry: industry?.name || form.preferred_industry,
    country: form.target_country,
    estimated_salary_range: salaryBenchmark
      ? `${formatSalary(salaryBenchmark.min)} – ${formatSalary(salaryBenchmark.max)}`
      : "Not available",
    market_demand: countryData.market_demand,
    executive_readiness: 0, // populated by Executive Readiness™ module
    promotion_readiness: 0, // populated by Promotion Readiness™ module
    leadership_dna_match: 0, // populated by Leadership DNA™ module
    recommended_learning_path: execContext.recommended_learning_paths,
    recommended_certifications: execContext.recommended_certifications,
    recommended_exec_coach: `EXEC™ Coach (${execContext.ai_persona})`,
    company_intelligence_available: company?.company_intelligence_available || false,
    interview_readiness: 0, // populated by Interview Simulator™
    exec_recommendation: generateExecRecommendation(company, role, industry, countryData, salaryBenchmark, form),
  };

  return {
    company,
    role,
    industry,
    countryData,
    salaryBenchmark,
    execContext,
    intelligence,
  };
}

function generateExecRecommendation(company, role, industry, countryData, salaryBenchmark, form) {
  if (!company && !role) {
    return "Select a target company and role to unlock your personalized executive development plan.";
  }

  const parts = [];

  if (company) {
    parts.push(`Your target is ${company.name} (${company.industry}). EXEC™ will personalize coaching around their ${company.leadership_style.toLowerCase()} leadership style and ${company.interview_style.toLowerCase()} interview process.`);
  }

  if (role) {
    parts.push(`As a ${role.title}, focus on developing: ${role.competencies.slice(0, 3).join(", ")}.`);
  }

  if (industry) {
    parts.push(`The ${industry.name} industry shows ${industry.growth_outlook.toLowerCase()}. Key challenges: ${industry.leadership_challenges.slice(0, 2).join(" & ")}.`);
  }

  if (salaryBenchmark?.marketPosition && salaryBenchmark.marketPosition !== "Not specified") {
    parts.push(`Your salary expectation is ${salaryBenchmark.marketPosition.toLowerCase()} (range: ${formatSalary(salaryBenchmark.min)}–${formatSalary(salaryBenchmark.max)}).`);
  }

  return parts.join(" ");
}

/**
 * Returns a lightweight summary for the Profile sidebar.
 */
export function getCareerIntelligenceSummary(form) {
  const ci = resolveCareerIntelligence(form);
  if (!ci) return null;
  return {
    hasCompany: !!ci.company,
    hasRole: !!ci.role,
    hasIndustry: !!ci.industry,
    hasSalary: !!form.expected_salary,
    hasCountry: !!form.target_country,
    completeness: calculateCompleteness(ci, form),
  };
}

function calculateCompleteness(ci, form) {
  let score = 0;
  const checks = [
    !!ci.company,
    !!ci.role,
    !!ci.industry,
    !!form.target_country,
    !!form.expected_salary,
    !!form.work_preference,
  ];
  score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return score;
}