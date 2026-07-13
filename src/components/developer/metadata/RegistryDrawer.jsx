import React, { useMemo, useState } from "react";
import { Search, CheckCircle2, AlertCircle, ChevronRight, Link2, Wrench } from "lucide-react";
import MetadataDrawer from "./MetadataDrawer";
import SelfHealingActions from "./SelfHealingActions";

const REGISTRY_CONFIG = {
  routes: { title: "Route Registry™", subtitle: "Every route in the platform — clickable, searchable, exportable", getItems: (r) => r.routeCoverage.detailed.map((d) => ({ id: d.route, name: d.name, status: d.complete, missingFields: d.missingFields, workspace: d.metadata.workspace, module: d.metadata.module, owner: "Platform Engineering", deepLink: d.route, metadata: d.metadata, type: "Route" })) },
  modules: { title: "Module Registry™", subtitle: "Every registered module with metadata completeness", getItems: (r) => r.moduleCoverage.detailed.map((d) => ({ id: d.moduleId, name: d.moduleName, status: d.complete, missingFields: d.missingFields, workspace: d.metadata.workspace, module: d.moduleName, owner: "Platform Engineering", deepLink: "/developer", metadata: d.metadata, type: "Module" })) },
  capabilities: { title: "Capability Registry™", subtitle: "Capability chains — each must link to Knowledge Pack → Framework → Evidence", getItems: (r) => r.capabilityCoverage.detailed.map((d) => ({ id: d.capabilityId, name: d.capabilityName, status: d.complete, missingFields: d.brokenAt ? [d.brokenAt] : [], workspace: d.chain.workspace, module: d.chain.module, owner: "AI Engineering", deepLink: "/developer", metadata: d.chain, type: "Capability" })) },
  frameworks: { title: "Framework Registry™", subtitle: "Every framework with its knowledge packs, capabilities, and modules", getItems: (r) => r.frameworkCoverage.detailed.map((d) => ({ id: d.frameworkId, name: d.frameworkName, status: d.complete, missingFields: d.missingFields, workspace: "—", module: "—", owner: "AI Engineering", deepLink: "/developer", metadata: d.metadata, type: "Framework" })) },
  personas: { title: "Persona Registry™", subtitle: "AI personas — each must have knowledge packs, frameworks, and capabilities", getItems: (r) => r.personaCoverage.detailed.map((d) => ({ id: d.personaId, name: d.personaName, status: d.complete, missingFields: d.missingFields, workspace: d.metadata.workspace, module: "—", owner: "AI Engineering", deepLink: "/developer", metadata: d.metadata, type: "Persona" })) },
  knowledge: { title: "Knowledge Pack Registry™", subtitle: "EXEC™ Knowledge Index entries for every non-exempt route", getItems: (r) => ROUTE_REGISTRY_ITEMS(r) },
  manifest: { title: "Platform Manifest™", subtitle: "Manifest validation findings — errors, warnings, orphans", getItems: (r) => MANIFEST_ITEMS(r) },
};

function ROUTE_REGISTRY_ITEMS(r) {
  return r.knowledgeCoverage.missingRoutes.length > 0
    ? r.knowledgeCoverage.missingRoutes.map((m) => ({ id: `k-${m.url}`, name: m.name, status: false, missingFields: ["knowledgeEntry"], workspace: "—", module: "—", owner: "AI Engineering", deepLink: m.url, metadata: { path: m.url }, type: "Knowledge Entry" }))
    : [{ id: "k-complete", name: "All knowledge entries complete", status: true, missingFields: [], workspace: "—", module: "—", owner: "AI Engineering", deepLink: "/developer", metadata: {}, type: "Knowledge Entry" }];
}

function MANIFEST_ITEMS(r) {
  return [
    { id: "m-errors", name: "Manifest Errors", status: r.manifestValidation.errors === 0, missingFields: r.manifestValidation.errors > 0 ? [`${r.manifestValidation.errors} errors`] : [], workspace: "—", module: "—", owner: "Platform Engineering", deepLink: "/developer", metadata: { findings: r.manifestValidation.totalFindings, errors: r.manifestValidation.errors, warnings: r.manifestValidation.warnings }, type: "Manifest" },
    { id: "m-orphan-routes", name: "Orphan Routes", status: r.manifestValidation.orphanRoutes === 0, missingFields: r.manifestValidation.orphanRoutes > 0 ? [`${r.manifestValidation.orphanRoutes} orphaned`] : [], workspace: "—", module: "—", owner: "Platform Engineering", deepLink: "/developer", metadata: { count: r.manifestValidation.orphanRoutes }, type: "Manifest" },
    { id: "m-dupes", name: "Duplicate Routes", status: r.manifestValidation.duplicateRoutes === 0, missingFields: r.manifestValidation.duplicateRoutes > 0 ? [`${r.manifestValidation.duplicateRoutes} duplicates`] : [], workspace: "—", module: "—", owner: "Platform Engineering", deepLink: "/developer", metadata: { count: r.manifestValidation.duplicateRoutes }, type: "Manifest" },
  ];
}

export default function RegistryDrawer({ registryType, report, onClose, icon: Icon }) {
  const config = REGISTRY_CONFIG[registryType] || REGISTRY_CONFIG.routes;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => config.getItems(report), [config, report]);
  const filtered = useMemo(() => items.filter((i) => {
    const matchesSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.module || "").toLowerCase().includes(search.toLowerCase()) || (i.workspace || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "complete" && i.status) || (filter === "incomplete" && !i.status);
    return matchesSearch && matchesFilter;
  }), [items, search, filter]);

  return (
    <MetadataDrawer title={config.title} subtitle={config.subtitle} icon={Icon} onClose={onClose}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, module, workspace…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 focus:outline-none">
          <option value="all">All ({items.length})</option>
          <option value="complete">Complete ({items.filter((i) => i.status).length})</option>
          <option value="incomplete">Incomplete ({items.filter((i) => !i.status).length})</option>
        </select>
      </div>
      <div className="space-y-1">
        {filtered.length === 0 && <p className="text-center text-white/30 text-xs py-8">No items match your search.</p>}
        {filtered.slice(0, 200).map((item) => (
          <button key={item.id} onClick={() => setSelected(item)}
            className="w-full flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors group">
            {item.status ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" /> : <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 font-medium truncate">{item.name}</span>
                <span className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{item.type}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
                <span>{item.workspace !== "—" && `WS: ${item.workspace}`}</span>
                {item.module !== "—" && <span>· Mod: {item.module}</span>}
                {item.missingFields.length > 0 && <span className="text-amber-400">· {item.missingFields.length} missing</span>}
              </div>
            </div>
            <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </button>
        ))}
        {filtered.length > 200 && <p className="text-center text-white/30 text-[10px] py-2">Showing first 200 of {filtered.length}. Refine your search.</p>}
      </div>
      {selected && <RegistryItemDetail item={selected} onClose={() => setSelected(null)} />}
    </MetadataDrawer>
  );
}

function RegistryItemDetail({ item, onClose }) {
  const metadataEntries = Object.entries(item.metadata || {}).filter(([, v]) => v && (!Array.isArray(v) || v.length > 0));
  return (
    <MetadataDrawer title={item.name} subtitle={`${item.type} · ${item.status ? "Complete" : "Incomplete"}`} icon={Link2} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailStat label="Owner" value={item.owner} />
          <DetailStat label="Workspace" value={item.workspace || "—"} />
          <DetailStat label="Module" value={item.module || "—"} />
          <DetailStat label="Status" value={item.status ? "Complete" : "Incomplete"} color={item.status ? "emerald" : "amber"} />
        </div>
        {item.missingFields.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Missing Fields ({item.missingFields.length})</h4>
            <div className="space-y-1">
              {item.missingFields.map((f) => (
                <div key={f} className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1.5 text-xs">
                  <AlertCircle size={10} className="text-amber-400 flex-shrink-0" />
                  <span className="text-white/70">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {metadataEntries.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Metadata</h4>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5">
              {metadataEntries.map(([k, v]) => (
                <div key={k} className="flex items-start gap-2 text-xs">
                  <span className="text-white/40 w-32 flex-shrink-0">{k}</span>
                  <span className="text-white/70 break-all">{Array.isArray(v) ? v.join(", ") || "—" : String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {item.missingFields.length > 0 && <SelfHealingActions item={{ ...item, field: item.missingFields[0] }} />}
        {item.deepLink && item.deepLink.startsWith("/") && (
          <a href={item.deepLink} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
            <Link2 size={12} /> Open {item.type}
          </a>
        )}
      </div>
    </MetadataDrawer>
  );
}

function DetailStat({ label, value, color }) {
  const colorClass = color === "emerald" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className={`text-xs font-medium ${colorClass} mt-0.5 truncate`}>{value}</div>
    </div>
  );
}