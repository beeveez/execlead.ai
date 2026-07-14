import React, { useState } from "react";
import { Grid3x3, ChevronDown } from "lucide-react";
import { PRIVACY_RISK_CATEGORIES, RISK_STYLES } from "@/lib/privacyEngine";

export default function PrivacyRiskHeatMap() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Grid3x3 size={18} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Privacy Risk Heat Map™</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRIVACY_RISK_CATEGORIES.map((cat) => {
            const style = RISK_STYLES[cat.risk] || RISK_STYLES.low;
            const isOpen = selected === cat.id;
            return (
              <div
                key={cat.id}
                className={`rounded-xl border ${style.border} ${style.bg} p-4 cursor-pointer transition-all hover:scale-[1.02]`}
                onClick={() => setSelected(isOpen ? null : cat.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-xs font-medium">{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.color} border ${style.border}`}>
                    {style.label}
                  </span>
                </div>
                <div className="text-white/30 text-[10px]">{cat.findings} finding{cat.findings !== 1 ? 's' : ''}</div>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40">
                    {cat.findings === 0 ? (
                      <span className="text-emerald-400/80">✓ No active findings in this category.</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-white/50">Active Findings:</div>
                        <div className="text-amber-400/80">• PIA review pending for Executive Memory™ data processing</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(RISK_STYLES).map(([key, style]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${style.bg} border ${style.border}`} />
            <span className="text-white/30 text-[10px]">{style.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}