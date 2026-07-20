import React, { useState } from "react";
import { BookOpen, Wrench, ChevronDown, ChevronRight } from "lucide-react";
import { DOCUMENTATION_SECTIONS, OPERATIONS_HANDBOOK } from "@/lib/execVerifiedFreeze";

export default function DocumentationOpsPanel() {
  const [openOps, setOpenOps] = useState(null);

  return (
    <div className="space-y-4">
      {/* Documentation */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Technical Documentation</h3>
          <span className="text-[9px] text-white/20 ml-auto">{DOCUMENTATION_SECTIONS.length} sections</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DOCUMENTATION_SECTIONS.map((doc) => (
            <div key={doc.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-xs font-medium text-white/60">{doc.title}</div>
              <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{doc.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Operations Handbook */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Operations Handbook</h3>
          <span className="text-[9px] text-white/20 ml-auto">{OPERATIONS_HANDBOOK.length} workflows</span>
        </div>
        <div className="space-y-1">
          {OPERATIONS_HANDBOOK.map((workflow) => {
            const isOpen = openOps === workflow.id;
            return (
              <div key={workflow.id} className="rounded-lg border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenOps(isOpen ? null : workflow.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  {isOpen ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
                  <span className="text-xs text-white/60 font-medium">{workflow.title}</span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1">
                    <p className="text-[10px] text-white/30 mb-2">{workflow.desc}</p>
                    <div className="space-y-1.5">
                      {workflow.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-white/50">
                          <span className="text-white/20 w-4 shrink-0">{i + 1}.</span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}