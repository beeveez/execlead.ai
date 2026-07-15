import React from "react";
import { CalendarDays } from "lucide-react";

export default function TomorrowPreview({ focus }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays size={12} className="text-white/30" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">Tomorrow's Preview</span>
      </div>
      <p className="text-sm text-white/50">
        {focus ? `Continue: ${focus}` : "Executive growth continues tomorrow"}
      </p>
    </div>
  );
}