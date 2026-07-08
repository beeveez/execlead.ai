import React from "react";
import { ShieldCheck, CalendarClock, Gauge, Sparkles, Info } from "lucide-react";

/**
 * Data Quality Badge — displayed on every company profile.
 * Shows: Verified Public Sources, Confidence Score, Last Updated, AI Enhanced.
 */
export default function DataQualityBadge({ company, className = "" }) {
  const confidence = company?.quality_score || 0;
  const lastUpdated = company?.last_updated;
  const version = company?.version_number || 1;
  const isVerified = ["verified", "official_partner", "strategic_partner"].includes(
    company?.profile_status
  );

  const confidenceColor =
    confidence >= 90
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : confidence >= 70
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-white/40 bg-white/5 border-white/10";

  const items = [
    {
      icon: ShieldCheck,
      label: "Verified Public Sources",
      value: isVerified ? "Verified" : "Public Sources",
      cls: isVerified
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        : "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Gauge,
      label: "Confidence Score",
      value: confidence > 0 ? `${confidence}%` : "—",
      cls: confidenceColor,
    },
    {
      icon: CalendarClock,
      label: "Last Updated",
      value: lastUpdated
        ? new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "Recent",
      cls: "text-white/50 bg-white/5 border-white/10",
    },
    {
      icon: Sparkles,
      label: "AI Enhanced",
      value: "Analysis",
      cls: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${className}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${item.cls}`}
          title={item.label}
        >
          <item.icon size={14} className="shrink-0" />
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-wider opacity-60 leading-none mb-0.5">
              {item.label}
            </div>
            <div className="text-xs font-semibold truncate">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}