import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function KnowledgeDetailLinks({ label, items, onOpen }) {
  if (!items.length) return null;
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</dt>
      <dd className="mt-1 space-y-1">
        {items.map((item) => (
          <button key={item.slug} onClick={() => onOpen(item.slug)} className="flex w-full items-center justify-between gap-2 py-1 text-left text-[11px] text-white/60 transition-colors hover:text-white/85">
            <span>{item.title || item.question}</span>
            <ChevronRight size={11} className="shrink-0 text-white/30" />
          </button>
        ))}
      </dd>
    </div>
  );
}