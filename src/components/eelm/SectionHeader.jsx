import React from "react";

export default function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-mono text-indigo-400/60">{number}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent max-w-[60px]" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-white/40 text-sm">{subtitle}</p>}
    </div>
  );
}