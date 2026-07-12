import React, { useState } from "react";
import { Building2, Download, Lock, CheckCircle2, FileText } from "lucide-react";
import { PROCUREMENT_PACKAGE, CLASSIFICATION_LEVELS } from "@/lib/trustCenterExtendedData";
import { generateTrustDocument } from "@/lib/trustCenterPdfGenerator";

export default function ProcurementMode() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (docId) => {
    setDownloading(docId);
    try {
      await generateTrustDocument(docId);
    } catch (e) {
      console.error("PDF generation failed:", e);
    }
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
          Download the complete vendor due diligence package for security reviews, procurement assessments,
          and compliance evaluations. Each document includes version metadata and is generated in real-time.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROCUREMENT_PACKAGE.map((doc) => {
          const classification = CLASSIFICATION_LEVELS[doc.classification];
          const isEnterprise = doc.classification === "Enterprise";
          return (
            <div key={doc.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white/80">{doc.title}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap" style={{ backgroundColor: `${classification.color}15`, color: classification.color }}>
                  {doc.classification}
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mb-3">{doc.description}</p>
              <button
                onClick={() => handleDownload(doc.id)}
                disabled={downloading === doc.id}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                style={isEnterprise
                  ? { backgroundColor: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }
                  : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {downloading === doc.id ? (
                  <><CheckCircle2 size={13} /> Generating...</>
                ) : isEnterprise ? (
                  <><Lock size={13} /> Request Access</>
                ) : (
                  <><Download size={13} /> Download PDF</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}