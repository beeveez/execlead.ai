import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Sparkles, Loader2, Star, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/events/EventFilters";
import { getEventType, getColor } from "@/lib/eventPlatform";

const EMPTY_FILTERS = { search: '', type: '', format: '', price: '' };

export default function NetworkEvents() {
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState(new Set());
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventData, myEventsRes] = await Promise.all([
        base44.entities.NetworkEvent.list('start_date', 100),
        base44.functions.invoke('executiveEvents', { action: 'get_my_events' }).catch(() => ({ data: { registrations: [] } })),
      ]);
      setEvents(eventData);
      setMyRegs(new Set((myEventsRes.data.registrations || []).map(r => r.event_id)));

      base44.functions.invoke('executiveEvents', { action: 'ai_recommend' })
        .then(res => setRecommendations(res.data.recommendations || []))
        .catch(() => {});
    } catch (e) {
      toast({ title: 'Failed to load events', variant: 'error' });
    }
    setLoading(false);
  };

  const filtered = events.filter(e => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!e.title?.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q)) return false;
    }
    if (filters.type && e.event_type !== filters.type) return false;
    if (filters.format === 'virtual' && !e.is_virtual) return false;
    if (filters.format === 'inperson' && e.is_virtual) return false;
    if (filters.price === 'free' && (e.price || 0) > 0) return false;
    if (filters.price === 'paid' && (e.price || 0) === 0) return false;
    return true;
  });

  const now = new Date();
  const upcoming = filtered.filter(e => !e.start_date || new Date(e.start_date) >= now);
  const featured = upcoming.filter(e => e.is_featured);
  const recommendedEvents = recommendations
    .map(r => events.find(e => e.id === r.event_id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Calendar size={12} className="text-indigo-400" /> Events
        </div>
        <h1 className="text-xl font-bold text-white">Executive Events</h1>
        <p className="text-white/40 text-sm mt-1">
          Roundtables, summits, masterclasses, and networking events for executives.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
      ) : (
        <>
          {/* AI Recommendations */}
          {recommendedEvents.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-indigo-400" />
                <h2 className="text-white font-semibold text-sm">Recommended for You</h2>
                <span className="text-xs text-white/30">Based on your profile</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {recommendedEvents.map((event) => {
                  const rec = recommendations.find(r => r.event_id === event.id);
                  return (
                    <div key={event.id} className="relative">
                      <EventCard event={event} registered={myRegs.has(event.id)} />
                      {rec?.reason && (
                        <div className="mt-1.5 px-2 text-[10px] text-indigo-300/70 line-clamp-2">{rec.reason}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured */}
          {featured.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-amber-400" />
                <h2 className="text-white/70 text-sm font-medium">Featured Events</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {featured.slice(0, 4).map(e => <EventCard key={e.id} event={e} registered={myRegs.has(e.id)} />)}
              </div>
            </div>
          )}

          {/* Filters + All Events */}
          <EventFilters
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
            resultCount={upcoming.length}
          />

          {upcoming.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={32} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/40 text-sm font-medium">No upcoming events match your filters</p>
              <p className="text-white/20 text-xs mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {upcoming.map(e => <EventCard key={e.id} event={e} registered={myRegs.has(e.id)} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}