import React, { useState } from "react";
import { REPORT_TYPES, generateReportContent } from "@/lib/releaseReadinessEngine";
import { SectionCard } from "./Shared";
import { FileText, Download, Printer, FileSpreadsheet } from "lucide-react";

export default function ReleaseReportsPanel({ reportData }) {
  const [selected, setSelected] = useState("executive");
  const [preview, setPreview] = useState(null);

  function generate() {
    const content = generateReportContent(selected, reportData);
    setPreview(content);
  }

  function downloadPDF() {
    const content = preview || generateReportContent(selected, reportData);
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const lines = content.split("\n");
      let y = 20;
      const pageHeight = doc.internal.pageSize.height;
      lines.forEach((line) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(line.startsWith("=") ? 8 : 10);
        doc.setFont(undefined, line.startsWith("EXECLEAD") || line.includes("RELEASE READINESS SCORE") ? "bold" : "normal");
        doc.text(line, 15, y);
        y += 6;
      });
      doc.save(`execlead-${selected}-report.pdf`);
    });
  }

  function downloadCSV() {
    const content = preview || generateReportContent(selected, reportData);
    const csv = content.split("\n").map((line) => `"${line.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execlead-${selected}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    const content = preview || generateReportContent(selected, reportData);
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>EXECLEAD.AI Report</title><style>body{font-family:monospace;white-space:pre-wrap;padding:40px;max-width:800px;margin:0 auto;line-height:1.6;}</style></head><body>${content.replace(/</g, "&lt;")}</body></html>`);
    win.document.close();
    win.print();
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Release Reports" icon={FileText}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.id}
              onClick={() => { setSelected(report.id); setPreview(null); }}
              className={`text-left p-3 rounded-lg border transition-colors ${
                selected === report.id
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/5"
              }`}
            >
              <div className="text-sm font-medium text-white">{report.name}</div>
              <div className="text-xs text-white/40 mt-0.5">{report.description}</div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={generate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors">
            <FileText className="w-3.5 h-3.5" /> Generate Preview
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 text-xs font-medium transition-colors">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={downloadCSV} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 text-xs font-medium transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={printReport} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 text-xs font-medium transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </SectionCard>

      {preview && (
        <SectionCard title={REPORT_TYPES.find((r) => r.id === selected)?.name || "Report"}>
          <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono leading-relaxed max-h-[60vh] overflow-y-auto">
            {preview}
          </pre>
        </SectionCard>
      )}
    </div>
  );
}