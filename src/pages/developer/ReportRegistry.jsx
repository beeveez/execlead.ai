import React, { useState } from "react";
import { FileText, Clock, Paperclip } from "lucide-react";
import RegistryTab from "@/components/developer/reports/RegistryTab";
import ScheduledReportsList from "@/components/developer/reports/ScheduledReportsList";
import EvidencePanel from "@/components/developer/reports/EvidencePanel";

const TABS = [
  { id: "registry", label: "Report Registry", icon: FileText },
  { id: "scheduled", label: "Scheduled Reports™", icon: Clock },
  { id: "evidence", label: "Evidence Attachments™", icon: Paperclip },
];

export default function ReportRegistry() {
  const [tab, setTab] = useState("registry");

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <FileText size={12} className="text-indigo-400" /> Developer
        </div>
        <h1 className="text-2xl font-bold text-white">Enterprise Report Registry™</h1>
        <p className="text-white/40 text-sm mt-1">Versioned registry of every enterprise report, scheduled generation, and audit-ready evidence attachments.</p>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "registry" && <RegistryTab />}
      {tab === "scheduled" && <ScheduledReportsList />}
      {tab === "evidence" && <EvidencePanel />}
    </div>
  );
}