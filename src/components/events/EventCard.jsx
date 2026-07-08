import React from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Video, Users, DollarSign, Check, Star } from "lucide-react";
import { getEventType, getColor, formatDate, formatTime, formatDuration } from "@/lib/eventPlatform";

export default function EventCard({ event, registered }) {
  const type = getEventType(event.event_type);
  const colors = getColor(type.color);
  const Icon = type.icon;
  const isPast = event.start_date && new Date(event.start_date) < new Date();
  const isFree = !event.price || event.price === 0;
  const spotsLeft = (event.max_capacity || event.capacity || 0) > 0
    ? Math.max(0, (event.max_capacity || event.capacity) - (event.registered_count || 0))
    : -1;

  return (
    <Link to={`/network/events/${event.id}`} className="group block">
      <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all duration-200 hover:bg-white/[0.05] h-full flex flex-col">
        {/* Cover */}
        <div className={`h-28 bg-gradient-to-br ${colors.gradient} relative flex items-center justify-center`}>
          {event.cover_image_url ? (
            <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon size={32} className={`text-white/20`} />
          )}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${colors.badge} backdrop-blur-sm`}>
              {type.short}
            </span>
          </div>
          {event.is_featured && (
            <div className="absolute top-2 right-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Star size={9} /> Featured
              </span>
            </div>
          )}
          {registered && (
            <div className="absolute bottom-2 right-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Check size={9} /> Registered
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{event.description}</p>
          )}
          <div className="mt-auto space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock size={11} />
              <span>{formatDate(event.start_date)}</span>
              {event.start_date && <span>· {formatTime(event.start_date)}</span>}
              {event.duration_minutes && <span>· {formatDuration(event.duration_minutes)}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              {event.is_virtual ? <Video size={11} /> : <MapPin size={11} />}
              <span className="truncate">{event.is_virtual ? 'Virtual' : (event.venue_name || event.location || 'TBD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Users size={11} /> {event.registered_count || 0} attending
              </span>
              {isFree ? (
                <span className="text-xs font-medium text-emerald-400">Free</span>
              ) : (
                <span className="flex items-center gap-0.5 text-xs font-medium text-white/60">
                  <DollarSign size={10} /> {event.price}
                </span>
              )}
            </div>
            {spotsLeft >= 0 && spotsLeft <= 5 && !isPast && (
              <div className="text-[10px] text-amber-400 font-medium">
                {spotsLeft === 0 ? 'Waitlist only' : `Only ${spotsLeft} spots left`}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}