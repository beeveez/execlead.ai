import React from "react";
import {
  TrendingUp, Database, Zap, ShieldCheck, Award, CheckCircle, Flag, Gauge as GaugeIcon,
} from "lucide-react";

// ============================================================
// Executive Trust Timeline™ — reusable trust evolution surface
// ============================================================
// Renders how executive growth evolved over time: score changes, evidence
// added, competencies strengthened, confidence/coverage/reliability changes,
// recommendations completed, and leadership milestones.
//
// Consumes a generic events array: [{ type, label, detail, at, module }]
// Build via buildReadinessTimeline() or any domain timeline builder.

const TYPE_CONFIG = {
  score_change: { icon: TrendingUp, color: "text-emerald-400", dot: "bg-emerald-400", ring: "bg-emerald-500/10 border-emerald-500/20" },
  evidence_added: { icon: Database, color: "text-sky-400", dot: "bg-sky-400", ring: "bg-sky-500/10 border-sky-500/20" },
  competency_strengthened: { icon: Zap, color: "text-amber-400", dot: "bg-amber-400", ring: "bg-amber-500/10 border-amber-500/20" },
  confidence_change: { icon: ShieldCheck, color: "text-violet-400", dot: "bg-violet-400", ring: "bg-violet-500/10 border-violet-500/20" },
  coverage_change: { icon: GaugeIcon, color: "text-cyan-400", dot: "bg-cyan-400", ring: "bg-cyan-500/10 border-cyan-500/20" },
  reliability_change: { icon: Award, color: "text-indigo-400", dot: "bg-indigo-400", ring: "bg-indigo-500/10 border-indigo-500/20" },
  recommendation_completed: { icon: CheckCircle, color: "text-emerald-400", dot: "bg-emerald-400", ring: "bg-emerald-500/10 border-emerald-500/20" },
  milestone: { icon: Flag, color: "text-yellow-400", dot: "bg-yellow-400", ring: "bg-yellow-500/10 border-yellow-500/20" },
};

export default function ExecutiveTrustTimeline({ events = [], title = "Executive Trust Timeline™", max = 20 }) {
  const list = (events || []).slice(0, max);
  if (list.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl px-5 py-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        <p className="text-[12px] text-white/40">No trust events recorded yet. Your timeline builds as evidence accumulates across simulations, coaching, and learning.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl px-5 py-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <span className="text-[10px] text-white/30 ml-auto">{list.length} events</span>
      </div>

      <div className="relative">
        {/* Vertical spine */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/8" />
        <div className="space-y-3">
          {list.map((ev, i) => {
            const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.evidence_added;
            const Icon = cfg.icon;
            return (
              <div key={i} className="relative flex gap-3 items-start">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border ${cfg.ring} shrink-0`}>
                  <Icon size={13} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-white/80 font-medium truncate">{ev.label}</span>
                    {ev.at && <span className="text-[10px] text-white/30 shrink-0">{relativeTime(ev.at)}</span>}
                  </div>
                  {ev.detail && <p className="text-[11px] text-white/45 truncate mt-0.5">{ev.detail}</p>}
                  {ev.module && <span className="text-[9px] text-white/30 uppercase tracking-wider">{ev.module}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}