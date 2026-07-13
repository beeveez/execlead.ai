import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Shield, Wrench, TrendingUp } from "lucide-react";
import SecReportToolbar from "./SecReportToolbar";

export default function SecCoverageDrawer({ open, detail, intel, onClose }) {
  if (!detail) return null;
  const color = detail.coverage === 100 ? "#10b981" : detail.coverage >= 80 ? "#f59e0b" : "#ef4444";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto bg-[#0a0a0f] border-white/10">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white flex items-center gap-2">
            <Shield size={16} style={{ color }} />
            {detail.label}
          </SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Total</div>
            <div className="text-lg font-bold text-white">{detail.total}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Covered</div>
            <div className="text-lg font-bold text-emerald-400">{detail.covered}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Uncovered</div>
            <div className="text-lg font-bold text-red-400">{detail.uncovered}</div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4 text-center">
          <div className="text-4xl font-bold" style={{ color }}>{detail.coverage}%</div>
          <div className="text-[10px] text-white/40">Coverage Rate</div>
          {detail.potentialScoreGain > 0 && (
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <TrendingUp size={10} /> Potential Score Gain: +{detail.potentialScoreGain}
            </div>
          )}
        </div>

        {/* Covered entities */}
        <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg p-3 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Covered Entities ({detail.coveredEntities.length})</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {detail.coveredEntities.map((e) => (
              <div key={e.name} className="text-[10px] text-white/60 flex items-center gap-2 py-0.5">
                <span className="text-emerald-400">✓</span>
                <span className="text-white/70">{e.name}</span>
                <span className="text-white/30">— {e.rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Uncovered entities */}
        {detail.uncoveredEntities.length > 0 && (
          <div className="bg-red-500/[0.03] border border-red-500/10 rounded-lg p-3 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-red-400 mb-2">Uncovered Entities ({detail.uncoveredEntities.length})</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {detail.uncoveredEntities.map((e) => (
                <div key={e.name} className="text-[10px] text-white/60 flex items-center gap-2 py-0.5">
                  <span className="text-red-400">✗</span>
                  <span className="text-white/70">{e.name}</span>
                  <span className="text-white/30">— {e.status} ({e.scope})</span>
                  {e.sensitive && <span className="text-[8px] px-1 rounded bg-red-500/10 text-red-300 border border-red-500/20">SENSITIVE</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engineering tasks */}
        {detail.engineeringTasks.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mb-2">
              <Wrench size={10} /> Engineering Tasks ({detail.engineeringTasks.length})
            </div>
            <div className="space-y-1">
              {detail.engineeringTasks.slice(0, 20).map((t) => (
                <div key={t.entity} className="flex items-center gap-2 text-[10px] py-0.5">
                  <span className="text-white/60 flex-1 truncate">{t.entity}: {t.fix}</span>
                  <span className="text-white/30">{t.owner}</span>
                  <span className="text-white/30">{t.estimatedHours}h</span>
                  {t.autoRepair && <Wrench size={9} className="text-indigo-400" />}
                  <span className="text-emerald-400">+{t.scoreGain}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SecReportToolbar intel={intel} />
      </SheetContent>
    </Sheet>
  );
}