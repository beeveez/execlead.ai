/**
 * Career Intelligence Context Cache™
 * ============================================================
 * Mirrors the Company Context Engine pattern: caches the resolved
 * Career Intelligence Profile™ (execContext) module-level so every
 * AI call via callAI automatically receives role, industry, country,
 * salary, and competency personalization.
 *
 * This complements companyContext.js — company context covers the
 * target company; career intelligence covers the target ROLE,
 * INDUSTRY, COUNTRY, and SALARY BENCHMARK dimensions.
 */
import { resolveCareerIntelligence } from "./registryService";

let _cachedContext = "";
let _cachedForm = null;

export const setCachedCareerIntelligenceForm = (form) => {
  _cachedForm = form;
  const execContext = form ? resolveCareerIntelligence(form)?.execContext : null;
  _cachedContext = buildCareerIntelligencePrompt(execContext);
};

export const getCachedCareerIntelligence = () => _cachedContext;

export const buildCareerIntelligencePrompt = (ctx) => {
  if (!ctx) return "";
  const parts = [`CAREER INTELLIGENCE PROFILE™`];
  const line = (label, val) => {
    if (val) parts.push(`${label}: ${val}`);
  };

  line("Target Role", ctx.target_role);
  line("Industry", ctx.industry);
  line("Target Country", ctx.country);
  line("AI Coaching Persona", ctx.ai_persona);

  if (ctx.executive_competencies?.length) {
    parts.push(`Executive Competencies for Target Role: ${ctx.executive_competencies.join("; ")}`);
  }
  if (ctx.leadership_behaviors?.length) {
    parts.push(`Expected Leadership Behaviors: ${ctx.leadership_behaviors.join("; ")}`);
  }
  if (ctx.industry_challenges?.length) {
    parts.push(`Industry Leadership Challenges: ${ctx.industry_challenges.join("; ")}`);
  }

  line("Industry Growth Outlook", ctx.industry_growth);
  line("Promotion Path", ctx.promotion_path);
  line("Promotion Expectations", ctx.promotion_expectations);

  if (ctx.recommended_certifications?.length) {
    parts.push(`Recommended Certifications: ${ctx.recommended_certifications.join(", ")}`);
  }
  if (ctx.recommended_learning_paths?.length) {
    parts.push(`Recommended Learning Paths: ${ctx.recommended_learning_paths.join(", ")}`);
  }

  line("Market Demand", ctx.market_demand);
  line("Remote Work Index", ctx.remote_work_index);
  line("Leadership Culture", ctx.leadership_culture);
  line("Salary Benchmark Range", ctx.salary_range);
  line("Salary Market Position", ctx.market_position);

  if (ctx.technology_stack?.length) {
    parts.push(`Relevant Technology Stack: ${ctx.technology_stack.join(", ")}`);
  }

  parts.push(
    `PERSONALIZATION DIRECTIVE: Tailor coaching, simulations, feedback, resume guidance, and development recommendations to the ${ctx.target_role || "executive"} role within the ${ctx.industry || "relevant"} industry. Reference the specific competencies, leadership behaviors, industry challenges, and promotion expectations above. Align advice with the ${ctx.leadership_culture || "standard"} leadership culture and ${ctx.market_demand || "general"} market demand in ${ctx.country || "the target market"}.`
  );

  return parts.join("\n");
};