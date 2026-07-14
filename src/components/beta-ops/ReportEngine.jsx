import React from "react";
import { FileText, Download, Printer, FileSpreadsheet } from "lucide-react";
import { Panel } from "./Shared";

const REPORT_TYPES = [
  { id: "executive_summary", label: "Beta Executive Summary", desc: "High-level overview for leadership" },
  { id: "board", label: "Board Report", desc: "Comprehensive board-ready report" },
  { id: "weekly", label: "Weekly Beta Report", desc: "Weekly engagement and progress summary" },
  { id: "engagement", label: "Engagement Report", desc: "DAU/WAU/MAU and activity metrics" },
  { id: "feedback", label: "Feedback Report", desc: "All feedback, bugs, and feature requests" },
  { id: "bug", label: "Bug Report", desc: "Bug triage and status summary" },
  { id: "feature_adoption", label: "Feature Adoption Report", desc: "Module and feature usage breakdown" },
  { id: "graduation", label: "Graduation Report", desc: "Eligibility and migration status" },
];

export default function ReportEngine({ data }) {
  if (!data) return null;
  const d = data.dashboard;

  const generateReport = (type, format) => {
    const report = buildReportText(type, data);
    if (format === "print") { window.print(); return; }
    const mime = format === "csv" ? "text/csv" : "application/json";
    const ext = format === "csv" ? "csv" : format === "excel" ? "xls" : "json";
    const blob = new Blob([report], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EXECLEAD_Beta_${type}_${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Panel title="Beta Report Engine™" icon={FileText}>
        <p className="text-white/40 text-xs mb-4">Generate comprehensive reports for executives, boards, and engineering teams.</p>
        <div className="space-y-3">
          {REPORT_TYPES.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div>
                <div className="text-xs text-white/80 font-medium">{r.label}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{r.desc}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => generateReport(r.id, "print")} className="p-1.5 rounded bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors" title="Print">
                  <Printer size={12} />
                </button>
                <button onClick={() => generateReport(r.id, "json")} className="p-1.5 rounded bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors" title="Export PDF">
                  <Download size={12} />
                </button>
                <button onClick={() => generateReport(r.id, "csv")} className="p-1.5 rounded bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors" title="Export CSV">
                  <FileSpreadsheet size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function buildReportText(type, data) {
  const d = data.dashboard;
  const date = new Date().toLocaleDateString();
  const header = `EXECLEAD.AI — Founding Private Beta Report\nDate: ${date}\n\n`;
  const summary = `BETA OPERATIONS SUMMARY\nApplications: ${d.applicationsReceived} | Pending: ${d.pendingReview} | Approved: ${d.approved} | Invited: ${d.invited} | Activated: ${d.activated}\nDAU: ${d.dailyActive} | WAU: ${d.weeklyActive} | MAU: ${d.monthlyActive}\nCompletion: ${d.completionRate}% | Retention: ${d.retentionRate}% | NPS: ${d.nps || "—"}\nFeedback: ${d.feedbackReceived} | Bugs: ${d.bugReports} | Features: ${d.featureRequests}\nBeta Health Score: ${d.betaHealthScore}/100\n`;

  if (type === "board") return header + summary + `\nRECOMMENDATIONS\n${data.recommendations.map((r) => `- [${r.priority}] ${r.title}: ${r.detail}`).join("\n")}`;
  if (type === "engagement") return header + `ENGAGEMENT REPORT\n${summary}\nDaily Active: ${d.dailyActive}\nWeekly Active: ${d.weeklyActive}\nMonthly Active: ${d.monthlyActive}\nEngagement Score: ${d.engagementScore}%\nActivity Score: ${d.activityScore}%`;
  if (type === "feedback") return header + `FEEDBACK REPORT\nTotal Feedback: ${d.feedbackReceived}\nBug Reports: ${d.bugReports}\nFeature Requests: ${d.featureRequests}`;
  if (type === "bug") return header + `BUG REPORT\nTotal Bugs: ${d.bugReports}`;
  if (type === "feature_adoption") return header + `FEATURE ADOPTION REPORT\nCompletion Rate: ${d.completionRate}%\nAI Usage Score: ${d.aiUsageScore}%`;
  if (type === "graduation") return header + `GRADUATION REPORT\nEligible: ${data.graduation.eligible}\nCertified: ${data.graduation.certified}\nMigrated: ${data.graduation.migrated}`;
  return header + summary;
}