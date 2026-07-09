import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { UserCog, X, Loader2, ArrowRight, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function TransferOwnershipDialog({ eligibleOwners, orgName, onClose, onTransferred }) {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState("select");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("organizationDangerZone", {
        action: "transfer_ownership",
        new_owner_user_id: selected.user_id,
      });
      toast({ title: "Ownership Transferred", description: `${res.data.new_owner} is now the organization owner.`, variant: "success" });
      setStep("done");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to transfer ownership.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div className="flex items-center gap-2">
            <UserCog size={18} className="text-indigo-400" />
            <h2 className="text-white font-semibold">Transfer Ownership</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="p-6">
          {step === "select" && (
            <div className="space-y-4">
              <p className="text-white/50 text-sm">Select a new owner for <span className="text-white font-medium">{orgName}</span>. You will become an Enterprise Admin after the transfer.</p>
              {eligibleOwners.length === 0 ? (
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-white/40 text-sm">No eligible members found. Invite an administrator or promote a member to Enterprise Admin first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {eligibleOwners.map(owner => (
                    <button
                      key={owner.user_id}
                      onClick={() => setSelected(owner)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selected?.user_id === owner.user_id
                          ? "bg-indigo-500/10 border-indigo-500/30"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400">
                        {(owner.name || "U").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{owner.name}</div>
                        <div className="text-xs text-white/40">{owner.email}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 whitespace-nowrap">{owner.role}</span>
                      {selected?.user_id === owner.user_id && <Check size={16} className="text-indigo-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleTransfer} disabled={!selected || submitting} className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Transfer Ownership
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Ownership Transferred</h3>
              <p className="text-white/50 text-sm">You are now an Enterprise Admin. The new owner has full control of the organization.</p>
              <button onClick={onTransferred} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}