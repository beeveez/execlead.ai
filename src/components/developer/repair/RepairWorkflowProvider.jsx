import React, { createContext, useContext, useState, useCallback } from "react";
import RepairWorkflowDrawer from "@/components/developer/repair/RepairWorkflowDrawer";
import { normalizeFinding } from "@/lib/repairWorkflowEngine";

const RepairWorkflowContext = createContext(null);

export function useRepairWorkflow() {
  const ctx = useContext(RepairWorkflowContext);
  if (!ctx) return { openRepairWorkflow: () => {}, closeRepairWorkflow: () => {} };
  return ctx;
}

export function RepairWorkflowProvider({ children }) {
  const [activeFinding, setActiveFinding] = useState(null);

  const openRepairWorkflow = useCallback((finding, options = {}) => {
    const normalized = normalizeFinding(finding, options.source || finding?.source || finding?.category);
    setActiveFinding(normalized);
  }, []);

  const closeRepairWorkflow = useCallback(() => setActiveFinding(null), []);

  return (
    <RepairWorkflowContext.Provider value={{ openRepairWorkflow, closeRepairWorkflow }}>
      {children}
      {activeFinding && (
        <RepairWorkflowDrawer finding={activeFinding} onClose={closeRepairWorkflow} />
      )}
    </RepairWorkflowContext.Provider>
  );
}