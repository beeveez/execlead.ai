/**
 * Company Issue Detection
 * ------------------------
 * Identifies specific data-quality issues for a company record.
 * Powers the "Needs Improvement" drill-down table's Issue column.
 */

export const ISSUE_TYPES = {
  missing_logo: { label: "Missing logo", severity: "high" },
  broken_logo: { label: "Broken logo", severity: "high" },
  no_ai_profile: { label: "No AI profile", severity: "high" },
  missing_cloud: { label: "Missing Cloud stack", severity: "medium" },
  missing_exec_intel: { label: "Missing Executive intelligence", severity: "medium" },
  missing_metadata: { label: "Missing metadata", severity: "medium" },
  duplicate: { label: "Duplicate record", severity: "high" },
};

const isEmpty = (v) => {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
};

/**
 * Detect all issues for a company. Pass the full company list to
 * enable duplicate-name detection.
 */
export function detectCompanyIssues(company, allCompanies = []) {
  const issues = [];

  if (isEmpty(company.logo_url)) {
    issues.push(ISSUE_TYPES.missing_logo);
  } else if (company.logo_status === "invalid" || company.logo_status === "missing") {
    issues.push(ISSUE_TYPES.broken_logo);
  }

  if (isEmpty(company.ai_strategy)) issues.push(ISSUE_TYPES.no_ai_profile);
  if (isEmpty(company.cloud_strategy) && isEmpty(company.technology_stack)) issues.push(ISSUE_TYPES.missing_cloud);
  if (isEmpty(company.executive_expectations) || isEmpty(company.leadership_competencies)) issues.push(ISSUE_TYPES.missing_exec_intel);
  if (isEmpty(company.description)) issues.push(ISSUE_TYPES.missing_metadata);

  const name = (company.name || "").toLowerCase().trim();
  if (name && allCompanies.some((c) => c.id !== company.id && (c.name || "").toLowerCase().trim() === name)) {
    issues.push(ISSUE_TYPES.duplicate);
  }

  return issues;
}

/** Quick boolean — does this company have any detectable issue? */
export function hasIssues(company, allCompanies = []) {
  return detectCompanyIssues(company, allCompanies).length > 0;
}