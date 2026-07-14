import React from "react";
import {
  Download, Database, Activity, Share2, Clock, Archive, Trash2, ArrowRight, CheckCircle2,
} from "lucide-react";
import { DATA_LIFECYCLE_STAGES } from "@/lib/privacyEngine";

const ICON_MAP = { Download, Database, Activity, Share2, Clock, Archive, Trash2 };

export default function DataLifecycleManager() {
  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={18} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Data Lifecycle Manager™</h3>
        </div>

        {/* Lifecycle Flow */}
        <div className="flex flex-col md:flex-row items-stretch gap-2">
          {DATA_LIFECYCLE_STAGES.map((stage, i) => {
            const Icon = ICON_MAP[stage.icon] || Activity;
            return (
              <React.Fragment key={stage.stage}>
                <div className="flex-1 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <Icon size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-white font-semibold text-xs mb-1">{stage.stage}</div>
                  <p className="text-white/40 text-[10px] leading-relaxed">{stage.description}</p>
                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={8} /> Governed
                  </div>
                </div>
                {i < DATA_LIFECYCLE_STAGES.length - 1 && (
                  <div className="flex items-center justify-center">
                    <ArrowRight size={16} className="text-white/20 rotate-90 md:rotate-0" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Lifecycle Detail Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Lifecycle Stage Details</h3>
        <div className="space-y-2">
          {DATA_LIFECYCLE_STAGES.map((stage, i) => {
            const Icon = ICON_MAP[stage.icon] || Activity;
            return (
              <div key={stage.stage} className="flex items-start gap-3 px-4 py-3 bg-white/[0.02] rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs font-medium">{i + 1}. {stage.stage}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400">Governed</span>
                  </div>
                  <p className="text-white/30 text-[10px] mt-0.5">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}