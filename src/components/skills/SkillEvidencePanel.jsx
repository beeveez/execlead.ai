import React from "react";
import { CheckCircle2, FileText, Briefcase, Award, Brain, MessageSquare, GraduationCap, Building2 } from "lucide-react";
import { parseJSON } from "@/lib/skillsIntelligenceEngine";

const EVIDENCE_ICONS = {
  resume: FileText,
  work_experience: Briefcase,
  certification: Award,
  ai_analysis: Brain,
  assessment: GraduationCap,
  coach: MessageSquare,
  company: Building2,
  default: CheckCircle2,
};

export default function SkillEvidencePanel({ skill }) {
  const evidence = parseJSON(skill.evidence_json, []);

  if (evidence.length === 0) {
    return (
      <div className="text-center py-4">
        <FileText size={20} className="text-white/10 mx-auto mb-1.5" />
        <p className="text-white/30 text-xs">No evidence sources recorded.</p>
        <p className="text-white/20 text-[10px] mt-0.5">Add evidence to increase the Skill Confidence Score™.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {evidence.map((item, idx) => {
        const Icon = EVIDENCE_ICONS[item.type] || EVIDENCE_ICONS.default;
        return (
          <div key={idx} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Icon size={11} className="text-white/30" />
                <span className="text-xs text-white/70 font-medium">{item.source || item.type || "Evidence"}</span>
              </div>
              {item.description && <p className="text-[10px] text-white/30 mt-0.5">{item.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}