import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Download, FileText, Loader2, Lock } from "lucide-react";
import { CLASSIFICATION_LEVELS } from "@/lib/trustCenterExtendedData";
import { generateTrustDocument } from "@/lib/trustCenterPdfGenerator";

export default function TrustDocumentCard({ doc }) {
  const [status, setStatus] = useState("idle");
  const restricted = doc.classification === "Enterprise";
  const classification = CLASSIFICATION_LEVELS[doc.classification];

  const download = async () => {
    setStatus("loading");
    await generateTrustDocument(doc.id);
    setStatus("done");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
    <div className="mb-2 flex items-start justify-between gap-2">
      <div className="flex items-center gap-2"><FileText size={14} className="flex-shrink-0 text-indigo-400" /><span className="text-sm font-medium text-white/80">{doc.title}</span></div>
      <span className="whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${classification.color}15`, color: classification.color }}>{doc.classification}</span>
    </div>
    <p className="mb-3 text-[11px] leading-relaxed text-white/40">{doc.description}</p>
    {restricted ? <div className="space-y-2">
      <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400"><Lock size={13} /> Enterprise Access</div>
      <Link to={`/contact?subject=enterprise-trust-access&document=${encodeURIComponent(doc.id)}`} className="block text-center text-xs font-medium text-indigo-400 hover:text-indigo-300">Request Enterprise Access →</Link>
    </div> : <button onClick={download} disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20 disabled:opacity-40">
      {status === "loading" ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : status === "done" ? <><CheckCircle2 size={13} className="text-emerald-400" /> Downloaded</> : <><Download size={13} /> Download PDF</>}
    </button>}
  </div>;
}