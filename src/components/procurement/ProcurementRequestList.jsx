import React, { useMemo, useState } from "react";
import { Search, Plus, ChevronRight, Filter } from "lucide-react";
import {
  PROCUREMENT_STATUSES, PROCUREMENT_PRIORITIES, PROCUREMENT_CATEGORIES,
  formatCurrency, getStatusBadge, getPriorityBadge, getSLABadgeClass, getCategoryMeta,
} from "@/lib/procurementEngine";

export default function ProcurementRequestList({ requests, onSelectRequest, onNewRequest, pendingOnly = false }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(pendingOnly ? "pending_approval" : "all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = [...(requests || [])].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (pendingOnly) result = result.filter((r) => r.status === "pending_approval");
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        (r.title || "").toLowerCase().includes(q) ||
        (r.request_number || "").toLowerCase().includes(q) ||
        (r.vendor_name || "").toLowerCase().includes(q) ||
        (r.requested_by_name || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter((r) => r.priority === priorityFilter);
    if (categoryFilter !== "all") result = result.filter((r) => r.category === categoryFilter);
    return result;
  }, [requests, search, statusFilter, priorityFilter, categoryFilter, pendingOnly]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by request #, title, vendor, requestor..."
              className="w-full pl-9 pr-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
        {!pendingOnly && (
          <button onClick={onNewRequest} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shrink-0">
            <Plus size={16} /> New Request
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={12} className="text-white/30" />
        {!pendingOnly && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1 bg-white/[0.02] border border-white/5 rounded text-xs text-white/60 focus:outline-none">
            <option value="all">All Statuses</option>
            {PROCUREMENT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        )}
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-2 py-1 bg-white/[0.02] border border-white/5 rounded text-xs text-white/60 focus:outline-none">
          <option value="all">All Priorities</option>
          {PROCUREMENT_PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-2 py-1 bg-white/[0.02] border border-white/5 rounded text-xs text-white/60 focus:outline-none">
          <option value="all">All Categories</option>
          {PROCUREMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <span className="text-white/30 text-xs ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-2.5 px-3 font-medium">Request #</th>
                  <th className="text-left py-2.5 px-3 font-medium">Title</th>
                  <th className="text-left py-2.5 px-3 font-medium">Category</th>
                  <th className="text-right py-2.5 px-3 font-medium">Amount</th>
                  <th className="text-center py-2.5 px-3 font-medium">Priority</th>
                  <th className="text-center py-2.5 px-3 font-medium">Status</th>
                  <th className="text-center py-2.5 px-3 font-medium">SLA</th>
                  <th className="text-left py-2.5 px-3 font-medium">Requestor</th>
                  <th className="text-left py-2.5 px-3 font-medium">Date</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const status = getStatusBadge(r.status);
                  const priority = getPriorityBadge(r.priority);
                  const cat = getCategoryMeta(r.category);
                  return (
                    <tr key={r.id} onClick={() => onSelectRequest(r)} className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group">
                      <td className="py-2.5 px-3 font-mono text-indigo-400 text-[10px]">{r.request_number}</td>
                      <td className="py-2.5 px-3 text-white/80 max-w-[200px] truncate">{r.title}</td>
                      <td className="py-2.5 px-3 text-white/40">{cat.label}</td>
                      <td className="py-2.5 px-3 text-right text-white/60">{formatCurrency(r.amount, r.currency)}</td>
                      <td className="py-2.5 px-3 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full border ${priority.badge}`}>{priority.label}</span></td>
                      <td className="py-2.5 px-3 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full border ${status.badge}`}>{status.label}</span></td>
                      <td className="py-2.5 px-3 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full border ${getSLABadgeClass(r.sla_status)}`}>{(r.sla_status || "on_track").replace("_", " ")}</span></td>
                      <td className="py-2.5 px-3 text-white/40 truncate max-w-[120px]">{r.requested_by_name || "—"}</td>
                      <td className="py-2.5 px-3 text-white/30 text-[10px]">{new Date(r.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                      <td className="py-2.5 px-2"><ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 transition-colors" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-white/15" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">No Requests Found</h3>
          <p className="text-white/30 text-xs">{pendingOnly ? "No pending approvals at this time." : "Adjust your filters or create a new procurement request."}</p>
        </div>
      )}
    </div>
  );
}