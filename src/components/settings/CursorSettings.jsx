import React from 'react';
import { useEXECursor } from '@/lib/EXECursorContext';
import { MousePointer2 } from 'lucide-react';

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <div className="text-sm text-white/80">{label}</div>
        {desc && <div className="text-xs text-white/30 mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-sm text-white/80">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0d0d14]">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function CursorSettings() {
  const ctx = useEXECursor();
  if (!ctx) return null;
  const { settings, updateSettings, isTouchDevice, prefersReducedMotion } = ctx;

  if (isTouchDevice || prefersReducedMotion) {
    return (
      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs text-white/40 flex items-center gap-2">
        <MousePointer2 size={14} className="text-white/30" />
        EXEC™ Cursor is automatically disabled on touch devices and when reduced motion is preferred.
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4">
      <h2 className="flex items-center gap-2 text-white font-semibold">
        <MousePointer2 size={16} className="text-amber-400" /> EXEC™ Cursor
      </h2>
      <p className="text-white/40 text-sm -mt-2">
        Configure the platform-wide intelligent magnetic cursor. Adjust magnetic strength, size, and visual preferences.
      </p>

      <div className="border-t border-white/5 divide-y divide-white/5">
        <Toggle
          checked={settings.enabled}
          onChange={(v) => updateSettings({ enabled: v })}
          label="Enable EXEC™ Cursor"
          desc="Platform-wide intelligent cursor with magnetic interactions"
        />
      </div>

      {settings.enabled && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          <SelectRow
            label="Magnetic Strength"
            value={settings.magneticStrength}
            onChange={(v) => updateSettings({ magneticStrength: v })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <SelectRow
            label="Cursor Size"
            value={settings.cursorSize}
            onChange={(v) => updateSettings({ cursorSize: v })}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
          <SelectRow
            label="Animation Speed"
            value={settings.animationSpeed}
            onChange={(v) => updateSettings({ animationSpeed: v })}
            options={[
              { value: 'slow', label: 'Slow' },
              { value: 'normal', label: 'Normal' },
              { value: 'fast', label: 'Fast' },
            ]}
          />
          <Toggle
            checked={settings.hoverLabels}
            onChange={(v) => updateSettings({ hoverLabels: v })}
            label="Hover Labels"
            desc="Show contextual labels beside the cursor"
          />
          <Toggle
            checked={settings.workspaceColors}
            onChange={(v) => updateSettings({ workspaceColors: v })}
            label="Workspace Colors"
            desc="Adapt cursor color to the active workspace"
          />
        </div>
      )}
    </div>
  );
}