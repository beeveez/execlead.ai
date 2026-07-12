import React from "react";
import {
  Server, Database, Cloud, Cpu, HardDrive, Zap, Clock, Globe,
  Lock, Radio, Layers, Activity,
} from "lucide-react";
import {
  HOSTING_INFRASTRUCTURE, PLATFORM_LIMITS, APP_FOOTPRINT,
  OVERALL_READINESS_SCORE,
} from "@/lib/scalabilityAssessmentEngine";

const INFRA_ITEMS = [
  { label: "Frontend", value: HOSTING_INFRASTRUCTURE.frontend, icon: Layers },
  { label: "CDN", value: HOSTING_INFRASTRUCTURE.cdn, icon: Cloud },
  { label: "Backend Runtime", value: HOSTING_INFRASTRUCTURE.backend, icon: Cpu },
  { label: "Database", value: HOSTING_INFRASTRUCTURE.database, icon: Database },
  { label: "Auth Service", value: HOSTING_INFRASTRUCTURE.auth, icon: Lock },
  { label: "File Storage", value: HOSTING_INFRASTRUCTURE.storage, icon: HardDrive },
  { label: "Scheduler", value: `${HOSTING_INFRASTRUCTURE.scheduler} (${HOSTING_INFRASTRUCTURE.awsRegion})`, icon: Clock },
  { label: "Realtime", value: HOSTING_INFRASTRUCTURE.realtime, icon: Radio },
  { label: "Regions", value: HOSTING_INFRASTRUCTURE.regions, icon: Globe },
  { label: "HTTPS", value: HOSTING_INFRASTRUCTURE.https, icon: Lock },
];

const FOOTPRINT_ITEMS = [
  { label: "Backend Functions", value: `${APP_FOOTPRINT.backendFunctions}/${APP_FOOTPRINT.backendFunctionLimit}`, icon: Server },
  { label: "Entities", value: APP_FOOTPRINT.entities, icon: Database },
  { label: "Automations", value: APP_FOOTPRINT.automations, icon: Clock },
  { label: "Routes", value: APP_FOOTPRINT.routes, icon: Globe },
  { label: "Pages", value: `${APP_FOOTPRINT.pages}/${APP_FOOTPRINT.pageLimit}`, icon: Layers },
];

const RING_COLOR = OVERALL_READINESS_SCORE >= 80 ? "#10b981" : OVERALL_READINESS_SCORE >= 70 ? "#f59e0b" : "#ef4444";

/**
 * Scalability Overview Hero
 * Infrastructure, app footprint, and overall readiness ring.
 */
export default function ScalabilityOverview() {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-white/5 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Readiness Ring */}
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="70" cy="70" r="60" fill="none" stroke={RING_COLOR} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 60 * (OVERALL_READINESS_SCORE / 100)} ${2 * Math.PI * 60}`}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{OVERALL_READINESS_SCORE}</span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">Readiness</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <Activity size={20} className="text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Platform Scalability & Capacity Assessment</h2>
            </div>
            <p className="text-sm text-white/50 max-w-2xl">
              Grounded in actual Base44 deployment limits, live app inventory, and documented platform constraints.
              No theoretical estimates — every figure cites its source.
            </p>
            <div className="flex items-center gap-3 mt-3 justify-center md:justify-start">
              <span className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">v1.0 · P0</span>
              <span className="text-[10px] text-white/30">Scheduler: {HOSTING_INFRASTRUCTURE.scheduler}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure + Footprint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Hosting Infrastructure</h3>
          <div className="space-y-1.5">
            {INFRA_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
                <item.icon size={12} className="text-white/30 flex-shrink-0" />
                <span className="text-[10px] text-white/30 uppercase tracking-wider w-28 flex-shrink-0">{item.label}</span>
                <span className="text-xs text-white/70 truncate">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Live App Footprint</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FOOTPRINT_ITEMS.map((item) => (
              <div key={item.label} className="px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon size={11} className="text-white/30" />
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">{item.label}</span>
                </div>
                <div className="text-sm font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>
          <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">Documented Limits</h4>
          <div className="space-y-1">
            <LimitRow label="Max items / request" value={`${PLATFORM_LIMITS.maxItemsPerRequest.toLocaleString()}`} />
            <LimitRow label="Max function duration" value={PLATFORM_LIMITS.maxFunctionDuration} />
            <LimitRow label="Min schedule interval" value={PLATFORM_LIMITS.minScheduleInterval} />
            <LimitRow label="Max image upload" value={PLATFORM_LIMITS.maxImageSize} />
            <LimitRow label="Max video upload" value={PLATFORM_LIMITS.maxVideoSize} />
            <LimitRow label="Rate limit model" value={PLATFORM_LIMITS.rateLimitModel} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded bg-white/[0.02]">
      <span className="text-[10px] text-white/40">{label}</span>
      <span className="text-[10px] text-white/70 font-medium">{value}</span>
    </div>
  );
}