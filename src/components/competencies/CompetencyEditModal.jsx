import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Save, BadgeCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  getCategoryById,
  getProficiencyById,
  PROFICIENCY_LEVELS,
  VERIFICATION_SOURCES,
} from "@/lib/competencyCatalog";

export default function CompetencyEditModal({ competency, onClose, onSave, onDelete }) {
  const cat = getCategoryById(competency.category);
  const CatIcon = cat?.icon;
  const [form, setForm] = useState({
    proficiency: competency.proficiency || "awareness",
    years_experience: competency.years_experience || 0,
    verified: competency.verified || false,
    verification_source: competency.verification_source || "manual",
    evidence: competency.evidence || "",
    competency_score: competency.competency_score || 0,
    growth_trend: competency.growth_trend || "stable",
  });

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const TrendIcon = form.growth_trend === "up" ? TrendingUp : form.growth_trend === "down" ? TrendingDown : Minus;
  const trendColor = form.growth_trend === "up" ? "text-emerald-400" : form.growth_trend === "down" ? "text-red-400" : "text-white/40";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0" style={{ background: `${cat?.color || "#6366f1"}0d` }}>
            <div className="flex items-center gap-3">
              {CatIcon && (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}20` }}>
                  <CatIcon size={20} style={{ color: cat.color }} />
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold text-sm">{competency.competency_name}</h3>
                <p className="text-white/40 text-xs">{cat?.label} · {competency.subcategory}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Competency Score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Competency Score</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setField("growth_trend", form.growth_trend === "up" ? "stable" : "up")}
                    className={`p-1 rounded ${form.growth_trend === "up" ? "bg-emerald-500/20" : "hover:bg-white/5"} ${trendColor}`}
                  >
                    <TrendingUp size={12} />
                  </button>
                  <button
                    onClick={() => setField("growth_trend", form.growth_trend === "down" ? "stable" : "down")}
                    className={`p-1 rounded ${form.growth_trend === "down" ? "bg-red-500/20" : "hover:bg-white/5"} ${form.growth_trend === "down" ? "text-red-400" : "text-white/40"}`}
                  >
                    <TrendingDown size={12} />
                  </button>
                  <TrendIcon size={12} className={trendColor} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.competency_score}
                  onChange={(e) => setField("competency_score", Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-2xl font-bold text-white/90 w-12 text-right">{form.competency_score}</span>
              </div>
            </div>

            {/* Maturity Level */}
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Maturity Level</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PROFICIENCY_LEVELS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setField("proficiency", p.id)}
                    className={`px-1 py-2 rounded-lg text-[9px] font-medium border transition-all text-center leading-tight ${
                      form.proficiency === p.id
                        ? "text-white"
                        : "text-white/40 border-white/10 bg-white/[0.02] hover:bg-white/5"
                    }`}
                    style={form.proficiency === p.id ? { borderColor: p.color, backgroundColor: `${p.color}20`, color: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-white/30 mt-1.5">
                {PROFICIENCY_LEVELS.find((p) => p.id === form.proficiency)?.description}
              </p>
            </div>

            {/* Years */}
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={form.years_experience}
                onChange={(e) => setField("years_experience", Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>

            {/* Verified toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} className={form.verified ? "text-emerald-400" : "text-white/20"} />
                <div>
                  <div className="text-white/80 text-sm font-medium">Verified</div>
                  <div className="text-white/30 text-xs">Confirm this competency is validated</div>
                </div>
              </div>
              <button
                onClick={() => setField("verified", !form.verified)}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.verified ? "bg-emerald-500" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.verified ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Verification source */}
            {form.verified && (
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Verification Source</label>
                <select
                  value={form.verification_source}
                  onChange={(e) => setField("verification_source", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                >
                  {VERIFICATION_SOURCES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Evidence */}
            <div>
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Evidence</label>
              <textarea
                value={form.evidence}
                onChange={(e) => setField("evidence", e.target.value)}
                placeholder="Describe how you've demonstrated this competency..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => onDelete(competency.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
            >
              <Trash2 size={14} /> Remove
            </button>
            <button
              onClick={() => onSave(competency.id, form)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
            >
              <Save size={14} /> Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}