import React from "react";
import { Moon, Sun, Monitor, Check, Palette, Type, Zap, Contrast, LayoutDashboard, Columns } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import CursorSettings from "@/components/settings/CursorSettings";

const THEMES = [
  { id: 'dark', label: 'Executive Dark', desc: 'Deep charcoal · gold & purple', icon: Moon, swatch: ['#0a0a0f', '#6366f1', '#fbbf24'] },
  { id: 'light', label: 'Executive Light', desc: 'White · executive blue', icon: Sun, swatch: ['#ffffff', '#2563eb', '#0f172a'] },
  { id: 'system', label: 'System', desc: 'Follow your OS', icon: Monitor, swatch: ['#0a0a0f', '#ffffff', '#6366f1'] },
];

function Toggle({ checked, onChange, label, desc, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-start gap-3">
        <Icon size={16} className="text-white/30 mt-0.5" />
        <div>
          <div className="text-sm text-white/80">{label}</div>
          {desc && <div className="text-xs text-white/30 mt-0.5">{desc}</div>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-indigo-500" : "bg-white/10"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

export default function AppearanceSection() {
  const { theme, setTheme, resolvedTheme, prefs, updatePrefs } = useTheme();

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4">
      <h2 className="flex items-center gap-2 text-white font-semibold">
        <Palette size={16} className="text-indigo-400" /> Appearance
      </h2>
      <p className="text-white/40 text-sm -mt-2">
        Choose how EXECLEAD.AI looks. Your preference is saved to your profile and syncs across devices.
      </p>

      {/* Theme preview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEMES.map((t) => {
          const active = theme === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-pressed={active}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={active ? "text-indigo-400" : "text-white/40"} />
                {active && <Check size={14} className="text-indigo-400" />}
              </div>
              <div className="flex gap-1.5 mb-3">
                {t.swatch.map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-md border border-white/10" style={{ background: c }} />
                ))}
              </div>
              <div className="text-sm font-medium text-white/80">{t.label}</div>
              <div className="text-xs text-white/30 mt-0.5">{t.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-white/30">
        Current theme: <span className="capitalize text-white/50">{theme}</span>
        {theme === 'system' && ` (resolving to ${resolvedTheme})`}
      </div>

      {/* Accessibility & density preferences */}
      <div className="mt-2 border-t border-white/5 divide-y divide-white/5">
        <Toggle
          checked={prefs.reduced_motion}
          onChange={(v) => updatePrefs({ reduced_motion: v })}
          icon={Zap}
          label="Reduced Motion"
          desc="Disable animations and transitions"
        />
        <Toggle
          checked={prefs.high_contrast}
          onChange={(v) => updatePrefs({ high_contrast: v })}
          icon={Contrast}
          label="High Contrast Mode"
          desc="Increase contrast for better readability"
        />
        <Toggle
          checked={prefs.compact_mode}
          onChange={(v) => updatePrefs({ compact_mode: v })}
          icon={LayoutDashboard}
          label="Compact Mode"
          desc="Reduce spacing and padding in content areas"
        />
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-start gap-3">
            <Columns size={16} className="text-white/30 mt-0.5" />
            <div>
              <div className="text-sm text-white/80">Sidebar Density</div>
              <div className="text-xs text-white/30 mt-0.5">Adjust sidebar spacing</div>
            </div>
          </div>
          <select
            value={prefs.sidebar_density}
            onChange={(e) => updatePrefs({ sidebar_density: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          >
            <option value="comfortable" className="bg-[#0d0d14]">Comfortable</option>
            <option value="compact" className="bg-[#0d0d14]">Compact</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/20 pt-1">
        <Type size={12} /> Accent color &amp; font size — coming soon
      </div>

      {/* EXEC™ Intelligent Magnetic Cursor */}
      <CursorSettings />
    </div>
  );
}