import React from 'react';

export function SectionShell({ title, subtitle, icon: Icon, children, actions }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            {Icon && <Icon size={18} className="text-indigo-400" />}
            {title}
          </h1>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, color = '#6366f1', icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={14} style={{ color }} />}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-[10px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

export function Badge({ children, color = '#64748b' }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
      {children}
    </span>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
    />
  );
}

export function EmptyState({ text }) {
  return <div className="text-center py-12 text-xs text-white/30">{text}</div>;
}

export function Row({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/[0.02] border border-white/5 rounded-xl p-3 ${onClick ? 'cursor-pointer hover:border-white/15 transition-colors' : ''}`}
    >
      {children}
    </div>
  );
}

export const STATUS_COLORS = { active: '#10b981', beta: '#f59e0b', planned: '#64748b', deprecated: '#ef4444' };
export const LAYER_COLORS = {
  frontend: '#6366f1', backend: '#0ea5e9', ai: '#8b5cf6', recommendation: '#ec4899',
  evidence: '#10b981', database: '#f59e0b', security: '#ef4444', governance: '#14b8a6',
  commercial: '#f97316', enterprise: '#3b82f6', analytics: '#06b6d4', platform: '#a855f7',
};