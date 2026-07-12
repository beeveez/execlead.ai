import React from "react";
import { Users, Calendar, Brain, Database, Gauge, Info } from "lucide-react";
import { CAPACITY_ESTIMATES } from "@/lib/scalabilityAssessmentEngine";

const SECTIONS = [
  {
    id: "concurrent",
    icon: Users,
    accent: "#10b981",
    title: "Maximum Concurrent Users",
    value: CAPACITY_ESTIMATES.maxConcurrentUsers.value.toLocaleString(),
    range: CAPACITY_ESTIMATES.maxConcurrentUsers.range,
    justification: CAPACITY_ESTIMATES.maxConcurrentUsers.justification,
    source: CAPACITY_ESTIMATES.maxConcurrentUsers.source,
  },
  {
    id: "dau",
    icon: Calendar,
    accent: "#06b6d4",
    title: "Daily Active Users",
    value: CAPACITY_ESTIMATES.dailyActiveUsers.value.toLocaleString(),
    range: CAPACITY_ESTIMATES.dailyActiveUsers.range,
    justification: CAPACITY_ESTIMATES.dailyActiveUsers.justification,
    source: CAPACITY_ESTIMATES.dailyActiveUsers.source,
  },
  {
    id: "mau",
    icon: Calendar,
    accent: "#6366f1",
    title: "Monthly Active Users",
    value: CAPACITY_ESTIMATES.monthlyActiveUsers.value.toLocaleString(),
    range: CAPACITY_ESTIMATES.monthlyActiveUsers.range,
    justification: CAPACITY_ESTIMATES.monthlyActiveUsers.justification,
    source: CAPACITY_ESTIMATES.monthlyActiveUsers.source,
  },
];

/**
 * Capacity Report — the 6 capacity estimates.
 * Concurrent, DAU, MAU, AI, Database, Performance.
 */
export default function CapacityReport() {
  return (
    <div className="space-y-4">
      {/* Top 3 headline metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECTIONS.map((s) => (
          <CapacityCard key={s.id} {...s} />
        ))}
      </div>

      {/* AI Capacity */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-violet-400" />
          <h3 className="text-sm font-bold text-white">AI Capacity</h3>
          <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 ml-auto">PRIMARY BOTTLENECK</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <MetricCell label="Simultaneous Conversations" value={CAPACITY_ESTIMATES.aiCapacity.simultaneousConversations} />
          <MetricCell label="Requests / Minute" value={CAPACITY_ESTIMATES.aiCapacity.requestsPerMinute} />
          <MetricCell label="Requests / Day (Builder)" value={CAPACITY_ESTIMATES.aiCapacity.requestsPerDayBuilder} />
          <MetricCell label="Requests / Day (Pro)" value={CAPACITY_ESTIMATES.aiCapacity.requestsPerDayPro} />
        </div>
        <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/15 mb-2">
          <p className="text-[11px] text-white/60 leading-relaxed">{CAPACITY_ESTIMATES.aiCapacity.bottleneck}</p>
        </div>
        <SourceTag source={CAPACITY_ESTIMATES.aiCapacity.source} />
      </div>

      {/* Database Capacity */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Database Capacity</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          <MetricCell label="Max Users" value={CAPACITY_ESTIMATES.databaseCapacity.maxUsers} />
          <MetricCell label="Max Organizations" value={CAPACITY_ESTIMATES.databaseCapacity.maxOrganizations} />
          <MetricCell label="Max Resumes" value={CAPACITY_ESTIMATES.databaseCapacity.maxResumes} />
          <MetricCell label="Max Uploaded Documents" value={CAPACITY_ESTIMATES.databaseCapacity.maxUploadedDocuments} />
          <MetricCell label="Max Leadership Records" value={CAPACITY_ESTIMATES.databaseCapacity.maxLeadershipRecords} />
          <MetricCell label="Max Company Intelligence" value={CAPACITY_ESTIMATES.databaseCapacity.maxCompanyIntelligenceRecords} />
        </div>
        <div className="px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/15 mb-2">
          <p className="text-[11px] text-white/60 leading-relaxed">{CAPACITY_ESTIMATES.databaseCapacity.bottleneck}</p>
        </div>
        <SourceTag source={CAPACITY_ESTIMATES.databaseCapacity.source} />
      </div>

      {/* Performance */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <MetricCell label="Average Response Time" value={CAPACITY_ESTIMATES.performance.averageResponseTime} />
          <MetricCell label="95th Percentile" value={CAPACITY_ESTIMATES.performance.p95} />
          <MetricCell label="99th Percentile" value={CAPACITY_ESTIMATES.performance.p99} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Largest Slow Endpoints</h4>
            <div className="space-y-1">
              {CAPACITY_ESTIMATES.performance.largestSlowEndpoints.map((ep, i) => (
                <div key={i} className="text-[11px] text-white/60 flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{ep}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Most Expensive Queries</h4>
            <div className="space-y-1">
              {CAPACITY_ESTIMATES.performance.mostExpensiveQueries.map((q, i) => (
                <div key={i} className="text-[11px] text-white/60 flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <SourceTag source={CAPACITY_ESTIMATES.performance.source} />
        </div>
      </div>
    </div>
  );
}

function CapacityCard({ icon: Icon, accent, title, value, range, justification, source }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-[10px] text-white/30 mb-2">{range}</div>
      <p className="text-[11px] text-white/50 leading-relaxed mb-2">{justification}</p>
      <SourceTag source={source} />
    </div>
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-xs text-white/70 font-medium">{value}</div>
    </div>
  );
}

function SourceTag({ source }) {
  return (
    <div className="flex items-start gap-1.5 text-[9px] text-white/30 italic">
      <Info size={9} className="mt-0.5 flex-shrink-0" />
      <span>Source: {source}</span>
    </div>
  );
}