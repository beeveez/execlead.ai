import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Loader2, FileText, Sparkles } from "lucide-react";
import { applySync, calculateCompleteness } from "@/lib/resumeSync";

const SECTIONS = [
  { id: "personal", label: "Personal Info", type: "scalar", fields: [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "mobile_number", label: "Phone" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "linkedin_url", label: "LinkedIn" },
    { key: "portfolio_url", label: "Portfolio" },
    { key: "website_url", label: "Website" },
    { key: "github_url", label: "GitHub" },
  ]},
  { id: "executive", label: "Executive Profile", type: "scalar", fields: [
    { key: "professional_headline", label: "Headline" },
    { key: "bio", label: "Bio" },
    { key: "industry", label: "Industry" },
    { key: "years_experience", label: "Years Exp" },
    { key: "current_company", label: "Current Company" },
    { key: "current_role", label: "Current Role" },
  ]},
  { id: "experience", label: "Work Experience", type: "array", itemLabel: (i) => `${i.role || "Role"} at ${i.company || "Company"}` },
  { id: "education", label: "Education", type: "array", itemLabel: (i) => `${i.degree || "Degree"} — ${i.school || "School"}` },
  { id: "certifications", label: "Certifications", type: "array", itemLabel: (i) => i.name || "Certification" },
  { id: "skills", label: "Skills", type: "array", itemLabel: (i) => i },
];

const MODES = [
  { id: "keep", label: "Keep Existing", color: "white" },
  { id: "replace", label: "Replace", color: "indigo" },
  { id: "merge", label: "Merge", color: "emerald" },
];

function ModeToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
            value === m.id
              ? m.id === "replace"
                ? "bg-indigo-500/20 text-indigo-400"
                : m.id === "merge"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-white/10 text-white/70"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function FieldDiff({ label, current, newValue, mode }) {
  const willChange = mode !== "keep" && newValue && newValue !== current;
  const willAdd = mode === "merge" && !current && newValue;
  return (
    <div className="flex items-start gap-2 py-1.5 text-xs">
      <span className="text-white/30 w-24 flex-shrink-0">{label}</span>
      <span className={`flex-1 truncate ${current ? "text-white/50" : "text-white/20 italic"}`}>
        {current || "empty"}
      </span>
      {willChange && (
        <>
          <ArrowRight size={10} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <span className={`flex-1 truncate ${willAdd ? "text-emerald-400" : "text-indigo-400"}`}>
            {newValue}
          </span>
        </>
      )}
    </div>
  );
}

function ArrayDiff({ label, current, incoming, mode, itemLabel }) {
  const currentItems = current || [];
  const newItems = incoming || [];
  const newCount = mode === "replace" ? newItems.length : mode === "merge" ? newItems.length : 0;
  const totalAfter = mode === "keep" ? currentItems.length : mode === "replace" ? newItems.length : currentItems.length + newItems.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/50">{currentItems.length} current</span>
        {mode !== "keep" && (
          <>
            <ArrowRight size={10} className="text-indigo-400" />
            <span className={mode === "merge" ? "text-emerald-400" : "text-indigo-400"}>
              {totalAfter} after sync (+{newItems.length} from resume)
            </span>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-white/20">Current</div>
          {currentItems.length === 0 ? (
            <div className="text-white/20 italic text-xs">None</div>
          ) : (
            currentItems.slice(0, 5).map((item, i) => (
              <div key={i} className="text-xs text-white/50 truncate">• {itemLabel(item)}</div>
            ))
          )}
          {currentItems.length > 5 && <div className="text-[10px] text-white/20">+{currentItems.length - 5} more</div>}
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-white/20">From Resume</div>
          {newItems.length === 0 ? (
            <div className="text-white/20 italic text-xs">None detected</div>
          ) : (
            newItems.slice(0, 5).map((item, i) => (
              <div key={i} className="text-xs text-indigo-400/80 truncate">• {itemLabel(item)}</div>
            ))
          )}
          {newItems.length > 5 && <div className="text-[10px] text-white/20">+{newItems.length - 5} more</div>}
        </div>
      </div>
    </div>
  );
}

export default function ResumeSyncModal({ extractedForm, currentForm, onApply, onClose, fileName }) {
  const [decisions, setDecisions] = useState(() => {
    const d = {};
    for (const s of SECTIONS) {
      const hasNew = s.type === "scalar"
        ? s.fields.some((f) => extractedForm[f.key])
        : (extractedForm[s.id]?.length || 0) > 0;
      const hasCurrent = s.type === "scalar"
        ? s.fields.some((f) => currentForm[f.key])
        : (currentForm[s.id]?.length || 0) > 0;
      d[s.id] = hasNew ? (hasCurrent ? "merge" : "replace") : "keep";
    }
    return d;
  });
  const [applying, setApplying] = useState(false);

  const previewForm = useMemo(() => applySync(currentForm, extractedForm, decisions), [currentForm, extractedForm, decisions]);
  const beforeCompleteness = useMemo(() => calculateCompleteness(currentForm), [currentForm]);
  const afterCompleteness = useMemo(() => calculateCompleteness(previewForm), [previewForm]);

  const handleApply = async () => {
    setApplying(true);
    await new Promise((r) => setTimeout(r, 300));
    onApply(previewForm);
    setApplying(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Sparkles size={18} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Review Resume Data</h2>
                <p className="text-white/40 text-xs flex items-center gap-1">
                  <FileText size={10} /> {fileName || "resume.pdf"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Completeness Bar */}
          <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40 font-medium">Identity Completion</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/30">{beforeCompleteness.overall}%</span>
                <ArrowRight size={12} className="text-indigo-400" />
                <span className="text-indigo-400 font-bold">{afterCompleteness.overall}%</span>
              </div>
            </div>
            <div className="flex gap-1">
              {Object.entries(afterCompleteness.sections).map(([key, s]) => (
                <div key={key} className="flex-1 group relative">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s.score >= 80 ? "bg-emerald-500" : s.score >= 50 ? "bg-indigo-500" : s.score > 0 ? "bg-amber-500" : "bg-white/10"
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/90 text-white/70 text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    {s.label}: {s.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {SECTIONS.map((section) => {
              const hasNew = section.type === "scalar"
                ? section.fields.some((f) => extractedForm[f.key])
                : (extractedForm[section.id]?.length || 0) > 0;

              return (
                <div key={section.id} className={`bg-white/[0.02] border rounded-xl overflow-hidden ${hasNew ? "border-white/10" : "border-white/5 opacity-50"}`}>
                  <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                    <span className="text-sm font-medium text-white/70">{section.label}</span>
                    <ModeToggle value={decisions[section.id]} onChange={(v) => setDecisions({ ...decisions, [section.id]: v })} />
                  </div>
                  {hasNew && (
                    <div className="px-4 py-3">
                      {section.type === "scalar" ? (
                        section.fields.map((f) => (
                          <FieldDiff
                            key={f.key}
                            label={f.label}
                            current={currentForm[f.key]}
                            newValue={extractedForm[f.key]}
                            mode={decisions[section.id]}
                          />
                        ))
                      ) : (
                        <ArrayDiff
                          label={section.label}
                          current={currentForm[section.id]}
                          incoming={extractedForm[section.id]}
                          mode={decisions[section.id]}
                          itemLabel={section.itemLabel}
                        />
                      )}
                    </div>
                  )}
                  {!hasNew && (
                    <div className="px-4 py-3 text-xs text-white/20 italic">No data detected in resume for this section</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const d = {};
                  for (const s of SECTIONS) d[s.id] = "replace";
                  setDecisions(d);
                }}
                className="px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={() => {
                  const d = {};
                  for (const s of SECTIONS) d[s.id] = "keep";
                  setDecisions(d);
                }}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 text-xs font-medium transition-colors"
              >
                Reject All
              </button>
              <span className="text-xs text-white/30 ml-2">
                {Object.values(decisions).filter((d) => d !== "keep").length} section(s) will be updated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-white/40 hover:text-white/70 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
              >
                {applying ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Apply to Identity
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}