import React, { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, XCircle, AlertTriangle, Wrench, Shield } from "lucide-react";
import SecCopilot from "./SecCopilot";
import SecReportToolbar from "./SecReportToolbar";

export default function SecFailureRegistryDrawer({ open, title, tests, intel, onClose, onTestClick }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.entity.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tests, search]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-5xl overflow-y-auto bg-[#0a0a0f] border-white/10">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white flex items-center gap-2">
            {title.includes("Warning") ? <AlertTriangle size={16} className="text-amber-400" /> : <XCircle size={16} className="text-red-400" />}
            {title} ({tests.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search failures, entities..." className="w-full bg-white/5 border border-white/10 rounded pl-7 pr-3 py-1.5 text-[11px] text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30" />
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden mb-4">
          <div className="overflow-x-auto max-h-[50vh]">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-[#0a0a0f]">
                <tr className="border-b border-white/5 text-white/40 uppercase">
                  <th className="text-left px-2 py-1.5 font-medium">Failure</th>
                  <th className="text-left px-2 py-1.5 font-medium">Category</th>
                  <th className="text-left px-2 py-1.5 font-medium">Severity</th>
                  <th className="text-left px-2 py-1.5 font-medium">Entity</th>
                  <th className="text-left px-2 py-1.5 font-medium">Module</th>
                  <th className="text-left px-2 py-1.5 font-medium">Workspace</th>
                  <th className="text-left px-2 py-1.5 font-medium">Root Cause</th>
                  <th className="text-left px-2 py-1.5 font-medium">Owner</th>
                  <th className="text-left px-2 py-1.5 font-medium">Est. Hours</th>
                  <th className="text-left px-2 py-1.5 font-medium">Potential Risk</th>
                  <th className="text-left px-2 py-1.5 font-medium">Auto Repair</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((t) => (
                  <tr key={t.id} onClick={() => onTestClick(t)} className="border-b border-white/[0.02] hover:bg-white/[0.03] cursor-pointer transition-colors">
                    <td className="px-2 py-1"><code className="text-white/40 font-mono">{t.id}</code><div className="text-white/50 text-[9px] truncate max-w-[150px]">{t.name}</div></td>
                    <td className="px-2 py-1 text-white/50">{t.categoryLabel}</td>
                    <td className="px-2 py-1"><span className={t.severity === "critical" ? "text-red-400" : t.severity === "high" ? "text-amber-400" : "text-yellow-400"}>{t.severity}</span></td>
                    <td className="px-2 py-1 text-white/70">{t.entity}</td>
                    <td className="px-2 py-1 text-white/40">{t.module}</td>
                    <td className="px-2 py-1 text-white/40">{t.workspace}</td>
                    <td className="px-2 py-1 text-amber-400/60 truncate max-w-[120px]">{t.rootCause}</td>
                    <td className="px-2 py-1 text-white/40">{t.owner}</td>
                    <td className="px-2 py-1 text-white/50">{t.estimatedHours}h</td>
                    <td className="px-2 py-1 text-red-400/60 truncate max-w-[120px]">{t.potentialRisk}</td>
                    <td className="px-2 py-1">{t.autoRepair ? <span className="flex items-center gap-1 text-indigo-400"><Wrench size={8} /> Yes</span> : <span className="text-white/30">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <SecReportToolbar intel={intel} />
          <SecCopilot intel={intel} title="Ask EXEC™ — Failure Registry" />
        </div>
      </SheetContent>
    </Sheet>
  );
}