import React, { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, CheckCircle2, XCircle, AlertTriangle, Wrench } from "lucide-react";
import SecReportToolbar from "./SecReportToolbar";

export default function SecTestRegistryDrawer({ open, tests, intel, onClose, onTestClick }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  const categories = useMemo(() => [...new Set(tests.map((t) => t.categoryLabel))], [tests]);

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      if (statusFilter === "fail" && t.status !== "fail") return false;
      if (statusFilter === "pass" && t.status !== "pass") return false;
      if (catFilter !== "all" && t.categoryLabel !== catFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.entity.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tests, search, statusFilter, catFilter]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-6xl overflow-y-auto bg-[#0a0a0f] border-white/10">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white">Test Registry™ ({tests.length} tests)</SheetTitle>
          <p className="text-white/40 text-xs">Every security test — clickable, filterable, exportable</p>
        </SheetHeader>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tests, entities, IDs..." className="w-full bg-white/5 border border-white/10 rounded pl-7 pr-3 py-1.5 text-[11px] text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[10px] text-white/70 focus:outline-none">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-1">
            {["all", "fail", "pass"].map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)} className={`text-[10px] px-2 py-1 rounded border transition-colors ${statusFilter === f ? "bg-white/10 border-white/20 text-white/80" : "bg-transparent border-white/5 text-white/40 hover:text-white/60"}`}>{f === "all" ? "All" : f === "fail" ? "Failed" : "Passed"}</button>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden mb-4">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-[#0a0a0f]">
                <tr className="border-b border-white/5 text-white/40 uppercase">
                  <th className="text-left px-2 py-1.5 font-medium">Test</th>
                  <th className="text-left px-2 py-1.5 font-medium">Category</th>
                  <th className="text-left px-2 py-1.5 font-medium">Status</th>
                  <th className="text-left px-2 py-1.5 font-medium">Severity</th>
                  <th className="text-left px-2 py-1.5 font-medium">Entity</th>
                  <th className="text-left px-2 py-1.5 font-medium">Owner</th>
                  <th className="text-left px-2 py-1.5 font-medium">RLS</th>
                  <th className="text-left px-2 py-1.5 font-medium">Root Cause</th>
                  <th className="text-left px-2 py-1.5 font-medium">Fix</th>
                  <th className="text-center px-2 py-1.5 font-medium">✓</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((t) => (
                  <tr key={t.id} onClick={() => onTestClick(t)} className="border-b border-white/[0.02] hover:bg-white/[0.03] cursor-pointer transition-colors">
                    <td className="px-2 py-1"><code className="text-white/40 font-mono">{t.id}</code></td>
                    <td className="px-2 py-1 text-white/50">{t.categoryLabel}</td>
                    <td className="px-2 py-1">{t.status === "pass" ? <CheckCircle2 size={10} className="text-emerald-400" /> : t.riskLevel === "critical" ? <XCircle size={10} className="text-red-400" /> : <AlertTriangle size={10} className="text-amber-400" />}</td>
                    <td className="px-2 py-1 text-white/50">{t.severity}</td>
                    <td className="px-2 py-1 text-white/70">{t.entity}</td>
                    <td className="px-2 py-1 text-white/40">{t.owner}</td>
                    <td className="px-2 py-1 text-white/40 truncate max-w-[100px]">{t.rlsPolicy}</td>
                    <td className="px-2 py-1 text-amber-400/60 truncate max-w-[120px]">{t.rootCause}</td>
                    <td className="px-2 py-1">{t.autoRepair ? <span className="flex items-center gap-1 text-indigo-400"><Wrench size={8} /> Auto</span> : <span className="text-white/30 truncate max-w-[80px]">{t.fix}</span>}</td>
                    <td className="px-2 py-1 text-center">{t.status === "pass" ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 200 && <div className="text-center py-2 text-[10px] text-white/30">Showing 200 of {filtered.length} — use search to filter</div>}
        </div>

        <SecReportToolbar intel={intel} />
      </SheetContent>
    </Sheet>
  );
}