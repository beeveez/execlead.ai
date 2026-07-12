import React from "react";
import { FileText, Hash, Download, Users, Calendar, GitBranch, Archive, RefreshCw, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const META = [
  { key: "generated_date", label: "Generated", icon: Calendar, fmt: (v) => v ? new Date(v).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "—" },
  { key: "report_id", label: "Report ID", icon: FileText, fmt: (v) => v || "—" },
  { key: "_engine", label: "Version", icon: GitBranch, fmt: () => "2.0" },
  { key: "integrity_hash", label: "Hash", icon: Hash, fmt: (v) => v ? `${v.slice(0, 16)}…` : "—" },
  { key: "downloads", label: "Downloads", icon: Download, fmt: (v) => v ?? 0 },
  { key: "recipients", label: "Recipients", icon: Users, fmt: (v) => v || "—" },
];

export default function ReportDetailCard({ report, versionGroup, onSelectVersion, onExportAgain, onArchive, onCompare, loading }) {
  if (!report) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <p className="text-white/40 text-sm">No report selected.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <FileText size={12} className="text-indigo-400" /> Enterprise Report Registry
          </div>
          <h2 className="text-xl font-bold text-white">{report.report_name}</h2>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 shrink-0">
          v{report.version}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {META.map((m) => (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon size={11} className="text-indigo-400" />
              <span className="text-white/40 text-[10px] uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-white/80 text-sm font-mono">{m.fmt(report[m.key])}</div>
          </div>
        ))}
      </div>

      {versionGroup.length > 1 && (
        <div className="mb-6">
          <div className="text-white/40 text-[10px] uppercase tracking-wider mb-2">History</div>
          <div className="flex items-center gap-2">
            {versionGroup.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelectVersion(v.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  v.id === report.id ? "bg-indigo-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                v{v.version}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={onCompare} variant="outline" size="sm" className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white" disabled={!!loading}>
          <ArrowLeftRight size={14} className="mr-1.5" /> Compare Reports
        </Button>
        <Button onClick={onExportAgain} size="sm" className="bg-indigo-600 hover:bg-indigo-500" disabled={!!loading}>
          {loading === "export" ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <RefreshCw size={14} className="mr-1.5" />}
          Export Again
        </Button>
        <Button onClick={onArchive} variant="outline" size="sm" className="border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white" disabled={!!loading}>
          {loading === "archive" ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Archive size={14} className="mr-1.5" />}
          Archive
        </Button>
      </div>
    </div>
  );
}