import React from "react";
import { FileText, ShieldCheck, KeyRound, Ticket, Users } from "lucide-react";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildPlatformValidationReport } from "@/lib/reports/platformValidationReport";

const REPORT_CARDS = [
  { type: "executive_summary", icon: ShieldCheck, label: "Identity Report", desc: "Overall identity health, providers, and sync status." },
  { type: "audit", icon: FileText, label: "SSO Report", desc: "SSO configuration, protocols, and authentication summary." },
  { type: "audit", icon: KeyRound, label: "SCIM Report", desc: "Provisioning operations, group sync, and lifecycle events." },
  { type: "security", icon: ShieldCheck, label: "Security Report", desc: "MFA adoption, failed logins, blocked accounts, and risk posture." },
  { type: "procurement", icon: Ticket, label: "License Report", desc: "License automation assignments and allocation breakdown." },
  { type: "board", icon: Users, label: "Executive Report", desc: "Board-level identity and access management overview." },
  { type: "audit", icon: FileText, label: "Audit Report", desc: "Complete identity audit trail across all providers." },
  { type: "board", icon: FileText, label: "Board Report", desc: "Strategic identity governance and compliance summary." },
];

export default function IdentityReporting({ user }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2"><FileText size={14} className="text-indigo-400" /><span className="text-white/60 text-sm font-medium">Enterprise Report Engine™ · Identity</span></div>
        <ReportToolbar reportBuilder={(type) => buildPlatformValidationReport(type, user)} filenamePrefix="Enterprise-Identity-Report" supportCSV />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORT_CARDS.map((r, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-indigo-500/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3"><r.icon size={16} className="text-indigo-400" /></div>
            <h3 className="text-white text-sm font-medium mb-1">{r.label}</h3>
            <p className="text-white/40 text-xs leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <p className="text-white/40 text-xs">Reports are generated on-demand using the Enterprise Report Engine™ and integrate with Organization Management™, Enterprise Administration™, Guardian™, Trust Center™, and Audit Center™ data.</p>
      </div>
    </div>
  );
}