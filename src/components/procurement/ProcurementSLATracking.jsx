import React, { useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { computeSLASummary, formatCurrency, getPriorityBadge, getSLABadgeClass, getStatusBadge } from "@/lib/procurementEngine";

export default function ProcurementSLATracking({ requests, onSelectRequest }) {
  const slaSummary = useMemo(() => computeSLASummary(requests), [requests]);
  const atRisk = useMemo(() => requests.filter((r) => r.sla_status === "at_risk" && ["draft", "pending_approval"].includes(r.status))
    .sort((a, b) => new Date(a.sla_deadline) - new Date(b.sla_deadline)), [requests]);
  const breached = useMemo(() => requests.filter((r) => r.sla_status === "breached" && ["draft", "pending_approval"].includes(r.status))
    .sort((a, b) => new Date(a.sla_deadline) - new Date(b.sla_deadline)), [requests]);

  const complianceRate = slaSummary.total > 0 ? Math.round(((slaSummary.total - slaSummary.breached) / slaSummary.total) * 100) : 100;

  return (
    <div className="space-y-4">
      {/* SLA Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SLACard icon={CheckCircle2} label="On Track" count={slaSummary.on_track} color="emerald" />
        <SLACard icon={AlertTriangle} label="At Risk" count={slaSummary.at_risk} color="amber" />
        <SLACard icon={XCircle} label="Breached" count={slaSummary.breached} color="red" />
        <SLACard icon={Clock} label="Compliance Rate" value={`${complianceRate}%`} color={complianceRate >= 90 ? "emerald" : complianceRate >= 70 ? "amber" : "red"} />
      </div>

      {/* At Risk Requests */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-amber-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">At Risk — Action Required</h3>
          <span className="text-xs text-white/30 ml-auto">{atRisk.length} request(s)</span>
        </div>
        {atRisk.length > 0 ? (
          <div className="space-y-2">
            {atRisk.map((r) => <SLARow key={r.id} request={r} onSelect={onSelectRequest} />)}
          </div>
        ) : <EmptyState text="No requests at risk — all SLAs are on track." />}
      </div>

      {/* Breached Requests */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <XCircle size={14} className="text-red-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Breached — Immediate Action Required</h3>
          <span className="text-xs text-white/30 ml-auto">{breached.length} request(s)</span>
        </div>
        {breached.length > 0 ? (
          <div className="space-y-2">
            {breached.map((r) => <SLARow key={r.id} request={r} onSelect={onSelectRequest} />)}
          </div>
        ) : <EmptyState text="No breached SLAs — excellent procurement governance." />}
      </div>
    </div>
  );
}

function SLACard({ icon: Icon, label, count, value, color }) {
  const colorMap = { emerald: "text-emerald-400 bg-emerald-500/10", amber: "text-amber-400 bg-amber-500/10", red: "text-red-400 bg-red-500/10" };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}><Icon size={14} /></div>
        <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white">{count !== undefined ? count : value}</span>
    </div>
  );
}

function SLARow({ request, onSelect }) {
  const priority = getPriorityBadge(request.priority);
  const status = getStatusBadge(request.status);
  return (
    <button onClick={() => onSelect(request)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors text-left">
      <span className="font-mono text-xs text-indigo-400 shrink-0">{request.request_number}</span>
      <span className="text-sm text-white/70 truncate flex-1">{request.title}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priority.badge} shrink-0`}>{priority.label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getSLABadgeClass(request.sla_status)} shrink-0 capitalize`}>{(request.sla_status || "").replace("_", " ")}</span>
      <span className="text-xs text-white/40 shrink-0">Due: {new Date(request.sla_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
      <ChevronRight size={12} className="text-white/20 shrink-0" />
    </button>
  );
}

function EmptyState({ text }) {
  return <div className="text-center py-6 text-white/30 text-sm">{text}</div>;
}