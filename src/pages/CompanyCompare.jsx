import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, GitCompare } from "lucide-react";
import ComplianceDisclaimer from "@/components/companies/ComplianceDisclaimer";
import CompanyLogo from "@/components/companies/CompanyLogo";

const DIMENSIONS = [
  { key: "industry", label: "Industry" },
  { key: "headquarters", label: "Headquarters" },
  { key: "founded", label: "Founded" },
  { key: "company_size", label: "Company Size" },
  { key: "company_type", label: "Type" },
  { key: "stock_symbol", label: "Stock Symbol" },
  { key: "revenue", label: "Revenue" },
  { key: "market_cap", label: "Market Cap" },
  { key: "employee_count", label: "Employees", format: v => v ? v.toLocaleString() : "—" },
  { key: "countries_count", label: "Countries", format: v => v ? v.toLocaleString() : "—" },
  { key: "cloud_provider", label: "Cloud Provider" },
  { key: "ceo", label: "CEO" },
  { key: "leadership_style", label: "Leadership Style" },
  { key: "work_model", label: "Work Model" },
  { key: "corporate_culture", label: "Corporate Culture" },
  { key: "business_model", label: "Business Model" },
  { key: "interview_style", label: "Interview Style" },
  { key: "executive_level_focus", label: "Executive Level" },
  { key: "digital_transformation_strategy", label: "Digital Transformation" },
  { key: "ai_strategy", label: "AI Strategy" },
  { key: "cloud_strategy", label: "Cloud Strategy" },
  { key: "technology_landscape", label: "Technology Landscape" },
  { key: "competitive_position", label: "Competitive Position" },
  { key: "risk_profile", label: "Risk Profile" },
  { key: "hiring_practices", label: "Hiring Practices" },
  { key: "board_expectations", label: "Board Expectations" },
  { key: "executive_resume_insights", label: "Executive Resume Insights" },
  { key: "sustainability_initiatives", label: "Sustainability" },
  { key: "diversity_inclusion", label: "Diversity & Inclusion" },
  { key: "global_presence", label: "Global Presence" },
  { key: "organizational_structure", label: "Org Structure" },
  { key: "salary_benchmarks", label: "Salary Benchmarks" },
  { key: "growth_potential", label: "Growth Potential" },
  { key: "career_opportunities", label: "Career Opportunities" },
  { key: "promotion_expectations", label: "Promotion Philosophy" },
  { key: "strategic_priorities", label: "Strategic Priorities" },
];

const LIST_DIMENSIONS = [
  { key: "core_values", label: "Core Values" },
  { key: "leadership_principles", label: "Leadership Principles" },
  { key: "executive_expectations", label: "Executive Expectations" },
  { key: "leadership_competencies", label: "Leadership Competencies" },
  { key: "executive_behaviors", label: "Executive Behaviors" },
  { key: "technology_stack", label: "Technology Stack" },
  { key: "major_products", label: "Major Products" },
  { key: "services", label: "Services" },
  { key: "competitors", label: "Competitors" },
  { key: "benefits", label: "Benefits" },
  { key: "transformation_initiatives", label: "Transformation Initiatives" },
  { key: "major_acquisitions", label: "Major Acquisitions" },
  { key: "learning_recommendations", label: "Learning Recommendations" },
  { key: "career_paths", label: "Career Paths" },
  { key: "common_interview_questions", label: "Common Interview Questions" },
  { key: "executive_case_studies", label: "Executive Case Studies" },
  { key: "recommended_certifications", label: "Recommended Certifications" },
  { key: "recommended_books", label: "Recommended Books" },
  { key: "recommended_courses", label: "Recommended Courses" },
];

export default function CompanyCompare() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = (params.get("ids") || "").split(",").filter(Boolean);
    const load = async () => {
      try {
        const results = await Promise.all(ids.map(id => base44.entities.Company.get(id)));
        setCompanies(results.filter(Boolean));
      } catch (e) {}
      setLoading(false);
    };
    if (ids.length) load(); else setLoading(false);
  }, [params]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

  if (companies.length < 2) {
    return (
      <div className="text-center py-20">
        <GitCompare size={24} className="mx-auto text-white/20 mb-2" />
        <p className="text-white/40 text-sm">Select at least 2 companies to compare.</p>
        <button onClick={() => navigate("/companies")} className="mt-4 text-violet-400 text-sm hover:text-violet-300">Back to Library</button>
      </div>
    );
  }

  const rowBg = (i) => i % 2 === 0 ? "bg-white/[0.02]" : "";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button onClick={() => navigate("/companies")} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
        <ArrowLeft size={14} /> Back to Library
      </button>

      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <GitCompare size={12} className="text-violet-400" /> Company Intelligence Comparison
        </div>
        <h1 className="text-2xl font-bold text-white">Comparing {companies.length} Companies</h1>
        <p className="text-white/40 text-sm mt-1">Side-by-side EXECLEAD executive intelligence across {DIMENSIONS.length + LIST_DIMENSIONS.length} dimensions.</p>
      </div>

      <ComplianceDisclaimer variant="compact" />

      <div className="overflow-x-auto border border-white/5 rounded-xl">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-xs uppercase tracking-wider text-white/30 font-medium w-44 align-top sticky left-0 bg-[#0a0a0f]">Dimension</th>
              {companies.map(c => (
                <th key={c.id} className="text-left p-3 align-top min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <CompanyLogo company={c} size="sm" />
                    <span className="text-white font-semibold text-sm">{c.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((dim, idx) => (
              <tr key={dim.key} className={`border-b border-white/5 ${rowBg(idx)}`}>
                <td className="p-3 text-xs font-medium text-white/40 align-top sticky left-0 bg-[#0a0a0f]">{dim.label}</td>
                {companies.map(c => (
                  <td key={c.id} className="p-3 text-sm text-white/70 align-top">{dim.format ? dim.format(c[dim.key]) : (c[dim.key] || "—")}</td>
                ))}
              </tr>
            ))}
            {LIST_DIMENSIONS.map((dim, idx) => (
              <tr key={dim.key} className={`border-b border-white/5 ${rowBg(DIMENSIONS.length + idx)}`}>
                <td className="p-3 text-xs font-medium text-white/40 align-top sticky left-0 bg-[#0a0a0f]">{dim.label}</td>
                {companies.map(c => (
                  <td key={c.id} className="p-3 align-top">
                    {c[dim.key]?.length > 0 ? (
                      <ul className="space-y-1">
                        {c[dim.key].map((item, i) => <li key={i} className="text-xs text-white/60 flex items-start gap-1"><span className="text-violet-400">•</span>{item}</li>)}
                      </ul>
                    ) : <span className="text-white/20 text-sm">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}