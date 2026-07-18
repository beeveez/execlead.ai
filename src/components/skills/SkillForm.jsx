import React, { useState } from "react";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXECUTIVE_DOMAINS, VERIFICATION_STATES, MARKET_DEMAND_LEVELS, calculateConfidenceScore, getConfidenceLevel, appendChangeHistory, parseJSON } from "@/lib/skillsIntelligenceEngine";

const PROFICIENCY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "resume", label: "Resume" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "ai_suggested", label: "AI Suggested" },
  { value: "work_experience", label: "Work Experience" },
  { value: "certification", label: "Certification" },
];

const EVIDENCE_TYPES = [
  { value: "resume", label: "Resume" },
  { value: "work_experience", label: "Work Experience" },
  { value: "certification", label: "Certification" },
  { value: "ai_analysis", label: "AI Resume Analysis" },
  { value: "assessment", label: "Assessment Results" },
  { value: "coach", label: "Executive Coach™" },
  { value: "company", label: "Company Evidence" },
];

export default function SkillForm({ skill, onSave, onClose }) {
  const [form, setForm] = useState({
    skill_name: skill?.skill_name || "",
    capability_domain: skill?.capability_domain || "technology",
    proficiency: skill?.proficiency || "intermediate",
    years_of_experience: skill?.years_of_experience || 0,
    last_used: skill?.last_used || "",
    acquired_year: skill?.acquired_year || "",
    verification_state: skill?.verification_state || "self_reported",
    market_demand: skill?.market_demand || "stable",
    source: skill?.source || "manual",
    related_skills_json: skill?.related_skills_json ? parseJSON(skill.related_skills_json, []).join(", ") : "",
  });
  const [evidence, setEvidence] = useState(parseJSON(skill?.evidence_json, []));
  const [newEvidence, setNewEvidence] = useState({ type: "resume", description: "" });
  const [history] = useState(skill?.change_history_json || "[]");

  const handleAddEvidence = () => {
    if (!newEvidence.description.trim()) return;
    setEvidence([...evidence, { source: EVIDENCE_TYPES.find(t => t.value === newEvidence.type)?.label, type: newEvidence.type, description: newEvidence.description }]);
    setNewEvidence({ type: "resume", description: "" });
  };

  const handleRemoveEvidence = (idx) => setEvidence(evidence.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const relatedArray = form.related_skills_json.split(",").map(s => s.trim()).filter(Boolean);
    const evidenceJson = JSON.stringify(evidence);
    const updatedHistory = appendChangeHistory(history, skill ? "skill_updated" : "skill_created", `Form saved with ${evidence.length} evidence items`);
    const confidence = calculateConfidenceScore({ ...form, evidence_json: evidenceJson });
    const level = getConfidenceLevel(confidence);
    onSave({
      ...form,
      years_of_experience: Number(form.years_of_experience) || 0,
      acquired_year: form.acquired_year ? Number(form.acquired_year) : undefined,
      evidence_json: evidenceJson,
      related_skills_json: JSON.stringify(relatedArray),
      change_history_json: updatedHistory,
      confidence_score: confidence,
      confidence_level: level,
      verified: form.verification_state !== "self_reported",
      verification_source: VERIFICATION_STATES[form.verification_state]?.label,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{skill ? "Edit Skill" : "Add Skill"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Skill Name *</label>
            <input required value={form.skill_name} onChange={e => setForm({ ...form, skill_name: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              placeholder="e.g. Strategic Thinking" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Capability Domain</label>
              <select value={form.capability_domain} onChange={e => setForm({ ...form, capability_domain: e.target.value })}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
                {EXECUTIVE_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Proficiency</label>
              <select value={form.proficiency} onChange={e => setForm({ ...form, proficiency: e.target.value })}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
                {PROFICIENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Years Exp</label>
              <input type="number" min="0" value={form.years_of_experience} onChange={e => setForm({ ...form, years_of_experience: e.target.value })}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Acquired Year</label>
              <input type="number" value={form.acquired_year} onChange={e => setForm({ ...form, acquired_year: e.target.value })}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                placeholder="e.g. 2018" />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Last Used</label>
              <input value={form.last_used} onChange={e => setForm({ ...form, last_used: e.target.value })}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                placeholder="Current" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Verification State</label>
              <select value={form.verification_state} onChange={e => setForm({ ...form, verification_state: e.target.value })}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
                {Object.entries(VERIFICATION_STATES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Market Demand</label>
              <select value={form.market_demand} onChange={e => setForm({ ...form, market_demand: e.target.value })}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
                {Object.entries(MARKET_DEMAND_LEVELS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Source</label>
            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
              {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Related Skills (Executive Skill Graph™)</label>
            <input value={form.related_skills_json} onChange={e => setForm({ ...form, related_skills_json: e.target.value })}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              placeholder="ITIL, ServiceNow, Incident Management" />
            <p className="text-[10px] text-white/20 mt-0.5">Comma-separated skill names to build the skill graph.</p>
          </div>
          {/* Evidence Management */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Skill Evidence Engine™ ({evidence.length})</label>
            <div className="mt-1 space-y-1.5">
              {evidence.map((ev, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-white/30 shrink-0">{ev.source}</span>
                  <span className="text-xs text-white/60 flex-1 truncate">{ev.description}</span>
                  <button type="button" onClick={() => handleRemoveEvidence(idx)} className="text-white/30 hover:text-red-400"><Trash2 size={11} /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <select value={newEvidence.type} onChange={e => setNewEvidence({ ...newEvidence, type: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none">
                {EVIDENCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input value={newEvidence.description} onChange={e => setNewEvidence({ ...newEvidence, description: e.target.value })}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddEvidence())}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                placeholder="Describe evidence (e.g. 'Used ServiceNow at Fujitsu for 3 years')" />
              <button type="button" onClick={handleAddEvidence} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10">
                <Plus size={14} />
              </button>
            </div>
          </div>
          {/* Confidence Preview */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Confidence Score Preview</span>
            <span className="text-sm font-bold text-white">{calculateConfidenceScore({ ...form, evidence_json: JSON.stringify(evidence) })}<span className="text-xs text-white/30">/100</span></span>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/60">Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">{skill ? "Update Skill" : "Add Skill"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}