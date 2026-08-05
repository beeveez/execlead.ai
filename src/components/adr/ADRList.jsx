import React from "react";
import ADRCard from "./ADRCard";
import { FileText } from "lucide-react";

export default function ADRList({ adrs, onSelect, emptyHint }) {
  if (!adrs.length) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-10 text-center">
        <FileText size={28} className="text-white/10 mx-auto mb-3" />
        <p className="text-white/40 text-sm">{emptyHint || "No Architecture Decision Records yet."}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {adrs.map((adr) => (
        <ADRCard key={adr.id || adr.adr_id} adr={adr} onClick={() => onSelect(adr)} />
      ))}
    </div>
  );
}