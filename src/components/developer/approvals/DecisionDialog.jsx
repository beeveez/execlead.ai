import React from "react";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Explicit human confirmation for a governed approval decision.
 * The backend decide_approval boundary re-validates authorization,
 * expiry, self-approval, and immutability — this dialog adds a
 * deliberate confirmation step on top; it never authorizes anything.
 */
export default function DecisionDialog({ dialog, notes, setNotes, submitting, onConfirm, onCancel }) {
  const approval = dialog ? dialog.approval : null;
  const decision = dialog ? dialog.decision : null;
  const approve = decision === "approve";

  return (
    <AlertDialog open={Boolean(dialog)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-[#0d0d14] border-white/10 max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            {approve ? "Approve this request?" : "Reject this request?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            {approval && (
              <span className="block mb-1 text-white/70 font-medium">
                {approval.agent_id} → {approval.tool_id}
              </span>
            )}
            The governed decision boundary re-validates your authorization, the required
            approver role, expiry, and the self-approval prohibition before recording anything.
            An approved request never auto-executes. Decision records are immutable once recorded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional decision notes (recorded on the approval)"
          className="bg-white/5 border-white/10 text-white text-sm"
          rows={3}
        />
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 text-white/60" disabled={submitting}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className={approve ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
          >
            {submitting ? "Recording…" : approve ? "Confirm Approve" : "Confirm Reject"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}