import React from "react";
import { Database, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { EVIDENCE_CATALOG } from "@/lib/launchDefenseEngine";

/**
 * EvidenceLibrary™ — every answer should reference evidence. Curated catalog
 * of platform modules/features to cite so answers stay credible.
 */
export default function EvidenceLibrary() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Database size={16} className="text-emerald-400" /><h3 className="text-white font-semibold text-sm">Evidence Library™</h3></div>
      <p className="text-xs text-white/40 mb-4">Reference these platform assets in your answers to build credibility with any audience.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EVIDENCE_CATALOG.map((e) => (
          <Link key={e.name} to={e.path} className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all group">
            <div>
              <div className="text-sm text-white/80">{e.name}</div>
              <div className="text-[11px] text-white/40">{e.module}</div>
            </div>
            <ExternalLink size={14} className="text-white/30 group-hover:text-emerald-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}