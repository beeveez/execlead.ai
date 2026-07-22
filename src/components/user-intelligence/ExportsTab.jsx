import React, { useState } from "react";
import { Download, FileText, FileJson, FileSpreadsheet, Brain, Loader2 } from "lucide-react";
import { SectionCard } from "./shared";
import { base44 } from "@/api/base44Client";

export default function ExportsTab({ data, overview, revenue, funnel }) {
  const [generating, setGenerating] = useState(null);
  const [report, setReport] = useState(null);

  const exportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Users", overview.totalUsers],
      ["DAU", overview.dau],
      ["WAU", overview.wau],
      ["MAU", overview.mau],
      ["Paid Subscribers", overview.paidSubscribers],
      ["Enterprise Organizations", overview.enterpriseOrganizations],
      ["Founding Members", overview.foundingMembers],
      ["Countries", overview.countries],
      ["Growth Rate", `${overview.growthRate}%`],
      ["Retention Rate", `${overview.retentionRate}%`],
      ["Conversion Rate", `${overview.conversionRate}%`],
      ["MRR", revenue.mrr],
      ["ARR", revenue.arr],
      ["ARPU", revenue.arpu],
      ["Churn Rate", `${revenue.churnRate}%`],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    download(csv, "user-intelligence.csv", "text/csv");
  };

  const exportJSON = () => {
    const json = JSON.stringify({ overview, revenue, funnel, generatedAt: new Date().toISOString() }, null, 2);
    download(json, "user-intelligence.json", "application/json");
  };

  const download = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = async (type) => {
    setGenerating(type);
    setReport(null);
    try {
      const prompt = `Generate a ${type} for EXECLEAD.AI's User Intelligence dashboard. Here is the aggregated platform data:

Total Users: ${overview.totalUsers}
Active Users (DAU/WAU/MAU): ${overview.dau}/${overview.wau}/${overview.mau}
Paid Subscribers: ${overview.paidSubscribers}
Enterprise Organizations: ${overview.enterpriseOrganizations}
Founding Members: ${overview.foundingMembers}
Countries: ${overview.countries}
Growth Rate: ${overview.growthRate}%
Retention Rate: ${overview.retentionRate}%
Conversion Rate: ${overview.conversionRate}%
MRR: $${revenue.mrr?.toLocaleString()}
ARR: $${revenue.arr?.toLocaleString()}
ARPU: $${revenue.arpu}
Churn Rate: ${revenue.churnRate}%

Subscription Plans: ${JSON.stringify(revenue.planDist)}
Funnel: ${JSON.stringify(funnel)}

Provide actionable executive insights, growth recommendations, retention opportunities, and emerging trends. Format with clear headers and bullet points.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            keyFindings: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
          },
        },
      });
      setReport(result);
    } catch (e) {
      setReport({ title: "Error", summary: "Failed to generate report. Please try again.", keyFindings: [], recommendations: [], risks: [] });
    } finally {
      setGenerating(null);
    }
  };

  const exportButtons = [
    { label: "CSV Export", icon: FileSpreadsheet, onClick: exportCSV, color: "#10b981" },
    { label: "JSON Export", icon: FileJson, onClick: exportJSON, color: "#06b6d4" },
  ];

  const reportButtons = [
    { label: "Weekly Executive Summary™", type: "Weekly Executive Summary" },
    { label: "Monthly Product Intelligence Report™", type: "Monthly Product Intelligence Report" },
    { label: "Quarterly Business Intelligence Report™", type: "Quarterly Business Intelligence Report" },
    { label: "Board Report™", type: "Board Report" },
    { label: "Investor Summary™", type: "Investor Summary" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Data Exports" icon={Download}>
          <div className="space-y-2">
            {exportButtons.map((btn) => (
              <button key={btn.label} onClick={btn.onClick} className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-white/70 hover:bg-white/5 transition-colors">
                <btn.icon size={16} style={{ color: btn.color }} /> {btn.label}
              </button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="AI-Powered Reports" icon={Brain}>
          <div className="space-y-2">
            {reportButtons.map((btn) => (
              <button key={btn.label} onClick={() => generateReport(btn.type)} disabled={generating !== null}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-white/70 hover:bg-white/5 disabled:opacity-40 transition-colors">
                {generating === btn.type ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : <FileText size={16} className="text-indigo-400" />}
                {btn.label}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {report && (
        <SectionCard title={report.title || "Generated Report"} icon={FileText}>
          <div className="space-y-4">
            <p className="text-sm text-white/60 leading-relaxed">{report.summary}</p>
            {report.keyFindings?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-indigo-400 mb-2">Key Findings</h4>
                <ul className="space-y-1">{report.keyFindings.map((f, i) => <li key={i} className="text-xs text-white/50 flex gap-2"><span className="text-indigo-400">•</span> {f}</li>)}</ul>
              </div>
            )}
            {report.recommendations?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 mb-2">Recommendations</h4>
                <ul className="space-y-1">{report.recommendations.map((r, i) => <li key={i} className="text-xs text-white/50 flex gap-2"><span className="text-emerald-400">•</span> {r}</li>)}</ul>
              </div>
            )}
            {report.risks?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-amber-400 mb-2">Risks & Opportunities</h4>
                <ul className="space-y-1">{report.risks.map((r, i) => <li key={i} className="text-xs text-white/50 flex gap-2"><span className="text-amber-400">•</span> {r}</li>)}</ul>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}