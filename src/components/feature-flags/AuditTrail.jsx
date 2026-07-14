import React, { useState, useMemo } from "react";
import { AUDIT_ACTIONS, getAuditActionConfig } from "@/lib/featureFlagEngine";
import { StatusBadge, SectionCard, Spinner, EmptyState } from "./Shared";
import { History, Search, RotateCcw } from "lucide-react";

export default function AuditTrail({ audits, loading, onRollback }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = useMemo(() => {
    return audits.filter((a) => {
      if (actionFilter !== "all" && a.action !== actionFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.flag_key?.toLowerCase().includes(q) || a.flag_name?.toLowerCase().includes(q) || a.changed_by_name?.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [audits, search, actionFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
            placeholder="Search by flag, user, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          {AUDIT_ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading audit trail..." />
      ) : filtered.length === 0 ? (
        <EmptyState label="No audit records found." />
      ) : (
        <div className="space-y-1">
          {filtered.map((audit) => (
            <AuditRow key={audit.id} audit={audit} onRollback={() => onRollback(audit)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AuditRow({ audit, onRollback }) {
  const config = getAuditActionConfig(audit.action);
  const time = audit.created_date ? new Date(audit.created_date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={audit.action} />
          <span className="text-sm font-medium text-white">{audit.flag_name || audit.flag_key}</span>
          <code className="text-[10px] text-white/30">{audit.flag_key}</code>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
          {audit.previous_state && audit.new_state && audit.previous_state !== audit.new_state && (
            <span>{audit.previous_state} → <span className="text-white/60">{audit.new_state}</span></span>
          )}
          {audit.previous_percentage != null && audit.new_percentage != null && audit.previous_percentage !== audit.new_percentage && (
            <span>{audit.previous_percentage}% → <span className="text-white/60">{audit.new_percentage}%</span></span>
          )}
        </div>
        {audit.reason && <p className="text-xs text-white/40 mt-0.5">{audit.reason}</p>}
        <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
          <span>by {audit.changed_by_name || "System"}</span>
          {audit.approved_by && <span>· approved by {audit.approved_by}</span>}
          <span>· {time}</span>
        </div>
      </div>
      {audit.rollback_available && onRollback && (
        <button onClick={onRollback} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors" title="Rollback">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}