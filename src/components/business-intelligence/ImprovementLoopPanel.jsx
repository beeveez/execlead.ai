import React, { useState, useEffect } from "react";
import { RefreshCw, ArrowRight, Check, X, Loader2 } from "lucide-react";
import { getImprovements, updateImprovement, getPriorityColor, getStatusColor, formatMetric } from "@/lib/businessIntelligenceEngine";

const STATUS_FLOW = ["identified", "planned", "in_progress", "implemented", "verified"];
const NEXT_STATUS = {
  identified: "planned",
  planned: "in_progress",
  in_progress: "implemented",
  implemented: "verified",
};

export default function ImprovementLoopPanel({ reportPeriod }) {
  const [improvements, setImprovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { improvements: data } = await getImprovements(null, 50);
      setImprovements(data || []);
    } catch {
      setImprovements([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [reportPeriod]);

  const handleAdvance = async (imp) => {
    const next = NEXT_STATUS[imp.status];
    if (!next) return;
    setUpdating(imp.id);
    try {
      await updateImprovement(imp.id, {
        status: next,
        implemented_date: next === "implemented" ? new Date().toISOString() : undefined,
        verified_date: next === "verified" ? new Date().toISOString() : undefined,
      });
      await load();
    } catch {}
    setUpdating(null);
  };

  const handleDismiss = async (imp) => {
    setUpdating(imp.id);
    try {
      await updateImprovement(imp.id, { status: "dismissed" });
      await load();
    } catch {}
    setUpdating(null);
  };

  const open = improvements.filter(i => i.status !== "dismissed" && i.status !== "verified");
  const closed = improvements.filter(i => i.status === "verified" || i.status === "dismissed");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw size={14} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Continuous Improvement Loop</h3>
        <span className="text-white/30 text-xs">({open.length} active)</span>
        <div className="flex-1 h-px bg-white/5" />
        <button onClick={load} className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1">
          <RefreshCw size={10} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        </div>
      ) : open.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-8 text-center text-white/30 text-sm">
          No active improvement actions. Generate a report to identify new improvements.
        </div>
      ) : (
        <div className="space-y-2">
          {open.map((imp) => (
            <div key={imp.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest border ${getPriorityColor(imp.priority)}`}>
                      {imp.priority}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest border ${getStatusColor(imp.status)}`}>
                      {imp.status.replace("_", " ")}
                    </span>
                    <span className="text-white/30 text-[10px]">{imp.improvement_type.replace("_", " ")}</span>
                  </div>
                  <div className="text-white/80 text-sm font-medium">{imp.title}</div>
                  {imp.description && <div className="text-white/40 text-xs mt-0.5">{imp.description}</div>}
                  {imp.ai_recommendation && (
                    <div className="text-indigo-400/60 text-xs mt-1 italic">AI: {imp.ai_recommendation}</div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-[11px]">
                    {imp.metric_name && (
                      <span className="text-white/40">
                        {imp.metric_name}: <span className="text-white/60">{formatMetric(imp.current_metric)}</span>
                        <ArrowRight size={8} className="inline mx-1" />
                        <span className="text-emerald-400">{formatMetric(imp.target_metric)}</span>
                      </span>
                    )}
                    {imp.expected_revenue_impact > 0 && (
                      <span className="text-emerald-400/60">+{formatMetric(imp.expected_revenue_impact, "currency")}/yr</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {imp.status !== "verified" && (
                    <button
                      onClick={() => handleAdvance(imp)}
                      disabled={updating === imp.id}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-medium transition-colors disabled:opacity-40"
                    >
                      {updating === imp.id ? <Loader2 size={10} className="animate-spin" /> : <ArrowRight size={10} />}
                      {NEXT_STATUS[imp.status]?.replace("_", " ")}
                    </button>
                  )}
                  {imp.status !== "dismissed" && (
                    <button
                      onClick={() => handleDismiss(imp)}
                      disabled={updating === imp.id}
                      className="p-1 rounded bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {closed.length > 0 && (
        <details className="mt-4">
          <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60">
            Completed & Dismissed ({closed.length})
          </summary>
          <div className="mt-2 space-y-1">
            {closed.slice(0, 10).map((imp) => (
              <div key={imp.id} className="flex items-center gap-2 text-xs text-white/30 py-1">
                {imp.status === "verified" ? <Check size={10} className="text-emerald-400" /> : <X size={10} className="text-red-400" />}
                <span className="flex-1 truncate">{imp.title}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${getStatusColor(imp.status)}`}>
                  {imp.status}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}