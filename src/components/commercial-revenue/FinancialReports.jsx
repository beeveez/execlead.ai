import React from "react";
import { FileDown, FileJson, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import { SectionHeader, BetaBanner } from "./shared";

const REPORTS = [
  { id: "executive", label: "Executive Commercial Report", icon: FileText },
  { id: "board", label: "Board Revenue Report", icon: FileText },
  { id: "investor", label: "Investor Summary", icon: FileText },
  { id: "forecast", label: "Commercial Forecast", icon: FileText },
  { id: "engine", label: "Revenue Engine Analysis", icon: FileText },
  { id: "abr", label: "Annual Business Review (ABR)", icon: FileText },
  { id: "qbr", label: "Quarterly Business Review (QBR)", icon: FileText },
];

export default function FinancialReports({ kpis, data }) {
  const exportJson = (reportId) => {
    const report = buildReport(reportId, kpis, data);
    download(`${reportId}.json`, JSON.stringify(report, null, 2), "application/json");
  };
  const exportMd = (reportId) => {
    const report = buildReport(reportId, kpis, data);
    const md = renderMd(report);
    download(`${reportId}.md`, md, "text/markdown");
  };

  return (
    <div>
      <SectionHeader icon={FileDown} title="Financial Reports™" subtitle="Generate executive, board, and investor reports with commercial metrics — exportable as Markdown and JSON." />
      <BetaBanner />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2"><r.icon size={15} className="text-indigo-400" /><span className="text-sm text-white font-semibold">{r.label}</span></div>
            <div className="flex gap-2">
              <button onClick={() => exportMd(r.id)} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-lg"><FileText size={11} /> MD</button>
              <button onClick={() => exportJson(r.id)} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-lg"><FileJson size={11} /> JSON</button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 mt-4">
        <p className="text-xs text-amber-300/90">PowerPoint, PDF, and Excel exports are planned for General Availability. Current exports are Markdown and JSON — board-ready text formats.</p>
      </div>
    </div>
  );
}

function buildReport(id, kpis, data) {
  const base = { report: id, generatedAt: new Date().toISOString(), beta: true, kpis: { arr: kpis.arr.value, mrr: kpis.mrr.value, qrr: kpis.qrr.value, totalCustomers: kpis.total_customers.value, enterpriseCustomers: kpis.enterprise_customers.value, pipelineValue: kpis.pipeline_value.value, acv: kpis.acv.value, collectedRevenue: kpis._meta.collectedRevenue, wonQuotes: kpis._meta.wonQuotes }, customers: (data.orgs || []).map((o) => ({ name: o.name, plan: o.plan, industry: o.industry, country: o.country, seats: `${o.seats_used}/${o.seats_total}` })), quotes: (data.quotes || []).map((q) => ({ organization: q.organization_name, status: q.status, annualValue: q.annual_value, industry: q.industry })) };
  return base;
}
function renderMd(r) {
  const k = r.kpis;
  return `# ${r.report.replace(/_/g, " ").toUpperCase()}\n\n_Generated ${r.generatedAt} · Founding Private Beta™_\n\n## Commercial KPIs\n\n- ARR: ${k.arr || 0}\n- MRR: ${k.mrr || 0}\n- QRR: ${k.qrr || 0}\n- Total Customers: ${k.totalCustomers}\n- Enterprise Customers: ${k.enterpriseCustomers}\n- Pipeline Value: ${k.pipelineValue}\n- ACV: ${k.acv || 0}\n- Collected Revenue: ${k.collectedRevenue}\n- Won Quotes: ${k.wonQuotes}\n\n## Customers\n\n${r.customers.map((c) => `- ${c.name} (${c.plan}, ${c.industry}, ${c.country}, seats ${c.seats})`).join("\n") || "_None yet_"}\n\n## Pipeline\n\n${r.quotes.map((q) => `- ${q.organization} — ${q.status} — ${q.annualValue} (${q.industry})`).join("\n") || "_None yet_"}\n`;
}
function download(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
}