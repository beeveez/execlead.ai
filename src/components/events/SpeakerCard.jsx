import React from "react";
import { BadgeCheck, ExternalLink, Award } from "lucide-react";

export default function SpeakerCard({ speaker }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-start gap-3">
      <div className="w-12 h-12 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0 overflow-hidden">
        {speaker.photo ? (
          <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
        ) : (
          (speaker.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-white font-medium text-sm truncate">{speaker.name}</h4>
          {speaker.verified && <BadgeCheck size={13} className="text-indigo-400 flex-shrink-0" />}
        </div>
        <p className="text-white/40 text-xs truncate">{speaker.title}{speaker.company ? ` · ${speaker.company}` : ''}</p>
        {speaker.bio && <p className="text-white/30 text-xs mt-1.5 line-clamp-2 leading-relaxed">{speaker.bio}</p>}
        <div className="flex items-center gap-3 mt-2">
          {speaker.executive_score > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400">
              <Award size={10} /> Score: {speaker.executive_score}
            </span>
          )}
          {speaker.linkedin && (
            <a href={speaker.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300">
              <ExternalLink size={10} /> LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}