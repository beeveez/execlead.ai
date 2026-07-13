import React, { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Link2 } from "lucide-react";
import MetadataDrawer from "./MetadataDrawer";
import SelfHealingActions from "./SelfHealingActions";
import { buildOrphanRegistry } from "@/lib/metadataCompletionEngine";

const CATEGORIES = [
  { key: "orphanRoutes", label: "Orphan Routes", color: "text-red-400", desc: "Routes with no registered module" },
  { key: "orphanCapabilities", label: "Orphan Capabilities", color: "text-amber-400", desc: "Capabilities with no Knowledge Pack" },
  { key: "unregisteredPersonas", label: "Unregistered Personas", color: "text-orange-400", desc: "Personas with no Knowledge Packs" },
  { key: "duplicateRoutes", label: "Duplicate Routes", color: "text-yellow-400", desc: "Routes registered more than once" },
];

export default function OrphanRegistryDrawer({ report, onClose }) {
  const orphans = useMemo(() => buildOrphanRegistry(report), [report]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedOrphanId, setSelectedOrphanId] = useState(null);

  const selectedOrphan = selectedOrphanId ? orphans.all.find((o) => o.id === selectedOrphanId) : null;
  const categoryItems = activeCategory ? orphans[activeCategory] : orphans.all;

  return (
    <MetadataDrawer title="Orphan Registry™" subtitle={`${orphans.all.length} orphan records across ${CATEGORIES.length} categories`} icon={AlertTriangle} onClose={onClose} maxWidth="max-w-3xl">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {CATEGORIES.map((cat) => (
          <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setSelectedOrphanId(null); }}
            className={`bg-white/[0.02] border rounded-lg p-3 text-left transition-colors group ${activeCategory === cat.key ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 hover:bg-white/[0.04]"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{cat.label}</span>
              <span className={`text-xl font-bold ${cat.color}`}>{orphans[cat.key].length}</span>
            </div>
            <p className="text-[10px] text-white/30">{cat.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        {activeCategory && (
          <button onClick={() => { setActiveCategory(null); setSelectedOrphanId(null); }}
            className="text-[10px] text-white/40 hover:text-white/70 flex items-center gap-1">
            <ChevronRight size={10} className="rotate-180" /> Back to all
          </button>
        )}
        <h4 className="text-xs font-medium text-white/80">
          {activeCategory ? CATEGORIES.find((c) => c.key === activeCategory)?.label : "All Orphan Records"}
        </h4>
        <span className="text-[10px] text-white/30 ml-auto">{categoryItems.length} records</span>
      </div>

      <div className="space-y-1">
        {categoryItems.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle size={20} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-white/40">No orphan records in this category. ✓</p>
          </div>
        )}
        {categoryItems.map((o) => (
          <button key={o.id} onClick={() => setSelectedOrphanId(o.id)}
            className="w-full flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors group">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 font-medium truncate">{o.name}</span>
                <span className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{o.type}</span>
              </div>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">{o.detail}</p>
            </div>
            <span className="text-[9px] text-white/40 flex-shrink-0">{o.estimatedFix}</span>
            <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>

      {selectedOrphan && (
        <OrphanDetail orphan={selectedOrphan} onClose={() => setSelectedOrphanId(null)} />
      )}
    </MetadataDrawer>
  );
}

function OrphanDetail({ orphan, onClose }) {
  return (
    <MetadataDrawer title={orphan.name} subtitle={`${orphan.category} · ${orphan.type}`} icon={AlertTriangle} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
          <p className="text-xs text-white/70">{orphan.detail}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DetailStat label="Owner" value={orphan.owner} />
          <DetailStat label="Priority" value={orphan.priority} />
          <DetailStat label="Est. Fix" value={orphan.estimatedFix} />
          <DetailStat label="Auto Repair" value={orphan.autoRepair ? "Available" : "Manual"} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MissingFlag label="Missing Module" missing={orphan.missingModule} />
          <MissingFlag label="Missing Knowledge Pack" missing={orphan.missingKnowledgePack} />
          <MissingFlag label="Missing Framework" missing={orphan.missingFramework} />
          <MissingFlag label="Missing Route" missing={orphan.missingRoute} />
        </div>
        <SelfHealingActions item={orphan} />
        {orphan.deepLink && orphan.deepLink.startsWith("/") && (
          <a href={orphan.deepLink} className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
            <Link2 size={12} /> Open
          </a>
        )}
      </div>
    </MetadataDrawer>
  );
}

function DetailStat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 mt-0.5 truncate">{value}</div>
    </div>
  );
}

function MissingFlag({ label, missing }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${missing ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
      <span className={`text-xs ${missing ? "text-red-400" : "text-emerald-400"}`}>{label}: {missing ? "Yes" : "No"}</span>
    </div>
  );
}