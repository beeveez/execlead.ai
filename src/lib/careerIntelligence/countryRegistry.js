/**
 * Country Registry™ — Master Registry v1.0
 * ============================================================
 * Extends the base country list with career intelligence metadata
 * for Salary Intelligence™, Executive Coach™, and Career Studio™.
 */
export const COUNTRY_REGISTRY_VERSION = "1.0.0";

export const COUNTRY_CAREER_DATA = {
  "United States": {
    region: "North America",
    currency: "USD",
    avg_executive_salary: 250000,
    market_demand: "High",
    remote_work_index: 85,
    leadership_culture: "Individualistic • Results-oriented • Direct communication",
    employment_market: "Highly competitive, strong executive demand in tech and finance",
    top_companies: ["Microsoft", "Amazon", "Apple", "Google", "Meta"],
    recommended_certifications: ["PMP", "MBA", "AWS", "ITIL"],
  },
  "Canada": {
    region: "North America",
    currency: "CAD",
    avg_executive_salary: 180000,
    market_demand: "Moderate",
    remote_work_index: 80,
    leadership_culture: "Collaborative • Inclusive • Consensus-building",
    employment_market: "Stable market, strong in government, banking, and energy sectors",
    top_companies: ["Shopify", "RBC", "TD Bank", "Government of Canada", "Suncor"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "PMP Canada"],
  },
  "United Kingdom": {
    region: "Europe",
    currency: "GBP",
    avg_executive_salary: 150000,
    market_demand: "Moderate",
    remote_work_index: 75,
    leadership_culture: "Professional • Formal • Stakeholder-oriented",
    employment_market: "Strong financial services and consulting market",
    top_companies: ["BP", "HSBC", "Deloitte", "BT", "Unilever"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "Chartered Director"],
  },
  "Germany": {
    region: "Europe",
    currency: "EUR",
    avg_executive_salary: 170000,
    market_demand: "Moderate",
    remote_work_index: 65,
    leadership_culture: "Structured • Engineering-focused • Consensus-driven",
    employment_market: "Strong manufacturing, automotive, and engineering sectors",
    top_companies: ["SAP", "Siemens", "BMW", "Volkswagen", "Deutsche Bank"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "Engineering Certifications"],
  },
  "India": {
    region: "Asia-Pacific",
    currency: "INR",
    avg_executive_salary: 8000000,
    market_demand: "High",
    remote_work_index: 90,
    leadership_culture: "Hierarchical • Relationship-driven • Respect for authority",
    employment_market: "Booming tech market, strong in IT services and engineering",
    top_companies: ["TCS", "Infosys", "Wipro", "Reliance", "HCL"],
    recommended_certifications: ["PMP", "MBA", "AWS", "ITIL"],
  },
  "Australia": {
    region: "Asia-Pacific",
    currency: "AUD",
    avg_executive_salary: 220000,
    market_demand: "Moderate",
    remote_work_index: 78,
    leadership_culture: "Egalitarian • Work-life balance • Direct",
    employment_market: "Strong mining, banking, and government sectors",
    top_companies: ["BHP", "Commonwealth Bank", "Telstra", "Rio Tinto", "Westpac"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "AGSM Executive"],
  },
  "Japan": {
    region: "Asia-Pacific",
    currency: "JPY",
    avg_executive_salary: 25000000,
    market_demand: "Moderate",
    remote_work_index: 45,
    leadership_culture: "Consensus • Long-term • Group harmony",
    employment_market: "Traditional market, strong in manufacturing and technology",
    top_companies: ["Toyota", "Sony", "NTT", "Fujitsu", "Hitachi"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "Japanese Business Certification"],
  },
  "France": {
    region: "Europe",
    currency: "EUR",
    avg_executive_salary: 160000,
    market_demand: "Moderate",
    remote_work_index: 70,
    leadership_culture: "Intellectual • Centralized • Formal",
    employment_market: "Strong in luxury, aerospace, and consulting",
    top_companies: ["LVMH", "Airbus", "Capgemini", "TotalEnergies", "BNP Paribas"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "Grand École"],
  },
  "Netherlands": {
    region: "Europe",
    currency: "EUR",
    avg_executive_salary: 165000,
    market_demand: "Moderate",
    remote_work_index: 82,
    leadership_culture: "Consensus • Pragmatic • International",
    employment_market: "Strong consulting, technology, and logistics",
    top_companies: ["Shell", "Philips", "ING", "KPMG", "ASML"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "Dutch Executive"],
  },
  "Ireland": {
    region: "Europe",
    currency: "EUR",
    avg_executive_salary: 155000,
    market_demand: "High",
    remote_work_index: 85,
    leadership_culture: "Collaborative • Flexible • International",
    employment_market: "European HQ hub for major tech companies",
    top_companies: ["Accenture", "Google", "Meta", "Apple", "Pfizer"],
    recommended_certifications: ["PMP", "MBA", "ITIL", "CIMA"],
  },
};

export function getCountryCareerData(countryName) {
  return COUNTRY_CAREER_DATA[countryName] || {
    region: "Global",
    currency: "USD",
    avg_executive_salary: 150000,
    market_demand: "Moderate",
    remote_work_index: 70,
    leadership_culture: "Region-specific leadership practices",
    employment_market: "Market conditions vary by region",
    top_companies: [],
    recommended_certifications: ["PMP", "MBA", "ITIL"],
  };
}

export function getCountriesWithCareerData() {
  return Object.entries(COUNTRY_CAREER_DATA).map(([name, data]) => ({ name, ...data }));
}