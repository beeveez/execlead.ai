import React from "react";
import { calculateProfileCompletion, validateForPublish, MIN_PUBLISH_COMPLETION } from "@/lib/profileCompletion";
import {
  Check, X, AlertCircle, TrendingUp, Circle,
  UserCircle, Crown, Briefcase, GraduationCap, Award, Zap, Target, Globe, FileText, Brain, Share2,
} from "lucide-react";

const ICON_MAP = {
  UserCircle, Crown, Briefcase, GraduationCap, Award, Zap, Target, Globe, FileText, Brain, Share2,
};

function CompletionBar({ score }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function ProfileCompletionDashboard({ profile, skillsCount }) {
  const { overall, sections, missing } = calculateProfileCompletion(profile, { skillsCount });
  const validation = validateForPublish(profile, { skillsCount });
  const readyToPublish = validation.valid;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Profile Completion Engine</h3>
        </div>
        <span className={`text-xs font-medium ${readyToPublish ? "text-emerald-400" : "text-amber-400"}`}>
          {readyToPublish ? "Ready to Publish" : "Missing Requirements"}
        </span>
      </div>

      {/* Overall Score */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider">Executive Profile Completion</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-3xl font-bold ${overall >= 80 ? "text-emerald-400" : overall >= 50 ? "text-amber-400" : "text-red-400"}`}>{overall}</span>
              <span className="text-sm text-white/30">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/30">Minimum to publish</div>
            <div className="text-sm font-medium text-white/50">{MIN_PUBLISH_COMPLETION}%</div>
          </div>
        </div>
        <CompletionBar score={overall} />
      </div>

      {/* Required Items Checklist */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Publish Requirements</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {validation.checks.map((req) => (
            <div key={req.key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${req.passed ? "bg-emerald-500/5" : "bg-amber-500/5"}`}>
              {req.passed ? <Check size={12} className="text-emerald-400 flex-shrink-0" /> : <X size={12} className="text-amber-400 flex-shrink-0" />}
              <span className={`text-xs ${req.passed ? "text-white/60" : "text-amber-400/90"}`}>{req.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Section Breakdown */}
      <div className="px-5 py-4">
        <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Section Breakdown</div>
        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = ICON_MAP[section.icon] || Circle;
            return (
              <div key={section.key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-40 flex-shrink-0">
                  <Icon size={12} className="text-white/30" />
                  <span className="text-xs text-white/50 truncate">{section.label}</span>
                </div>
                <div className="flex-1">
                  <CompletionBar score={section.score} />
                </div>
                <div className="flex items-center gap-1 w-12 justify-end flex-shrink-0">
                  <span className={`text-xs font-medium ${section.score >= 80 ? "text-emerald-400" : section.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{section.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Items Summary */}
      {missing.length > 0 && (
        <div className="px-5 pb-5">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="text-white/50 font-medium mb-1.5">{missing.length} items to improve:</div>
              <div className="flex flex-wrap gap-1.5">
                {missing.slice(0, 8).map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px]">{m.item}</span>
                ))}
                {missing.length > 8 && <span className="px-2 py-0.5 text-white/30 text-[10px]">+{missing.length - 8} more</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}