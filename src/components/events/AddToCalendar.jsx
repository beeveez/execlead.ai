import React, { useState } from "react";
import { Calendar, ChevronDown, Download, Check } from "lucide-react";
import { getGoogleCalendarUrl, getOutlookUrl, downloadICS } from "@/lib/eventPlatform";

export default function AddToCalendar({ event }) {
  const [open, setOpen] = useState(false);

  const options = [
    { label: 'Google Calendar', onClick: () => window.open(getGoogleCalendarUrl(event), '_blank') },
    { label: 'Outlook', onClick: () => window.open(getOutlookUrl(event), '_blank') },
    { label: 'Apple Calendar (.ics)', onClick: () => downloadICS(event) },
    { label: 'Download .ics', onClick: () => downloadICS(event) },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/60 hover:text-white transition-colors w-full justify-center"
      >
        <Calendar size={13} /> Add to Calendar
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-[#0d0d14] border border-white/10 rounded-lg shadow-xl z-50 py-1">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => { opt.onClick(); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 w-full text-left text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Download size={12} className="text-white/30" /> {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}