import React from "react";
import { Presentation, FileDown } from "lucide-react";

export default function ExecutivePresentation({ presentation, onDownload }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Presentation size={15} className="text-indigo-400" />
          <h3 className="text-white text-sm font-semibold">Executive Presentation Generator™</h3>
          <span className="text-[10px] text-white/40">PowerPoint export at General Availability</span>
        </div>
        <button onClick={onDownload} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-500/90 px-3 py-1.5 rounded-lg">
          <FileDown size={13} /> Download PDF
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presentation.slides.map((s, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
              <span className="text-white text-xs font-semibold">{s.title}</span>
            </div>
            <ul className="space-y-1">
              {s.bullets.map((b, j) => (
                <li key={j} className="text-[11px] text-white/55 flex items-start gap-1"><span className="text-indigo-400 mt-0.5">•</span> {b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}