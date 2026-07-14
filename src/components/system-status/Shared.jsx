import React from "react";
import { STATUS_META, INCIDENT_STATUS_META, SEVERITY_META, IMPACT_META } from "@/lib/systemStatusEngine";

export function Spinner({ label }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
        {label && <span className="text-white/40 text-sm">{label}</span>}
      </div>
    </div>
  );
}

export function StatusDot({ status, size = "sm" }) {
  const meta = STATUS_META[status] || STATUS_META.operational;
  const dotSize = size === "lg" ? "w-3 h-3" : "w-2 h-2";
  return (
    <span className={`inline-block ${dotSize} rounded-full ${meta.dot} ${status !== "operational" ? "animate-pulse" : ""}`} />
  );
}

export function StatusBadge({ status, size = "sm" }) {
  const meta = STATUS_META[status] || STATUS_META.operational;
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${meta.bg} ${meta.border} ${meta.text} ${padding} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function IncidentBadge({ status }) {
  const meta = INCIDENT_STATUS_META[status] || INCIDENT_STATUS_META.investigating;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta.bg} ${meta.border} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.minor;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

export function ImpactBadge({ level }) {
  const meta = IMPACT_META[level] || IMPACT_META.degraded;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: meta.color }}>
      {meta.label}
    </span>
  );
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const minutes = Math.floor(ms / (1000 * 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function formatResponseTime(ms) {
  if (!ms || ms <= 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}