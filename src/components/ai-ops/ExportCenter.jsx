import React, { useState } from "react";
import Panel from "./Panel";
import { Download, FileText, FileJson, Printer } from "lucide-react";
import { MODULE_LABELS, modelLabel } from "@/lib/aiOperations";

export default function ExportCenter({ logs, analytics }) {
  const [exporting, setExporting] = useState(null);

  const buildRows = () => logs.map((l) => ({
    timestamp: l.created_date,
    module: MODULE_LABELS[l.module] || l.module,
    model: modelLabel(l.model),
    provider: l.provider || "",
    user: l.user_name || "",
    organization: l.organization_name || "",
    input_tokens: l.input_tokens || 0,
    output_tokens: l.output_tokens || 0,
    total_tokens: l.tokens_estimated || 0,
    cost: l.cost_estimated || 0,
    latency_ms: l.response_time_ms || 0,
    status: l.status || "success",
    error_type: l.error_type || "",
    prompt_id: l.prompt_id || "",
  }));

  const download = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const rows = buildRows();
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => `"${String(r[k]).replace(/"/g, '""')}"`).join(","))].join("\n");
    download(csv, `ai-operations-${Date.now()}.csv`, "text/csv");
  };

  const exportJSON = () => {
    download(JSON.stringify({ exportedAt: new Date().toISOString(), summary: analytics.totals, logs: buildRows() }, null, 2), `ai-operations-${Date.now()}.json`, "application/json");
  };

  const exportExcel = () => {
    // Excel-compatible: CSV with BOM so Excel opens UTF-8 correctly.
    const rows = buildRows();
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = "\uFEFF" + [keys.join("\t"), ...rows.map((r) => keys.map((k) => String(r[k])).join("\t"))].join("\n");
    download(csv, `ai-operations-${Date.now()}.xls`, "application/vnd.ms-excel");
  };

  const exportPDF = () => window.print();

  const options = [
    { key: "csv", label: "CSV", icon: FileText, fn: exportCSV },
    { key: "excel", label: "Excel", icon: Download, fn: exportExcel },
    { key: "pdf", label: "PDF", icon: Printer, fn: exportPDF },
    { key: "json", label: "JSON", icon: FileJson, fn: exportJSON },
  ];

  const handle = async (opt) => {
    setExporting(opt.key);
    try { opt.fn(); } catch (e) {}
    setTimeout(() => setExporting(null), 800);
  };

  return (
    <Panel title="Export Center" icon={Download}>
      <p className="text-xs text-white/30 mb-3">Export the current filtered dataset ({logs.length} records).</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {options.map((opt) => (
          <button key={opt.key} onClick={() => handle(opt)} disabled={exporting === opt.key} className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] text-white/60 hover:text-white transition-all disabled:opacity-50">
            <opt.icon size={18} className={exporting === opt.key ? "animate-pulse text-indigo-400" : ""} />
            <span className="text-xs font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}