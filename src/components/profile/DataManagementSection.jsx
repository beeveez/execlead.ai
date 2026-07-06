import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionCard } from "./FormFields";
import VersionHistory from "./VersionHistory";
import { clearImportedData, clearResumeData, resetExecutiveIdentity, clearSection, CLEARABLE_SECTIONS } from "@/lib/identityVersioning";
import { Database, Trash2, RotateCcw, Upload, AlertTriangle, Loader2, ShieldCheck, Layers } from "lucide-react";

function ConfirmDialog({ open, title, message, onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0d0d14] border border-red-500/20 rounded-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <h2 className="text-white font-bold text-base">{title}</h2>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{message}</p>
            <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-2">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-white/40 text-xs">Your account, subscription, billing, and settings will not be affected.</p>
            </div>
          </div>
          <div className="p-4 border-t border-white/5 flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg text-white/40 hover:text-white/70 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={busy} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Continue
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const ACTION_ROWS = [
  { id: "imported", label: "Clear Imported Data", desc: "Remove Executive Profile, Experience, Education, Certifications, Skills, Social Links, Target Career", icon: Layers, danger: true },
  { id: "resume", label: "Clear Resume Data", desc: "Remove resume file and all data imported from it", icon: Trash2, danger: true },
  { id: "reset", label: "Reset Executive Identity", desc: "Clear all identity and professional data. Start fresh.", icon: RotateCcw, danger: true },
  { id: "reimport", label: "Re-import Resume", desc: "Upload a new resume to replace or merge identity data", icon: Upload, danger: false },
];

export default function DataManagementSection({ form, profile, onApplyForm, onResumeFile }) {
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const handleAction = (id) => {
    if (id === "reimport") {
      fileRef.current?.click();
      return;
    }
    const messages = {
      imported: "This action will remove imported profile information. Your account, subscription, billing and settings will not be affected. Continue?",
      resume: "This will remove your resume file and all data imported from it. Your account, subscription, billing and settings will not be affected. Continue?",
      reset: "This action will remove all Executive Identity and professional data. Your account, subscription, billing and settings will not be affected. Continue?",
    };
    setConfirm({ id, message: messages[id] });
  };

  const executeConfirm = async () => {
    setBusy(true);
    try {
      if (confirm.id === "imported") {
        await onApplyForm(clearImportedData(form), "Imported data has been cleared.");
      } else if (confirm.id === "resume") {
        await onApplyForm(clearResumeData(form), "Resume data has been cleared.");
      } else if (confirm.id === "reset") {
        await onApplyForm(resetExecutiveIdentity(form), "Executive Identity has been reset.");
      }
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const handleSectionClear = async (sectionId) => {
    await onApplyForm(clearSection(form, sectionId), `${CLEARABLE_SECTIONS.find(s => s.id === sectionId)?.label} cleared.`);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) onResumeFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Data Management" description="Full control over AI-imported data. Recover from incorrect imports at any time." icon={Database}>
        <div className="space-y-2">
          {ACTION_ROWS.map((row) => (
            <div key={row.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${row.danger ? "bg-red-500/10" : "bg-indigo-500/10"}`}>
                <row.icon size={16} className={row.danger ? "text-red-400" : "text-indigo-400"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium">{row.label}</div>
                <div className="text-white/30 text-xs">{row.desc}</div>
              </div>
              <button
                onClick={() => handleAction(row.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${row.danger ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400"}`}
              >
                {row.id === "reimport" ? "Upload" : "Clear"}
              </button>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFile} />
      </SectionCard>

      <SectionCard title="Clear Individual Sections" description="Remove data from a single section without affecting the rest." icon={Layers}>
        <div className="grid grid-cols-2 gap-2">
          {CLEARABLE_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSectionClear(s.id)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-white/60 hover:text-red-400 text-sm font-medium transition-all"
            >
              {s.label}
              <Trash2 size={13} />
            </button>
          ))}
        </div>
      </SectionCard>

      <VersionHistory currentForm={form} onRestore={onApplyForm} />

      <ConfirmDialog
        open={!!confirm}
        title="Confirm Reset"
        message={confirm?.message}
        onConfirm={executeConfirm}
        onCancel={() => setConfirm(null)}
        busy={busy}
      />
    </div>
  );
}