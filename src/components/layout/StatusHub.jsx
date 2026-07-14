import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useUniversalRouter } from "@/lib/universalRouter";
import { getActiveIncidents, getUpcomingMaintenance, STATUS_META } from "@/lib/systemStatusEngine";
import {
  Activity, RefreshCw, ArrowRight, Clock, Wrench,
  Brain, Zap, CreditCard, Loader2, ShieldCheck,
} from "lucide-react";

function StatusDot({ status }) {
  const meta = STATUS_META[status] || STATUS_META.operational;
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${meta.dot} ${status === "operational" ? "" : "animate-pulse"}`} />
      <span className={`text-xs ${meta.text}`}>{meta.label}</span>
    </span>
  );
}

function StatusRow({ icon: Icon, label, status }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-white/40" />
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <StatusDot status={status} />
    </div>
  );
}

export default function StatusHub() {
  const [open, setOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { availableWorkspaces, navigateTo } = useUniversalRouter();
  const hasOpsAccess = availableWorkspaces.includes("operations");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [inc, maint] = await Promise.all([
        base44.entities.SystemIncident.filter({ is_active: true }),
        base44.entities.ScheduledMaintenance.list("-created_date", 10),
      ]);
      setIncidents(inc || []);
      setMaintenance(maint || []);
      setLastUpdated(new Date());
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) loadStatus();
  }, [open, loadStatus]);

  const activeIncidents = getActiveIncidents(incidents);
  const upcomingMaintenance = getUpcomingMaintenance(maintenance);

  // Overall platform status
  let platformStatus = "operational";
  if (activeIncidents.some((i) => i.impact_level === "full_outage")) platformStatus = "major_outage";
  else if (activeIncidents.some((i) => i.impact_level === "partial_outage")) platformStatus = "partial_outage";
  else if (activeIncidents.some((i) => i.impact_level === "degraded")) platformStatus = "degraded";
  else if (upcomingMaintenance.some((m) => m.status === "in_progress")) platformStatus = "maintenance";

  const getComponentStatus = (componentId) => {
    const componentIncidents = activeIncidents.filter((inc) => {
      try {
        const affected = JSON.parse(inc.affected_components || "[]");
        return Array.isArray(affected) && affected.includes(componentId);
      } catch {
        return false;
      }
    });
    if (componentIncidents.length === 0) return "operational";
    if (componentIncidents.some((i) => i.impact_level === "full_outage")) return "major_outage";
    if (componentIncidents.some((i) => i.impact_level === "partial_outage")) return "partial_outage";
    return "degraded";
  };

  const execStatus = getComponentStatus("executive_ai");
  const apiStatus = getComponentStatus("api_services");
  const billingStatus = "operational";

  const handleOpenOperations = () => {
    navigateTo("/system-status");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60 hover:text-white/80 cursor-pointer"
        title="Platform Status"
        aria-label="Platform Status"
        aria-expanded={open}
      >
        <Activity size={14} className="text-emerald-400" /> Status
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-sm font-medium text-white">Platform Status</span>
              </div>
              <button onClick={loadStatus} className="text-white/30 hover:text-white/60 cursor-pointer" title="Refresh">
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="px-4 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-white/20">Global Platform Service</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              </div>
            ) : (
              <>
                {/* Status rows */}
                <div className="px-4 py-3 space-y-0">
                  <StatusRow icon={ShieldCheck} label="Platform Health" status={platformStatus} />
                  <StatusRow icon={Brain} label="EXEC™ Status" status={execStatus} />
                  <StatusRow icon={Zap} label="API Health" status={apiStatus} />
                  <StatusRow icon={CreditCard} label="Billing Status" status={billingStatus} />
                </div>

                {/* Active Incidents */}
                {activeIncidents.length > 0 && (
                  <div className="px-4 py-3 border-t border-white/5">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Active Incidents</div>
                    <div className="space-y-2">
                      {activeIncidents.slice(0, 3).map((inc) => (
                        <div key={inc.id} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              inc.severity === "critical" ? "bg-red-500" :
                              inc.severity === "major" ? "bg-orange-500" : "bg-amber-500"
                            }`} />
                            <span className="text-white/70 font-medium truncate">{inc.title}</span>
                          </div>
                          <div className="text-white/30 ml-3.5 capitalize">{inc.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled Maintenance */}
                {upcomingMaintenance.length > 0 && (
                  <div className="px-4 py-3 border-t border-white/5">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Scheduled Maintenance</div>
                    <div className="space-y-2">
                      {upcomingMaintenance.slice(0, 3).map((m) => (
                        <div key={m.id} className="flex items-start gap-2 text-xs">
                          <Wrench size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-white/70 font-medium truncate">{m.title}</div>
                            {m.start_time && (
                              <div className="text-white/30">{new Date(m.start_time).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                {lastUpdated && (
                  <div className="px-4 py-2 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[10px] text-white/20">
                      <Clock size={10} />
                      Last updated {lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Open Operations Workspace — only for users with Operations access */}
            {hasOpsAccess && (
              <button
                onClick={handleOpenOperations}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-white/5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Open Operations Workspace <ArrowRight size={12} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}