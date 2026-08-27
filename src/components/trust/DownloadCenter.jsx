import React from "react";
import { FileText } from "lucide-react";
import { DOWNLOAD_DOCUMENTS } from "@/lib/trustCenterExtendedData";
import { PLATFORM_METADATA } from "@/lib/platformManifest";
import TrustDocumentCard from "@/components/trust/TrustDocumentCard";

export default function DownloadCenter() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Trust &amp; Transparency Documentation</span>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed">
          Explore EXECLEAD.AI's security, privacy, responsible AI, and platform assurance practices. Additional enterprise documentation is available to qualified enterprise prospects upon request.
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
        {DOWNLOAD_DOCUMENTS.map((doc) => <TrustDocumentCard key={doc.id} doc={doc} />)}
      </div>
    </div>
  );
}