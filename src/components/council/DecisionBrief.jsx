import React from "react";
import ReactMarkdown from "react-markdown";
import {
  FileText, DollarSign, Settings, Users, Cpu, Target,
  CheckSquare, Calendar, GitBranch, ArrowRight,
} from "lucide-react";
import RiskMatrix from "./RiskMatrix";

const PRIORITY_STYLES = {
  high: "bg-red-500/10 text-red-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-emerald-500/10 text-emerald-400",
};

const IMPACT_SECTIONS = [
  { key: "financial_impact", label: "Financial Impact", icon: DollarSign, color: "text-emerald-400" },
  { key: "operational_impact", label: "Operational Impact", icon: Settings, color: "text-blue-400" },
  { key: "people_impact", label: "People Impact", icon: Users, color: "text-pink-400" },
  { key: "technology_impact", label: "Technology Impact", icon: Cpu, color: "text-cyan-400" },
];

export default function DecisionBrief({ brief }) {
  if (!brief) return null;

  return (
    <div className="space-y-5">
      {/* Executive Summary */}
      {brief.executive_summary && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-indigo-400" />
            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Executive Summary</h3>
          </div>
          <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{brief.executive_summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {brief.recommendation && (
        <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-emerald-400" />
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Recommendation</h3>
          </div>
          <div className="text-white/80 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{brief.recommendation}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Impact Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {IMPACT_SECTIONS.map((section) => {
          const content = brief[section.key];
          if (!content) return null;
          return (
            <div key={section.key} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <section.icon size={14} className={section.color} />
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider">{section.label}</h4>
              </div>
              <p className="text-sm text-white/60">{content}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Matrix */}
      {brief.risk_matrix?.length > 0 && <RiskMatrix risks={brief.risk_matrix} />}

      {/* Alternatives */}
      {brief.alternatives?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={16} className="text-violet-400" />
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Viable Alternatives</h3>
          </div>
          <div className="space-y-3">
            {brief.alternatives.map((alt, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70 font-medium">{alt.option}</span>
                  {alt.feasibility != null && (
                    <span className="text-xs text-white/40">Feasibility: <span className="text-white font-bold">{alt.feasibility}%</span></span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {alt.pros && <div className="text-emerald-400/60"><span className="font-medium">Pros:</span> <span className="text-white/50">{alt.pros}</span></div>}
                  {alt.cons && <div className="text-red-400/60"><span className="font-medium">Cons:</span> <span className="text-white/50">{alt.cons}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {brief.action_items?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={16} className="text-indigo-400" />
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Action Items</h3>
          </div>
          <div className="space-y-2">
            {brief.action_items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 mt-0.5 shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">{item.action}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {item.owner && <span className="text-xs text-white/40">👤 {item.owner}</span>}
                    {item.timeline && <span className="text-xs text-white/40">📅 {item.timeline}</span>}
                    {item.priority && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium}`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {brief.timeline && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <Calendar size={16} className="text-indigo-400 shrink-0" />
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider">Execution Timeline: </span>
            <span className="text-sm text-white/70">{brief.timeline}</span>
          </div>
        </div>
      )}
    </div>
  );
}