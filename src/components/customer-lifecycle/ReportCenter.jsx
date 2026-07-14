import React, { useState } from "react";
import { FileText, Download, Printer, FileSpreadsheet, Building2, User, Award, Clock, BarChart3, RefreshCw } from "lucide-react";
import { SectionCard, StatCard } from "./Shared";

const REPORT_TYPES = [
  { id: "customer_health", label: "Customer Health Report", icon: User, description: "Individual customer health, engagement, and risk assessment" },
  { id: "org_health", label: "Organization Health Report", icon: Building2, description: "Enterprise organization health and member overview" },
  { id: "leadership_progress", label: "Leadership Progress Report", icon: Award, description: "Learning, simulations, reputation, and readiness progress" },
  { id: "customer_timeline", label: "Customer Timeline", icon: Clock, description: "Unified activity timeline across all touchpoints" },
  { id: "executive_summary", label: "Executive Summary", icon: BarChart3, description: "Board-level summary of customer lifecycle metrics" },
  { id: "board_report", label: "Board Report", icon: FileText, description: "Strategic board presentation with KPIs and trends" },
  { id: "renewal_report", label: "Renewal Report", icon: RefreshCw, description: "Upcoming renewals, churn risk, and expansion opportunities" },
  { id: "journey_analytics", label: "Journey Analytics Report", icon: BarChart3, description: "Funnel conversion, drop-off, and lifecycle analytics" },
];

export default function ReportCenter({ data }) {
  const [generating, setGenerating] = useState(null);
  const [generatedReports, setGeneratedReports] = useState([]);

  function generateReport(type) {
    setGenerating(type.id);
    setTimeout(() => {
      const report = {
        id: `RPT-CLM-${Date.now().toString().slice(-6)}`,
        type: type.id,
        label: type.label,
        generatedAt: new Date().toISOString(),
        data: buildReportData(type.id, data),
      };
      setGeneratedReports((prev) => [report, ...prev]);
      setGenerating(null);
    }, 800);
  }

  function buildReportData(typeId, data) {
    const { customers, organizations, pipeline, journeyAnalytics, playbooks } = data;
    switch (typeId) {
      case "customer_health":
        return customers.slice(0, 20).map((c) => ({ name: c.fullName || c.email, health: c.health.total, risk: c.health.riskLevel, stage: c.lifecycleStage, engagement: c.telemetryCount, usage: c.usageCount }));
      case "org_health":
        return organizations.map((o) => ({ name: o.organization.name || o.organization.organization_name, members: o.memberCount, health: o.avgHealth, revenue: o.revenue, active: o.activeMembers }));
      case "leadership_progress":
        return customers.filter((c) => c.lessonProgress?.length || c.simulations?.length).slice(0, 20).map((c) => ({ name: c.fullName || c.email, lessons: c.lessonProgress?.length || 0, sims: c.simulations?.length || 0, certs: c.certificateCount, reputation: c.reputation?.reputation_score || 0 }));
      case "customer_timeline":
        return customers.flatMap((c) => c.timeline?.slice(0, 3).map((e) => ({ customer: c.fullName || c.email, event: e.label, date: e.date })) || []).slice(0, 30);
      case "executive_summary":
        return [{ totalCustomers: customers.length, avgHealth: Math.round(customers.reduce((s, c) => s + c.health.total, 0) / Math.max(1, customers.length)), atRisk: customers.filter((c) => ["critical", "high"].includes(c.health.riskLevel)).length, champions: customers.filter((c) => c.lifecycleStage === "champion").length, organizations: organizations.length, playbooks: playbooks.total }];
      case "board_report":
        return [{ acquisition: journeyAnalytics.acquisition, activation: journeyAnalytics.activation, engagement: journeyAnalytics.engagement, retention: journeyAnalytics.retention, expansion: journeyAnalytics.expansion, referrals: journeyAnalytics.referralCount, graduation: journeyAnalytics.graduation }];
      case "renewal_report":
        return customers.filter((c) => c.lifecycleStage === "renewal" || c.subscription?.status === "renewing").map((c) => ({ name: c.fullName || c.email, health: c.health.total, plan: c.subscription?.plan, status: c.subscription?.status }));
      case "journey_analytics":
        return pipeline.stages.map((s) => ({ stage: s.label, count: s.count, conversion: s.conversionRate, dropoff: 100 - s.conversionRate }));
      default:
        return [];
    }
  }

  function exportReport(report, format) {
    if (format === "csv") {
      const headers = Object.keys(report.data[0] || {});
      const rows = report.data.map((row) => headers.map((h) => `"${row[h] ?? ""}"`).join(","));
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${report.id}.csv`; a.click();
      URL.revokeObjectURL(url);
    } else if (format === "print") {
      window.print();
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Report Types" value={REPORT_TYPES.length} icon={FileText} accent="indigo" />
        <StatCard label="Generated" value={generatedReports.length} icon={Download} accent="emerald" />
        <StatCard label="Customers" value={data.customers.length} icon={User} accent="cyan" />
        <StatCard label="Organizations" value={data.organizations.length} icon={Building2} accent="purple" />
      </div>

      <SectionCard title="Available Reports" icon={FileText}>
        <div className="grid md:grid-cols-2 gap-3">
          {REPORT_TYPES.map((type) => (
            <div key={type.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <type.icon size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{type.label}</p>
                    <p className="text-white/30 text-xs">{type.description}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => generateReport(type)} disabled={generating === type.id}
                className="w-full mt-2 px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 disabled:opacity-50 transition-colors">
                {generating === type.id ? "Generating…" : "Generate Report"}
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {generatedReports.length > 0 && (
        <SectionCard title="Generated Reports" icon={Download}>
          <div className="space-y-2">
            {generatedReports.map((report) => (
              <div key={report.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{report.label}</p>
                    <p className="text-white/30 text-xs">{report.id} · {new Date(report.generatedAt).toLocaleString()} · {report.data.length} records</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportReport(report, "csv")} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white/70 flex items-center gap-1">
                      <FileSpreadsheet size={12} /> CSV
                    </button>
                    <button onClick={() => exportReport(report, "print")} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white/70 flex items-center gap-1">
                      <Printer size={12} /> Print
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-32 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-[#0a0a0f]">
                      <tr className="text-white/40">
                        {report.data[0] && Object.keys(report.data[0]).map((k) => <th key={k} className="text-left py-1 px-2">{k}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t border-white/5">
                          {Object.values(row).map((v, j) => <td key={j} className="py-1 px-2 text-white/60">{String(v)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}