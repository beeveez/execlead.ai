import React, { useEffect, useState } from "react";
import { Grid3x3, ShieldCheck } from "lucide-react";
import { buildComparisonMatrix, STATUS_META } from "@/lib/competitiveIntelligence";
import { base44 } from "@/api/base44Client";

function StatusBadge({ cell }) {
  const status = cell?.status || "Unknown";
  const m = STATUS_META[status] || STATUS_META["Unknown"];
  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${m.bg} ${m.border} ${m.color}`}><span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{status}</span>
      {cell?.evidence > 0 && <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400/80"><ShieldCheck size={8} /> {cell.evidence}</span>}
    </div>
  );
}

export default function IntelFeatureMatrix({ competitors }) {
  const [evidence, setEvidence] = useState([]);
  useEffect(() => { (async () => { try { setEvidence(await base44.entities.CompetitiveEvidence.list("-created_date", 200) || []); } catch {} })(); }, []);
  const rows = buildComparisonMatrix(competitors, evidence);
  const cols = ["EXECLEAD.AI", ...competitors.map((c) => c.company_name)];
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 size={16} className="text-indigo-400" />
        <h2 className="text-lg font-semibold">Feature Intelligence™</h2>
      </div>
      <p className="text-white/45 text-xs mb-4">Compare capabilities — not marketing claims. Status: Supported · Publicly Confirmed · Partially Supported · Unknown · Not Publicly Documented. Cells with evidence show a verified count. Never guessed.</p>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-white/50 font-semibold sticky left-0 bg-[#0d0d14]">Feature</th>
              {cols.map((c) => <th key={c} className="text-center p-3 text-white/70 font-semibold whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="p-3 text-white/70 font-medium sticky left-0 bg-[#0d0d14] whitespace-nowrap">{r.feature}</td>
                {cols.map((c) => <td key={c} className="p-3 text-center"><StatusBadge cell={r[c]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}