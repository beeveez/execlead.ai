import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { normalizeImportedCompany, logAudit } from "@/lib/companyAdmin";
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle, Download } from "lucide-react";

const IMPORT_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" }, industry: { type: "string" }, country: { type: "string" },
    headquarters: { type: "string" }, company_size: { type: "string" }, revenue: { type: "string" },
    employee_count: { type: "number" }, ceo: { type: "string" }, description: { type: "string" },
    mission: { type: "string" }, vision: { type: "string" }, core_values: { type: "string" },
    leadership_principles: { type: "string" }, corporate_culture: { type: "string" },
    business_model: { type: "string" }, technology_stack: { type: "string" },
    ai_strategy: { type: "string" }, cloud_strategy: { type: "string" },
    digital_transformation_strategy: { type: "string" }, interview_style: { type: "string" },
    executive_expectations: { type: "string" }, leadership_competencies: { type: "string" },
    executive_behaviors: { type: "string" }, promotion_expectations: { type: "string" },
    career_paths: { type: "string" }, common_interview_questions: { type: "string" },
    executive_case_studies: { type: "string" }, recommended_certifications: { type: "string" },
    recommended_books: { type: "string" }, recommended_courses: { type: "string" },
    strategic_priorities: { type: "string" }, competitors: { type: "string" },
    major_products: { type: "string" }, services: { type: "string" }, benefits: { type: "string" },
    salary_benchmarks: { type: "string" }, leadership_style: { type: "string" },
    sustainability_initiatives: { type: "string" }, diversity_inclusion: { type: "string" },
    global_presence: { type: "string" }, organizational_structure: { type: "string" },
    executive_level_focus: { type: "string" }, growth_potential: { type: "string" },
    career_opportunities: { type: "string" }, learning_paths_json: { type: "string" },
    fortune_ranking: { type: "string" }, global_ranking: { type: "string" },
    company_type: { type: "string" }, stock_symbol: { type: "string" },
    status: { type: "string" }, tags: { type: "string" }, notes: { type: "string" },
    remote_work_friendly: { type: "string" }, hybrid_work_friendly: { type: "string" },
  }
};

export default function ImportModal({ existingCompanies, userName, onComplete, onClose }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [updateExisting, setUpdateExisting] = useState(true);

  const existingNames = useMemo(() => new Set(existingCompanies.map(c => c.name?.toLowerCase()).filter(Boolean)), [existingCompanies]);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setFile(f); setError(""); setPreview([]); setResults(null); setParsing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: IMPORT_SCHEMA });
      let records = [];
      if (res.status === "success" && res.output) {
        records = Array.isArray(res.output) ? res.output : [res.output];
      }
      const normalized = records.map(normalizeImportedCompany).filter(Boolean);
      setPreview(normalized.map(data => ({
        data, isDuplicate: existingNames.has(data.name?.toLowerCase()), isValid: !!data.name?.trim(),
      })));
      if (normalized.length === 0) setError("No records found. Ensure your file has company data with a 'name' column.");
    } catch (err) {
      setError(err?.message || "Failed to parse file. Please check the format.");
    }
    setParsing(false);
  };

  const handleImport = async () => {
    setImporting(true);
    let created = 0, updated = 0, errors = 0, skipped = 0;
    const toCreate = [], toUpdate = [];
    for (const item of preview) {
      if (!item.isValid) { errors++; continue; }
      if (item.isDuplicate) {
        if (updateExisting) {
          const existing = existingCompanies.find(c => c.name?.toLowerCase() === item.data.name?.toLowerCase());
          if (existing) {
            const { id, created_date, updated_date, created_by_id, version_number, ...rest } = item.data;
            toUpdate.push({ id: existing.id, data: rest });
          } else toCreate.push(item.data);
        } else skipped++;
      } else toCreate.push(item.data);
    }
    try {
      if (toCreate.length > 0) { await base44.entities.Company.bulkCreate(toCreate); created = toCreate.length; }
      for (const u of toUpdate) { await base44.entities.Company.update(u.id, u.data); updated++; }
      await logAudit("import", { name: file?.name || "import" }, null, { count: created + updated }, userName, `Imported ${created} new, updated ${updated}`);
    } catch (e) { errors++; }
    setResults({ created, updated, errors, skipped, total: preview.length });
    setImporting(false);
    if (created > 0 || updated > 0) onComplete?.();
  };

  const downloadTemplate = () => {
    const headers = ["name", "industry", "country", "headquarters", "ceo", "description", "mission", "vision", "core_values", "leadership_principles", "technology_stack", "ai_strategy", "cloud_strategy", "interview_style", "executive_expectations", "leadership_competencies", "competitors", "recommended_certifications", "common_interview_questions", "status"];
    const sample = "Example Corp,Technology,USA,San Francisco,Jane Doe,Leading tech company...,To innovate...,To transform...,Value1; Value2,Principle1; Principle2,AWS; Azure; Python,AI-first strategy...,Multi-cloud approach...,Behavioral and case-based,Leadership; Strategic thinking,Innovation; Delivery,CompetitorA; CompetitorB,AWS Certified; PMP,Tell me about a time...;How would you...,approved";
    const blob = new Blob([headers.join(",") + "\n" + sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "company-import-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2"><Upload size={18} className="text-indigo-400" /><h3 className="text-lg font-bold text-white">Bulk Import Companies</h3></div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-4">{error}</div>}
          {results ? (
            <div className="text-center py-8">
              <CheckCircle size={40} className="mx-auto text-emerald-400 mb-4" />
              <h4 className="text-white font-semibold text-lg mb-4">Import Complete</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
                {[["Created", results.created, "bg-emerald-500/10 text-emerald-400"], ["Updated", results.updated, "bg-blue-500/10 text-blue-400"], ["Skipped", results.skipped, "bg-amber-500/10 text-amber-400"], ["Errors", results.errors, "bg-red-500/10 text-red-400"]].map(([l, v, c]) => (
                  <div key={l} className={`${c} rounded-lg p-3`}><div className="text-2xl font-bold">{v}</div><div className="text-xs text-white/40">{l}</div></div>
                ))}
              </div>
              <button onClick={onClose} className="mt-6 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium">Done</button>
            </div>
          ) : preview.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-white/40 text-sm">{preview.length} companies found · {preview.filter(p => p.isDuplicate).length} duplicates</p>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={updateExisting} onChange={e => setUpdateExisting(e.target.checked)} className="w-4 h-4 rounded bg-white/5 border-white/20" /><span className="text-sm text-white/60">Update existing companies</span></label>
              </div>
              <div className="overflow-x-auto border border-white/5 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.02]"><tr><th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Name</th><th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Industry</th><th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Country</th><th className="text-center px-3 py-2 text-xs text-white/40 uppercase">Score</th><th className="text-center px-3 py-2 text-xs text-white/40 uppercase">Status</th></tr></thead>
                  <tbody>
                    {preview.map((item, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-3 py-2 text-white/80">{item.data.name || <span className="text-red-400">— missing —</span>}</td>
                        <td className="px-3 py-2 text-white/50">{item.data.industry || "—"}</td>
                        <td className="px-3 py-2 text-white/50">{item.data.country || "—"}</td>
                        <td className="px-3 py-2 text-center text-white/60">{item.data.quality_score}%</td>
                        <td className="px-3 py-2 text-center">{!item.isValid ? <span className="text-xs text-red-400">Invalid</span> : item.isDuplicate ? <span className="text-xs text-amber-400">Duplicate</span> : <span className="text-xs text-emerald-400">New</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileSpreadsheet size={40} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/40 text-sm mb-2">Upload a CSV, Excel, or JSON file with company data</p>
              <p className="text-white/30 text-xs mb-6">Automatic column mapping, validation, and duplicate detection</p>
              <div className="flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer">
                  {parsing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Select File
                  <input type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={handleFile} />
                </label>
                <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm"><Download size={14} /> Template</button>
              </div>
              {file && <p className="text-white/30 text-xs mt-4">{file.name}</p>}
            </div>
          )}
        </div>

        {preview.length > 0 && !results && (
          <div className="flex items-center justify-end gap-2 p-5 border-t border-white/5">
            <button onClick={() => { setPreview([]); setFile(null); }} className="px-4 py-2 text-white/40 hover:text-white/70 text-sm">Back</button>
            <button onClick={handleImport} disabled={importing} className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium">
              {importing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Import {preview.length} Companies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}