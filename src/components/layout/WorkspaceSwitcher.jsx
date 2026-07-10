import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { WORKSPACES, WORKSPACE_HOME } from "@/lib/workspaces";
import { ChevronDown, Check } from "lucide-react";
import PlanSimulatorSection from "@/components/developer/PlanSimulatorSection";
import MobileBottomSheet from "@/components/layout/MobileBottomSheet";

export default function WorkspaceSwitcher({ compact = false }) {
  const { activeWorkspace, availableWorkspaces, setActiveWorkspace } = useWorkspace();
  const { developerMode } = useDeveloper();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!activeWorkspace || availableWorkspaces.length <= 1) return null;

  const current = WORKSPACES[activeWorkspace];
  if (!current) return null;

  const handleSelect = (wsId) => {
    setOpen(false);
    if (wsId === activeWorkspace) return;
    setActiveWorkspace(wsId);
    navigate(WORKSPACE_HOME[wsId] || "/");
  };

  const Icon = current.icon;

  if (compact) {
    return (
      <MobileBottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Switch Workspace"
        trigger={
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Icon size={14} style={{ color: current.color }} />
            <ChevronDown size={12} className="text-white/40" />
          </button>
        }
      >
        <div className="py-1">
          {availableWorkspaces.map((wsId) => {
            const ws = WORKSPACES[wsId];
            if (!ws) return null;
            const WsIcon = ws.icon;
            const isActive = wsId === activeWorkspace;
            return (
              <button key={wsId} onClick={() => handleSelect(wsId)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${isActive ? "bg-white/[0.03]" : ""}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ws.color}15` }}>
                  <WsIcon size={15} style={{ color: ws.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/80">{ws.label}</div>
                  <div className="text-[10px] text-white/30 truncate">{ws.description}</div>
                </div>
                {isActive && <Check size={14} className="text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
        {developerMode && <PlanSimulatorSection />}
      </MobileBottomSheet>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <span className={`w-2 h-2 rounded-full ${current.badge}`} />
        <span className="text-xs font-semibold text-white/80">{current.label}</span>
        <ChevronDown size={12} className="text-white/40" />
      </button>
      {open && <Dropdown available={availableWorkspaces} active={activeWorkspace} onSelect={handleSelect} />}
    </div>
  );
}

function Dropdown({ available, active, onSelect }) {
  const { developerMode } = useDeveloper();
  return (
    <div className="absolute left-0 top-full mt-2 w-72 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[85vh] overflow-y-auto">
      <div className="px-4 py-2 border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Switch Workspace</span>
      </div>
      <div className="py-1">
        {available.map((wsId) => {
          const ws = WORKSPACES[wsId];
          if (!ws) return null;
          const Icon = ws.icon;
          const isActive = wsId === active;
          return (
            <button key={wsId} onClick={() => onSelect(wsId)} className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left ${isActive ? "bg-white/[0.03]" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ws.badge}/10`} style={{ background: `${ws.color}15` }}>
                <Icon size={15} style={{ color: ws.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/80">{ws.label}</div>
                <div className="text-[10px] text-white/30 truncate">{ws.description}</div>
              </div>
              {isActive && <Check size={14} className="text-indigo-400 shrink-0" />}
            </button>
          );
        })}
      </div>
      {developerMode && <PlanSimulatorSection />}
    </div>
  );
}