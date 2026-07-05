import React from "react";
import { AlertTriangle, CheckCircle, Wrench, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function SkillGapAnalysis({ data, targetRole }) {
  if (!data) return null;
  const gaps = data.skill_gaps || [];
  const techSkills = data.technical_skills || [];
  const leadSkills = data.leadership_experience || data.leadership_skills || [];
  const certs = data.certifications || [];

  const skillName = (s) => (typeof s === "string" ? s : s.skill);
  const certName = (c) => (typeof c === "string" ? c : c.name);
  const gapText = (g) => (typeof g === "string" ? g : g.gap);

  return (
    <div className="space-y-6">
      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-400" />
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Skill Gaps for {targetRole}</h3>
        </div>
        {gaps.length > 0 ? (
          <div className="space-y-3">
            {gaps.map((gap, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">⚠</span>
                  <div>
                    <p className="text-white/60 text-sm">{gapText(gap)}</p>
                    {typeof gap === "object" && gap.action && <p className="text-white/40 text-xs mt-1">→ {gap.action}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-white/40 text-sm">No significant skill gaps identified. You're well-positioned for this role.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Wrench size={16} className="text-indigo-400" /><h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Technical Skills</h3></div>
          {techSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">{techSkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400">{skillName(s)}</span>)}</div>
          ) : <p className="text-white/30 text-sm">None identified</p>}
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Crown size={16} className="text-violet-400" /><h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Leadership Skills</h3></div>
          {leadSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">{leadSkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-400">{skillName(s)}</span>)}</div>
          ) : <p className="text-white/30 text-sm">None identified</p>}
        </div>
      </div>

      {certs.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><CheckCircle size={16} className="text-emerald-400" /><h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Certifications</h3></div>
          <div className="flex flex-wrap gap-1.5">{certs.map((c, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400">{certName(c)}</span>)}</div>
        </div>
      )}
    </div>
  );
}