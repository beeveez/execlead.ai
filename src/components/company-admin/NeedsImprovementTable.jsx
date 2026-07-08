import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { calculateQualityScore, logAudit } from "@/lib/companyAdmin";
import { validateLogoUrl } from "@/lib/companyLogo";
import { detectCompanyIssues } from "@/lib/companyIssues";
import CompanyLogo from "@/components/companies/CompanyLogo";
import { ExternalLink, Pencil, CheckCircle2, Sparkles, Wand2, Archive, Loader2 } from "lucide-react";

/**
 * Needs Improvement drill-down table.
 * Shows every company requiring admin attention with a detected Issue
 * column and action buttons: Open, Edit, Validate Logo, Generate Logo,
 * AI Fix, Archive.
 */
export default function NeedsImprovementTable({ items, allCompanies, onEdit, onArchive, onUpdated, userName }) {
  const [busy, setBusy] = useState({});

  const setRowBusy = (id, action) => setBusy((b) => ({ ...b, [id]: action }));
  const isBusy = (id, action) => busy[id] === action;

  const handleValidateLogo = async (company) => {
    setRowBusy(company.id, "validate");
    try {
      const result = await validateLogoUrl(company.logo_url);
      await base44.entities.Company.update(company.id, {
        logo_status: result.status,
        logo_error: result.error || "",
      });
      await logAudit("update", company, company, { logo_status: result.status }, userName, `Logo validated: ${result.status}`);
      onUpdated();
    } catch (e) {}
    setRowBusy(company.id, null);
  };

  const handleGenerateLogo = async (company) => {
    setRowBusy(company.id, "generate");
    try {
      const { file_url } = await base44.integrations.Core.GenerateImage({
        prompt: `professional minimalist company logo for ${company.name}, ${company.industry || "technology"} industry, clean modern flat vector design, centered on white background, no text`,
      });
      await base44.entities.Company.update(company.id, { logo_url: file_url, logo_status: "valid", logo_error: "" });
      await logAudit("update", company, company, { logo_url: file_url }, userName, "AI-generated logo");
      onUpdated();
    } catch (e) {}
    setRowBusy(company.id, null);
  };

  const handleAiFix = async (company) => {
    setRowBusy(company.id, "aifix");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are enriching an executive intelligence record for "${company.name}" (industry: ${company.industry || "unknown"}, country: ${company.country || "unknown"}). Generate concise, executive-grade content for missing fields. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            ai_strategy: { type: "string" },
            cloud_strategy: { type: "string" },
            mission: { type: "string" },
          },
        },
      });
      const patch = {};
      if (!company.description?.trim() && res.description) patch.description = res.description;
      if (!company.ai_strategy?.trim() && res.ai_strategy) patch.ai_strategy = res.ai_strategy;
      if (!company.cloud_strategy?.trim() && res.cloud_strategy) patch.cloud_strategy = res.cloud_strategy;
      if (!company.mission?.trim() && res.mission) patch.mission = res.mission;
      patch.quality_score = calculateQualityScore({ ...company, ...patch });
      await base44.entities.Company.update(company.id, patch);
      await logAudit("update", company, company, patch, userName, "AI Fix applied to missing fields");
      onUpdated();
    } catch (e) {}
    setRowBusy(company.id, null);
  };

  return (
    <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02]">
          <tr>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Logo</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Company</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Industry</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Country</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Issue</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Last Updated</th>
            <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const issues = detectCompanyIssues(c, allCompanies);
            const rowBusy = Boolean(busy[c.id]);
            return (
              <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3"><CompanyLogo company={c} size="xs" showSkeleton={false} /></td>
                <td className="px-4 py-3">
                  <Link to={`/companies/${c.id}`} className="text-white/80 font-medium hover:text-indigo-400">{c.name}</Link>
                </td>
                <td className="px-4 py-3 text-white/50">{c.industry || "—"}</td>
                <td className="px-4 py-3 text-white/50">{c.country || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {issues.length > 0 ? issues.map((iss, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-xs ${iss.severity === "high" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{iss.label}</span>
                    )) : <span className="text-white/30 text-xs">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-white/50 text-xs capitalize">{c.status || "approved"}</td>
                <td className="px-4 py-3 text-white/30 text-xs">{new Date(c.updated_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/companies/${c.id}`} className="p-1.5 text-white/30 hover:text-indigo-400" title="Open"><ExternalLink size={14} /></Link>
                    <button onClick={() => onEdit(c)} className="p-1.5 text-white/30 hover:text-indigo-400" title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleValidateLogo(c)} disabled={rowBusy} className="p-1.5 text-white/30 hover:text-emerald-400 disabled:opacity-30" title="Validate Logo">
                      {isBusy(c.id, "validate") ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    </button>
                    <button onClick={() => handleGenerateLogo(c)} disabled={rowBusy} className="p-1.5 text-white/30 hover:text-purple-400 disabled:opacity-30" title="Generate Logo">
                      {isBusy(c.id, "generate") ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    </button>
                    <button onClick={() => handleAiFix(c)} disabled={rowBusy} className="p-1.5 text-white/30 hover:text-cyan-400 disabled:opacity-30" title="AI Fix">
                      {isBusy(c.id, "aifix") ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    </button>
                    <button onClick={() => onArchive(c)} className="p-1.5 text-white/30 hover:text-amber-400" title="Archive"><Archive size={14} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-12 text-center text-white/30 text-sm">No companies need improvement. 🎉</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}