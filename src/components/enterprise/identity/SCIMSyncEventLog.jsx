import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, Activity, UserPlus, UserCog, UserX, Layers, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EVENT_ICONS = {
  provisioning_create: UserPlus, provisioning_update: UserCog,
  provisioning_disable: UserX, provisioning_delete: UserX,
  group_sync: Layers, sync_complete: Activity, sync_error: AlertCircle,
  sync_warning: AlertCircle,
};

const STATUS_COLORS = {
  success: "text-emerald-400 bg-emerald-500/10",
  error: "text-red-400 bg-red-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  info: "text-blue-400 bg-blue-500/10",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SCIMSyncEventLog({ provider }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const evts = await base44.entities.IdentitySyncEvent.filter(
        { provider_id: provider.id }, "-created_date", 20
      );
      setEvents(evts);
    } catch (e) { console.error("Events load failed:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (provider?.id) load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [provider?.id]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={20} /></div>;

  if (events.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <Activity size={28} className="text-white/20 mx-auto mb-2" />
        <p className="text-white/30 text-sm">No sync events yet. SCIM operations will appear here once your IdP starts provisioning.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider">Recent Sync Events</h4>
        <button onClick={load} className="text-white/40 hover:text-white/80 transition-colors">
          <RefreshCw size={12} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {events.map((e) => {
          const Icon = EVENT_ICONS[e.event_type] || Activity;
          const statusColor = STATUS_COLORS[e.status] || STATUS_COLORS.info;
          return (
            <div key={e.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${statusColor}`}>
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-xs font-medium truncate">{e.event_type.replace(/_/g, " ")}</span>
                  {e.affected_users > 0 && <span className="text-white/30 text-[10px]">{e.affected_users} user{e.affected_users > 1 ? "s" : ""}</span>}
                </div>
                <p className="text-white/40 text-xs truncate">{e.message}</p>
              </div>
              <span className="text-white/20 text-[10px] shrink-0 whitespace-nowrap">{timeAgo(e.created_date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}