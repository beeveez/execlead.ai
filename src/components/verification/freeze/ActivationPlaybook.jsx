import React, { useState } from "react";
import { Rocket, Clock, ChevronDown, ChevronRight, CheckCircle2, ArrowRight, Undo2, Eye, ShieldCheck } from "lucide-react";
import { ACTIVATION_PLAYBOOK } from "@/lib/execVerifiedFreeze";

const SECTIONS = [
  { key: "prerequisites", label: "Prerequisites", icon: ShieldCheck },
  { key: "activation_steps", label: "Activation Steps", icon: ArrowRight },
  { key: "rollback_steps", label: "Rollback Steps", icon: Undo2 },
  { key: "validation", label: "Validation", icon: Eye },
  { key: "post_launch_checks", label: "Post-Launch Checks", icon: CheckCircle2 },
  { key: "support_requirements", label: "Support Requirements", icon: ShieldCheck },
  { key: "monitoring_requirements", label: "Monitoring Requirements", icon: ShieldCheck },
];

export default function ActivationPlaybook() {
  const [expanded, setExpanded] = useState("activation_steps");

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Rocket size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Activation Playbook</h3>
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ml-auto text-amber-400 bg-amber-500/10">
          <Clock size={10} /> {ACTIVATION_PLAYBOOK.estimated_time}
        </span>
      </div>
      <div className="space-y-1">
        {SECTIONS.map(({ key, label, icon: Icon }) => {
          const isOpen = expanded === key;
          return (
            <div key={key} className="rounded-lg border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
              >
                {isOpen ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
                <Icon size={12} className="text-indigo-400" />
                <span className="text-xs text-white/60 font-medium">{label}</span>
                <span className="text-[9px] text-white/20 ml-auto">{ACTIVATION_PLAYBOOK[key].length} steps</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-1 space-y-1.5">
                  {ACTIVATION_PLAYBOOK[key].map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-white/50">
                      <span className="text-white/20 w-4 shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}