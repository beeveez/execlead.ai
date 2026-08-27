import React from "react";
import { Building2 } from "lucide-react";
import { PROCUREMENT_PACKAGE } from "@/lib/trustCenterExtendedData";
import TrustDocumentCard from "@/components/trust/TrustDocumentCard";

export default function ProcurementMode() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 to-white/[0.02] border border-indigo-500/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Enterprise Procurement Mode™</h3>
        </div>
        <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
          Review public trust documents and request restricted enterprise materials for security, procurement, and compliance evaluations.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROCUREMENT_PACKAGE.map((doc) => <TrustDocumentCard key={doc.id} doc={doc} />)}
      </div>
    </div>
  );
}