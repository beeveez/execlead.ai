import React, { useState } from "react";
import { ShieldAlert, TrendingUp, AlertCircle, Lightbulb, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const PROBLEM_ICONS = {
  unsupported_claim: AlertCircle,
  inflated_ownership: ShieldAlert,
  fake_metric: ShieldAlert,
  weak_language: AlertCircle,
  missing_impact: TrendingUp,
};

function IssueCard({ issue, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = PROBLEM_ICONS[issue.problem_type] || AlertCircle;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start justify-between gap-3 text-left">
        <div className="flex items-start gap-2 flex-1">
          <Icon size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-white/70 text-sm italic">"{issue.original_statement}"</p>
        </div>
        {expanded ? <ChevronUp size={14} className="text-white/30 flex-shrink-0 mt-1" /> : <ChevronDown size={14} className="text-white/30 flex-shrink-0 mt-1" />}
      </button>
      {expanded && (
        <div className="mt-4 space-y-4 pl-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium uppercase tracking-wider mb-1"><AlertCircle size={12} /> Problem</div>
            <p className="text-white/50 text-sm">{issue.problem}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium uppercase tracking-wider mb-1"><Lightbulb size={12} /> Executive Rewrite</div>
            <p className="text-white/70 text-sm bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">{issue.executive_rewrite}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1"><TrendingUp size={12} /> Why It's Stronger</div>
            <p className="text-white/50 text-sm">{issue.explanation}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium uppercase tracking-wider mb-1"><MessageSquare size={12} /> Interview Narrative</div>
            <p className="text-white/50 text-sm bg-violet-500/5 border border-violet-500/10 rounded-lg p-3">{issue.interview_narrative}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function TruthEngineReport({ report }) {
  if (!report) return null;

  let data = report;
  if (typeof report === "string") {
    try { data = JSON.parse(report); } catch { return null; }
  }

  const issues = data.issues || [];
  const healthScore = data.resume_health_score || 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-500/5 to-white/[0.02] border border-red-500/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-red-400" />
            <div>
              <h3 className="text-white font-semibold text-sm">Resume Health Score</h3>
              <p className="text-white/30 text-xs">Truth Engine credibility assessment</p>
            </div>
          </div>
          <div className={`text-3xl font-bold ${healthScore >= 70 ? "text-emerald-400" : healthScore >= 40 ? "text-amber-400" : "text-red-400"}`}>{healthScore}</div>
        </div>
      </div>

      {data.overall_assessment && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-2">Overall Assessment</h3>
          <p className="text-white/60 text-sm leading-relaxed">{data.overall_assessment}</p>
        </div>
      )}

      {issues.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">{issues.length} Issues Found · Click to expand</h3>
          <div className="space-y-2">
            {issues.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)}
          </div>
        </div>
      )}

      {data.priority_improvements?.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
          <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-3">Top 5 Priority Improvements</h3>
          <ul className="space-y-2">
            {data.priority_improvements.map((imp, i) => (
              <li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-amber-400 mt-0.5">{i + 1}.</span> {imp}</li>
            ))}
          </ul>
        </div>
      )}

      {data.missing_elements?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Missing Elements</h3>
          <ul className="space-y-2">
            {data.missing_elements.map((el, i) => (
              <li key={i} className="text-white/50 text-sm flex items-start gap-2"><span className="text-white/30 mt-0.5">•</span> {el}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}