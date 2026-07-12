import React, { useState, useEffect } from "react";
import { Clock, Loader2, Play, Pause, Calendar, CheckCircle2, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const FREQ_BADGE = {
  daily: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  weekly: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  monthly: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ScheduledReportsList() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ScheduledReport.list("-created_date", 100);
      setSchedules(data);
    } catch (e) {
      console.error("Failed to load schedules:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async (id, name) => {
    setRunning(id);
    try {
      const res = await base44.functions.invoke("runScheduledReports", { scheduled_report_id: id });
      toast({
        title: "Report generated",
        description: res.data?.results?.[0]
          ? `${name} v${res.data.results[0].version} (RPT-${res.data.results[0].report_id}) created.`
          : `${name} generated successfully.`,
      });
      await load();
    } catch (e) {
      toast({ title: "Generation failed", description: e?.message || "Could not generate report.", variant: "destructive" });
    } finally {
      setRunning(null);
    }
  };

  const handleToggle = async (schedule) => {
    const newStatus = schedule.status === "active" ? "paused" : "active";
    try {
      await base44.entities.ScheduledReport.update(schedule.id, {
        status: newStatus,
        ...(newStatus === "active" ? { next_run_at: new Date().toISOString() } : {}),
      });
      await load();
      toast({ title: newStatus === "active" ? "Schedule resumed" : "Schedule paused", description: `${schedule.report_name} ${newStatus}.` });
    } catch (e) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  const activeCount = schedules.filter((s) => s.status === "active").length;
  const nextDue = schedules
    .filter((s) => s.status === "active" && s.next_run_at)
    .sort((a, b) => new Date(a.next_run_at) - new Date(b.next_run_at))[0];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-indigo-400" />
            <span className="text-white/40 text-xs uppercase tracking-wider">Total Schedules</span>
          </div>
          <div className="text-white text-2xl font-bold">{schedules.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-white/40 text-xs uppercase tracking-wider">Active</span>
          </div>
          <div className="text-white text-2xl font-bold">{activeCount}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-amber-400" />
            <span className="text-white/40 text-xs uppercase tracking-wider">Next Due</span>
          </div>
          <div className="text-white text-sm font-medium truncate">{nextDue ? nextDue.report_name : "—"}</div>
          <div className="text-white/30 text-xs">{nextDue ? fmtDateTime(nextDue.next_run_at) : ""}</div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`px-2 py-0.5 rounded-md text-xs font-medium border shrink-0 ${FREQ_BADGE[s.frequency] || "bg-white/5 text-white/40 border-white/10"}`}>
                {s.frequency}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">{s.report_name}</span>
                  {s.status === "paused" && <span className="text-white/30 text-xs">(paused)</span>}
                </div>
                <div className="flex items-center gap-3 text-white/30 text-xs mt-0.5">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {s.schedule_description || s.frequency}</span>
                  <span>Last: {fmtDateTime(s.last_run_at)}</span>
                  <span>Generated: {s.total_generated || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-white/30 text-xs hidden md:block">Next: {fmtDateTime(s.next_run_at)}</span>
              <button
                onClick={() => handleRunNow(s.id, s.report_name)}
                disabled={running === s.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                {running === s.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                Run Now
              </button>
              <button
                onClick={() => handleToggle(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                  s.status === "active"
                    ? "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              >
                {s.status === "active" ? <Pause size={12} /> : <Play size={12} />}
                {s.status === "active" ? "Pause" : "Resume"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}