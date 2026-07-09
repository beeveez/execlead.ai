import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight, Check, Loader2, AlertCircle, Wrench } from "lucide-react";

const STATUS_CONFIG = {
  pending: { icon: Loader2, spin: true, label: "Pending", color: "text-white/40" },
  running: { icon: Loader2, spin: true, label: "Running", color: "text-blue-400" },
  in_progress: { icon: Loader2, spin: true, label: "In progress", color: "text-blue-400" },
  completed: { icon: Check, spin: false, label: "Completed", color: "text-emerald-400" },
  success: { icon: Check, spin: false, label: "Done", color: "text-emerald-400" },
  failed: { icon: AlertCircle, spin: false, label: "Failed", color: "text-red-400" },
  error: { icon: AlertCircle, spin: false, label: "Error", color: "text-red-400" },
};

function formatName(name) {
  return (name || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function prettyPrint(value) {
  if (value == null) return "";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status || "pending";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isFailed = status === "failed" || status === "error";

  let parsedResults = toolCall.results;
  if (typeof parsedResults === "string") {
    try { parsedResults = JSON.parse(parsedResults); } catch { /* keep raw */ }
  }
  const failedResult = typeof parsedResults === "string"
    ? /error|failed/i.test(parsedResults)
    : parsedResults && parsedResults.success === false;
  const effectiveFailed = isFailed || !!failedResult;

  const proj = toolCall.display_projection || {};
  const hideDetails = proj.hide_details && proj.details_redacted;
  const label = effectiveFailed
    ? (proj.error_label || "Failed")
    : status === "completed" || status === "success"
      ? (proj.label || "Done")
      : (proj.active_label || config.label);
  const Icon = effectiveFailed ? AlertCircle : config.icon;

  return (
    <div className="mt-2 text-xs border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
      >
        {expanded ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
        <Wrench size={12} className="text-white/30" />
        <span className="font-medium text-white/60">{formatName(toolCall.name)}</span>
        <Icon size={12} className={`${effectiveFailed ? "text-red-400" : config.color} ${config.spin ? "animate-spin" : ""} ml-auto`} />
        <span className={effectiveFailed ? "text-red-400" : config.color}>{label}</span>
      </button>
      {expanded && !hideDetails && (
        <div className="px-3 py-2 border-t border-white/5 space-y-2 bg-white/[0.02]">
          {toolCall.arguments_string && (
            <div>
              <div className="text-white/30 mb-1">Parameters:</div>
              <pre className="text-white/50 whitespace-pre-wrap break-words text-[11px] font-mono">{prettyPrint(toolCall.arguments_string)}</pre>
            </div>
          )}
          {parsedResults != null && (
            <div>
              <div className="text-white/30 mb-1">Result:</div>
              <pre className="text-white/50 whitespace-pre-wrap break-words text-[11px] font-mono">{prettyPrint(parsedResults)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}