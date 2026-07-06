import React from "react";
import { Check, X } from "lucide-react";
import { COMPARISON_ROWS } from "@/lib/pricingContent";

const PLANS = [
  { id: "free", label: "Free" },
  { id: "professional", label: "Professional" },
  { id: "executive", label: "Executive" },
  { id: "enterprise", label: "Enterprise" },
];

function Cell({ value, note }) {
  if (value === true) return <Check size={15} className="text-emerald-400 mx-auto" />;
  if (value === "limited") return <span className="text-amber-400 text-xs font-medium">{note || "Limited"}</span>;
  return <X size={15} className="text-white/15 mx-auto" />;
}

export default function ComparisonTable() {
  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/10">
              <th className="text-left px-5 py-5 text-white/40 text-xs uppercase tracking-wider font-medium w-2/5">Capability</th>
              {PLANS.map((plan) => (
                <th key={plan.id} className="px-5 py-5 text-center min-w-[110px]">
                  <div className="text-white font-semibold text-sm">{plan.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                <td className="px-5 py-3.5">
                  <span className="text-white/70 text-sm">{row.feature}</span>
                </td>
                <td className="px-5 py-3.5 text-center"><Cell value={row.free} note={row.note} /></td>
                <td className="px-5 py-3.5 text-center"><Cell value={row.pro} /></td>
                <td className="px-5 py-3.5 text-center"><Cell value={row.exec} /></td>
                <td className="px-5 py-3.5 text-center"><Cell value={row.ent} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-6 text-xs text-white/30 mt-4 flex-wrap">
        <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Included</span>
        <span className="flex items-center gap-1.5"><X size={14} className="text-white/20" /> Not Included</span>
        <span className="flex items-center gap-1.5"><span className="text-amber-400 font-medium">Label</span> Limited</span>
      </div>
    </>
  );
}