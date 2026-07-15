import React from 'react';

export default function PortfolioSection({ id, title, icon: Icon, color, children, action }) {
  return (
    <section id={id} className="scroll-mt-16">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>
          {action}
        </div>
        <div className="p-4">{children}</div>
      </div>
    </section>
  );
}