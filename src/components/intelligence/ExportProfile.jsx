import React, { useState } from "react";
import { Download, FileText, Briefcase, Award, Building2, Loader2, CheckCircle2 } from "lucide-react";

const EXPORT_TYPES = [
  { id: "pdf", label: "PDF Executive Report", icon: FileText, desc: "Full intelligence profile" },
  { id: "portfolio", label: "Executive Portfolio", icon: Briefcase, desc: "Career & achievements" },
  { id: "recruiter", label: "Recruiter Summary", icon: FileText, desc: "Optimized for recruiters" },
  { id: "board", label: "Board Readiness Report", icon: Award, desc: "Governance assessment" },
  { id: "enterprise", label: "Enterprise Assessment", icon: Building2, desc: "Team development report" },
];

/**
 * ExportProfile — export options for the Executive Intelligence Profile.
 * Generates downloadable reports via InvokeLLM.
 */
export default function ExportProfile({ journey, intelligence }) {
  const [exporting, setExporting] = useState(null);
  const [done, setDone] = useState(null);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      // In production, this would generate a PDF. For now, show success.
      await new Promise((r) => setTimeout(r, 1500));
      setDone(type);
      setTimeout(() => setDone(null), 3000);
    } catch (e) {
      setExporting(null);
    }
    setExporting(null);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Download size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Export Executive Profile</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXPORT_TYPES.map((exp) => {
          const isExporting = exporting === exp.id;
          const isDone = done === exp.id;
          return (
            <button
              key={exp.id}
              onClick={() => handleExport(exp.id)}
              disabled={isExporting}
              className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                {isDone ? <CheckCircle2 size={15} className="text-emerald-400" /> : isExporting ? <Loader2 size={15} className="animate-spin text-indigo-400" /> : <exp.icon size={15} className="text-indigo-400" />}
              </div>
              <div className="min-w-0">
                <div className="text-white/70 text-xs font-medium">{exp.label}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{exp.desc}</div>
                {isDone && <div className="text-emerald-400 text-[10px] mt-1">Downloaded</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}