import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/companyAdmin";
import { Pencil, GitMerge, Trash2, Check, X, Building2 } from "lucide-react";

/**
 * Industries Management view — lists every industry derived from the
 * company library with company counts, status, and taxonomy actions:
 * rename (edit), merge into another industry, and delete (unassign).
 */
export default function IndustriesManagement({ companies, onUpdated, userName }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [merging, setMerging] = useState(null);
  const [mergeTarget, setMergeTarget] = useState("");

  const industries = useMemo(() => {
    const map = {};
    for (const c of companies) {
      const key = c.industry || "(Uncategorized)";
      if (!map[key]) map[key] = { name: key, count: 0, active: 0, archived: 0, ids: [] };
      map[key].count++;
      map[key].ids.push(c.id);
      if (c.status === "archived") map[key].archived++;
      else map[key].active++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [companies]);

  const saveEdit = async (oldName) => {
    const newName = editValue.trim();
    setEditing(null);
    if (!newName || newName === oldName) return;
    const targets = industries.find((i) => i.name === oldName)?.ids || [];
    if (targets.length === 0) return;
    await base44.entities.Company.bulkUpdate(targets.map((id) => ({ id, industry: newName })));
    await logAudit("update", { name: oldName }, null, { industry: newName }, userName, `Renamed industry "${oldName}" → "${newName}" (${targets.length} companies)`);
    onUpdated();
  };

  const doMerge = async (source) => {
    if (!mergeTarget || mergeTarget === source) { setMerging(null); return; }
    const targets = industries.find((i) => i.name === source)?.ids || [];
    if (targets.length === 0) { setMerging(null); return; }
    await base44.entities.Company.bulkUpdate(targets.map((id) => ({ id, industry: mergeTarget })));
    await logAudit("update", { name: source }, null, { industry: mergeTarget }, userName, `Merged industry "${source}" into "${mergeTarget}" (${targets.length} companies)`);
    setMerging(null);
    setMergeTarget("");
    onUpdated();
  };

  const doDelete = async (name) => {
    if (!confirm(`Remove "${name}"? This unassigns the industry from all ${industries.find((i) => i.name === name)?.count || 0} companies.`)) return;
    const targets = industries.find((i) => i.name === name)?.ids || [];
    if (targets.length === 0) return;
    await base44.entities.Company.bulkUpdate(targets.map((id) => ({ id, industry: "" })));
    await logAudit("update", { name }, null, { industry: "" }, userName, `Deleted industry "${name}" (${targets.length} companies unassigned)`);
    onUpdated();
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02]">
          <tr>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Industry</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Companies</th>
            <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Status</th>
            <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {industries.map((ind) => (
            <tr key={ind.name} className="border-t border-white/5 hover:bg-white/[0.02]">
              <td className="px-4 py-3">
                {editing === ind.name ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(ind.name)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                    <button onClick={() => saveEdit(ind.name)} className="p-1 text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
                    <button onClick={() => setEditing(null)} className="p-1 text-white/30 hover:text-white/60"><X size={14} /></button>
                  </div>
                ) : (
                  <span className="text-white/80 font-medium flex items-center gap-2"><Building2 size={14} className="text-white/20" />{ind.name}</span>
                )}
              </td>
              <td className="px-4 py-3 text-white/50">{ind.count}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{ind.active} active</span>
                  {ind.archived > 0 && <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">{ind.archived} archived</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {merging === ind.name ? (
                    <select
                      autoFocus
                      value={mergeTarget}
                      onChange={(e) => setMergeTarget(e.target.value)}
                      onBlur={() => doMerge(ind.name)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    >
                      <option value="">Merge into…</option>
                      {industries.filter((o) => o.name !== ind.name).map((o) => (
                        <option key={o.name} value={o.name} className="bg-[#0d0d14]">{o.name}</option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <button onClick={() => { setEditing(ind.name); setEditValue(ind.name); }} className="p-1.5 text-white/30 hover:text-indigo-400" title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => { setMerging(ind.name); setMergeTarget(""); }} className="p-1.5 text-white/30 hover:text-cyan-400" title="Merge"><GitMerge size={14} /></button>
                      <button onClick={() => doDelete(ind.name)} className="p-1.5 text-white/30 hover:text-red-400" title="Delete"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {industries.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-12 text-center text-white/30 text-sm">No industries yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}