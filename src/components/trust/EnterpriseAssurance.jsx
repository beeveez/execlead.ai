import React from "react";
import { ShieldCheck } from "lucide-react";
import { ENTERPRISE_ASSURANCE } from "@/lib/trustCenterData";

// Enterprise Assurance™ — concise enterprise assurance statements for
// security teams, procurement officers, and enterprise buyers.
export default function EnterpriseAssurance() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ENTERPRISE_ASSURANCE.map((item) => (
        <div key={item.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white/90">{item.name}</h3>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}