import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Package, GitBranch } from "lucide-react";
import { EELM_GOVERNANCE_ITEMS, EELM_KNOWLEDGE_PACK_REQUIREMENTS } from "@/lib/eelmMethodology";
import SectionHeader from "./SectionHeader";

export default function MethodologyGovernance() {
  return (
    <section id="governance" className="border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <SectionHeader number="08" title="Methodology Governance" subtitle="The EELM™ Governance Center maintains and version-controls all methodology components" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-purple-400" />
              <h3 className="text-white font-semibold text-sm">Governed Assets</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EELM_GOVERNANCE_ITEMS.map((item) => (
                <span key={item} className="px-2 py-1 rounded-md bg-purple-500/5 border border-purple-500/10 text-[11px] text-white/60">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-amber-400" />
              <h3 className="text-white font-semibold text-sm">Knowledge Pack Alignment</h3>
            </div>
            <p className="text-white/40 text-xs mb-3">Every Knowledge Pack must declare:</p>
            <div className="flex flex-wrap gap-1.5">
              {EELM_KNOWLEDGE_PACK_REQUIREMENTS.map((req) => (
                <span key={req} className="px-2 py-1 rounded-md bg-amber-500/5 border border-amber-500/10 text-[11px] text-white/60">
                  {req}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <GitBranch size={14} className="text-emerald-400 flex-shrink-0" />
          <p className="text-white/50 text-xs">All methodology updates are version-controlled. Framework versions, scoring rules, and evidence weights are tracked across releases.</p>
        </div>
      </div>
    </section>
  );
}