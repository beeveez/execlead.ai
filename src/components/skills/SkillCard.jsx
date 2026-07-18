import React from "react";
import { Code, Crown, Target, Settings, Shield, DollarSign, MessageSquare, Users, RefreshCw, Lightbulb, AlertTriangle, Heart, Pencil, Trash2, Award, ChevronRight } from "lucide-react";
import SkillConfidenceScore from "./SkillConfidenceScore";
import SkillVerificationBadge from "./SkillVerificationBadge";
import MarketIntelligenceBadge from "./MarketIntelligencePanel";
import { parseJSON, getDomainMeta } from "@/lib/skillsIntelligenceEngine";

const ICON_MAP = { Code, Crown, Target, Settings, Shield, DollarSign, MessageSquare, Users, RefreshCw, Lightbulb, AlertTriangle, Heart };

export default function SkillCard({ skill, onEdit, onDelete, onClick }) {
  const domain = getDomainMeta(skill.capability_domain || "technology");
  const Icon = ICON_MAP[domain.icon] || Code;
  const evidence = parseJSON(skill.evidence_json, []);

  const DOMAIN_COLORS = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    green: "text-green-400 bg-green-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    rose: "text-rose-400 bg-rose-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    red: "text-red-400 bg-red-500/10",
    pink: "text-pink-400 bg-pink-500/10",
  };
  const colorClass = DOMAIN_COLORS[domain.color] || DOMAIN_COLORS.indigo;

  return (
    <div
      className="group bg-white/[0.02] border border-white/5 rounded-xl p-3.5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer relative"
      onClick={() => onClick?.(skill)}
    >
      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onEdit?.(skill); }} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70">
          <Pencil size={12} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete?.(skill); }} className="p-1 rounded hover:bg-red-500/10 text-white/40 hover:text-red-400">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white/90 truncate">{skill.skill_name}</h4>
          <div className="text-[10px] text-white/30 mt-0.5">{domain.label}</div>
        </div>
        <SkillConfidenceScore score={skill.confidence_score || 0} level={skill.confidence_level || "low"} size="sm" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <SkillVerificationBadge state={skill.verification_state} size="xs" />
        <MarketIntelligenceBadge level={skill.market_demand} size="xs" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[10px] text-white/30">
        {skill.years_of_experience > 0 && <span>{skill.years_of_experience}y exp</span>}
        {evidence.length > 0 && (
          <span className="flex items-center gap-0.5"><Award size={9} /> {evidence.length} evidence</span>
        )}
        {skill.proficiency && <span className="capitalize">{skill.proficiency}</span>}
        {skill.last_used && <span>· {skill.last_used}</span>}
      </div>

      {/* Drill-down hint */}
      <div className="flex items-center justify-end mt-2">
        <ChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors" />
      </div>
    </div>
  );
}