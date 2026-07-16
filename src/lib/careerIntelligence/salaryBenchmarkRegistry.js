/**
 * Salary Benchmark Registry™ — Master Registry v1.0
 * ============================================================
 * Salary ranges by role, country, and industry for
 * Salary Intelligence™ and Career Intelligence Panel™.
 */
export const SALARY_REGISTRY_VERSION = "1.0.0";

// Base salary benchmarks (USD) by role ID from Role Registry™
export const SALARY_BENCHMARKS = {
  ceo: { min: 350000, median: 600000, max: 1200000, currency: "USD" },
  cto: { min: 250000, median: 400000, max: 700000, currency: "USD" },
  cio: { min: 220000, median: 350000, max: 600000, currency: "USD" },
  cdo: { min: 220000, median: 350000, max: 600000, currency: "USD" },
  coo: { min: 250000, median: 400000, max: 750000, currency: "USD" },
  vp: { min: 180000, median: 280000, max: 500000, currency: "USD" },
  director: { min: 150000, median: 220000, max: 350000, currency: "USD" },
  senior_director: { min: 180000, median: 260000, max: 420000, currency: "USD" },
  senior_manager: { min: 120000, median: 170000, max: 260000, currency: "USD" },
  service_delivery_director: { min: 160000, median: 230000, max: 380000, currency: "USD" },
  head_of_it: { min: 180000, median: 270000, max: 450000, currency: "USD" },
  head_of_engineering: { min: 200000, median: 300000, max: 520000, currency: "USD" },
  platform_engineering_manager: { min: 140000, median: 200000, max: 320000, currency: "USD" },
  cloud_director: { min: 170000, median: 250000, max: 420000, currency: "USD" },
  infrastructure_director: { min: 160000, median: 230000, max: 380000, currency: "USD" },
  enterprise_architect: { min: 150000, median: 210000, max: 340000, currency: "USD" },
  program_director: { min: 160000, median: 230000, max: 380000, currency: "USD" },
};

// Country multipliers relative to USD baseline
export const COUNTRY_MULTIPLIERS = {
  "United States": 1.0,
  "Canada": 0.72,
  "United Kingdom": 0.60,
  "Germany": 0.68,
  "India": 0.32,
  "Australia": 0.88,
  "Japan": 1.0,
  "France": 0.64,
  "Netherlands": 0.66,
  "Ireland": 0.62,
};

// Industry multipliers
export const INDUSTRY_MULTIPLIERS = {
  "Technology": 1.15,
  "Financial Services": 1.2,
  "Healthcare": 1.0,
  "Government": 0.85,
  "Consulting": 1.1,
  "Retail": 0.9,
  "Telecommunications": 1.0,
  "Energy": 1.05,
  "Manufacturing": 0.95,
  "Education": 0.8,
  "Transportation": 0.9,
  "Logistics": 0.95,
  "Insurance": 1.0,
  "Pharmaceutical": 1.1,
  "Construction": 0.9,
  "Mining": 1.1,
  "Real Estate": 0.95,
  "Professional Services": 1.05,
  "Hospitality": 0.8,
  "Media": 0.95,
};

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

/**
 * Computes a salary benchmark for a given role, country, and industry.
 * Returns the adjusted range and market position of the user's expected salary.
 */
export function computeSalaryBenchmark(roleId, country, industry, expectedSalary) {
  const base = SALARY_BENCHMARKS[roleId];
  if (!base) return null;

  const countryMult = COUNTRY_MULTIPLIERS[country] || 1.0;
  const industryMult = INDUSTRY_MULTIPLIERS[industry] || 1.0;
  const adjustment = countryMult * industryMult;

  const adjusted = {
    min: Math.round(base.min * adjustment),
    median: Math.round(base.median * adjustment),
    max: Math.round(base.max * adjustment),
    currency: base.currency,
  };

  let marketPosition = "Not specified";
  let aiRecommendation = "Enter your expected salary for market analysis.";

  if (expectedSalary && expectedSalary > 0) {
    if (expectedSalary >= adjusted.max) {
      marketPosition = "Above Market";
      aiRecommendation = "Your expectation is above market. Ensure you have strong justification and unique value proposition.";
    } else if (expectedSalary >= adjusted.median) {
      marketPosition = "Competitive";
      aiRecommendation = "Your expectation is competitive. You're well-positioned for executive roles in this market.";
    } else if (expectedSalary >= adjusted.min) {
      marketPosition = "Market Average";
      aiRecommendation = "Your expectation is at market average. Consider negotiating for the median range.";
    } else {
      marketPosition = "Below Market";
      aiRecommendation = "Your expectation is below market. Research comparable roles and adjust upward.";
    }
  }

  return { ...adjusted, marketPosition, aiRecommendation };
}

export function formatSalary(amount, currency = "USD") {
  const curr = CURRENCIES.find(c => c.code === currency);
  const symbol = curr?.symbol || "$";
  return `${symbol}${amount.toLocaleString()}`;
}