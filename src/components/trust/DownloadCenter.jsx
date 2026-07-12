import React, { useState } from "react";
import { Download, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { DOWNLOAD_DOCUMENTS, CLASSIFICATION_LEVELS } from "@/lib/trustCenterExtendedData";
import { generateTrustDocument } from "@/lib/trustCenterPdfGenerator";
import { PLATFORM_METADATA } from "@/lib/platformManifest";

export default function DownloadCenter() {
  const [downloading, setDownloading] = useState(null);
  const [completed, setCompleted] = useState({});

  const handleDownload = async (docId) => {
    setDownloading(docId);
    try {
      await generateTrustDocument(docId);
      setCompleted((prev) => ({ ...prev, [docId]: true }));
      setTimeout(() => setCompleted((prev) => ({ ...prev, [docId]: false })), 3000);
    } catch (e) {
      console.error("PDF generation failed:", e);
    }
    setDownloading(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Download Center™</span>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed">
          Comprehensive documentation for vendor assessments, due diligence, and procurement reviews.
          Each document includes version metadata and is generated in real-time with the latest status.
        </p>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-white/30">
          <span>Platform v{PLATFORM_METADATA.platformVersion}</span>
          <span>·</span>
          <span>Build {PLATFORM_METADATA.buildNumber}</span>
          <span>·</span>
          <span>Generated {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DOWNLOAD_DOCUMENTS.map((doc) => {
          const classification = CLASSIFICATION_LEVELS[doc.classification];
          const isDownloading = downloading === doc.id;
          const isCompleted = completed[doc.id];
          return (
            <div key={doc.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Download size={14} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white/80">{doc.title}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap" style={{ backgroundColor: `${classification.color}15`, color: classification.color }}>
                  {doc.classification}
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mb-3">{doc.description}</p>
              <button
                onClick={() => handleDownload(doc.id)}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-medium text-indigo-400 transition-colors disabled:opacity-40"
              >
                {isDownloading ? (
                  <><Loader2 size={13} className="animate-spin" /> Generating...</>
                ) : isCompleted ? (
                  <><CheckCircle2 size={13} className="text-emerald-400" /> Downloaded</>
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