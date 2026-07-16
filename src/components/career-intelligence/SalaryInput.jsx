import React, { useMemo } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { CURRENCIES, computeSalaryBenchmark, formatSalary } from "@/lib/careerIntelligence/salaryBenchmarkRegistry";
import { getRoleByTitle } from "@/lib/careerIntelligence/roleRegistry";
import { cn } from "@/lib/utils";

export default function SalaryInput({ value, onChange, currency, onCurrencyChange, role, country, industry }) {
  const benchmark = useMemo(() => {
    const roleObj = getRoleByTitle(role);
    if (!roleObj) return null;
    return computeSalaryBenchmark(roleObj.id, country, industry, value);
  }, [role, country, industry, value]);

  const positionColor = {
    "Above Market": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "Competitive": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    "Market Average": "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "Below Market": "text-red-400 bg-red-500/10 border-red-500/20",
    "Not specified": "text-white/30 bg-white/5 border-white/10",
  };

  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Expected Salary</label>
      <div className="flex gap-2">
        <select
          value={currency || "USD"}
          onChange={e => onCurrencyChange?.(e.target.value)}
          className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code} className="bg-[#0d0d14]">{c.code}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="number"
            value={value ?? ""}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder="250000"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {benchmark && (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>Market Range</span>
            <span>{formatSalary(benchmark.min)} – {formatSalary(benchmark.max)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>Median</span>
            <span>{formatSalary(benchmark.median)}</span>
          </div>
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium", positionColor[benchmark.marketPosition])}>
            <TrendingUp size={10} />
            {benchmark.marketPosition}
          </div>
          {benchmark.aiRecommendation && value > 0 && (
            <p className="text-[10px] text-white/30 italic leading-relaxed">{benchmark.aiRecommendation}</p>
          )}
        </div>
      )}
    </div>
  );
}