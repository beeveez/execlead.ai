import React from "react";
import { Inbox, Search, Filter, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";
import { FEEDBACK_STATUSES, SEVERITY_LEVELS, getTypeMeta, getStatusMeta, getSeverityMeta, safeParse } from "@/lib/feedbackConfig";
import { resolveCustomer, getSentiment, formatRelative } from "@/lib/productManagement";

const selectCls = "bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-indigo-500/50";

export default function FeedbackInbox({ pm, onSelect }) {
  const { filters, setFilters, resetFilters, filteredFeedback, insights } = pm;
  const modules = insights?.modules || [];
  const organizations = insights?.organizations || [];
  const developers = insights?.developers || [];

  return (
    <div>
      <SectionHeader icon={Inbox} title="Feedback Inbox" description={`${filteredFeedback.length} items — connected directly to the Feedback entity.`} />

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={filters.search} onChange={e => setFilters({ search: e.target.value })} placeholder="Search by ID, customer, organization, keyword, tag..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-white/30"><Filter size={11} /></span>
          <select value={filters.status} onChange={e => setFilters({ status: e.target.value })} className={selectCls}>
            <option value="" className="bg-[#0d0d14]">All Statuses</option>
            {FEEDBACK_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilters({ priority: e.target.value })} className={selectCls}>
            <option value="" className="bg-[#0d0d14]">All Priorities</option>
            {SEVERITY_LEVELS.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
          </select>
          <select value={filters.module} onChange={e => setFilters({ module: e.target.value })} className={selectCls}>
            <option value="" className="bg-[#0d0d14]">All Modules</option>
            {modules.map(m => <option key={m} value={m} className="bg-[#0d0d14]">{m}</option>)}
          </select>
          <select value={filters.organization} onChange={e => setFilters({ organization: e.target.value })} className={selectCls}>
            <option value="" className="bg-[#0d0d14]">All Organizations</option>
            {organizations.map(o => <option key={o} value={o} className="bg-[#0d0d14]">{o}</option>)}
          </select>
          <select value={filters.developer} onChange={e => setFilters({ developer: e.target.value })} className={selectCls}>
            <option value="" className="bg-[#0d0d14]">All Developers</option>
            {developers.map(d => <option key={d} value={d} className="bg-[#0d0d14]">{d}</option>)}
          </select>
          <input type="date" value={filters.dateFrom} onChange={e => setFilters({ dateFrom: e.target.value })} className={selectCls} />
          <input type="date" value={filters.dateTo} onChange={e => setFilters({ dateTo: e.target.value })} className={selectCls} />
          <button onClick={resetFilters} className="text-xs text-white/40 hover:text-white/60">Reset</button>
        </div>
      </div>

      {/* List */}
      {filteredFeedback.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Inbox size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No feedback matches your filters.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredFeedback.map(item => {
            const tMeta = getTypeMeta(item.type);
            const sMeta = getStatusMeta(item.status);
            const sevMeta = getSeverityMeta(item.severity);
            const customer = resolveCustomer(item);
            const sentiment = getSentiment(item.ai_sentiment);
            const module = item.affected_module || item.ai_responsible_module || item.category;
            return (
              <div key={item.id} onClick={() => onSelect(item.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 cursor-pointer transition-colors group">
                <span className="text-lg shrink-0">{tMeta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80 truncate group-hover:text-white">{item.title}</span>
                    {item.is_enterprise_priority && <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-amber-500/15 text-amber-400">P1</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30 flex-wrap">
                    <code>{item.feedback_id}</code>
                    <span>{customer.name}</span>
                    {customer.organization !== "—" && <span>· {customer.organization}</span>}
                    <span>· {module}</span>
                    {item.assigned_developer && <span>· @{item.assigned_developer}</span>}
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sentiment.color }} title={sentiment.label} />
                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium border shrink-0" style={{ color: sMeta.color, borderColor: `${sMeta.color}30`, background: `${sMeta.color}10` }}>{sMeta.label}</span>
                <span className="text-[10px] text-white/30 shrink-0 hidden sm:block">{formatRelative(item.created_date)}</span>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}