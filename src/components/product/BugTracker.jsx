import React, { useState } from "react";
import { Bug, ChevronRight, Filter } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";
import { SEVERITY_LEVELS, getStatusMeta, getSeverityMeta, safeParse } from "@/lib/feedbackConfig";
import { formatRelative, resolveCustomer } from "@/lib/productManagement";

const selectCls = "bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-indigo-500/50";

export default function BugTracker({ pm, onSelect }) {
  const [sevFilter, setSevFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [envFilter, setEnvFilter] = useState("");

  const bugs = pm.feedback.filter(f => f.type === "bug");
  const filtered = bugs.filter(b => {
    if (sevFilter && b.severity !== sevFilter) return false;
    if (statusFilter && b.status !== statusFilter) return false;
    if (envFilter && b.environment !== envFilter) return false;
    return true;
  });

  const environments = [...new Set(bugs.map(b => b.environment).filter(Boolean))];

  return (
    <div>
      <SectionHeader icon={Bug} title="Bug Tracker" description={`${filtered.length} bugs tracked — converted from customer feedback.`} />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="flex items-center gap-1 text-xs text-white/30"><Filter size={11} /></span>
        <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className={selectCls}>
          <option value="" className="bg-[#0d0d14]">All Severities</option>
          {SEVERITY_LEVELS.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="" className="bg-[#0d0d14]">All Statuses</option>
          {["new", "acknowledged", "investigating", "in_progress", "testing", "resolved", "closed"].map(s => <option key={s} value={s} className="bg-[#0d0d14]">{s.replace(/_/g, " ")}</option>)}
        </select>
        <select value={envFilter} onChange={e => setEnvFilter(e.target.value)} className={selectCls}>
          <option value="" className="bg-[#0d0d14]">All Environments</option>
          {environments.map(e => <option key={e} value={e} className="bg-[#0d0d14]">{e}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Bug size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No bugs found. Convert feedback to bugs from the inbox.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(bug => {
            const sMeta = getStatusMeta(bug.status);
            const sevMeta = getSeverityMeta(bug.severity);
            const customer = resolveCustomer(bug);
            return (
              <div key={bug.id} onClick={() => onSelect(bug.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 cursor-pointer transition-colors group">
                <div className="w-1 h-10 rounded-full shrink-0" style={{ background: sevMeta.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate group-hover:text-white">{bug.title}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30 flex-wrap">
                    <code>{bug.feedback_id}</code>
                    <span>· {bug.affected_module || bug.category}</span>
                    {bug.environment && <span>· {bug.environment}</span>}
                    {bug.fix_version && <span>· fix: {bug.fix_version}</span>}
                    <span>· {customer.name}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium shrink-0" style={{ color: sevMeta.color, background: `${sevMeta.color}15` }}>{sevMeta.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium border shrink-0" style={{ color: sMeta.color, borderColor: `${sMeta.color}30`, background: `${sMeta.color}10` }}>{sMeta.label}</span>
                {bug.assigned_developer ? <span className="text-[10px] text-white/40 shrink-0 hidden sm:block">@{bug.assigned_developer}</span> : <span className="text-[10px] text-white/20 shrink-0 hidden sm:block">Unassigned</span>}
                <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}