import React, { useMemo, useState } from "react";
import { Search, Plus, Building2, ChevronRight } from "lucide-react";
import {
  formatCurrency, getStatusBadge, getRiskBadge, getPerformanceTierBadge,
  getCategoryLabel, getTypeLabel, VENDOR_CATEGORIES, VENDOR_TYPES, VENDOR_STATUS,
} from "@/lib/vendorEngine";

export default function VendorDirectory({ vendors, onNewVendor, onSelectVendor }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = Array.isArray(vendors) ? vendors : [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((v) =>
        v.vendor_name?.toLowerCase().includes(q) ||
        v.contact_name?.toLowerCase().includes(q) ||
        v.contact_email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter((v) => v.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter((v) => v.category === categoryFilter);
    if (typeFilter !== "all") list = list.filter((v) => v.vendor_type === typeFilter);
    return list.sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0));
  }, [vendors, search, statusFilter, categoryFilter, typeFilter]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 focus:outline-none">
          <option value="all">All Status</option>
          {VENDOR_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 focus:outline-none">
          <option value="all">All Categories</option>
          {VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 focus:outline-none">
          <option value="all">All Types</option>
          {VENDOR_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <button onClick={onNewVendor} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors shrink-0">
          <Plus size={14} /> Add Vendor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2">Vendor</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-left py-2 px-2">Category</th>
              <th className="text-center py-2 px-2">Status</th>
              <th className="text-center py-2 px-2">Risk</th>
              <th className="text-center py-2 px-2">Tier</th>
              <th className="text-right py-2 px-2">Spend</th>
              <th className="text-center py-2 px-2">Perf</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-white/30">No vendors found. Add your first vendor to get started.</td></tr>
            ) : (
              filtered.slice(0, 100).map((v) => {
                const status = getStatusBadge(v.status);
                const risk = getRiskBadge(v.risk_level);
                const tier = getPerformanceTierBadge(v.performance_tier);
                return (
                  <tr key={v.id} onClick={() => onSelectVendor(v)} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Building2 size={12} className="text-indigo-400" />
                        </div>
                        <span className="text-white/80 font-medium truncate max-w-[180px]">{v.vendor_name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-white/40">{getTypeLabel(v.vendor_type)}</td>
                    <td className="py-2 px-2 text-white/40">{getCategoryLabel(v.category)}</td>
                    <td className="py-2 px-2 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full border ${status.badge}`}>{status.label}</span></td>
                    <td className="py-2 px-2 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full border ${risk.badge}`}>{risk.label}</span></td>
                    <td className="py-2 px-2 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full border ${tier.badge}`}>{tier.label}</span></td>
                    <td className="py-2 px-2 text-right text-white/50">{formatCurrency(v.total_spend)}</td>
                    <td className="py-2 px-2 text-center"><span className={v.performance_score >= 80 ? "text-emerald-400" : v.performance_score >= 60 ? "text-amber-400" : "text-red-400"}>{v.performance_score || 0}</span></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > 100 && <p className="text-center text-white/30 text-[10px] py-2">Showing first 100 of {filtered.length}. Refine your search.</p>}
      </div>
    </div>
  );
}