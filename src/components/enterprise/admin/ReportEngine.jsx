import React from "react";
import { FileText, ShieldCheck } from "lucide-react";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildPlatformValidationReport } from "@/lib/reports/platformValidationReport";

const REPORT_CARDS = [
  { type: "executive_summary", icon: ShieldCheck, label: "Executive Report", desc: "Board-level summary of enterprise health, licenses, and risks." },
  { type: "full_engineering", icon: FileText, label: "Administration Report", desc: "Full administrative state: users, roles, workspaces, delegation." },
  { type: "audit", icon: FileText, label: "Audit Report", desc: "Complete audit trail across user, license, and security events." },
  { type: "security", icon: ShieldCheck, label: "Security Report", desc: "Security posture, RBAC coverage, and Guardian™ findings." },
  { type: "board", icon: FileText, label: "Board Report", desc: "Strategic board overview of organization readiness." },
  { type: "procurement", icon: FileText, label: "License Report", desc: "License utilization, forecast, and procurement recommendations." },
];

export default function ReportEngine({ user }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-indigo-400" />
          <span className="text-white/60 text-sm font-medium">Enterprise Report Engine™</span>
        </div>
        <ReportToolbar reportBuilder={(type) => buildPlatformValidationReport(type, user)} filenamePrefix="Enterprise-Admin-Report" supportCSV />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORT_CARDS.map((r) => (
          <div key={r.type} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-indigo-500/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
              <r.icon size={16} className="text-indigo-400" />
            </div>
            <h3 className="text-white text-sm font-medium mb-1">{r.label}</h3>
            <p className="text-white/40 text-xs leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <p className="text-white/40 text-xs">Reports are generated on-demand using the Enterprise Report Engine™. Use the toolbar above to generate PDF, print, export JSON, or download CSV. Reports integrate governance, audit, license, and platform health data.</p>
      </div>
    </div>
  );
}