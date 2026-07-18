import React, { useMemo } from "react";
import { BrainCircuit, CheckCircle2, TrendingUp, Sparkles, Award, Target } from "lucide-react";
import { calculateOverallScorecard, EXECUTIVE_DOMAINS, aggregateDomainCoverage } from "@/lib/skillsIntelligenceEngine";

export default function SkillIntelligenceDashboard({ skills }) {
  const metrics = useMemo(() => calculateOverallScorecard(skills), [skills]);
  const domains = useMemo(() => aggregateDomainCoverage(skills), [skills]);
  const activeDomains = EXECUTIVE_DOMAINS.filter(d => domains[d.id]?.skills.length > 0).length;
  const emergingCount = skills.filter(s => s.market_demand === "emerging").length;
  const newSkills = skills.filter(s => {
    if (!s.created_date) return false;
    const days = (Date.now() - new Date(s.created_date).getTime()) / 86400000;
    return days <= 30;
  }).length;

  const cards = [
    { label: "Total Skills", value: metrics.totalSkills, icon: BrainCircuit, color: "indigo" },
    { label: "Verified Skills", value: metrics.verifiedCount, icon: CheckCircle2, color: "emerald" },
    { label: "Avg Confidence", value: `${metrics.avgConfidence}%`, icon: Target, color: "blue" },
    { label: "High Demand", value: metrics.highDemandCount, icon: TrendingUp, color: "amber" },
    { label: "Emerging", value: emergingCount, icon: Sparkles, color: "purple" },
    { label: "Domains Active", value: `${activeDomains}/12`, icon: Award, color: "rose" },
    { label: "New (30d)", value: newSkills, icon: BrainCircuit, color: "cyan" },
    { label: "Overall Coverage", value: `${metrics.overallCoverage}%`, icon: Target, color: "green" },
  ];

  const COLOR_CLASSES = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    rose: "text-rose-400 bg-rose-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    green: "text-green-400 bg-green-500/10",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colorClass = COLOR_CLASSES[card.color] || COLOR_CLASSES.indigo;
        return (
          <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${colorClass}`}>
              <Icon size={14} />
            </div>
            <div className="text-lg font-bold text-white">{card.value}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}