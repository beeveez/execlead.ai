import React, { useState, useEffect, useCallback } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { usePlatformState } from "@/lib/PlatformStateContext";
import {
  SYSTEM_COMPONENTS,
  computeComponentStatus,
  computeOverallStatus,
  getActiveIncidents,
  getUpcomingMaintenance,
} from "@/lib/systemStatusEngine";
import { Spinner } from "@/components/system-status/Shared";
import StatusOverview from "@/components/system-status/StatusOverview";
import ComponentGrid from "@/components/system-status/ComponentGrid";
import IncidentCenter from "@/components/system-status/IncidentCenter";
import MaintenanceSchedule from "@/components/system-status/MaintenanceSchedule";
import AvailabilityHistory from "@/components/system-status/AvailabilityHistory";

// Icon mapping for components (kept here so the engine stays UI-free)
const COMPONENT_ICONS = {
  authentication: "Lock",
  executive_ai: "Brain",
  learning_platform: "GraduationCap",
  executive_journey: "Map",
  reports: "FileText",
  ai_memory: "Database",
  executive_coach: "MessageSquare",
  enterprise_services: "Building2",
  api_services: "Server",
};

export default function SystemStatusCenter() {
  const { user } = useAuth();
  const platformState = usePlatformState();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [telemetryEvents, setTelemetryEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [incData, maintData, telData] = await Promise.allSettled([
        base44.entities.SystemIncident.list("-created_date", 100),
        base44.entities.ScheduledMaintenance.list("-created_date", 50),
        base44.entities.TelemetryEvent.list("-created_date", 500),
      ]);
      const resolve = (r) => (r.status === "fulfilled" ? r.value : []);
      setIncidents(resolve(incData));
      setMaintenance(resolve(maintData));
      setTelemetryEvents(resolve(telData));
      setLastUpdated(new Date().toISOString());
    } catch {
      // Initialize with empty data if entities aren't available yet
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Merge telemetry from platform state context with entity telemetry
  const allTelemetry = [
    ...telemetryEvents,
    ...(platformState?.findings || []).map((f) => ({
      event_type: f.code || f.type || "platform_finding",
      event_category: f.severity === "error" ? "error" : "warning",
      status: f.severity === "error" ? "error" : "warning",
      module: f.context?.moduleId || f.context?.route || "",
      created_date: f.timestamp || new Date().toISOString(),
      duration_ms: 0,
    })),
  ];

  // Compute component statuses
  const componentStatuses = SYSTEM_COMPONENTS.map((comp) =>
    computeComponentStatus({ ...comp, icon: COMPONENT_ICONS[comp.id] }, allTelemetry, incidents, maintenance)
  );

  // Compute overall platform status
  const overallStatus = computeOverallStatus(componentStatuses, incidents, maintenance);

  // Filter active incidents and upcoming maintenance
  const activeIncidents = getActiveIncidents(incidents);
  const upcomingMaintenance = getUpcomingMaintenance(maintenance);

  if (loading && !lastUpdated) {
    return (
      <div className="max-w-7xl mx-auto">
        <Spinner label="Loading system status..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Activity size={12} className="text-indigo-400" /> Operations
          </div>
          <h1 className="text-2xl font-bold text-white">System Status Center™</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Real-time platform availability, component health, incidents, and maintenance — transparently reported.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Section 1: Platform Status Overview */}
      <StatusOverview
        overallStatus={overallStatus}
        lastUpdated={lastUpdated}
        activeIncidentCount={activeIncidents.length}
        components={componentStatuses}
      />

      {/* Section 2: Component Status */}
      <ComponentGrid components={componentStatuses} />

      {/* Section 3: Incident Center */}
      <IncidentCenter
        incidents={activeIncidents}
        loading={false}
        user={user}
        onAction={fetchData}
      />

      {/* Section 4: Scheduled Maintenance */}
      <MaintenanceSchedule
        maintenance={upcomingMaintenance}
        loading={false}
        user={user}
        onAction={fetchData}
      />

      {/* Section 5: Historical Availability */}
      <AvailabilityHistory incidents={incidents} />

      {/* Footer */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
        <p className="text-white/30 text-xs">
          System Status Center™ — automatic status updates from platform telemetry, with operator-declared incidents and maintenance.
          Component health is computed from real telemetry events.
        </p>
      </div>
    </div>
  );
}