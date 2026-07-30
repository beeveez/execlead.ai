import React from "react";
import { Settings as SettingsIcon } from "lucide-react";

/**
 * LaunchDefenseSettings — module preferences (placeholder for future voice/
 * video practice toggles, persona defaults, difficulty targeting).
 */
export default function LaunchDefenseSettings() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><SettingsIcon size={16} className="text-white/50" /><h3 className="text-white font-semibold text-sm">Settings</h3></div>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <p className="text-xs text-white/40 mb-4">Future capabilities in development:</p>
        <ul className="space-y-2 text-sm text-white/60">
          {["Voice Practice", "Video Practice", "Eye Contact Analysis", "Speech Analysis", "Presentation Coaching", "Live Panel Simulation", "Debate Mode", "Multi-Person Interviews", "Boardroom Simulation"].map((x) => (
            <li key={x} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> {x}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}