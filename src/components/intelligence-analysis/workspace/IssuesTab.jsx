import React, { useState, useMemo } from "react";
import { Search, Filter, Boxes } from "lucide-react";

const SEV_STYLE = { Critical: "text-red-400 bg-red-500/10", High: "text-red-400 bg-red-500/10", Medium: "text-amber-400 bg-amber-500/10", Low: "text-blue-400 bg-blue-500/10" };
const STATUS_STYLE = { Resolved: "text-emerald-400", "In Progress": "text-amber-400", Open: "text-white/50", Pending: "text-amber-400", Scheduled: "text-blue-400" };

export default function IssuesTab({ bundle }) {
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");

  const owners = useMemo(() => ["All", ...new Set(bundle.issues.map((i) => i.owner))], [bundle.issues]);
  const filtered = useMemo(() => bundle.issues.filter((i) => {
    const ms = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()) || i.component.toLowerCase().includes(search.toLowerCase());
    const ms2 = sevFilter === "All" || i.severity === sevFilter;
    const ms3 = statusFilter === "All" || i.status === statusFilter;
    const ms4 = ownerFilter === "All" || i.owner === ownerFilter;
    return ms && ms2 && ms3 && ms4;
  }), [bundle.issues, search, sevFilter, statusFilter, ownerFilter]);

  return (
    <div className="space-y-6">
      {/* Affected Components */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Boxes size={14} className="text-indigo-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Affected Components</h3></div>
        <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-lg">
          <table className="w-full text-xs">
            <thead className="text-white/30 uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="text-left px-3 py-2">Component</th>
                <th className="text-center px-3 py-2">Current</th>
                <th className="text-center px-3 py-2">Target</th>
                <th className="text-center px-3 py-2">Issues</th>
                <th className="text-center px-3 py-2">Severity</th>
                <th className="text-left px-3 py-2">Owner</th>
                <th className="text-center px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bundle.components.map((c, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-3 py-2 text-white/80 font-medium">{c.component}</td>
                  <td className="px-3 py-2 text-center text-amber-400 font-medium">{c.currentScore}</td>
                  <td className="px-3 py-2 text-center text-white/60">{c.targetScore}</td>
                  <td className="px-3 py-2 text-center text-white/70">{c.issueCount}</td>
                  <td className="px-3 py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SEV_STYLE[c.severity] || ""}`}>{c.severity}</span></td>
                  <td className="px-3 py-2 text-white/60">{c.owner}</td>
                  <td className={`px-3 py-2 text-center ${STATUS_STYLE[c.status] || "text-white/50"}`}>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue List */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Filter size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Issue List ({filtered.length})</h3></div>
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search issues, components…" className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40" />
          </div>
          <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none">
            <option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none">
            <option>All</option><option>Open</option><option>In Progress</option><option>Pending</option><option>Scheduled</option><option>Resolved</option>
          </select>
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none">
            {owners.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          {filtered.map((iss) => (
            <div key={iss.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <span className="text-white/80 text-sm font-medium">{iss.title}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SEV_STYLE[iss.severity] || ""}`}>{iss.severity}</span>
              </div>
              <p className="text-white/50 text-xs mb-2">{iss.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px]">
                <span><span className="text-white/30">Business:</span> <span className="text-white/60">{iss.businessImpact}</span></span>
                <span><span className="text-white/30">Technical:</span> <span className="text-white/60">{iss.technicalImpact}</span></span>
                <span><span className="text-white/30">Est. Improvement:</span> <span className="text-emerald-400">{iss.estimatedImprovement}</span></span>
                <span><span className="text-white/30">Owner:</span> <span className="text-white/60">{iss.owner}</span></span>
                <span><span className="text-white/30">Detected:</span> <span className="text-white/60">{iss.detectedDate}</span></span>
                <span><span className="text-white/30">Updated:</span> <span className="text-white/60">{iss.lastUpdated}</span></span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-white/30 text-xs text-center py-4">No issues match the current filters.</p>}
        </div>
      </div>
    </div>
  );
}