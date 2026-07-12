import React, { useState } from "react";
import { FileSearch } from "lucide-react";
import StatusBadge from "./StatusBadge";
import EvidencePanel from "./EvidencePanel";

export default function CapabilityCard({ item }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  return (
    <>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-white/80">{item.name}</span>
          <StatusBadge status={item.status} />
        </div>
        {item.detail && <p className="text-[11px] text-white/40 leading-relaxed mb-2">{item.detail}</p>}
        <button
          onClick={() => setEvidenceOpen(true)}
          className="flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <FileSearch size={11} /> View Evidence
        </button>
      </div>
      <EvidencePanel itemName={item.name} open={evidenceOpen} onClose={() => setEvidenceOpen(false)} />
    </>
  );
}