import React from "react";

export default function SectionHeader({ icon: Icon, title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          {Icon && <Icon size={12} className="text-indigo-400" />} Product Management
        </div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {description && <p className="text-white/40 text-sm mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}