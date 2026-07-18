import React from "react";
import { X, Clock, GitBranch, Award, Brain } from "lucide-react";
import SkillConfidenceScore from "./SkillConfidenceScore";
import SkillVerificationBadge from "./SkillVerificationBadge";
import SkillEvidencePanel from "./SkillEvidencePanel";
import MarketIntelligenceBadge from "./MarketIntelligencePanel";
import { parseJSON, getDomainMeta, EXECUTIVE_DOMAINS } from "@/lib/skillsIntelligenceEngine";

const DOMAIN_LABELS = Object.fromEntries(EXECUTIVE_DOMAINS.map(d => [d.id, d.label]));

export default function SkillDetailDrawer({ skill, onClose }) {
  if (!skill) return null;
  const evidence = parseJSON(skill.evidence_json, []);
  const related = parseJSON(skill.related_skills_json, []);
  const history = parseJSON(skill.change_history_json, []);
  const domain = getDomainMeta(skill.capability_domain);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0d14] border-l border-white/10 overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{DOMAIN_LABELS[domain.id] || "Skill"}</div>
            <h2 className="text-lg font-bold text-white">{skill.skill_name}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Confidence + Verification */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <SkillConfidenceScore score={skill.confidence_score || 0} level={skill.confidence_level || "low"} size="lg" />
            <div className="flex-1">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Skill Confidence Score™</div>
              <div className="text-sm font-semibold text-white capitalize mb-2">{skill.confidence_level || "low"} confidence</div>
              <SkillVerificationBadge state={skill.verification_state} />
            </div>
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Proficiency</div>
              <div className="text-sm text-white/80 capitalize mt-0.5">{skill.proficiency}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Experience</div>
              <div className="text-sm text-white/80 mt-0.5">{skill.years_of_experience || 0} year{(skill.years_of_experience || 0) !== 1 ? "s" : ""}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Last Used</div>
              <div className="text-sm text-white/80 mt-0.5">{skill.last_used || "—"}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Acquired</div>
              <div className="text-sm text-white/80 mt-0.5">{skill.acquired_year || "—"}</div>
            </div>
          </div>

          {/* Market Intelligence */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              <Brain size={12} /> Market Intelligence™
            </div>
            <MarketIntelligenceBadge level={skill.market_demand} size="sm" />
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              <Award size={12} /> Skill Evidence Engine™ ({evidence.length})
            </div>
            <SkillEvidencePanel skill={skill} />
          </div>

          {/* Related Skills (Executive Skill Graph) */}
          {related.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <GitBranch size={12} /> Executive Skill Graph™
              </div>
              <div className="flex flex-wrap gap-1.5">
                {related.map((name, idx) => (
                  <span key={idx} className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md px-2 py-1">{name}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendation Reason */}
          {skill.recommendation_reason && (
            <div className="bg-indigo-500/[0.04] border border-indigo-500/15 rounded-xl p-3">
              <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-1">AI Recommendation</div>
              <p className="text-xs text-white/60 leading-relaxed">{skill.recommendation_reason}</p>
            </div>
          )}

          {/* Change History */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <Clock size={12} /> Skill Change History™ ({history.length})
              </div>
              <div className="space-y-1">
                {history.slice(-10).reverse().map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-white/60 font-medium">{entry.event}</span>
                      {entry.details && <span className="text-white/30"> — {entry.details}</span>}
                      <span className="text-white/20 block">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}