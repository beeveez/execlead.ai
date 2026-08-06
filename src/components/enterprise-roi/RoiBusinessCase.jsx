import React, { useState } from "react";
import { FileDown, FileSpreadsheet, Save, Share2, Presentation, Package, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RoiBusinessCase({ inputs, assumptions, roi, insights }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const downloadPdf = () => {
    import("@/lib/enterpriseRoiPdf").then(({ generateBusinessCasePdf: gen }) => gen(inputs, assumptions, roi, insights));
  };

  const downloadCsv = () => {
    const rows = [
      ["Field", "Value"],
      ["Organization", inputs.organizationName],
      ["Leadership Population", inputs.leadershipPopulation],
      ["Annual Gross Value", roi.annualGrossValue],
      ["Annual Investment", roi.annualInvestment],
      ["Net Business Impact", roi.annualNetValue],
      ["Three-Year ROI %", roi.threeYearROI],
      ["Payback (months)", roi.paybackMonths],
      ...roi.metrics.map((m) => [m.label, m.value]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EXECLEAD-ROI-${(inputs.organizationName || "org").replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      const token = "roi_" + Math.random().toString(36).slice(2, 10);
      await base44.entities.EnterpriseROICalculation.create({
        organization_name: inputs.organizationName || "Organization",
        industry: inputs.industry,
        country: inputs.country,
        calc_date: new Date().toISOString(),
        inputs_json: JSON.stringify(inputs),
        assumptions_json: JSON.stringify(assumptions),
        estimated_annual_value: roi.annualGrossValue,
        estimated_three_year_roi: roi.threeYearROI ?? 0,
        estimated_net_impact: roi.annualNetValue,
        business_case_generated: true,
        proposal_generated: false,
        sales_owner: me?.email || me?.full_name || "",
        opportunity_stage: "Qualification",
        share_token: token,
      });
      setSaved(true);
    } catch {}
    setSaving(false);
  };

  const share = () => {
    const token = "roi_" + Math.random().toString(36).slice(2, 10);
    const url = `${window.location.origin}/enterprise/roi?share=${token}`;
    navigator.clipboard?.writeText(url).then(() => setShared(true)).catch(() => setShared(true));
    setTimeout(() => setShared(false), 2500);
  };

  const btn = "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="text-white text-sm font-semibold mb-1">Executive Business Case™</h3>
      <p className="text-white/45 text-xs mb-4">Generate a professional, procurement-ready report. PowerPoint export available at General Availability.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button onClick={downloadPdf} className={`${btn} bg-accent-orange hover:bg-accent-orange/90 text-white`}><FileDown size={14} /> PDF</button>
        <button onClick={downloadCsv} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10 text-white/70`}><FileSpreadsheet size={14} /> Excel (CSV)</button>
        <button onClick={save} disabled={saving} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10 text-white/70`}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} className="text-emerald-400" /> : <Save size={14} />} {saved ? "Saved" : "Save Report"}
        </button>
        <button onClick={share} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10 text-white/70`}>
          {shared ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />} {shared ? "Link Copied" : "Share Link"}
        </button>
        <button onClick={downloadPdf} className={`${btn} bg-white/5 hover:bg-white/10 border border-white/10 text-white/70`}><Package size={14} /> Proposal</button>
        <button disabled className={`${btn} bg-white/[0.02] border border-white/8 text-white/30 cursor-not-allowed`}><Presentation size={14} /> PPT (GA)</button>
      </div>
      <p className="text-white/35 text-[10px] mt-3">Saved reports are stored in your Enterprise ROI CRM record (organization, inputs, assumptions, estimated ROI, sales owner, opportunity stage).</p>
    </div>
  );
}