import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, Video, MapPin, Loader2, Crown } from "lucide-react";

export default function FounderEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.NetworkEvent.list("-start_date", 20)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Founder Events</h1>
        <p className="text-white/40 text-sm">Exclusive events for founding members — roundtables, summits, and feedback sessions.</p>
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 rounded-xl p-4 flex items-center gap-2">
        <Crown size={16} className="text-amber-400" />
        <span className="text-white/70 text-sm">You have priority access to all founder events.</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">No upcoming events.</div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const rsvpCount = event.rsvp_count || 0;
            const startDate = event.start_date ? new Date(event.start_date) : null;
            return (
              <div key={event.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium mb-1">{event.title}</h3>
                    {event.description && <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{event.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      {startDate && (
                        <span className="flex items-center gap-1"><Calendar size={11} /> {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      )}
                      {event.is_virtual && <span className="flex items-center gap-1"><Video size={11} /> Virtual</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>}
                      <span className="flex items-center gap-1"><Clock size={11} /> {rsvpCount} RSVPs</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-medium uppercase shrink-0">
                    {event.event_type?.replace(/_/g, " ") || "event"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}