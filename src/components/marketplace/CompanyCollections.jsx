import React from "react";
import { Building2, ChevronRight } from "lucide-react";

const COMPANY_COLLECTIONS = [
  "Microsoft", "Google", "Amazon", "Apple", "Meta", "OpenAI", "NVIDIA",
  "Accenture", "IBM", "ServiceNow", "Oracle", "SAP", "Salesforce",
  "Deloitte", "PwC", "EY", "KPMG", "McKinsey", "BCG", "Bain",
];

const COMPANY_COLORS = {
  Microsoft: "#00a4ef", Google: "#4285f4", Amazon: "#ff9900", Apple: "#a2aaad",
  Meta: "#0866ff", OpenAI: "#10a37f", NVIDIA: "#76b900", Accenture: "#a100ff",
  IBM: "#0f62fe", ServiceNow: "#62d84e", Oracle: "#f80000", SAP: "#0faaff",
  Salesforce: "#00a1e0", Deloitte: "#86bc25", PwC: "#d04a02", EY: "#ffe600",
  KPMG: "#00338d", McKinsey: "#051c2c", BCG: "#005a9c", Bain: "#cc0000",
};

export default function CompanyCollections({ availableCollections, onSelect }) {
  const collections = COMPANY_COLLECTIONS.filter((c) =>
    availableCollections.some((ac) => ac.toLowerCase() === c.toLowerCase())
  );
  if (collections.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={14} className="text-cyan-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Company Collections</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {collections.map((company) => (
          <button
            key={company}
            onClick={() => onSelect(company)}
            className="shrink-0 w-32 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/20 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: (COMPANY_COLORS[company] || "#6366f1") + "20" }}>
              <span className="text-lg font-bold" style={{ color: COMPANY_COLORS[company] || "#6366f1" }}>
                {company.charAt(0)}
              </span>
            </div>
            <div className="text-white/70 text-xs font-medium group-hover:text-cyan-400 transition-colors">{company}</div>
            <div className="flex items-center gap-0.5 text-[10px] text-white/30 mt-1">
              View pack <ChevronRight size={9} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}