import React from "react";
import { Activity, Server, ShieldCheck, Cpu, Rocket, AlertTriangle, Clock, TrendingUp } from "lucide-react";

function MetricCard({ icon: Icon, label, value, sublabel, color = "#06b6d4" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
      {sublabel && <div className="text-[10px] text-white/30 mt-0.5">{sublabel}</div>}
    </div>
  );
}

const STATUS_COLORS = {
  healthy: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export default function LivePlatformStatus({ platformState, certificate, guardian }) {
  const statusColor = STATUS_COLORS[platformState.status] || "#64748b";
  const health = platformState.health || {};
  const guardianPending = guardian?.pending?.length || 0;
  const lastDeployment = platformState.lastDeployment;
  const lastBroadcast = platformState.lastBroadcast;

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
          <div>
            <span className="text-sm font-bold text-white capitalize">{platformState.status || "Not Yet Measured"}</span>
            <span className="text-[11px] text-white/40 ml-2">{platformState.environment || "—"} Environment</span>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Current Uptime</div>
            <div className="text-sm font-bold text-white">Not Yet Measured</div>
          </div>
        </div>
        <div className="text-[10px] text-white/30">
          Uptime telemetry requires continuous monitoring infrastructure. Until deployed, we display "Not Yet Measured" rather than inventing percentages.
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Activity} label="Runtime Health" value={`${health.overall ?? 0}/100`} sublabel={platformState.safeMode ? "Safe Mode" : "Nominal"} color={health.overall >= 80 ? "#10b981" : health.overall >= 50 ? "#f59e0b" : "#ef4444"} />
        <MetricCard icon={ShieldCheck} label="Guardian™" value={guardianPending > 0 ? `${guardianPending} Pending` : "Clear"} sublabel={platformState.lastGuardianScan ? "Recently scanned" : "Not Yet Scanned"} color={guardianPending > 0 ? "#f59e0b" : "#10b981"} />
        <MetricCard icon={Cpu} label="Platform State Mgr™" value={`v${platformState.stateVersion || 0}`} sublabel={platformState.safeMode ? "Recovering" : "Active"} color="#06b6d4" />
        <MetricCard icon={Rocket} label="Deployment Status" value={lastDeployment ? "Deployed" : "Not Yet Measured"} sublabel={lastDeployment ? new Date(lastDeployment).toLocaleDateString() : "—"} color="#6366f1" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Clock} label="Last Deployment" value={lastDeployment ? new Date(lastDeployment).toLocaleString() : "Not Yet Measured"} color="#6366f1" />
        <MetricCard icon={AlertTriangle} label="Last Incident" value="Not Yet Measured" sublabel="Incident tracking pending" color="#64748b" />
        <MetricCard icon={TrendingUp} label="Findings" value={`${platformState.totalFindings ?? 0}`} sublabel={`${platformState.errorCount ?? 0} errors · ${platformState.warningCount ?? 0} warnings`} color={platformState.errorCount > 0 ? "#ef4444" : "#10b981"} />
        <MetricCard icon={Server} label="Last Broadcast" value={lastBroadcast ? new Date(lastBroadcast).toLocaleTimeString() : "—"} sublabel={`${platformState.subscribersUpdated || 0} subscribers`} color="#06b6d4" />
      </div>

      {certificate && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Governance Certificate™ — Latest Run</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Manifest Health", value: certificate.manifestHealth },
              { label: "Registry Health", value: certificate.registryHealth },
              { label: "Knowledge Health", value: certificate.knowledgeHealth },
              { label: "Deployment Readiness", value: certificate.deploymentReadiness },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-xl font-bold" style={{ color: m.value >= 90 ? "#10b981" : m.value >= 70 ? "#f59e0b" : "#ef4444" }}>{m.value}</div>
                <div className="text-[9px] text-white/30 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}