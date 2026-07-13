import React, { useState } from "react";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { downloadPDF } from "@/lib/enterpriseReportEngine";
import { buildSecurityReport } from "@/lib/securityIntelligenceEngine";

function exportCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function SecReportToolbar({ intel, label = "Export" }) {
  const [loading, setLoading] = useState(null);
  const reportDef = buildSecurityReport(intel);

  const handlePDF = async (type) => {
    setLoading(type);
    try {
      await downloadPDF({ ...reportDef, reportType: type });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleCSV = () => {
    setLoading("csv");
    try {
      const rows = intel.tests.map((t) => ({
        TestID: t.id, Name: t.name, Category: t.categoryLabel, Status: t.status,
        Severity: t.severity, Entity: t.entity, Expected: t.expected, Actual: t.actual,
        RootCause: t.rootCause, Fix: t.fix, Owner: t.owner, RLS: t.rlsPolicy,
        ScoreGain: t.potentialScoreGain, AutoRepair: t.autoRepair, Verification: t.verificationStatus,
      }));
      exportCSV(rows, `security-tests-${Date.now()}`);
    } finally {
      setLoading(null);
    }
  };

  const buttons = [
    { label: "Executive PDF", icon: FileText, action: () => handlePDF("executive") },
    { label: "Engineering PDF", icon: FileText, action: () => handlePDF("engineering") },
    { label: "Security Report", icon: FileText, action: () => handlePDF("security") },
    { label: "Audit Report", icon: FileText, action: () => handlePDF("audit") },
    { label: "Board Report", icon: FileText, action: () => handlePDF("board") },
    { label: "CSV", icon: FileSpreadsheet, action: handleCSV },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          disabled={loading !== null}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors disabled:opacity-50"
        >
          {loading !== null ? <Loader2 size={10} className="animate-spin" /> : <btn.icon size={10} />}
          {btn.label}
        </button>
      ))}
    </div>
  );
}