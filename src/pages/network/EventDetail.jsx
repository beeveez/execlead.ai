import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft, Clock, MapPin, Video, Users, Calendar, Globe, Share2, Link2,
  UserPlus, Loader2, ChevronDown, ChevronUp, Building2, MessageCircle, Award, Gift,
} from "lucide-react";
import { getEventType, getColor, formatDate, formatTime, formatDuration, safeParse } from "@/lib/eventPlatform";
import RegistrationPanel from "@/components/events/RegistrationPanel";
import AddToCalendar from "@/components/events/AddToCalendar";
import SpeakerCard from "@/components/events/SpeakerCard";
import AgendaTimeline from "@/components/events/AgendaTimeline";

export default function EventDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [detailsRes, attendeesRes] = await Promise.all([
        base44.functions.invoke('executiveEvents', { action: 'get_event_details', event_id: id }),
        base44.functions.invoke('executiveEvents', { action: 'get_attendees', event_id: id }).catch(() => ({ data: { attendees: [] } })),
      ]);
      setData(detailsRes.data);
      setAttendees(attendeesRes.data.attendees || []);
    } catch (e) {
      toast({ title: 'Failed to load event', variant: 'error' });
    }
    setLoading(false);
  };

  const handleRegister = async (paymentMethod) => {
    setRegistering(true);
    try {
      const res = await base44.functions.invoke('executiveEvents', {
        action: 'register', event_id: id, payment_method: paymentMethod,
      });
      setData(prev => ({
        ...prev,
        my_registration: res.data.registration,
        event: res.data.event || prev.event,
        spots_remaining: prev.spots_remaining > 0 ? prev.spots_remaining - 1 : prev.spots_remaining,
        attendee_count: (prev.attendee_count || 0) + 1,
      }));
      toast({
        title: res.data.registration.status === 'waitlisted' ? 'Added to waitlist' : 'Registration confirmed!',
        variant: 'success',
      });
      const attRes = await base44.functions.invoke('executiveEvents', { action: 'get_attendees', event_id: id });
      setAttendees(attRes.data.attendees || []);
    } catch (e) {
      toast({ title: e.response?.data?.error || 'Registration failed', variant: 'error' });
    }
    setRegistering(false);
  };

  const handleCancel = async () => {
    if (!data?.my_registration) return;
    try {
      await base44.functions.invoke('executiveEvents', { action: 'cancel', registration_id: data.my_registration.id });
      setData(prev => ({ ...prev, my_registration: null }));
      toast({ title: 'Registration cancelled', variant: 'info' });
    } catch (e) {
      toast({ title: 'Failed to cancel', variant: 'error' });
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await base44.functions.invoke('executiveEvents', { action: 'check_in', event_id: id, method: 'manual' });
      setData(prev => ({
        ...prev,
        my_registration: { ...prev.my_registration, attended: true, certificate_issued: !!res.data.certificate },
      }));
      toast({ title: 'Checked in!', description: res.data.certificate ? 'Certificate issued.' : '', variant: 'success' });
    } catch (e) {
      toast({ title: e.response?.data?.error || 'Check-in failed', variant: 'error' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: data.event.title, url }); } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', variant: 'success' });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied', variant: 'success' });
  };

  const handleCopyReferral = async () => {
    const refUrl = `${window.location.origin}/network/events/${id}?ref=execlead`;
    await navigator.clipboard.writeText(refUrl);
    toast({ title: 'Referral link copied', variant: 'success' });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>;
  }

  if (!data?.event) {
    return (
      <div className="text-center py-20">
        <Calendar size={32} className="mx-auto text-white/10 mb-3" />
        <p className="text-white/40 text-sm">Event not found</p>
        <Link to="/network/events" className="mt-3 inline-block text-xs text-indigo-400 hover:text-indigo-300">← Back to events</Link>
      </div>
    );
  }

  const { event, my_registration, discount, spots_remaining, attendee_count } = data;
  const type = getEventType(event.event_type);
  const colors = getColor(type.color);
  const Icon = type.icon;
  const speakers = safeParse(event.speakers_json, []);
  const agenda = safeParse(event.agenda_json, []);
  const faqs = safeParse(event.faq_json, []);
  const sponsors = safeParse(event.sponsors_json, []);
  const isPast = event.start_date && new Date(event.start_date) < new Date();

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Link to="/network/events" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors">
        <ArrowLeft size={13} /> Back to Events
      </Link>

      {/* Hero */}
      <div className={`relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-br ${colors.gradient}`}>
        {event.cover_image_url && <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium border ${colors.badge}`}>
              <Icon size={11} /> {type.label}
            </span>
            {event.status === 'live' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
              </span>
            )}
            {event.is_featured && (
              <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Featured</span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Event meta */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-1 text-white/30 text-[10px] uppercase tracking-wider mb-1"><Calendar size={10} /> Date</div>
                <div className="text-white/70 text-sm">{formatDate(event.start_date)}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/30 text-[10px] uppercase tracking-wider mb-1"><Clock size={10} /> Time</div>
                <div className="text-white/70 text-sm">{formatTime(event.start_date)}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/30 text-[10px] uppercase tracking-wider mb-1"><Clock size={10} /> Duration</div>
                <div className="text-white/70 text-sm">{formatDuration(event.duration_minutes) || 'TBD'}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/30 text-[10px] uppercase tracking-wider mb-1"><Globe size={10} /> Timezone</div>
                <div className="text-white/70 text-sm">{event.timezone || 'UTC'}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm">
              {event.is_virtual ? (
                <><Video size={14} className="text-indigo-400" /> <span className="text-white/60">Virtual Event{event.meeting_platform ? ` · ${event.meeting_platform.charAt(0).toUpperCase() + event.meeting_platform.slice(1)}` : ''}</span></>
              ) : (
                <><MapPin size={14} className="text-indigo-400" /> <span className="text-white/60">{event.venue_name || event.location || 'TBD'}</span></>
              )}
            </div>
            {!event.is_virtual && event.venue_maps_url && (
              <a href={event.venue_maps_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                <MapPin size={11} /> View on Google Maps
              </a>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-semibold text-sm mb-2">About this event</h2>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-white/40">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Agenda */}
          {agenda.length > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Agenda</h2>
              <AgendaTimeline agenda={agenda} />
            </div>
          )}

          {/* Speakers */}
          {speakers.length > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-semibold text-sm mb-3">Speakers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speakers.map((s, i) => <SpeakerCard key={i} speaker={s} />)}
              </div>
            </div>
          )}

          {/* Sponsors */}
          {sponsors.length > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-semibold text-sm mb-3">Sponsors</h2>
              <div className="flex flex-wrap gap-3">
                {sponsors.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                    {s.logo && <img src={s.logo} alt="" className="w-6 h-6 rounded" />}
                    <div>
                      <div className="text-xs text-white/60 font-medium">{s.name}</div>
                      {s.tier && <div className="text-[10px] text-white/30 capitalize">{s.tier}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.networking_enabled && attendees.length > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <button onClick={() => setShowAttendees(!showAttendees)} className="flex items-center justify-between w-full">
                <h2 className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Users size={15} className="text-indigo-400" /> Attendees ({attendees.length})
                </h2>
                {showAttendees ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
              </button>
              {showAttendees && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attendees.slice(0, 20).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 overflow-hidden">
                        {a.user_photo ? <img src={a.user_photo} alt="" className="w-full h-full object-cover" /> : (a.user_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/70 font-medium truncate">{a.user_name}</div>
                        {a.user_headline && <div className="text-[10px] text-white/30 truncate">{a.user_headline}</div>}
                      </div>
                      {a.attended && <Award size={12} className="text-emerald-400" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAQ */}
          {faqs.length > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <h2 className="text-white font-semibold text-sm mb-3">FAQ</h2>
              <div className="space-y-2">
                {faqs.map((f, i) => (
                  <div key={i} className="border-b border-white/5 last:border-0">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between w-full py-2.5 text-left">
                      <span className="text-sm text-white/70">{f.question}</span>
                      {openFaq === i ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                    </button>
                    {openFaq === i && <p className="text-white/40 text-xs pb-2.5 leading-relaxed">{f.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <RegistrationPanel
            event={event}
            myRegistration={my_registration}
            discount={discount}
            spotsRemaining={spots_remaining}
            onRegister={handleRegister}
            onCancel={handleCancel}
            onCheckIn={handleCheckIn}
            loading={registering}
          />

          {/* Host */}
          {(event.host_name || event.organizer_name) && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Hosted by</div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {(event.host_name || event.organizer_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="text-sm text-white/70 font-medium">{event.host_name || event.organizer_name}</div>
                  {event.host_company && <div className="text-xs text-white/30 flex items-center gap-1"><Building2 size={10} /> {event.host_company}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
            <AddToCalendar event={event} />
            <button onClick={handleShare} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/60 hover:text-white transition-colors w-full">
              <Share2 size={13} /> Share Event
            </button>
            <button onClick={handleCopyLink} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/60 hover:text-white transition-colors w-full">
              <Link2 size={13} /> Copy Link
            </button>
            <button onClick={handleCopyReferral} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/60 hover:text-white transition-colors w-full">
              <Gift size={13} /> Referral Link
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-white">{attendee_count || 0}</div>
              <div className="text-[10px] text-white/30">Registered</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{event.views_count || 0}</div>
              <div className="text-[10px] text-white/30">Views</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{event.attended_count || 0}</div>
              <div className="text-[10px] text-white/30">Attended</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}