import React, { useState, useEffect } from "react";
import { Activity, Loader2, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SECURITY_EVENT_TYPES, getSeverityColor } from "@/lib/zeroTrustEngine";

const ACTION_LABELS = {
  none: "Logged",
  blocked: "Blocked",
  challenged: "Challenged",
  alerted: "Alerted",
  logged: "Logged",
};

export default function SecurityAuditLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const records = await base44.entities.SecurityEvent.list("-created_date", 100);
        setEvents(records);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const filtered = events.filter(e => {
    if (filter !== "all" && e.severity !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (e.user_name || "").toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q) || (e.event_type || "").toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50" />
        </div>
        <div className="flex items-center gap-1">
          {["all", "critical", "high", "medium", "low", "info"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-violet-500/15 text-violet-400" : "text-white/40 hover:text-white/70"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-4">
          <Activity size={14} /> Security Event Log
        </div>
        {filtered.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-8">No security events recorded.</p>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((e, i) => {
              const meta = SECURITY_EVENT_TYPES[e.event_type] || {};
              const sevColor = getSeverityColor(e.severity);
              return (
                <div key={e.id || i} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: sevColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-white/70 font-medium">{meta.label || e.event_type}</span>
                      <span className="text-[10px] text-white/30 flex-shrink-0">{e.created_date ? new Date(e.created_date).toLocaleString() : ""}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{e.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                      {e.user_name && <span>{e.user_name}</span>}
                      {e.ip_address && <span>IP: {e.ip_address}</span>}
                      {e.device && <span>{e.device}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ color: sevColor, background: `${sevColor}10` }}>{e.severity}</span>
                    <span className="text-[10px] text-white/30">{ACTION_LABELS[e.action_taken] || "Logged"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}