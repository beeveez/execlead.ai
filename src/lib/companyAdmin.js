import { base44 } from "@/api/base44Client";

export const COMPANY_CATEGORIES = [
  "Technology", "Consulting", "Finance", "Healthcare", "Government",
  "Energy", "Manufacturing", "Retail", "Telecommunications", "Education",
  "Startups", "Non-Profit"
];

export const COMPANY_TYPES = ["public", "private", "subsidiary", "government", "non_profit"];
export const COMPANY_STATUSES = ["draft", "review", "approved", "archived"];

export const ARRAY_FIELDS = [
  "core_values", "leadership_principles", "executive_behaviors", "technology_stack",
  "major_products", "services", "competitors", "executive_expectations",
  "leadership_competencies", "career_paths", "common_interview_questions",
  "executive_case_studies", "learning_recommendations", "recommended_certifications",
  "recommended_books", "recommended_courses", "benefits", "tags"
];

export const BOOLEAN_FIELDS = ["remote_work_friendly", "hybrid_work_friendly", "is_archived"];

export const QUALITY_FIELDS = [
  { name: "name", weight: 2 }, { name: "industry", weight: 2 }, { name: "country", weight: 2 },
  { name: "headquarters", weight: 1 }, { name: "description", weight: 2 }, { name: "mission", weight: 2 },
  { name: "vision", weight: 1 }, { name: "core_values", weight: 2, isArray: true },
  { name: "leadership_principles", weight: 2, isArray: true }, { name: "corporate_culture", weight: 1 },
  { name: "business_model", weight: 2 }, { name: "technology_stack", weight: 1, isArray: true },
  { name: "ai_strategy", weight: 2 }, { name: "cloud_strategy", weight: 1 },
  { name: "digital_transformation_strategy", weight: 1 }, { name: "interview_style", weight: 2 },
  { name: "executive_expectations", weight: 2, isArray: true }, { name: "leadership_competencies", weight: 2, isArray: true },
  { name: "executive_behaviors", weight: 1, isArray: true }, { name: "promotion_expectations", weight: 1 },
  { name: "career_paths", weight: 1, isArray: true }, { name: "common_interview_questions", weight: 1, isArray: true },
  { name: "executive_case_studies", weight: 1, isArray: true }, { name: "recommended_certifications", weight: 1, isArray: true },
  { name: "recommended_books", weight: 1, isArray: true }, { name: "recommended_courses", weight: 1, isArray: true },
  { name: "strategic_priorities", weight: 1 }, { name: "ceo", weight: 1 }, { name: "company_size", weight: 1 },
  { name: "revenue", weight: 1 }, { name: "employee_count", weight: 1 }, { name: "competitors", weight: 1, isArray: true },
  { name: "major_products", weight: 1, isArray: true }, { name: "services", weight: 1, isArray: true },
  { name: "sustainability_initiatives", weight: 1 }, { name: "diversity_inclusion", weight: 1 },
  { name: "benefits", weight: 1, isArray: true }, { name: "salary_benchmarks", weight: 1 },
  { name: "growth_potential", weight: 1 }, { name: "career_opportunities", weight: 1 },
  { name: "learning_recommendations", weight: 1, isArray: true }, { name: "leadership_style", weight: 1 },
  { name: "remote_work_friendly", weight: 1 }, { name: "hybrid_work_friendly", weight: 1 },
  { name: "executive_level_focus", weight: 1 }, { name: "organizational_structure", weight: 1 },
  { name: "global_presence", weight: 1 }, { name: "learning_paths_json", weight: 1 },
];

export const COMPANY_FORM_TABS = [
  {
    id: "overview", label: "Overview",
    fields: [
      { name: "name", label: "Company Name", type: "text", required: true },
      { name: "logo_url", label: "Logo URL", type: "text" },
      { name: "industry", label: "Industry / Category", type: "select", options: COMPANY_CATEGORIES },
      { name: "company_type", label: "Company Type", type: "select", options: COMPANY_TYPES },
      { name: "stock_symbol", label: "Stock Symbol", type: "text" },
      { name: "country", label: "Country", type: "text" },
      { name: "headquarters", label: "Headquarters", type: "text" },
      { name: "company_size", label: "Company Size", type: "text" },
      { name: "revenue", label: "Revenue", type: "text" },
      { name: "employee_count", label: "Employee Count", type: "number" },
      { name: "ceo", label: "CEO", type: "text" },
      { name: "fortune_ranking", label: "Fortune Ranking", type: "text" },
      { name: "global_ranking", label: "Global Ranking", type: "text" },
      { name: "description", label: "Company Description", type: "textarea" },
    ]
  },
  {
    id: "identity", label: "Identity & Culture",
    fields: [
      { name: "mission", label: "Mission", type: "textarea" },
      { name: "vision", label: "Vision", type: "textarea" },
      { name: "core_values", label: "Core Values", type: "array" },
      { name: "leadership_principles", label: "Leadership Principles", type: "array" },
      { name: "executive_behaviors", label: "Executive Behaviors", type: "array" },
      { name: "corporate_culture", label: "Corporate Culture", type: "textarea" },
      { name: "leadership_style", label: "Leadership Style", type: "text" },
      { name: "diversity_inclusion", label: "Diversity & Inclusion", type: "textarea" },
      { name: "sustainability_initiatives", label: "Sustainability Initiatives", type: "textarea" },
    ]
  },
  {
    id: "strategy", label: "Strategy & Tech",
    fields: [
      { name: "business_model", label: "Business Model", type: "textarea" },
      { name: "technology_stack", label: "Technology Stack", type: "array" },
      { name: "ai_strategy", label: "AI Strategy", type: "textarea" },
      { name: "cloud_strategy", label: "Cloud Strategy", type: "textarea" },
      { name: "digital_transformation_strategy", label: "Digital Transformation", type: "textarea" },
      { name: "strategic_priorities", label: "Strategic Priorities", type: "textarea" },
      { name: "major_products", label: "Major Products", type: "array" },
      { name: "services", label: "Services", type: "array" },
      { name: "competitors", label: "Competitors", type: "array" },
      { name: "global_presence", label: "Global Presence", type: "textarea" },
      { name: "organizational_structure", label: "Organizational Structure", type: "textarea" },
    ]
  },
  {
    id: "talent", label: "Talent & Career",
    fields: [
      { name: "interview_style", label: "Interview Style", type: "textarea" },
      { name: "executive_expectations", label: "Executive Expectations", type: "array" },
      { name: "leadership_competencies", label: "Leadership Competencies", type: "array" },
      { name: "promotion_expectations", label: "Promotion Expectations", type: "textarea" },
      { name: "career_paths", label: "Career Paths", type: "array" },
      { name: "executive_level_focus", label: "Executive Level Focus", type: "text" },
      { name: "salary_benchmarks", label: "Salary Benchmarks", type: "text" },
      { name: "benefits", label: "Benefits", type: "array" },
      { name: "growth_potential", label: "Growth Potential", type: "text" },
      { name: "career_opportunities", label: "Career Opportunities", type: "text" },
      { name: "remote_work_friendly", label: "Remote Work Friendly", type: "boolean" },
      { name: "hybrid_work_friendly", label: "Hybrid Work Friendly", type: "boolean" },
    ]
  },
  {
    id: "learning", label: "Learning & Prep",
    fields: [
      { name: "recommended_certifications", label: "Recommended Certifications", type: "array" },
      { name: "recommended_books", label: "Recommended Books", type: "array" },
      { name: "recommended_courses", label: "Recommended Courses", type: "array" },
      { name: "learning_recommendations", label: "Learning Recommendations", type: "array" },
      { name: "common_interview_questions", label: "Common Interview Questions", type: "array" },
      { name: "executive_case_studies", label: "Executive Case Studies", type: "array" },
      { name: "learning_paths_json", label: "Learning Paths (JSON)", type: "textarea" },
    ]
  },
  {
    id: "meta", label: "Status & Meta",
    fields: [
      { name: "status", label: "Status", type: "select", options: COMPANY_STATUSES },
      { name: "tags", label: "Tags", type: "array" },
      { name: "notes", label: "Internal Notes", type: "textarea" },
      { name: "reviewed_by", label: "Reviewed By", type: "text" },
      { name: "review_notes", label: "Review Notes", type: "textarea" },
      { name: "review_date", label: "Review Date", type: "date" },
    ]
  },
];

const EMPTY_ARRAYS = ARRAY_FIELDS.reduce((acc, f) => { acc[f] = []; return acc; }, {});

export const defaultCompany = () => ({
  name: "", status: "draft", company_type: "private",
  remote_work_friendly: false, hybrid_work_friendly: false,
  employee_count: 0, version_number: 1, quality_score: 0,
  ...EMPTY_ARRAYS,
});

export const calculateQualityScore = (company) => {
  if (!company) return 0;
  let earned = 0, total = 0;
  for (const f of QUALITY_FIELDS) {
    total += f.weight;
    const val = company[f.name];
    if (typeof val === "boolean") { earned += f.weight; }
    else if (f.isArray) { if (Array.isArray(val) && val.length > 0) earned += f.weight; }
    else if (typeof val === "number") { if (val > 0) earned += f.weight; }
    else if (val !== undefined && val !== null && val !== "") { earned += f.weight; }
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0;
};

export const normalizeImportedCompany = (raw) => {
  if (!raw) return null;
  const normalized = { ...raw };
  for (const f of ARRAY_FIELDS) {
    if (typeof normalized[f] === "string") {
      normalized[f] = normalized[f].split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(normalized[f])) {
      normalized[f] = [];
    }
  }
  for (const f of BOOLEAN_FIELDS) {
    if (typeof normalized[f] === "string") {
      normalized[f] = ["true", "1", "yes"].includes(normalized[f].toLowerCase());
    } else if (typeof normalized[f] !== "boolean") {
      normalized[f] = false;
    }
  }
  if (typeof normalized.employee_count === "string") normalized.employee_count = parseInt(normalized.employee_count) || 0;
  if (!COMPANY_STATUSES.includes(normalized.status)) normalized.status = "approved";
  normalized.quality_score = calculateQualityScore(normalized);
  return normalized;
};

export const downloadFile = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const CSV_FIELDS = [
  "name", "industry", "country", "headquarters", "company_size", "revenue", "employee_count",
  "ceo", "company_type", "stock_symbol", "fortune_ranking", "global_ranking",
  "description", "mission", "vision", "corporate_culture", "business_model", "leadership_style",
  "core_values", "leadership_principles", "executive_behaviors",
  "technology_stack", "ai_strategy", "cloud_strategy", "digital_transformation_strategy", "strategic_priorities",
  "major_products", "services", "competitors", "global_presence", "organizational_structure",
  "interview_style", "executive_expectations", "leadership_competencies", "promotion_expectations",
  "career_paths", "common_interview_questions", "executive_case_studies",
  "recommended_certifications", "recommended_books", "recommended_courses", "learning_recommendations",
  "executive_level_focus", "salary_benchmarks", "benefits", "growth_potential", "career_opportunities",
  "remote_work_friendly", "hybrid_work_friendly", "sustainability_initiatives", "diversity_inclusion",
  "status", "quality_score", "tags", "notes", "version_number", "learning_paths_json"
];

export const companiesToCSV = (companies) => {
  const esc = (val) => {
    let s = Array.isArray(val) ? val.join("; ") : String(val ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = companies.map(c => CSV_FIELDS.map(f => esc(c[f])).join(","));
  return [CSV_FIELDS.join(","), ...rows].join("\n");
};

export const exportCompanies = (companies, format) => {
  if (format === "json") {
    downloadFile("companies-export.json", JSON.stringify(companies, null, 2), "application/json");
  } else if (format === "csv") {
    downloadFile("companies-export.csv", companiesToCSV(companies), "text/csv");
  } else if (format === "pdf") {
    exportPDFSummary(companies);
  }
};

export const exportPDFSummary = async (companies) => {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Company Intelligence Library", 14, 20);
    doc.setFontSize(9);
    doc.text(`Total: ${companies.length} companies | Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    let y = 40;
    doc.setFontSize(7);
    doc.text("Company", 14, y); doc.text("Industry", 80, y); doc.text("Country", 120, y); doc.text("Score", 160, y); doc.text("Status", 178, y);
    y += 3; doc.line(14, y, 196, y); y += 5;
    companies.forEach(c => {
      if (y > 285) { doc.addPage(); y = 20; }
      doc.text(String(c.name || "").substring(0, 38), 14, y);
      doc.text(String(c.industry || "").substring(0, 22), 80, y);
      doc.text(String(c.country || "").substring(0, 22), 120, y);
      doc.text(String(c.quality_score || 0), 160, y);
      doc.text(String(c.status || "approved"), 178, y);
      y += 5;
    });
    doc.save("companies-summary.pdf");
  } catch (e) {
    console.error("PDF export failed", e);
  }
};

export const logAudit = async (action, company, before, after, userName, details) => {
  try {
    await base44.entities.CompanyAuditLog.create({
      action,
      entity_id: company?.id || "",
      entity_name: company?.name || "",
      before_json: before ? JSON.stringify(before) : "",
      after_json: after ? JSON.stringify(after) : "",
      performed_by_name: userName || "Admin",
      details: details || "",
    });
  } catch (e) {}
};

export const saveVersionSnapshot = async (company, userName, changeSummary) => {
  try {
    const { id, created_date, updated_date, created_by_id, ...snapshot } = company;
    await base44.entities.CompanyVersion.create({
      company_id: company.id,
      company_name: company.name,
      version_number: company.version_number || 1,
      snapshot_json: JSON.stringify(snapshot),
      change_summary: changeSummary,
      created_by_name: userName || "Admin",
    });
  } catch (e) {}
};