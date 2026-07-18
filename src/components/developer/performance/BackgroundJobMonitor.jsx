import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Server, Loader2, Play, RefreshCw } from "lucide-react";

export default function BackgroundJobMonitor() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("dispatchBackgroundJob", { action: "stats" });
      setStats(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const processBatch = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      await base44.functions.invoke("dispatchBackgroundJob", { action: "process_batch", batch_size: 5 });
      await fetchStats();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  }, [fetchStats]);

  React.useEffect(() => { fetchStats(); }, [fetchStats]);

  const STATUS_COLORS = {
    queued: "text-amber-400 bg-amber-500/10",
    running: "text-blue-400 bg-blue-500/10",
    completed: "text-emerald-400 bg-emerald-500/10",
    failed: "text-red-400 bg-red-500/10",
    dead_letter: "text-red-500 bg-red-500/20",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          Background Job Queue
        </h3>
        <div className="flex gap-1.5">
          <button onClick={fetchStats} disabled={loading} className="rounded-md border border-white/10 p-1.5 text-white/60 hover:bg-white/5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={processBatch} disabled={processing} className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1">
            {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Process Batch
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!stats && loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-white/30 animate-spin" /></div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-5 gap-2">
            {["queued", "running", "completed", "failed", "dead_letter"].map((s) => (
              <div key={s} className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
                <p className={`text-lg font-bold ${STATUS_COLORS[s]?.split(" ")[0] || "text-white/60"}`}>{stats[s] ?? 0}</p>
                <p className="text-xs text-white/40 capitalize">{s.replace("_", " ")}</p>
              </div>
            ))}
          </div>

          {stats.avg_duration_ms > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-white/60">Avg Job Duration</span>
              <span className="text-xs font-mono text-indigo-300">{stats.avg_duration_ms} ms</span>
            </div>
          )}

          {stats.recent_completed && stats.recent_completed.length > 0 && (
            <div>
              <p className="text-xs text-white/40 mb-1">Recent Completed</p>
              <div className="space-y-1">
                {stats.recent_completed.map((j) => (
                  <div key={j.job_id} className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-2 py-1">
                    <span className="text-xs text-white/60">{j.job_type}</span>
                    <span className="text-xs font-mono text-emerald-300">{j.duration_ms} ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-white/40 py-4 text-center">No data — click refresh</p>
      )}
    </div>
  );
}