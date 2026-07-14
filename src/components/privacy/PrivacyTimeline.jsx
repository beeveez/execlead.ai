import React from "react";
import { Calendar, CheckCircle2, Clock, Award, FileText, Flag } from "lucide-react";
import { PRIVACY_TIMELINE_EVENTS } from "@/lib/privacyEngine";

const TYPE_ICONS = { milestone: Award, policy: FileText, certification: CheckCircle2, review: Clock, audit: Clock, future: Flag };

export default function PrivacyTimeline() {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={18} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Privacy Timeline™</h3>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-white/10" />
        <div className="space-y-6">
          {PRIVACY_TIMELINE_EVENTS.map((event, i) => {
            const Icon = TYPE_ICONS[event.type] || Clock;
            const isUpcoming = event.status === 'upcoming';
            return (
              <div key={i} className="relative">
                <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isUpcoming ? 'bg-white/5 border-white/30' : 'bg-emerald-500/20 border-emerald-500/40'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isUpcoming ? 'bg-white/30' : 'bg-emerald-400'}`} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} className={isUpcoming ? 'text-white/30' : 'text-emerald-400'} />
                  <span className="text-white/30 text-[10px]">{event.date}</span>
                  {isUpcoming && <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-indigo-500/10 text-indigo-400">Upcoming</span>}
                </div>
                <h4 className={`text-xs font-medium ${isUpcoming ? 'text-white/50' : 'text-white/80'}`}>{event.event}</h4>
                <p className="text-white/30 text-[10px] mt-0.5">{event.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}