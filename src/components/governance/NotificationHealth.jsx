import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Loader2, Mail, CheckCircle2, XCircle, Clock, RefreshCw,
  AlertTriangle, Send, Activity, Bell,
} from "lucide-react";

export default function NotificationHealth() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("governanceNotificationEngine", { action: "delivery_stats" });
      setStats(res.data || res);
    } catch (err) {
      // Silent fail — not critical for page load
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("governanceNotificationEngine", { action: "delivery_history", limit: 20 });
      const data = res.data || res;
      setHistory(data.logs || []);
    } catch {}
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await base44.functions.invoke("governanceNotificationEngine", { action: "test_notification" });
      const data = res.data || res;
      if (data.success) {
        toast({
          title: "✅ Test Notification Sent",
          description: `In-App: ${data.channels.in_app.status} · Email: ${data.channels.email.status} · ${data.delivery_time_ms}ms`,
        });
      } else {
        toast({ title: "Test Failed", description: data.error || "Unknown error", variant: "destructive" });
      }
      await loadStats();
    } catch (err) {
      toast({ title: "Test Failed", description: err.response?.data?.error || err.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-16"><Loader2 className="w-4 h-4 animate-spin text-indigo-400" /></div>;
  }

  const s = stats || {};

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Bell size={14} className="text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-white">Notification Engine™ Health</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-white/60 h-7 text-xs" onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}>
            <Activity size={12} className="mr-1" /> Delivery Log
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 h-7 text-xs" onClick={handleTest} disabled={testing}>
            {testing ? <><Loader2 size={12} className="mr-1 animate-spin" /> Sending...</> : <><Send size={12} className="mr-1" /> Test Notification</>}
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        <HealthKPI icon={Mail} label="Sent Today" value={s.emails_sent_today || 0} color="text-blue-400" bg="bg-blue-500/10" />
        <HealthKPI icon={CheckCircle2} label="Delivered" value={s.emails_delivered || 0} color="text-emerald-400" bg="bg-emerald-500/10" />
        <HealthKPI icon={XCircle} label="Failed" value={s.failed_deliveries || 0} color="text-red-400" bg="bg-red-500/10" />
        <HealthKPI icon={Clock} label="Pending" value={s.pending_notifications || 0} color="text-amber-400" bg="bg-amber-500/10" />
        <HealthKPI icon={RefreshCw} label="Reminders" value={s.reminder_queue || 0} color="text-purple-400" bg="bg-purple-500/10" />
        <HealthKPI icon={Activity} label="Retries" value={s.retry_count || 0} color="text-orange-400" bg="bg-orange-500/10" />
        <HealthKPI icon={AlertTriangle} label="Failed Total" value={s.failed_deliveries || 0} color="text-red-400" bg="bg-red-500/10" />
      </div>

      {/* Delivery History */}
      {showHistory && (
        <div className="space-y-2 mt-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Recent Email Deliveries</span>
          {history.filter(h => h.channel === 'email').length === 0 ? (
            <p className="text-white/30 text-xs text-center py-4">No email deliveries yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {history.filter(h => h.channel === 'email').slice(0, 10).map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/[0.01] border border-white/5 rounded-lg px-3 py-2">
                  <StatusIcon status={log.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{log.subject}</p>
                    <p className="text-[10px] text-white/30 truncate">{log.recipient_email} · {log.sent_at ? new Date(log.sent_at).toLocaleString() : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                      log.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                      log.status === 'retried' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-white/5 text-white/40'
                    }`}>{log.status}</span>
                    {log.delivery_attempts > 1 && <span className="text-[10px] text-orange-400 ml-1">{log.delivery_attempts}x</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HealthKPI({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-center">
      <div className={`w-5 h-5 rounded ${bg} flex items-center justify-center mx-auto mb-1`}>
        <Icon size={10} className={color} />
      </div>
      <span className="text-lg font-bold text-white block">{value}</span>
      <span className="text-[9px] text-white/30 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === 'delivered') return <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />;
  if (status === 'failed') return <XCircle size={14} className="text-red-400 shrink-0" />;
  if (status === 'retried') return <RefreshCw size={14} className="text-orange-400 shrink-0" />;
  if (status === 'queued') return <Clock size={14} className="text-amber-400 shrink-0" />;
  return <Mail size={14} className="text-white/30 shrink-0" />;
}