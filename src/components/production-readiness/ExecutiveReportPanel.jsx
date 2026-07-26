import React from "react";
import { Download, FileText, FileSpreadsheet, FileType } from "lucide-react";
import { jsPDF } from "jspdf";

export default function ExecutiveReportPanel({ result }) {
  const { summary, overallScore, status, recommendation, evaluatedAt } = result;

  const handleExport = (format) => {
    const report = generateExportData(result);
    if (format === "json") {
      downloadFile(JSON.stringify(report, null, 2), "production-readiness-report.json", "application/json");
    } else if (format === "csv") {
      downloadFile(toCSV(report), "production-readiness-report.csv", "text/csv");
    } else if (format === "pdf") {
      exportPDF(report);
    }
  };

  return (
    <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Executive Report</h2>
          <p className="text-xs text-white/40 mt-0.5">
            Last validated: {new Date(evaluatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
          >
            <FileType className="w-3.5 h-3.5" />
            PDF
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: "Overall Score", value: `${overallScore}%`, color: status === "certified" ? "text-emerald-400" : status === "requires_attention" ? "text-amber-400" : "text-red-400" },
          { label: "Checks Passed", value: summary.totalPassed, color: "text-emerald-400" },
          { label: "Critical Issues", value: summary.criticalIssues, color: summary.criticalIssues > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Open Risks", value: summary.openRisks, color: "text-amber-400" },
          { label: "Blocked Items", value: summary.blockedItems, color: summary.blockedItems > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Recommendation", value: recommendation.replace(/_/g, " "), color: "text-white/80" },
        ].map((m) => (
          <div key={m.label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <div className="text-xs text-white/40 mb-1">{m.label}</div>
            <div className={`text-sm font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Mitigation plan */}
      {result.gateStatus.failedDomains.length > 0 && (
        <div className="border-t border-white/5 pt-4">
          <h3 className="text-sm font-semibold text-white mb-3">Mitigation Plan — Failed Domains</h3>
          <div className="space-y-2">
            {result.gateStatus.failedDomains.map((domain) => (
              <div key={domain.id} className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white/80">{domain.name}</span>
                  <span className="text-xs text-red-400">
                    {domain.score}/{domain.targetValue} — gap of {domain.targetValue - domain.score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {domain.checks.filter((c) => c.status === "fail" || c.status === "pending").map((c) => (
                    <span key={c.id} className={`text-xs px-2 py-0.5 rounded ${c.status === "fail" ? "bg-red-500/10 text-red-300" : "bg-slate-500/10 text-slate-400"}`}>
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function generateExportData(result) {
  return {
    framework: "EXECLEAD.AI Production Readiness Certification Framework",
    version: result.version,
    evaluated_at: result.evaluatedAt,
    overall_readiness_score: result.overallScore,
    certification_status: result.status,
    launch_recommendation: result.recommendation,
    release_gate: {
      all_gates_passed: result.gateStatus.allGatesPassed,
      passed: result.gateStatus.passedDomains,
      total: result.gateStatus.totalDomains,
    },
    summary: result.summary,
    domains: result.domains.map((d) => ({
      id: d.id,
      name: d.name,
      score: d.score,
      target: d.target,
      target_value: d.targetValue,
      passed: d.passedGate,
      weight: d.weight,
      checks: d.checks.map((c) => ({ label: c.label, status: c.status, evidence: c.evidence })),
    })),
  };
}

function toCSV(report) {
  const rows = [["Domain", "Score", "Target", "Passed", "Check", "Status", "Evidence"]];
  report.domains.forEach((d) => {
    d.checks.forEach((c) => {
      rows.push([d.name, d.score, d.target, d.passed ? "YES" : "NO", c.label, c.status, c.evidence]);
    });
  });
  return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Production Readiness Certification Report", margin, y);
  y += 24;

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100);
  doc.text(`Framework v${report.version}  |  Evaluated: ${new Date(report.evaluated_at).toLocaleString()}`, margin, y);
  y += 20;

  // Overall metrics
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0);
  doc.text("Executive Summary", margin, y);
  y += 16;

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  const statusLabel = report.certification_status === "certified" ? "Certified" : report.certification_status === "requires_attention" ? "Requires Attention" : "Release Blocked";
  const summaryRows = [
    `Overall Readiness Score: ${report.overall_readiness_score}%`,
    `Certification Status: ${statusLabel}`,
    `Launch Recommendation: ${report.launch_recommendation.replace(/_/g, " ")}`,
    `Release Gate: ${report.release_gate.passed}/${report.release_gate.total} domains passed`,
    `Checks: ${report.summary.totalPassed} passed, ${report.summary.totalFailed} failed, ${report.summary.totalPending} pending`,
    `Critical Issues: ${report.summary.criticalIssues}  |  Open Risks: ${report.summary.openRisks}  |  Blocked Items: ${report.summary.blockedItems}`,
  ];
  summaryRows.forEach((row) => {
    doc.text(row, margin, y);
    y += 14;
  });
  y += 10;

  // Domain scores table
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Domain Scores", margin, y);
  y += 16;

  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 8, pageWidth - margin * 2, 16, "F");
  doc.text("Domain", margin + 4, y + 2);
  doc.text("Score", pageWidth - margin - 80, y + 2);
  doc.text("Target", pageWidth - margin - 50, y + 2);
  doc.text("Status", pageWidth - margin - 20, y + 2);
  y += 16;

  doc.setFont(undefined, "normal");
  report.domains.forEach((d) => {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    const passedLabel = d.passed ? "PASS" : "FAIL";
    doc.setTextColor(d.passed ? 0 : 200, 0, 0);
    doc.text(`${d.id}. ${d.name}`, margin + 4, y + 2);
    doc.text(String(d.score), pageWidth - margin - 80, y + 2);
    doc.text(d.target, pageWidth - margin - 50, y + 2);
    doc.text(passedLabel, pageWidth - margin - 20, y + 2);
    y += 14;
  });

  // Mitigation plan
  const failedDomains = report.domains.filter((d) => !d.passed);
  if (failedDomains.length > 0) {
    y += 16;
    if (y > doc.internal.pageSize.getHeight() - margin * 2) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0);
    doc.text("Mitigation Plan", margin, y);
    y += 16;

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    failedDomains.forEach((d) => {
      if (y > doc.internal.pageSize.getHeight() - margin * 2) {
        doc.addPage();
        y = margin;
      }
      doc.setFont(undefined, "bold");
      doc.setTextColor(200, 0, 0);
      doc.text(`${d.name} — Score: ${d.score}/${d.target_value}`, margin, y);
      y += 12;
      doc.setFont(undefined, "normal");
      doc.setTextColor(80, 80, 80);
      const failedChecks = d.checks.filter((c) => c.status === "fail" || c.status === "pending");
      failedChecks.forEach((c) => {
        const lines = doc.splitTextToSize(`  • [${c.status.toUpperCase()}] ${c.label}`, pageWidth - margin * 2 - 20);
        lines.forEach((line) => {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin + 4, y);
          y += 11;
        });
      });
      y += 6;
    });
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("EXECLEAD.AI Production Readiness Certification Framework — One Leadership Journey. One AI Platform. One Production Standard.", margin, doc.internal.pageSize.getHeight() - 20);

  doc.save("production-readiness-report.pdf");
}