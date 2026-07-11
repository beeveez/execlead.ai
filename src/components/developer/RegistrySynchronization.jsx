import React, { useState, useMemo, useCallback } from "react";
import {
  synchronizeRegistries, getSyncHealth, getRegistryCoverage,
  getSyncRepairLog, clearSyncState, REGISTRIES,
} from "@/lib/registrySyncEngine";
import {
  RefreshCw, CheckCircle2, AlertTriangle, XCircle, Database,
  Activity, Zap, Clock, Boxes, Layers, FileText, TrendingUp,
} from "lucide-react";

export default function RegistrySynchronization() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastReport, setLastReport] = useState(null);

  const health = useMemo(() => getSyncHealth(), [refreshKey]);
  const registryCoverage = useMemo(() => getRegistryCoverage(), [refreshKey]);
  const repairLog = useMemo(() => getSyncRepairLog(), [refreshKey]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    // Small delay for UX feedback
    await new Promise((r) => setTimeout(r, 300));
    const report = synchronizeRegistries();
    setLastReport(report);
    setSyncing(false);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleReset = useCallback(() => {
    clearSyncState();
    setLastReport(null);
    setRefreshKey((k) => k + 1);
  }, []);

  const healthColor = health.overallHealth === 100 ? "text-emerald-400" : health.overallHealth >= 75 ? "text-amber-400" : "text-red-400";
  const healthBg = health.overallHealth === 100 ? "bg-emerald-500/5 border-emerald-500/10" : health.overallHealth >= 75 ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10";
  const ringColor = health.overallHealth >= 90 ? "#10b981" : health.overallHealth >= 75 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${healthBg}`}>
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <circle cx="32" cy="32" r="27" fill="none" stroke={ringColor} strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 27 * (health.overallHealth / 100)} ${2 * Math.PI * 27}`}
              strokeLinecap="round" transform="rotate(-90 32 32)"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{health.overallHealth}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Database size={16} className={healthColor} />
            <span className="text-white font-semibold text-sm">Registry Synchronization Engine™</span>
          </div>
          <div className={`text-xs mt-0.5 ${healthColor}`}>{health.healthLabel}</div>
          <div className="text-[10px] text-white/40 mt-0.5">
            {health.synchronizedModules}/{health.totalModules} modules synchronized · {health.passedChecks}/{health.totalChecks} checks passed
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Run Synchronization"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/60 text-xs font-medium hover:bg-white/[0.06] transition-colors"
          >
            <XCircle size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <KPICard icon={Activity} label="Sync %" value={`${health.syncPercentage}%`} color="text-emerald-400" />
        <KPICard icon={Clock} label="Last Sync" value={health.lastSync ? new Date(health.lastSync).toLocaleTimeString() : "—"} color="text-cyan-400" />
        <KPICard icon={XCircle} label="Broken Reg." value={health.brokenRegistrations} color="text-red-400" />
        <KPICard icon={Zap} label="Auto Repairs" value={health.autoRepairs} color="text-amber-400" />
        <KPICard icon={AlertTriangle} label="Manual Reviews" value={health.pendingManualReviews} color="text-orange-400" />
        <KPICard icon={Boxes} label="Modules Synced" value={`${health.synchronizedModules}/${health.totalModules}`} color="text-indigo-400" />
      </div>

      {/* Registry Coverage Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers size={14} className="text-indigo-400" />
          <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">Registry Coverage — 14 Registries</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {registryCoverage.map((reg) => {
            const cov = reg.coverage;
            const color = cov === 100 ? "text-emerald-400" : cov >= 75 ? "text-amber-400" : "text-red-400";
            const bg = cov === 100 ? "bg-emerald-500/5 border-emerald-500/10" : cov >= 75 ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10";
            return (
              <div key={reg.id} className={`p-3 rounded-lg border ${bg}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/60 font-medium truncate">{reg.name}</span>
                  {cov === 100 ? <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> : <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />}
                </div>
                <div className={`text-lg font-bold ${color}`}>{cov}%</div>
                <div className="text-[9px] text-white/30">{reg.passed}/{reg.total} entries</div>
                <div className="w-full h-1 rounded-full bg-white/5 mt-1.5">
                  <div className="h-full rounded-full transition-all" style={{ width: `${cov}%`, backgroundColor: cov === 100 ? "#10b981" : cov >= 75 ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Report */}
      {lastReport && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-cyan-400" />
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">Registry Synchronization Report™</h3>
            <span className="text-[10px] text-white/30">— {new Date(lastReport.lastSync).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <ReportStat label="Modules Synchronized" value={lastReport.summary.modulesSynchronized} />
            <ReportStat label="Routes Verified" value={lastReport.summary.routesVerified} />
            <ReportStat label="Capabilities Linked" value={lastReport.summary.capabilitiesLinked} />
            <ReportStat label="Knowledge Packs Linked" value={lastReport.summary.knowledgePacksLinked} />
            <ReportStat label="Frameworks Linked" value={lastReport.summary.frameworksLinked} />
            <ReportStat label="Personas Linked" value={lastReport.summary.personasLinked} />
            <ReportStat label="Manifest Entries Created" value={lastReport.summary.manifestEntriesCreated} highlight />
            <ReportStat label="Search Entries Rebuilt" value={lastReport.summary.searchEntriesRebuilt} highlight />
            <ReportStat label="EXEC™ Entries Created" value={lastReport.summary.execEntriesCreated} highlight />
            <ReportStat label="Broken References Fixed" value={lastReport.summary.brokenReferencesFixed} highlight />
            <ReportStat label="Remaining Issues" value={lastReport.summary.remainingIssues} danger={lastReport.summary.remainingIssues > 0} />
            <ReportStat label="Sync %" value={`${lastReport.summary.syncPercentage}%`} />
          </div>
        </div>
      )}

      {/* Repair Log */}
      {repairLog.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-amber-400" />
            <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">Auto-Repair Log</h3>
            <span className="text-[10px] text-white/30">— {repairLog.length} repair(s) applied</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
            {repairLog.slice(0, 20).map((repair, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
                <CheckCircle2 size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-white/70">{repair.action}</span>
                  <span className="text-[9px] text-white/30 ml-2">{repair.registry}</span>
                </div>
                <span className="text-[9px] text-white/30 flex-shrink-0">{new Date(repair.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
            {repairLog.length > 20 && (
              <div className="text-[10px] text-white/30 text-center py-2">+ {repairLog.length - 20} more repairs</div>
            )}
          </div>
        </div>
      )}

      {/* Repair Flow Integration */}
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-purple-400" />
          <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">Self-Healing Repair Flow Integration</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          {["Analyze", "Repair", "Registry Synchronization", "Manifest Validation", "Knowledge Sync", "Platform State Refresh", "Deployment Readiness Refresh"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className={`px-2.5 py-1.5 rounded-lg border ${
                step === "Registry Synchronization" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-white/[0.02] border-white/5 text-white/50"
              }`}>
                {i + 1}. {step}
              </span>
              {i < arr.length - 1 && <span className="text-white/20">→</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-3">
          The Platform Self-Healing Engine™ calls the Registry Synchronization Engine™ after every successful repair, ensuring all registries stay consistent.
        </p>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} className={color} />
        <span className="text-[9px] text-white/30 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function ReportStat({ label, value, highlight, danger }) {
  const color = danger ? "text-red-400" : highlight ? "text-emerald-400" : "text-white";
  return (
    <div className={`px-3 py-2 rounded-lg border ${danger ? "bg-red-500/5 border-red-500/10" : highlight ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.02] border-white/5"}`}>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}