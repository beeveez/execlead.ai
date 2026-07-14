import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Wrench, Clock, Activity } from "lucide-react";
import { PLATFORM_STATUS_META } from "@/lib/systemStatusEngine";
import { formatRelativeTime } from "./Shared";

const STATUS_ICONS = {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
};

export default function StatusOverview({ overallStatus, lastUpdated, activeIncidentCount, components }) {
  const meta = PLATFORM_STATUS_META[overallStatus] || PLATFORM_STATUS_META.operational;
  const Icon = STATUS_ICONS[meta.icon] || CheckCircle2;

  const operationalCount = components.filter((c) => c.status === "operational").length;
  const totalCount = components.length;

  return (
    <div className={`rounded-2xl border p-6 ${
      overallStatus === "operational" ? "bg-emerald-500/5 border-emerald-500/20" :
      overallStatus === "maintenance" ? "bg-indigo-500/5 border-indigo-500/20" :
      "bg-red-500/5 border-red-500/20"
    }`}>
      <div className="flex items-center gap-4 flex-wrap">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          overallStatus === "operational" ? "bg-emerald-500/10" :
          overallStatus === "maintenance" ? "bg-indigo-500/10" :
          "bg-red-500/10"
        }`}>
          <Icon size={28} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl font-bold text-white">{meta.label}</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {operationalCount}/{totalCount} components operational
            {activeIncidentCount > 0 && ` · ${activeIncidentCount} active incident${activeIncidentCount !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <Metric label="Overall Status" value={meta.label} color={meta.color} />
        <Metric label="Last Updated" value={formatRelativeTime(lastUpdated)} icon={Clock} />
        <Metric label="Active Incidents" value={activeIncidentCount} icon={Activity} />
        <Metric label="Components Up" value={`${operationalCount}/${totalCount}`} icon={CheckCircle2} />
      </div>
    </div>
  );
}

function Metric({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      {Icon && <Icon size={14} className="text-white/30 mb-1.5" />}
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold mt-0.5" style={color ? { color } : { color: "white" }}>{value}</div>
    </div>
  );
}