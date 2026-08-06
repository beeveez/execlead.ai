import React from "react";
import { Users, ArrowUpCircle, GitBranch, Target, ClipboardCheck, Sparkles } from "lucide-react";
import { fmtNum } from "@/lib/enterpriseRoiEngine";

export default function LeadershipImpactSummary({ summary }) {
  const cards = [
    { icon: Users, label: "Coverage", value: summary.coverage, color: "text-indigo-400" },
    { icon: ArrowUpCircle, label: "Internal Promotion", value: `${fmtNum(summary.promotion)} leaders`, color: "text-emerald-400" },
    { icon: GitBranch, label: "Succession (hires avoided)", value: fmtNum(summary.succession), color: "text-amber-400" },
    { icon: Target, label: "Readiness Assessments", value: fmtNum(summary.readiness), color: "text-accent-orange" },
    { icon: ClipboardCheck, label: "Assessment Capacity", value: `+${fmtNum(summary.assessmentCapacity)}`, color: "text-emerald-400" },
    { icon: Sparkles, label: "Coaching Capacity", value: `${fmtNum(summary.coachingCapacity)} leaders`, color: "text-indigo-400" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="text-white text-sm font-semibold mb-4">Leadership Impact Summary™</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <c.icon size={14} className={`${c.color} mb-1.5`} />
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{c.label}</div>
            <div className="text-sm font-bold text-white">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}