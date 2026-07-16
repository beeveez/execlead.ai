import React, { useMemo } from "react";
import { Brain, Building2, Briefcase, Factory, MapPin, DollarSign, TrendingUp, Award, BookOpen, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { resolveCareerIntelligence } from "@/lib/careerIntelligence/registryService";
import { formatSalary } from "@/lib/careerIntelligence/salaryBenchmarkRegistry";
import { cn } from "@/lib/utils";

export default function CareerIntelligencePanel({ form }) {
  const ci = useMemo(() => resolveCareerIntelligence(form), [form]);

  if (!ci) return null;

  const { intelligence, company, role, industry, countryData, salaryBenchmark } = ci;
  const hasAnySelection = company || role || industry || form.target_country;

  if (!hasAnySelection) {
    return (
      <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Career Intelligence™</h3>
        </div>
        <p className="text-white/30 text-xs">Complete your target career selections above to unlock your personalized Career Intelligence Panel™.</p>
      </div>
    );
  }

  const fields = [
    { icon: Building2, label: "Target Company", value: intelligence.target_company, available: !!company },
    { icon: Briefcase, label: "Target Role", value: intelligence.target_role, available: !!role },
    { icon: Factory, label: "Industry", value: intelligence.industry, available: !!industry },
    { icon: MapPin, label: "Country", value: intelligence.country, available: !!form.target_country },
    { icon: DollarSign, label: "Salary Range", value: intelligence.estimated_salary_range, available: !!salaryBenchmark },
    { icon: TrendingUp, label: "Market Demand", value: intelligence.market_demand, available: !!countryData },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Career Intelligence™</h3>
        {company?.company_intelligence_available && (
          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={9} /> CI™ Available
          </span>
        )}
      </div>

      {/* Core Fields Grid */}
      <div className="grid grid-cols-2 gap-2">
        {fields.map((field, i) => (
          <div key={i} className={cn("flex items-start gap-2 p-2 rounded-lg", field.available ? "bg-white/5" : "bg-white/[0.02] opacity-50")}>
            <field.icon size={12} className={cn("flex-shrink-0 mt-0.5", field.available ? "text-indigo-400" : "text-white/20")} />
            <div className="min-w-0">
              <div className="text-[9px] text-white/30 uppercase tracking-wider">{field.label}</div>
              <div className="text-xs text-white/80 truncate">{field.value || "—"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Salary Market Position */}
      {salaryBenchmark && salaryBenchmark.marketPosition !== "Not specified" && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Market Position</span>
          <span className={cn("text-xs font-medium", {
            "text-emerald-400": salaryBenchmark.marketPosition === "Above Market",
            "text-indigo-400": salaryBenchmark.marketPosition === "Competitive",
            "text-amber-400": salaryBenchmark.marketPosition === "Market Average",
            "text-red-400": salaryBenchmark.marketPosition === "Below Market",
          })}>{salaryBenchmark.marketPosition}</span>
        </div>
      )}

      {/* Recommended Learning Paths */}
      {intelligence.recommended_learning_path.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen size={11} className="text-indigo-400" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Recommended Learning Paths</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {intelligence.recommended_learning_path.slice(0, 5).map((path, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{path}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Certifications */}
      {intelligence.recommended_certifications.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Award size={11} className="text-indigo-400" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Recommended Certifications</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {intelligence.recommended_certifications.slice(0, 5).map((cert, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{cert}</span>
            ))}
          </div>
        </div>
      )}

      {/* EXEC™ Recommendation */}
      {intelligence.exec_recommendation && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
          <Sparkles size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/60 leading-relaxed">{intelligence.exec_recommendation}</p>
        </div>
      )}

      {/* Leadership Culture & Market Info */}
      {countryData && form.target_country && (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Remote Work Index</span>
            <span className="text-xs text-white/80">{countryData.remote_work_index}/100</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-0.5">Leadership Culture</span>
            <span className="text-[11px] text-white/60">{countryData.leadership_culture}</span>
          </div>
        </div>
      )}

      {/* Promotion Path */}
      {role?.promotion_path && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
          <Target size={11} className="text-indigo-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider block">Promotion Path</span>
            <span className="text-[11px] text-white/60">{role.promotion_path}</span>
          </div>
        </div>
      )}
    </div>
  );
}