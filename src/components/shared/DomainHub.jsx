import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function DomainHub({ title, primaryQuestion, description, tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const tab = tabs[activeTab];

  if (!tab) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{primaryQuestion}</div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-white/40 text-sm mt-1 max-w-2xl">{description}</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/5 pb-px">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
              i === activeTab ? 'border-indigo-500 text-white' : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            {t.icon && <t.icon size={12} />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in space-y-4">
        {tab.summary && <p className="text-sm text-white/50 max-w-3xl">{tab.summary}</p>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tab.features?.map((f) => (
            <div
              key={f.label}
              onClick={() => f.path && navigate(f.path)}
              className={`bg-white/[0.02] border border-white/5 rounded-xl p-5 transition-colors ${
                f.path ? 'hover:border-white/10 cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  {f.icon && <f.icon size={18} className="text-indigo-400" />}
                </div>
                {f.path && <ArrowRight size={14} className="text-white/20" />}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.label}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.description}</p>
              {f.metric !== undefined && (
                <div className="mt-3 text-2xl font-bold text-white">{f.metric}</div>
              )}
            </div>
          ))}
        </div>
        {(!tab.features || tab.features.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={24} className="text-white/20 mb-2" />
            <p className="text-white/30 text-sm">No features configured for this tab yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}