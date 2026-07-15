import React from 'react';

export default function SectionNavigator({ sections, active, onSelect }) {
  return (
    <div className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 overflow-x-auto scrollbar-thin">
        <div className="flex gap-1 py-2">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onSelect(sec.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${active === sec.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
            >
              <span className="text-[8px] opacity-50 font-mono">{sec.number}</span>
              {sec.title.replace('™', '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}