import React from "react";
import { Layers, Eye, EyeOff, ShieldCheck } from "lucide-react";

const FLOATING_WIDGETS = [
  {
    name: "ExecConcierge",
    file: "src/components/concierge/ExecConcierge.jsx",
    owner: "Concierge",
    purpose: "AI Executive Assistant — chat launcher for leadership guidance",
    position: "bottom-6 right-6 · z-50",
    visibilityRules: "Always visible (authenticated + public)",
    launchModeVisibility: "All launch modes",
    classification: "Public",
    tooltip: "EXEC™ AI Concierge — Ask anything",
    status: "ok",
  },
  {
    name: "FeedbackWidget",
    file: "src/components/beta/FeedbackWidget.jsx",
    owner: "Beta Program",
    purpose: "Submit feedback, report bugs, suggest features",
    position: "bottom: 5.5rem right-6 · z-40",
    visibilityRules: "Authenticated users only (hidden for public visitors)",
    launchModeVisibility: "Beta modes (hidden at GA)",
    classification: "Authenticated",
    tooltip: "Send feedback, report bugs, or suggest features",
    status: "ok",
  },
  {
    name: "RepairQueueWidget",
    file: "src/components/developer/repair/RepairQueueWidget.jsx",
    owner: "Developer",
    purpose: "Repair queue management for governance findings",
    position: "top-16 right-4 · z-40",
    visibilityRules: "Developer access only + active findings required",
    launchModeVisibility: "All modes (developer-gated)",
    classification: "Developer-only",
    tooltip: "Repair Queue — developer tool",
    status: "ok",
  },
  {
    name: "DebugPanel",
    file: "src/components/developer/DebugPanel.jsx",
    owner: "Developer",
    purpose: "Debug identity, roles, permissions, navigation groups",
    position: "bottom-4 right-4 · z-100",
    visibilityRules: "canAccessDeveloper only",
    launchModeVisibility: "All modes (developer-gated)",
    classification: "Developer-only",
    tooltip: "Debug Panel",
    status: "ok",
  },
  {
    name: "RepairWorkflowDrawer",
    file: "src/components/developer/repair/RepairWorkflowDrawer.jsx",
    owner: "Developer",
    purpose: "Repair workflow drawer for individual findings",
    position: "inset-0 · z-50 (overlay)",
    visibilityRules: "Developer + active finding (on-demand)",
    launchModeVisibility: "All modes (developer-gated)",
    classification: "Developer-only",
    tooltip: "Repair Workflow™",
    status: "ok",
  },
];

export default function FloatingUIInventory() {
  const publicCount = FLOATING_WIDGETS.filter((w) => w.classification === "Public").length;
  const devCount = FLOATING_WIDGETS.filter((w) => w.classification === "Developer-only").length;
  const authCount = FLOATING_WIDGETS.filter((w) => w.classification === "Authenticated").length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Floating UI Inventory™</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
            {publicCount} Public
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
            {authCount} Authenticated
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
            {devCount} Developer
          </span>
        </div>
      </div>

      <p className="text-white/40 text-xs mb-4 leading-relaxed">
        Every floating widget on the platform, with ownership, purpose, and visibility policy. Public pages show only the EXEC™ AI Concierge — all developer and debug tools are hidden unless Developer Mode is enabled.
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Widget</th>
              <th className="text-left py-2 px-2 font-medium">Owner</th>
              <th className="text-left py-2 px-2 font-medium">Purpose</th>
              <th className="text-left py-2 px-2 font-medium">Visibility</th>
              <th className="text-center py-2 px-2 font-medium">Class</th>
            </tr>
          </thead>
          <tbody>
            {FLOATING_WIDGETS.map((w) => (
              <tr key={w.name} className="border-b border-white/5">
                <td className="py-2.5 px-2">
                  <div className="text-white/80 font-medium">{w.name}</div>
                  <code className="text-[10px] text-white/30 block">{w.file}</code>
                </td>
                <td className="py-2.5 px-2 text-white/50">{w.owner}</td>
                <td className="py-2.5 px-2 text-white/50 max-w-[200px]">{w.purpose}</td>
                <td className="py-2.5 px-2">
                  <div className="text-white/50">{w.visibilityRules}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{w.position}</div>
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                      w.classification === "Public"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : w.classification === "Authenticated"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {w.classification === "Developer-only" ? "Dev" : w.classification}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Policy */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2 text-xs text-white/40">
        <ShieldCheck size={12} className="text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <span className="text-white/60 font-medium">Policy:</span> Only one floating button is visible to public visitors — the EXEC™ AI Concierge. FeedbackWidget requires authentication. All developer/debug tools require Developer Mode. No unidentified floating controls remain on public pages.
        </p>
      </div>
    </div>
  );
}