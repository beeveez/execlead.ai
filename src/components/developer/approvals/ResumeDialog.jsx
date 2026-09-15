import React from "react";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Explicit requester confirmation for governed approval continuation.
 * The UI never mutates AgentApproval or AgentExecution records — it
 * invokes ONLY the governed resume_approved_execution capability, which
 * re-validates every precondition server-side and executes the approved
 * action exactly once. A consumed approval can never execute again.
 */
export default function ResumeDialog({ dialog, submitting, onConfirm, onCancel }) {
  const approval = dialog ? dialog.approval : null;

  return (
    <AlertDialog open={Boolean(dialog)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-[#0d0d14] border-white/10 max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Resume this approved action?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            {approval && (
              <span className="block mb-2 text-white/70 font-medium">
                {approval.agent_id} → {approval.tool_id}
              </span>
            )}
            {approval && (
              <span className="block mb-2 space-y-1">
                <span className="block">
                  <span className="text-white/30">Intended action: </span>
                  {approval.requested_action || "—"}
                </span>
                <span className="block">
                  <span className="text-white/30">Target: </span>
                  {approval.requested_scope || "your own records"}
                </span>
                <span className="block">
                  <span className="text-white/30">Risk: </span>
                  {approval.risk_level || "—"}
                </span>
                <span className="block">
                  <span className="text-white/30">Approval status: </span>
                  {approval.status}
                </span>
              </span>
            )}
            Resuming re-validates every authorization server-side and executes the
            approved action exactly once. An approved request never auto-executes —
            this explicit resume is the only continuation path.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 text-white/60" disabled={submitting}>
            Cancel
          </AlertDialogCancel>
          <Button onClick={onConfirm} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
            {submitting ? "Resuming…" : "Confirm Resume"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}