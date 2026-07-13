import React, { useMemo, useState } from "react";
import { Search, AlertCircle, ChevronRight, Link2, Download } from "lucide-react";
import MetadataDrawer from "./MetadataDrawer";
import SelfHealingActions from "./SelfHealingActions";
import { buildMissingEntriesTable } from "@/lib/metadataCompletionEngine";
import { downloadCSV } from "@/lib/enterpriseReportEngine";

const COLUMNS = [
  { key: "entity", label: "Entity" },
  { key: "type", label: "Type" },
  { key: "workspace", label: "Workspace" },
  { key: "module", label: "Module" },
  { key: "priority", label: "Priority" },
  { key: "severity", label: "Severity" },
  { key: "owner", label: "Owner" },
  { key: "dependencies", label: "Dependencies" },
  { key: "estimatedFixTime", label: "Est. Fix" },
  { key: "status", label: "Status" },
  { key: "deepLink", label: "Deep Link" },
  { key: "repairAction", label: "Repair Action" },
  { key: "autoRepair", label: "Auto Repair" },
];

const SEV_COLOR = { high: "text-red-400", medium: "text-amber-400", low: "text-blue-400" };
const PRIO_COLOR = { P1: "bg-red-500/10 text-red-400", P2: "bg-amber-500/10 text-amber-400", P3: "bg-blue-500/10 text-blue-400" };

export default function MissingEntriesDrawer({ report, onClose }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [prioFilter, setPrioFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const entries = useMemo(() => buildMissingEntriesTable(report), [report]);
  const types = useMemo(() => [...new Set(entries.map((e) => e.type))], [entries]);

  const filtered = useMemo(() => entries.filter((e) => {
    const ms = !search || e.entity.toLowerCase().includes(search.toLowerCase()) || e.field.toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === "all" || e.type === typeFilter;
    const mp = prioFilter === "all" || e.priority === prioFilter;
    return ms && mt && mp;
  }), [entries, search, typeFilter, prioFilter]);

  const totalHours = useMemo(() => entries.reduce((sum, e) => sum + parseFloat(e.estimatedFixTime) || 0, 0), [entries]);

  const handleExport = () => {
    const rows = filtered.map((e) => ({ Entity: e.entity, Type: e.type, Field: e.field, Workspace: e.workspace, Module: e.module, Priority: e.priority, Severity: e.severity, Owner: e.owner, Dependencies: e.dependencies.join("; "), EstimatedFixTime: e.estimatedFixTime, Status: e.status, DeepLink: e.deepLink, RepairAction: e.repairAction, AutoRepair: e.autoRepair }));
    downloadCSV({ title: "Missing Metadata Entries", reportType: "metadata_completion", sections: [{ id: "table", type: "table", title: "Missing Entries", data: { columns: COLUMNS.map((c) => c.label), rows: rows.map((r) => COLUMNS.map((c) => r[c.label] ?? "")) } }] });
  };

  return (
    <MetadataDrawer title="Missing Metadata™" subtitle={`${entries.length} missing entries · ${totalHours.toFixed(1)}h estimated effort`} icon={AlertCircle} onClose={onClose} maxWidth="max-w-4xl"
      footer={<button onClick={handleExport} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg px-3 py-1.5 text-xs transition-colors"><Download size={12} /> Export CSV ({filtered.length})</button>}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entities, fields…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 focus:outline-none">
          <option value="all">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={prioFilter} onChange={(e) => setPrioFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 focus:outline-none">
          <option value="all">All Priority</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2">Entity</th>
              <th className="text-left py-2 px-2">Field</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-left py-2 px-2">WS</th>
              <th className="text-center py-2 px-2">Prio</th>
              <th className="text-center py-2 px-2">Sev</th>
              <th className="text-right py-2 px-2">Fix</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 150).map((e) => (
              <tr key={e.id} onClick={() => setSelected(e)} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors">
                <td className="py-2 px-2 text-white/70 font-mono truncate max-w-[160px]">{e.entity}</td>
                <td className="py-2 px-2 text-white/50">{e.field}</td>
                <td className="py-2 px-2 text-white/40">{e.type}</td>
                <td className="py-2 px-2 text-white/40 truncate max-w-[80px]">{e.workspace}</td>
                <td className="py-2 px-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] ${PRIO_COLOR[e.priority] || ""}`}>{e.priority}</span></td>
                <td className={`py-2 px-2 text-center ${SEV_COLOR[e.severity] || ""}`}>{e.severity}</td>
                <td className="py-2 px-2 text-right text-white/40">{e.estimatedFixTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 150 && <p className="text-center text-white/30 text-[10px] py-2">Showing first 150 of {filtered.length}. Refine your search.</p>}
      </div>
      {selected && <MissingEntryDetail entry={selected} onClose={() => setSelected(null)} />}
    </MetadataDrawer>
  );
}

function MissingEntryDetail({ entry, onClose }) {
  return (
    <MetadataDrawer title={entry.entity} subtitle={`${entry.type} · Missing: ${entry.field}`} icon={ChevronRight} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailStat label="Type" value={entry.type} />
          <DetailStat label="Field" value={entry.field} />
          <DetailStat label="Workspace" value={entry.workspace} />
          <DetailStat label="Module" value={entry.module} />
          <DetailStat label="Priority" value={entry.priority} />
          <DetailStat label="Severity" value={entry.severity} />
          <DetailStat label="Owner" value={entry.owner} />
          <DetailStat label="Est. Fix Time" value={entry.estimatedFixTime} />
          <DetailStat label="Status" value={entry.status} />
          <DetailStat label="Auto Repair" value={entry.autoRepair ? "Available" : "Manual"} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Dependencies</h4>
          <div className="flex flex-wrap gap-1.5">
            {entry.dependencies.map((d) => <span key={d} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5">{d}</span>)}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Evidence</h4>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1">
            {entry.evidence.map((ev, i) => <p key={i} className="text-[10px] text-white/50 font-mono">{ev}</p>)}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Repair Action</h4>
          <p className="text-xs text-white/70 bg-white/[0.02] border border-white/5 rounded-lg p-3">{entry.repairAction}</p>
        </div>
        <SelfHealingActions item={entry} />
        {entry.deepLink && entry.deepLink.startsWith("/") && (
          <a href={entry.deepLink} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"><Link2 size={12} /> Open {entry.type}</a>
        )}
      </div>
    </MetadataDrawer>
  );
}

function DetailStat({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5"><div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 mt-0.5 truncate">{value}</div></div>);
}