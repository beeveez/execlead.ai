import React from "react";
import { FileText, Users, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { EXECUTIVE_SUMMARY } from "@/lib/scalabilityAssessmentEngine";

const SCALING_REQUIRES = [
  { dau: "10,000 DAU", requirement: EXECUTIVE_SUMMARY.scalingRequirements.tenThousandDAU },
  { dau: "100,000 DAU", requirement: EXECUTIVE_SUMMARY.scalingRequirements.oneHundredThousandDAU },
  { dau: "1,000,000 DAU", requirement: EXECUTIVE_SUMMARY.scalingRequirements.oneMillionDAU },
];

/**
 * Executive Summary — the 5 final answers.
 */
export default function ExecutiveSummary() {
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={18} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Executive Summary</h3>
      </div>

      <div className="space-y-4">
        {/* Q1 */}
        <SummaryQuestion
          n={1}
          question="How many users can simultaneously use EXECLEAD.AI today?"
          answer={EXECUTIVE_SUMMARY.simultaneousUsersToday}
          icon={Users}
        />

        {/* Q2 */}
        <SummaryQuestion
          n={2}
          question="How many users can realistically use the platform per day?"
          answer={EXECUTIVE_SUMMARY.dailyUsersToday}
          icon={Users}
        />

        {/* Q3 */}
        <SummaryQuestion
          n={3}
          question="What is the first scalability bottleneck?"
          answer={EXECUTIVE_SUMMARY.firstBottleneck}
          icon={AlertTriangle}
          accent="amber"
        />

        {/* Q4 */}
        <div className="px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-[11px] font-bold text-indigo-400 flex-shrink-0">4</span>
            <span className="text-xs font-medium text-white/80">What infrastructure changes are required to support:</span>
          </div>
          <div className="space-y-2 ml-8">
            {SCALING_REQUIRES.map((s) => (
              <div key={s.dau} className="flex items-start gap-2">
                <span className="text-[11px] font-bold text-indigo-400 w-28 flex-shrink-0">{s.dau}</span>
                <ArrowRight size={11} className="text-white/20 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-white/60">{s.requirement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Q5 */}
        <SummaryQuestion
          n={5}
          question="Is the current architecture suitable for enterprise production?"
          answer={EXECUTIVE_SUMMARY.enterpriseReady}
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>
    </div>
  );
}

function SummaryQuestion({ n, question, answer, icon: Icon, accent }) {
  const accentClass = accent === "amber"
    ? "bg-amber-500/15 border-amber-500/25 text-amber-400"
    : accent === "emerald"
    ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
    : "bg-indigo-500/15 border-indigo-500/25 text-indigo-400";

  return (
    <div className="px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${accentClass}`}>
          {n}
        </span>
        <Icon size={13} className="text-white/40 flex-shrink-0" />
        <span className="text-xs font-medium text-white/80">{question}</span>
      </div>
      <p className="text-[11px] text-white/60 leading-relaxed ml-8">{answer}</p>
    </div>
  );
}