import React from "react";

export default function CompanySection({ icon: Icon, title, children }) {
  if (!children) return null;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-3">
        {Icon && <Icon size={14} />} {title}
      </div>
      {children}
    </div>
  );
}

export function ListBlock({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
          <span className="text-violet-400 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}