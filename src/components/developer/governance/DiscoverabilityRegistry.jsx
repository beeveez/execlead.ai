import React, { useMemo, useState } from "react";
import { Search, ChevronRight, AlertCircle, CheckCircle2, Link2, EyeOff } from "lucide-react";
import MetadataDrawer from "../metadata/MetadataDrawer";
import SelfHealingActions from "../metadata/SelfHealingActions";

function buildDiscoverabilityGaps(report) {
  const gaps = [];
  report.routeCoverage.detailed.forEach((r) => {
    const reasons = [];
    if (!r.metadata.navigationGroup) reasons.push("Missing Navigation");
    if (!r.metadata.searchKeywords) reasons.push("Missing Search Metadata");
    if (reasons.length > 0) {
      gaps.push({
        id: `route-${r.route}`, entity: r.route, name: r.name, type: "Route", workspace: r.metadata.workspace || "—", module: r.metadata.module || "—",
        reasons, owner: "Platform Engineering", fix: "Add navigation group + search keywords", deepLink: r.route, autoRepair: true,
        estimatedHours: 0.5, dependencies: ["Route Registry™", "Navigation Groups"],
      });
    }
  });
  report.moduleCoverage.detailed.forEach((m) => {
    if (!m.metadata.navigationLocation) {
      gaps.push({
        id: `module-${m.moduleId}`, entity: m.moduleName, name: m.moduleName, type: "Module", workspace: m.metadata.workspace || "—", module: m.moduleName,
        reasons: ["Missing Navigation"], owner: "Platform Engineering", fix: "Assign navigation location",
        deepLink: "/developer", autoRepair: true, estimatedHours: 0.25, dependencies: ["Module Registry™"],
      });
    }
  });
  const orphanRouteNames = report.manifestValidation.orphanRoutes > 0 ? ["Dark Asset", "Missing Module", "Missing Manifest"] : [];
  if (orphanRouteNames.length > 0) {
    gaps.push({
      id: "orphan-routes-summary", entity: `${report.manifestValidation.orphanRoutes} orphaned routes`, name: "Orphaned Routes (Dark Assets)", type: "Manifest",
      workspace: "—", module: "—", reasons: orphanRouteNames, owner: "Platform Engineering", fix: "Register modules for orphaned routes or remove dead routes",
      deepLink: "/developer", autoRepair: false, estimatedHours: report.manifestValidation.orphanRoutes * 1, dependencies: ["Module Registry™", "Platform Manifest™"],
    });
  }
  return gaps;
}

export default function DiscoverabilityRegistry({ report, onClose }) {
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const gaps = useMemo(() => buildDiscoverabilityGaps(report), [report]);
  const allReasons = useMemo(() => [...new Set(gaps.flatMap((g) => g.reasons))], [gaps]);
  const filtered = useMemo(() => gaps.filter((g) => {
    const ms = !search || g.entity.toLowerCase().includes(search.toLowerCase()) || g.name.toLowerCase().includes(search.toLowerCase());
    const mr = reasonFilter === "all" || g.reasons.includes(reasonFilter);
    return ms && mr;
  }), [gaps, search, reasonFilter]);

  const totalHours = gaps.reduce((s, g) => s + (g.estimatedHours || 0), 0);

  return (
    <MetadataDrawer title="Discoverability Registry™" subtitle={`${gaps.length} dark/unindexed assets · ${100 - report.discoverabilityScore}% gap · ${totalHours.toFixed(1)}h est.`} icon={EyeOff} onClose={onClose} maxWidth="max-w-3xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets…" className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 focus:outline-none">
          <option value="all">All Reasons</option>
          {allReasons.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        {filtered.length === 0 && (
          <div className="text-center py-8"><CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" /><p className="text-xs text-white/40">All assets are discoverable. ✓</p></div>
        )}
        {filtered.slice(0, 150).map((g) => (
          <button key={g.id} onClick={() => setSelected(g)} className="w-full flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors group">
            <EyeOff size={14} className="text-cyan-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 font-medium truncate">{g.name}</span>
                <span className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{g.type}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {g.reasons.map((r) => <span key={r} className="text-[9px] text-cyan-400/70 bg-cyan-500/5 px-1.5 py-0.5 rounded">{r}</span>)}
              </div>
            </div>
            <span className="text-[9px] text-white/40 flex-shrink-0">{g.estimatedHours}h</span>
            <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </button>
        ))}
        {filtered.length > 150 && <p className="text-center text-white/30 text-[10px] py-2">Showing first 150 of {filtered.length}.</p>}
      </div>
      {selected && <GapDetail gap={selected} onClose={() => setSelected(null)} />}
    </MetadataDrawer>
  );
}

function GapDetail({ gap, onClose }) {
  return (
    <MetadataDrawer title={gap.name} subtitle={`${gap.type} · Discoverability Gap`} icon={EyeOff} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailStat label="Type" value={gap.type} />
          <DetailStat label="Owner" value={gap.owner} />
          <DetailStat label="Workspace" value={gap.workspace} />
          <DetailStat label="Module" value={gap.module} />
          <DetailStat label="Est. Hours" value={`${gap.estimatedHours}h`} />
          <DetailStat label="Auto Repair" value={gap.autoRepair ? "Available" : "Manual"} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Discoverability Gaps</h4>
          <div className="space-y-1.5">
            {gap.reasons.map((r) => (
              <div key={r} className="flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/10 rounded px-2 py-1.5 text-xs">
                <AlertCircle size={10} className="text-cyan-400 flex-shrink-0" />
                <span className="text-white/70">{r}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Repair Action</h4>
          <p className="text-xs text-white/70 bg-white/[0.02] border border-white/5 rounded-lg p-3">{gap.fix}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Dependencies</h4>
          <div className="flex flex-wrap gap-1.5">{gap.dependencies.map((d) => <span key={d} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5">{d}</span>)}</div>
        </div>
        <SelfHealingActions item={{ ...gap, field: gap.reasons[0], repairAction: gap.fix, autoRepair: gap.autoRepair }} />
        {gap.deepLink && gap.deepLink.startsWith("/") && (
          <a href={gap.deepLink} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"><Link2 size={12} /> Open {gap.type}</a>
        )}
      </div>
    </MetadataDrawer>
  );
}

function DetailStat({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5"><div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 mt-0.5 truncate">{value}</div></div>);
}