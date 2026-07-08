import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { canModerate } from "@/hooks/useCommunityMemberships";
import { Loader2, Calendar, Plus, Video, MapPin, X, Clock } from "lucide-react";

const EVENT_TYPES = [
  { value: "roundtable", label: "Roundtable" },
  { value: "workshop", label: "Workshop" },
  { value: "fireside_chat", label: "Fireside Chat" },
  { value: "summit", label: "Summit" },
  { value: "ai_strategy", label: "AI Strategy" },
  { value: "career_accelerator", label: "Career Accelerator" },
];

const safeParse = (json, fallback) => {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
};

export default function CommunityEvents() {
  const { community, membership } = useOutletContext();
  const { user } = useAuth();
  const { profile } = useSubscription();
  const userCanModerate = canModerate(membership?.member_role);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", event_type: "roundtable",
    start_date: "", end_date: "", is_virtual: true, meeting_url: "", location: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.NetworkEvent.filter(
          { community_id: community.id }, "start_date", 50
        );
        setEvents(all);
      } catch {}
      setLoading(false);
    };
    load();
  }, [community.id]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.start_date) return;
    setCreating(true);
    try {
      const newEvent = await base44.entities.NetworkEvent.create({
        ...form,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        organizer_name: profile?.full_name || user?.email || "",
        organizer_id: user?.id,
        community_id: community.id,
        community_name: community.name,
        rsvp_json: "[]",
        rsvp_count: 0,
      });
      setEvents((prev) => [...prev, newEvent].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)));
      setShowForm(false);
      setForm({ title: "", description: "", event_type: "roundtable", start_date: "", end_date: "", is_virtual: true, meeting_url: "", location: "" });
    } catch {}
    setCreating(false);
  };

  const handleRSVP = async (event) => {
    const rsvps = safeParse(event.rsvp_json, []);
    const alreadyRSVP = rsvps.some((r) => r.user_id === user?.id);
    const newRsvps = alreadyRSVP
      ? rsvps.filter((r) => r.user_id !== user?.id)
      : [...rsvps, { user_id: user?.id, name: profile?.full_name || user?.email }];
    try {
      await base44.entities.NetworkEvent.update(event.id, {
        rsvp_json: JSON.stringify(newRsvps),
        rsvp_count: newRsvps.length,
      });
      setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, rsvp_json: JSON.stringify(newRsvps), rsvp_count: newRsvps.length } : e));
    } catch {}
  };

  const upcoming = events.filter((e) => new Date(e.start_date) >= new Date(Date.now() - 86400000));
  const past = events.filter((e) => new Date(e.start_date) < new Date(Date.now() - 86400000));

  const renderEvent = (event) => {
    const rsvps = safeParse(event.rsvp_json, []);
    const hasRSVP = rsvps.some((r) => r.user_id === user?.id);
    return (
      <div key={event.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] text-cyan-400 font-bold uppercase">
              {new Date(event.start_date).toLocaleDateString("en", { month: "short" })}
            </span>
            <span className="text-sm text-white font-bold">{new Date(event.start_date).getDate()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm">{event.title}</h3>
            {event.description && <p className="text-white/40 text-xs mt-1 line-clamp-2">{event.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <Clock size={11} /> {new Date(event.start_date).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
              </span>
              <span className="capitalize">{event.event_type.replace(/_/g, " ")}</span>
              {event.is_virtual ? (
                <span className="flex items-center gap-1 text-cyan-400"><Video size={11} /> Virtual</span>
              ) : (
                <span className="flex items-center gap-1"><MapPin size={11} /> {event.location || "TBD"}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleRSVP(event)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              hasRSVP ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {hasRSVP ? "✓ Going" : "RSVP"}
          </button>
        </div>
        {rsvps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/30">
            {rsvps.length} attending{rsvps.length <= 5 ? `: ${rsvps.map((r) => r.name).join(", ")}` : ""}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-cyan-400" /> Events
          </h1>
          <p className="text-white/40 text-sm mt-1">Upcoming events and meetings in {community.name}.</p>
        </div>
        {userCanModerate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "New Event"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Event title"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Event description"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 mb-1 block">Start Date & Time</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/30 mb-1 block">End Date & Time</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-white/60 px-3">
              <input
                type="checkbox"
                checked={form.is_virtual}
                onChange={(e) => setForm({ ...form, is_virtual: e.target.checked })}
                className="rounded"
              />
              Virtual event
            </label>
          </div>
          {form.is_virtual ? (
            <input
              value={form.meeting_url}
              onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
              placeholder="Meeting URL (Zoom, Teams, etc.)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          ) : (
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          )}
          <button
            onClick={handleCreate}
            disabled={creating || !form.title.trim() || !form.start_date}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Event
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-white/70 mb-3">Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-white/30 text-sm py-4">No upcoming events.</p>
            ) : (
              <div className="space-y-3">{upcoming.map(renderEvent)}</div>
            )}
          </div>
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/70 mb-3">Past ({past.length})</h2>
              <div className="space-y-3 opacity-60">{past.slice().reverse().map(renderEvent)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}