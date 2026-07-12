import React from "react";
import { Boxes, Route, Layers, BookOpen, Users, Fingerprint, FileStack, AlertOctagon, AlertTriangle, Heart } from "lucide-react";

function Metric({ label, value, icon: Icon, accent }) {
  const colors = { green: "text-emerald-400", amber: "text-amber-400", red: "text-red-400", blue: "text-cyan-400", violet: "text-violet-400", indigo: "text-indigo-400" };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className={colors[accent] || "text-white/40"} />
        <div className="text-[10px] text-white/30 uppercase tracking-wider truncate">{label}</div>
      </div>
      <div className={`text-xl font-bold ${colors[accent] || "text-white"}`}>{value}</div>
    </div>
  );
}

export default function SyncMetricsGrid({ metrics }) {
  if (!metrics) return null;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Synchronization Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <Metric label="Knowledge Packs Loaded" value={metrics.knowledgePacksLoaded} icon={BookOpen} accent="violet" />
        <Metric label="Capabilities Registered" value={metrics.capabilitiesRegistered} icon={Boxes} accent="indigo" />
        <Metric label="Modules Registered" value={metrics.modulesRegistered} icon={Layers} accent="blue" />
        <Metric label="Frameworks Registered" value={metrics.frameworksRegistered} icon={FileStack} accent="violet" />
        <Metric label="Pages Registered" value={metrics.pagesRegistered} icon={Route} accent="indigo" />
        <Metric label="Routes Registered" value={metrics.routesRegistered} icon={Route} accent="blue" />
        <Metric label="Personas Registered" value={metrics.personasRegistered} icon={Users} accent="violet" />
        <Metric label="Evidence Sources" value={metrics.evidenceSources} icon={Fingerprint} accent="indigo" />
        <Metric label="Broken Registrations" value={metrics.brokenRegistrations} icon={AlertOctagon} accent={metrics.brokenRegistrations > 0 ? "red" : "green"} />
        <Metric label="Sync Errors" value={metrics.syncErrors} icon={AlertOctagon} accent={metrics.syncErrors > 0 ? "red" : "green"} />
        <Metric label="Sync Warnings" value={metrics.syncWarnings} icon={AlertTriangle} accent={metrics.syncWarnings > 0 ? "amber" : "green"} />
        <Metric label="Overall Knowledge Health" value={`${metrics.overallKnowledgeHealth}%`} icon={Heart} accent={metrics.overallKnowledgeHealth >= 90 ? "green" : metrics.overallKnowledgeHealth >= 70 ? "amber" : "red"} />
      </div>
    </div>
  );
}