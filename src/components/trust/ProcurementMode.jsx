import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Download, FileText, Loader2, Lock } from "lucide-react";
import { PROCUREMENT_PACKAGE, CLASSIFICATION_LEVELS } from "@/lib/trustCenterExtendedData";
import { generateTrustDocument } from "@/lib/trustCenterPdfGenerator";

export default function ProcurementMode() {
  const [downloading, setDownloading] = useState(null);

  const downloadPublicDocument = async (doc) => {
    if (doc.classification !== "Public") return;
    setDownloading(doc.id);
    await generateTrustDocument(doc.id);
    setDownloading(null);
  };

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
        {PROCUREMENT_PACKAGE.map((doc) => {
          const restricted = doc.classification === "Enterprise";
          const classification = CLASSIFICATION_LEVELS[doc.classification];
          return <div key={doc.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2"><FileText size={14} className="flex-shrink-0 text-indigo-400" /><span className="text-sm font-medium text-white/80">{doc.title}</span></div>
              <span className="whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${classification.color}15`, color: classification.color }}>{doc.classification}</span>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-white/40">{doc.description}</p>
            {restricted ? <div className="space-y-2">
              <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400"><Lock size={13} /> Enterprise Access</div>
              <Link to={`/contact?subject=enterprise-trust-access&document=${encodeURIComponent(doc.id)}`} className="block text-center text-xs font-medium text-indigo-400 hover:text-indigo-300">Request Enterprise Access →</Link>
            </div> : <button onClick={() => downloadPublicDocument(doc)} disabled={downloading === doc.id} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 disabled:opacity-40">
              {downloading === doc.id ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Download size={13} /> Download PDF</>}
            </button>}
          </div>;
        })}
      </div>
    </div>
  );
}