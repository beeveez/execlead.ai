import React, { useState, useMemo } from "react";
import { GitCompare, ArrowUp, ArrowDown, Plus, Briefcase, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function VersionCompare({ versions }) {
  const [v1Id, setV1Id] = useState("");
  const [v2Id, setV2Id] = useState("");

  const comparison = useMemo(() => {
    if (!v1Id || !v2Id) return null;
    const v1 = versions.find(v => v.id === v1Id);
    const v2 = versions.find(v => v.id === v2Id);
    if (!v1 || !v2) return null;
    let d1, d2;
    try { d1 = JSON.parse(v1.extracted_data); d2 = JSON.parse(v2.extracted_data); } catch { return null; }

    const scores = [
      { label: "Executive Readiness", v1: d1.executive_readiness_score, v2: d2.executive_readiness_score },
      { label: "Promotion Readiness", v1: d1.promotion_readiness, v2: d2.promotion_readiness },
      { label: "Leadership Maturity", v1: d1.leadership_maturity, v2: d2.leadership_maturity },
      { label: "Commercial Maturity", v1: d1.commercial_maturity, v2: d2.commercial_maturity },
      { label: "Executive Presence", v1: d1.executive_presence, v2: d2.executive_presence },
      { label: "Communication", v1: d1.communication_assessment, v2: d2.communication_assessment },
    ];

    const oldSkills = new Set([...(d1.technical_skills || []), ...(d1.leadership_skills || [])]);
    const newSkills = [...(d2.technical_skills || []), ...(d2.leadership_skills || [])].filter(s => !oldSkills.has(s));
    const oldCerts = new Set(d1.certifications || []);
    const newCerts = (d2.certifications || []).filter(c => !oldCerts.has(c));
    const roleChange = (d2.career_history || []).length - (d1.career_history || []).length;

    return { scores, newSkills, newCerts, roleChange };
  }, [v1Id, v2Id, versions]);

  if (versions.length < 2) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
        <GitCompare size={32} className="mx-auto text-white/20 mb-3" />
        <p className="text-white/40 text-sm">Upload at least 2 resume versions to compare improvements over time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <GitCompare size={18} className="text-indigo-400" />
        <select value={v1Id} onChange={e => setV1Id(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="" className="bg-[#0d0d14]">Version 1 (older)</option>
          {versions.map((v, i) => <option key={v.id} value={v.id} className="bg-[#0d0d14]">Version {versions.length - i} · {new Date(v.created_date).toLocaleDateString()}</option>)}
        </select>
        <span className="text-white/30">→</span>
        <select value={v2Id} onChange={e => setV2Id(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="" className="bg-[#0d0d14]">Version 2 (newer)</option>
          {versions.map((v, i) => <option key={v.id} value={v.id} className="bg-[#0d0d14]">Version {versions.length - i} · {new Date(v.created_date).toLocaleDateString()}</option>)}
        </select>
      </div>

      {comparison && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {comparison.scores.map(s => {
              const diff = (s.v2 || 0) - (s.v1 || 0);
              return (
                <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <p className="text-white/30 text-xs mb-1">{s.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">{s.v1 || 0}</span>
                    <span className="text-white/20 text-xs">→</span>
                    <span className="text-white font-bold text-lg">{s.v2 || 0}</span>
                    {diff !== 0 && (
                      <span className={`flex items-center gap-0.5 text-xs ${diff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {diff > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{Math.abs(diff)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {comparison.newSkills.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Plus size={14} className="text-emerald-400" /><h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">New Skills Added</h3></div>
              <div className="flex flex-wrap gap-1.5">{comparison.newSkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400">{s}</span>)}</div>
            </div>
          )}

          {comparison.newCerts.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Award size={14} className="text-amber-400" /><h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider">New Certifications</h3></div>
              <div className="flex flex-wrap gap-1.5">{comparison.newCerts.map((c, i) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400">{c}</span>)}</div>
            </div>
          )}

          {comparison.roleChange > 0 && (
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-5">
              <div className="flex items-center gap-2"><Briefcase size={14} className="text-indigo-400" /><h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Career Progression</h3></div>
              <p className="text-white/60 text-sm mt-2">+{comparison.roleChange} new role(s) added since the previous version.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}