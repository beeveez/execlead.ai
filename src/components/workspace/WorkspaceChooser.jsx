import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { WORKSPACES, WORKSPACE_HOME } from "@/lib/workspaces";
import { ArrowRight, Check } from "lucide-react";
import Logo from "@/components/layout/Logo";

/**
 * Workspace Chooser — shown when a multi-workspace user clicks "Dashboard"
 * from a public page without a saved preference.
 *
 * On select: sets the active workspace (persisted if "Remember" is checked)
 * and navigates to that workspace's home route.
 */
export default function WorkspaceChooser() {
  const { availableWorkspaces, setActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [remember, setRemember] = useState(true);

  const handleChoose = (wsId) => {
    setActiveWorkspace(wsId, { persist: remember });
    navigate(WORKSPACE_HOME[wsId] || "/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080d] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Logo /></div>
          <h1 className="text-2xl font-bold text-white mb-2">Continue as</h1>
          <p className="text-white/40 text-sm">Choose a workspace to enter. You can switch anytime from the sidebar.</p>
        </div>

        <div className="space-y-3 mb-6">
          {availableWorkspaces.map((wsId) => {
            const ws = WORKSPACES[wsId];
            if (!ws) return null;
            const Icon = ws.icon;
            return (
              <motion.button
                key={wsId}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleChoose(wsId)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all text-left group"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ws.color}15` }}>
                  <Icon size={20} style={{ color: ws.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{ws.label} Workspace</div>
                  <div className="text-xs text-white/40 truncate">{ws.description}</div>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
              </motion.button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none justify-center">
          <button
            type="button"
            onClick={() => setRemember(!remember)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
              remember ? "bg-indigo-500 border-indigo-500" : "border-white/20 hover:border-white/30"
            }`}
          >
            {remember && <Check size={11} className="text-white" />}
          </button>
          <span className="text-xs text-white/50">Remember my choice</span>
        </label>
      </div>
    </div>
  );
}