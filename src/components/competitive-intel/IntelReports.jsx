import React from "react";
import { Download, FileJson, FileSpreadsheet, Grid3x3 } from "lucide-react";
import { buildComparisonMatrix } from "@/lib/competitiveIntelligence";

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function IntelReports({ competitors, evidence }) {
  const exportProfilesJson = () => download("competitor-profiles.json", JSON.stringify(competitors, null, 2), "application/json");
  const exportProfilesCsv = () => {
    const headers = ["company_name", "category", "headquarters", "founded_year", "primary_market", "primary_value_proposition", "confidence_level", "pricing_model_type"];
    const rows = competitors.map((c) => headers.map((h) => `"${String(c[h] ?? "").replace(/"/g, '""')}"`).join(","));
    download("competitor-profiles.csv", [headers.join(","), ...rows].join("\n"), "text/csv");
  };
  const exportMatrixCsv = () => {
    const matrix = buildComparisonMatrix(competitors, evidence);
    const cols = ["EXECLEAD.AI", ...competitors.map((c) => c.company_name)];
    const headers = ["Feature", ...cols];
    const rows = matrix.map((r) => [r.feature, ...cols.map((c) => r[c]?.status || "")].map((v) => `"${String(v)}"`).join(","));
    download("feature-comparison-matrix.csv", [headers.join(","), ...rows].join("\n"), "text/csv");
  };
  const btn = "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors";
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Download size={16} className="text-indigo-400" /><h2 className="text-lg font-semibold">Reports</h2></div>
      <p className="text-white/45 text-xs mb-4">Export competitive intelligence for product, sales, and strategy reviews.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={exportProfilesJson} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10 text-white/70`}><FileJson size={14} /> Profiles (JSON)</button>
        <button onClick={exportProfilesCsv} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10 text-white/70`}><FileSpreadsheet size={14} /> Profiles (CSV)</button>
        <button onClick={exportMatrixCsv} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10 text-white/70`}><Grid3x3 size={14} /> Feature Matrix (CSV)</button>
      </div>
    </div>
  );
}