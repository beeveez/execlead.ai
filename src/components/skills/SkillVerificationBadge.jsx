import React from "react";
import { User, Sparkles, FileText, Briefcase, Award, ShieldCheck, Users, Building2 } from "lucide-react";
import { getVerificationMeta } from "@/lib/skillsIntelligenceEngine";

const ICON_MAP = { User, Sparkles, FileText, Briefcase, Award, ShieldCheck, Users, Building2 };

const COLOR_CLASSES = {
  slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function SkillVerificationBadge({ state, size = "sm" }) {
  const meta = getVerificationMeta(state);
  const Icon = ICON_MAP[meta.icon] || User;
  const colorClass = COLOR_CLASSES[meta.color] || COLOR_CLASSES.slate;
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";
  const iconSize = size === "xs" ? 10 : 12;

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      <Icon size={iconSize} />
      {meta.label}
    </span>
  );
}