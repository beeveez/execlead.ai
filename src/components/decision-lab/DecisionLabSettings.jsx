import React from "react";
import { Settings as SettingsIcon } from "lucide-react";

/**
 * DecisionLabSettings — module preferences and roadmap of future
 * capabilities (voice/video decision practice, live panel simulations).
 */
export default function DecisionLabSettings() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><SettingsIcon size={16} className="text-white/50" /><h3 className="text-white font-semibold text-sm">Settings</h3></div>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <p className="text-xs text-white/40 mb-4">Decision Lab capabilities in development:</p>
        <ul className="space-y-2 text-sm text-white/60">
          {["Voice Decision Defense", "Live Panel Simulations", "Multi-Person Board Rooms", "Department Challenge Mode", "Succession Planning Exercises", "Custom Enterprise Scenario Library"].map((x) => (
            <li key={x} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> {x}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}