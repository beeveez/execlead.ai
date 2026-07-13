import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Clock, Wrench, TrendingUp, Users } from "lucide-react";
import SecReportToolbar from "./SecReportToolbar";
import SecCopilot from "./SecCopilot";

export default function SecTechDebtDrawer({ open, detail, intel, onClose }) {
  if (!detail) return null;
  const color = detail.severity === "critical" ? "#ef4444" : detail.severity === "high" ? "#f59e0b" : detail.severity === "medium" ? "#eab308" : "#6366f1";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto bg-[#0a0a0f] border-white/10">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white">{detail.label}</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Count</div>
            <div className="text-lg font-bold" style={{ color }}>{detail.count}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Est. Hours</div>
            <div className="text-lg font-bold text-white">{Math.round(detail.estimatedHours * 10) / 10}h</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Score Gain</div>
            <div className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1"><TrendingUp size={12} />+{detail.potentialScoreGain}</div>
          </div>
        </div>

        {detail.entities.length > 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden mb-4">
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-[#0a0a0f]">
                  <tr className="border-b border-white/5 text-white/40 uppercase">
                    <th className="text-left px-2 py-1.5 font-medium">Entity</th>
                    <th className="text-left px-2 py-1.5 font-medium">Classification</th>
                    <th className="text-left px-2 py-1.5 font-medium">Status</th>
                    <th className="text-left px-2 py-1.5 font-medium">Sensitive</th>
                    <th className="text-left px-2 py-1.5 font-medium">Owner</th>
                    <th className="text-left px-2 py-1.5 font-medium">Fix</th>
                    <th className="text-left px-2 py-1.5 font-medium">Hours</th>
                    <th className="text-left px-2 py-1.5 font-medium">Auto</th>
                    <th className="text-left px-2 py-1.5 font-medium">Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.entities.map((e) => (
                    <tr key={e.name} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors">
                      <td className="px-2 py-1 text-white/70">{e.name}</td>
                      <td className="px-2 py-1 text-white/50">{e.classification}</td>
                      <td className="px-2 py-1" style={{ color: e.status === "protected" ? "#10b981" : "#ef4444" }}>{e.status}</td>
                      <td className="px-2 py-1">{e.sensitive ? <span className="text-red-400">Yes</span> : <span className="text-white/30">No</span>}</td>
                      <td className="px-2 py-1 text-white/40">{e.owner}</td>
                      <td className="px-2 py-1 text-white/50 truncate max-w-[150px]">{e.fix}</td>
                      <td className="px-2 py-1 text-white/50">{e.estimatedHours}h</td>
                      <td className="px-2 py-1">{e.autoRepair ? <Wrench size={9} className="text-indigo-400" /> : <span className="text-white/30">—</span>}</td>
                      <td className="px-2 py-1 text-emerald-400">+{e.scoreGain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg p-4 text-center mb-4">
            <div className="text-sm text-emerald-400">No technical debt in this category</div>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mb-2"><Clock size={10} /> Timeline</div>
          <div className="text-[11px] text-white/60">{detail.estimatedHours > 0 ? `${detail.estimatedHours}h estimated` : "Complete"}</div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 mb-1 mt-2"><Users size={10} /> Owners</div>
          <div className="flex flex-wrap gap-1">
            {intel.techDebt.owners.map((o) => <span key={o} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">{o}</span>)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 mt-2">Dependencies</div>
          <div className="flex flex-wrap gap-1">
            {intel.techDebt.dependencies.map((d) => <span key={d} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">{d}</span>)}
          </div>
        </div>

        <div className="space-y-3">
          <SecReportToolbar intel={intel} />
          <SecCopilot intel={intel} title="Ask EXEC™ — Technical Debt" />
        </div>
      </SheetContent>
    </Sheet>
  );
}