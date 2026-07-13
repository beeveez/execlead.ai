import React, { useMemo, useState } from "react";
import { computePlatformTelemetry } from "@/lib/platformTelemetryService";
import TelemetryMetricCard from "@/components/trust/TelemetryMetricCard";
import TelemetryDiagnosticsDrawer from "@/components/trust/TelemetryDiagnosticsDrawer";

export default function LivePlatformStatus({ platformState, certificate, guardian }) {
  const [activeMetric, setActiveMetric] = useState(null);

  const metrics = useMemo(
    () => computePlatformTelemetry({ platformState, certificate, guardian }),
    [platformState, certificate, guardian]
  );

  return (
    <div className="space-y-4">
      {/* Telemetry Service Banner */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white">Platform Telemetry Service™</div>
          <p className="text-[11px] text-white/40 leading-relaxed mt-0.5">
            Authoritative telemetry source — every dashboard reads from this service, ensuring consistent values across the platform.
            Click any metric card to view full diagnostics, dependencies, and repair actions.
          </p>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <TelemetryMetricCard
            key={metric.id}
            metric={metric}
            onClick={setActiveMetric}
          />
        ))}
      </div>

      {/* Telemetry State Legend */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Telemetry States</div>
        <div className="flex flex-wrap gap-3">
          {Object.entries({
            live: "Live",
            calculated: "Calculated",
            historical: "Historical",
            waiting: "Waiting for Telemetry",
            disabled: "Monitoring Disabled",
            no_records: "No Records Available",
            not_applicable: "Not Applicable",
          }).map(([key, label]) => {
            const colors = {
              live: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              calculated: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
              historical: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
              waiting: "bg-amber-500/10 border-amber-500/20 text-amber-400",
              disabled: "bg-slate-500/10 border-slate-500/20 text-slate-400",
              no_records: "bg-slate-500/10 border-slate-500/20 text-slate-400",
              not_applicable: "bg-slate-500/10 border-slate-500/20 text-slate-400",
            };
            return (
              <div key={key} className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border ${colors[key]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  key === "live" ? "bg-emerald-400 animate-pulse" :
                  key === "calculated" ? "bg-cyan-400" :
                  key === "historical" ? "bg-indigo-400" :
                  key === "waiting" ? "bg-amber-400" :
                  "bg-slate-400"
                }`} />
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostics Drawer */}
      {activeMetric && (
        <TelemetryDiagnosticsDrawer
          metric={activeMetric}
          onClose={() => setActiveMetric(null)}
        />
      )}
    </div>
  );
}