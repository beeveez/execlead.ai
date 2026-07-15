import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Play, RefreshCw, Brain, Wrench, Calculator, Database, Download, Copy,
  TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, AlertTriangle,
  ExternalLink, Clock, Lightbulb, Activity, ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DIAGNOSTIC_TYPES, STATUS_CONFIG, TREND_CONFIG,
  QUICK_ACTION_ICONS, QUICK_ACTION_LABELS,
} from "@/lib/diagnosticRegistry";

const ICON_MAP = {
  Play, RefreshCw, Brain, Wrench, Calculator, Database, Download, Copy,
};

const STATUS_ICONS = {
  healthy: CheckCircle2,
  warning: AlertCircle,
  critical: AlertTriangle,
};

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, stable: Minus };

/**
 * DiagnosticDrawer™ — Reusable Drill-Down Panel
 * ==============================================
 * Displays: Summary · Evidence · Timeline · Recommendations · Quick Actions · Links
 *
 * No page builds its own diagnostics panel — everyone uses this.
 */
export default function DiagnosticDrawer({
  open,
  onOpenChange,
  title,
  description,
  diagnosticType,
  score,
  status = "healthy",
  trend = "stable",
  evidence = [],
  timeline = [],
  recommendations = [],
  summary,
  actions,
  links,
  onAction,
}) {
  const navigate = useNavigate();

  const typeConfig = DIAGNOSTIC_TYPES[diagnosticType] || {};
  const finalTitle = title || typeConfig.title || "Diagnostics";
  const finalDescription = description || typeConfig.description || "";
  const finalLinks = links || typeConfig.links || [];
  const actionIds = actions?.map((a) => a.id) || typeConfig.defaultActionIds || [];

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.healthy;
  const StatusIcon = STATUS_ICONS[status] || CheckCircle2;
  const TrendIcon = TREND_ICONS[trend] || Minus;
  const trendCfg = TREND_CONFIG[trend] || TREND_CONFIG.stable;

  // Build score ring
  const ringColor = statusCfg.scoreColor;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - ((score || 0) / 100) * circumference;

  const handleAction = (actionId) => {
    base44.analytics.track({
      eventName: "diagnostic_action_triggered",
      properties: { diagnostic_type: diagnosticType, action_id: actionId, title: finalTitle },
    });

    // Default behavior for copy_details
    if (actionId === "copy_details" && !onAction) {
      const details = JSON.stringify({
        title: finalTitle, diagnosticType, score, status, trend,
        evidenceCount: evidence.length, summary,
      }, null, 2);
      navigator.clipboard?.writeText(details);
      return;
    }

    onAction?.(actionId);
  };

  const handleLink = (path) => {
    base44.analytics.track({
      eventName: "diagnostic_link_navigated",
      properties: { diagnostic_type: diagnosticType, path },
    });
    onOpenChange?.(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] overflow-y-auto p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${statusCfg.bgColor} ${statusCfg.borderColor} border`}>
              <StatusIcon size={20} className={statusCfg.textColor} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-base font-semibold text-white">{finalTitle}</SheetTitle>
              <SheetDescription className="text-xs text-white/40">{finalDescription}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">
          {/* ── Summary ── */}
          <section>
            <SectionLabel icon={Activity} label="Summary" />
            <div className="flex items-center gap-4 mt-3">
              <div className="relative flex-shrink-0">
                <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                  <circle
                    cx="48" cy="48" r="40" fill="none" stroke={ringColor}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{score ?? 0}</span>
                  <span className="text-[9px] text-white/40 uppercase">Score</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.textColor} ${statusCfg.borderColor} border`}>
                    {statusCfg.label}
                  </span>
                  <div className={`flex items-center gap-1 ${trendCfg.textColor}`}>
                    <TrendIcon size={12} />
                    <span className="text-xs">{trendCfg.label}</span>
                  </div>
                </div>
                {summary && <p className="text-xs text-white/50 leading-relaxed">{summary}</p>}
              </div>
            </div>
          </section>

          {/* ── Evidence ── */}
          {evidence.length > 0 && (
            <section>
              <SectionLabel icon={AlertCircle} label="Evidence" count={evidence.length} />
              <div className="mt-3 space-y-2">
                {evidence.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-white/80 truncate">{item.title || item.source || `Item ${idx + 1}`}</span>
                      {item.severity && (
                        <span className={`text-[10px] uppercase tracking-wide ${
                          item.severity === "critical" ? "text-red-400" :
                          item.severity === "warning" ? "text-amber-400" : "text-emerald-400"
                        }`}>{item.severity}</span>
                      )}
                    </div>
                    {item.message && <p className="text-xs text-white/40 mt-1">{item.message}</p>}
                    {item.owner && <p className="text-[10px] text-white/30 mt-1">Owner: {item.owner}</p>}
                  </div>
                ))}
                {evidence.length > 8 && (
                  <p className="text-xs text-white/30 text-center pt-1">+ {evidence.length - 8} more</p>
                )}
              </div>
            </section>
          )}

          {/* ── Timeline ── */}
          {timeline.length > 0 && (
            <section>
              <SectionLabel icon={Clock} label="Timeline" />
              <div className="mt-3 space-y-2">
                {timeline.slice(0, 6).map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-white/70">{event.label || event.event}</span>
                      {event.timestamp && <span className="text-[10px] text-white/30 ml-2">{new Date(event.timestamp).toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Recommendations ── */}
          {recommendations.length > 0 && (
            <section>
              <SectionLabel icon={Lightbulb} label="Recommendations" />
              <div className="mt-3 space-y-2">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <ChevronRight size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/60">{typeof rec === "string" ? rec : rec.message || rec.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Quick Actions ── */}
          {actionIds.length > 0 && (
            <section>
              <SectionLabel icon={Wrench} label="Quick Actions" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {actionIds.map((actionId) => {
                  const customAction = actions?.find((a) => a.id === actionId);
                  const iconName = QUICK_ACTION_ICONS[actionId];
                  const Icon = iconName ? ICON_MAP[iconName] : null;
                  const label = customAction?.label || QUICK_ACTION_LABELS[actionId] || actionId;
                  return (
                    <button
                      key={actionId}
                      onClick={() => handleAction(actionId)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-colors text-left"
                    >
                      {Icon && <Icon size={14} className="text-white/40 flex-shrink-0" />}
                      <span className="text-xs text-white/70">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Links ── */}
          {finalLinks.length > 0 && (
            <section>
              <SectionLabel icon={ExternalLink} label="Related Pages" />
              <div className="mt-3 space-y-1.5">
                {finalLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLink(link.path)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.05] transition-colors w-full text-left group"
                  >
                    <ExternalLink size={14} className="text-white/30 group-hover:text-white/50 flex-shrink-0" />
                    <span className="text-xs text-white/60 group-hover:text-white/80">{link.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ icon: Icon, label, count }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-white/30" />
      <span className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</span>
      {count != null && <span className="text-xs text-white/30">({count})</span>}
    </div>
  );
}