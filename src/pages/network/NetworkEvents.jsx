import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Loader2, Calendar, Clock, MapPin, Video, Users, Check, Globe,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const safeParse = (json, fallback) => {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
};

const EVENT_TYPE_LABELS = {
  roundtable: "Roundtable", summit: "Summit", workshop: "Workshop",
  fireside_chat: "Fireside Chat", ai_strategy: "AI Strategy", career_accelerator: "Career Accelerator",
};

export default function NetworkEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setEvents(await base44.entities.NetworkEvent.list("start_date", 50));
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const isRSVPd = (event) => {
    const rsvp = safeParse(event.rsvp_json, []);
    return rsvp.some((r) => r.id === user?.id);
  };

  const handleRSVP = async (event) => {
    const rsvp = safeParse(event.rsvp_json, []);
    const isGoing = rsvp.some((r) => r.id === user?.id);
    const newRsvp = isGoing
      ? rsvp.filter((r) => r.id !== user?.id)
      : [...rsvp, { id: user?.id, rsvp_at: new Date().toISOString() }];
    try {
      await base44.entities.NetworkEvent.update(event.id, {
        rsvp_json: JSON.stringify(newRsvp),
        rsvp_count: newRsvp.length,
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, rsvp_json: JSON.stringify(newRsvp), rsvp_count: newRsvp.length }
            : e
        )
      );
      toast({
        title: isGoing ? "Removed RSVP" : "RSVP Confirmed",
        description: isGoing ? `You're no longer attending ${event.title}.` : `You're attending ${event.title}.`,
      });
    } catch (e) {}
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Calendar size={12} className="text-indigo-400" /> Events
        </div>
        <h1 className="text-xl font-bold text-white">Executive Calendar</h1>
        <p className="text-white/40 text-sm mt-1">
          Roundtables, summits, workshops, and fireside chats for executives.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No upcoming events.</div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const rsvpd = isRSVPd(event);
            return (
              <div key={event.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/15 shrink-0">
                    <span className="text-indigo-400 text-lg font-bold">
                      {event.start_date ? new Date(event.start_date).getDate() : "—"}
                    </span>
                    <span className="text-indigo-400/60 text-[10px] uppercase">
                      {event.start_date ? new Date(event.start_date).toLocaleDateString("en-US", { month: "short" }) : "TBD"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{event.title}</h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-300">
                        {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-white/40 text-xs leading-relaxed mb-2 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(event.start_date)} · {formatTime(event.start_date)}</span>
                      {event.is_virtual ? (
                        <span className="flex items-center gap-1"><Video size={11} /> Virtual</span>
                      ) : (
                        <span className="flex items-center gap-1"><MapPin size={11} /> {event.location || "TBD"}</span>
                      )}
                      <span className="flex items-center gap-1"><Users size={11} /> {event.rsvp_count || 0} attending</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRSVP(event)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      rsvpd ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                  >
                    {rsvpd ? <><Check size={12} /> Going</> : <><Calendar size={12} /> RSVP</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}